export type AvailabilityStatus = 'available' | 'low_stock' | 'sold_out' | 'hidden';

export type BadgeType = 'none' | 'Novità' | 'Consigliato' | 'Più richiesto' | 'Speciale del giorno';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  ingredients: string;
  price: number;
  image_url: string;
  availability_status: AvailabilityStatus;
  stock_management_enabled: boolean;
  stock_quantity: number;
  featured: boolean;
  badge: BadgeType;
  visible: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export type OrderStatus =
  | 'NUOVO'
  | 'ACCETTATO'
  | 'IN PREPARAZIONE'
  | 'PRONTO'
  | 'RITIRATO'
  | 'ANNULLATO';

export interface OrderItem {
  id: string;
  order_id?: string;
  product_id: string;
  product_name_snapshot: string;
  product_price_snapshot: number;
  quantity: number;
  notes?: string;
  subtotal: number;
  image_url_snapshot?: string;
}

export interface Order {
  id: string;
  order_number: string; // e.g. MP-0048
  customer_name: string;
  customer_surname: string;
  customer_phone: string;
  pickup_date: string; // YYYY-MM-DD
  pickup_time: string; // HH:MM
  notes?: string;
  subtotal: number;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface BusinessSettings {
  id: string;
  store_name: string;
  tagline: string;
  hero_title?: string;
  hero_description?: string;
  hero_image_url?: string;
  hero_image_alt?: string;
  footer_claim?: string;
  address: string;
  city: string;
  phone: string;
  whatsapp_notification_phone: string;
  instagram_handle: string;
  orders_enabled: boolean; // Interruttore PRENOTAZIONI ATTIVE
  orders_disabled_message: string;
  next_day_orders_allowed: boolean;
  slot_interval_minutes: number; // e.g. 15
}

export interface OpeningHourDay {
  day_of_week: number; // 0 = Domenica, 1 = Lunedi, ..., 6 = Sabato
  day_name: string;
  is_open: boolean;
  morning_open: string;
  morning_close: string;
  evening_open: string;
  evening_close: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'owner';
}
