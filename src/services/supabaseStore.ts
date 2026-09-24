import {
  BusinessSettings,
  Category,
  OpeningHourDay,
  Order,
  OrderItem,
  Product,
} from '../types';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export interface RemoteStoreSnapshot {
  categories: Category[];
  products: Product[];
  orders: Order[];
  settings: BusinessSettings | null;
  openingHours: OpeningHourDay[];
}

function isReady() {
  return isSupabaseConfigured && Boolean(supabase);
}

async function hasAuthenticatedSession(): Promise<boolean> {
  if (!isReady() || !supabase) return false;
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}

function withoutItems(order: Order) {
  const { items: _items, ...orderRow } = order;
  return orderRow;
}

function orderItemsToRows(orders: Order[]): OrderItem[] {
  return orders.flatMap((order) =>
    order.items.map((item) => ({
      ...item,
      order_id: order.id,
    }))
  );
}

export async function fetchRemoteSnapshot(): Promise<RemoteStoreSnapshot | null> {
  if (!isReady() || !supabase) return null;

  const [categoriesResult, productsResult, settingsResult, hoursResult] = await Promise.all([
    supabase.from('categories').select('*').order('display_order'),
    supabase.from('products').select('*').order('display_order'),
    supabase.from('business_settings').select('*').eq('id', 'settings_main').maybeSingle(),
    supabase.from('opening_hours').select('*').order('day_of_week'),
  ]);

  const firstError = [categoriesResult, productsResult, settingsResult, hoursResult].find(
    (result) => result.error
  );
  if (firstError?.error) throw firstError.error;

  // Orders are intentionally optional here: anonymous customers are not allowed to read them.
  let orders: Order[] = [];
  const ordersResult = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (!ordersResult.error && ordersResult.data?.length) {
    const orderIds = ordersResult.data.map((order) => order.id);
    const itemsResult = await supabase.from('order_items').select('*').in('order_id', orderIds);
    if (!itemsResult.error) {
      const itemsByOrder = new Map<string, OrderItem[]>();
      for (const item of itemsResult.data || []) {
        const current = itemsByOrder.get(item.order_id || '') || [];
        current.push(item as OrderItem);
        itemsByOrder.set(item.order_id || '', current);
      }
      orders = ordersResult.data.map((order) => ({
        ...(order as Order),
        items: itemsByOrder.get(order.id) || [],
      }));
    }
  }

  return {
    categories: (categoriesResult.data || []) as Category[],
    products: (productsResult.data || []) as Product[],
    orders,
    settings: (settingsResult.data || null) as BusinessSettings | null,
    openingHours: (hoursResult.data || []) as OpeningHourDay[],
  };
}

export async function syncCategories(categories: Category[]) {
  if (!isReady() || !supabase || categories.length === 0 || !(await hasAuthenticatedSession())) return;
  const { error } = await supabase.from('categories').upsert(categories);
  if (error) throw error;
}

export async function deleteRemoteCategory(id: string) {
  if (!isReady() || !supabase || !(await hasAuthenticatedSession())) return;
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function syncProducts(products: Product[]) {
  if (!isReady() || !supabase || products.length === 0 || !(await hasAuthenticatedSession())) return;
  const { error } = await supabase.from('products').upsert(products);
  if (error) throw error;
}

export async function deleteRemoteProduct(id: string) {
  if (!isReady() || !supabase || !(await hasAuthenticatedSession())) return;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function syncOrders(orders: Order[]) {
  if (!isReady() || !supabase || orders.length === 0) return;
  const { error: ordersError } = await supabase.from('orders').upsert(orders.map(withoutItems));
  if (ordersError) throw ordersError;

  const items = orderItemsToRows(orders);
  if (items.length > 0) {
    const { error: itemsError } = await supabase.from('order_items').upsert(items);
    if (itemsError) throw itemsError;
  }
}

export async function syncSettings(settings: BusinessSettings) {
  if (!isReady() || !supabase || !(await hasAuthenticatedSession())) return;
  const { error } = await supabase.from('business_settings').upsert(settings);
  if (error) throw error;
}

export async function syncOpeningHours(hours: OpeningHourDay[]) {
  if (!isReady() || !supabase || hours.length === 0 || !(await hasAuthenticatedSession())) return;
  const { error } = await supabase.from('opening_hours').upsert(hours);
  if (error) throw error;
}

export async function uploadProductImage(blob: Blob): Promise<string | null> {
  if (!isReady() || !supabase || !(await hasAuthenticatedSession())) return null;
  const path = `products/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from('product-images').upload(path, blob, {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
}

export function subscribeToRemoteStore(onChange: () => void): () => void {
  if (!isReady() || !supabase) return () => undefined;
  const client = supabase;

  const channel = client
    .channel('mpastamm-store-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'business_settings' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'opening_hours' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, onChange)
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}
