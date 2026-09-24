import { Category, Product, Order, BusinessSettings, OpeningHourDay } from '../types';
import { ASSET_IMAGES, getProductFallbackImage } from './imageMap';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  deleteRemoteCategory,
  deleteRemoteProduct,
  RemoteStoreSnapshot,
  syncCategories,
  syncOpeningHours,
  syncOrders,
  syncProducts,
  syncSettings,
} from './supabaseStore';

const BROADCAST_CHANNEL_NAME = 'mpastamm_realtime_sync';
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel(BROADCAST_CHANNEL_NAME)
  : null;

// Initial Categories
export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat_saltimbocca',
    name: 'Saltimbocca',
    slug: 'saltimbocca',
    description: "L'arte del gusto in un morso.",
    image_url: ASSET_IMAGES.saltimbocca,
    display_order: 1,
    visible: true,
  },
  {
    id: 'cat_bun',
    name: 'Bun (100g)',
    slug: 'bun',
    description: 'Soffice, fragrante, ineguagliabile.',
    image_url: ASSET_IMAGES.bun,
    display_order: 2,
    visible: true,
  },
  {
    id: 'cat_rutiello',
    name: 'Rutiello 2.0',
    slug: 'rutiello-2-0',
    description: 'La tradizione si rinnova.',
    image_url: ASSET_IMAGES.rutiello,
    display_order: 3,
    visible: true,
  },
  {
    id: 'cat_padellino',
    name: 'Padellino',
    slug: 'padellino',
    description: 'Tutta la bontà della rosticceria.',
    image_url: ASSET_IMAGES.padellino,
    display_order: 4,
    visible: true,
  },
  {
    id: 'cat_friggitoria',
    name: 'Friggitoria',
    slug: 'friggitoria',
    description: 'Croccante fuori, irresistibile dentro.',
    image_url: ASSET_IMAGES.friggitoria,
    display_order: 5,
    visible: true,
  },
];

// Initial Products as requested by user prompt
export const INITIAL_PRODUCTS: Product[] = [
  // SALTIMBOCCA
  {
    id: 'prod_sal_classico',
    category_id: 'cat_saltimbocca',
    name: 'Classico',
    slug: 'saltimbocca-classico',
    description: 'Il grande classico della tradizione campana, racchiuso nel nostro impasto a lunga lievitazione.',
    ingredients: 'Pancetta, provola e funghi champignon.',
    price: 8.0,
    image_url: ASSET_IMAGES.saltimbocca,
    availability_status: 'available',
    stock_management_enabled: false,
    stock_quantity: 25,
    featured: false,
    badge: 'none',
    visible: true,
    display_order: 1,
  },
  {
    id: 'prod_sal_sfizioso',
    category_id: 'cat_saltimbocca',
    name: 'Sfizioso',
    slug: 'saltimbocca-sfizioso',
    description: 'Gusto rustico e avvolgente con patate morbide al forno e salsiccia nostrana.',
    ingredients: 'Patate arrosto, salsiccia e provola.',
    price: 8.0,
    image_url: ASSET_IMAGES.saltimbocca,
    availability_status: 'available',
    stock_management_enabled: true,
    stock_quantity: 18,
    featured: true,
    badge: 'Consigliato',
    visible: true,
    display_order: 2,
  },
  {
    id: 'prod_sal_abatese',
    category_id: 'cat_saltimbocca',
    name: 'Abatese',
    slug: 'saltimbocca-abatese',
    description: 'Profumo di porchetta artigianale, patate croccanti e cuore filante.',
    ingredients: 'Porchetta, patate arrosto e provola.',
    price: 9.0,
    image_url: ASSET_IMAGES.saltimbocca,
    availability_status: 'available',
    stock_management_enabled: false,
    stock_quantity: 15,
    featured: false,
    badge: 'none',
    visible: true,
    display_order: 3,
  },
  {
    id: 'prod_sal_parma',
    category_id: 'cat_saltimbocca',
    name: 'Parma',
    slug: 'saltimbocca-parma',
    description: 'Equilibrio perfetto tra dolcezza del crudo stagionato e la freschezza delle melanzane.',
    ingredients: 'Crudo di Parma, provola e melanzane grigliate.',
    price: 10.0,
    image_url: ASSET_IMAGES.saltimbocca,
    availability_status: 'available',
    stock_management_enabled: false,
    stock_quantity: 12,
    featured: false,
    badge: 'none',
    visible: true,
    display_order: 4,
  },

  // BUN (100g)
  {
    id: 'prod_bun_crunchy',
    category_id: 'cat_bun',
    name: 'Crunchy',
    slug: 'bun-crunchy',
    description: 'Croccantezza straordinaria, maionese montata a mano e pan brioche sofficissimo.',
    ingredients: 'Cotoletta crunchy, insalata e maionese homemade.',
    price: 10.0,
    image_url: ASSET_IMAGES.bun,
    availability_status: 'available',
    stock_management_enabled: true,
    stock_quantity: 20,
    featured: true,
    badge: 'Più richiesto',
    visible: true,
    display_order: 1,
  },
  {
    id: 'prod_bun_fresco',
    category_id: 'cat_bun',
    name: 'Fresco',
    slug: 'bun-fresco',
    description: 'Carne succosa, stracciata fresca pugliese e l\'aroma balsamico del nostro pesto fresco.',
    ingredients: 'Hamburger, pomodori, insalata, bacon, stracciata e pesto di basilico.',
    price: 12.0,
    image_url: ASSET_IMAGES.bun,
    availability_status: 'available',
    stock_management_enabled: false,
    stock_quantity: 15,
    featured: false,
    badge: 'none',
    visible: true,
    display_order: 2,
  },
  {
    id: 'prod_bun_burger',
    category_id: 'cat_bun',
    name: 'Burger',
    slug: 'bun-burger',
    description: 'Doppio hamburger per i palati decisi, accompagnato dalle nostre chips fatte in casa.',
    ingredients: 'Doppio hamburger, chips, bacon croccante e provola.',
    price: 11.0,
    image_url: ASSET_IMAGES.bun,
    availability_status: 'available',
    stock_management_enabled: true,
    stock_quantity: 14,
    featured: false,
    badge: 'none',
    visible: true,
    display_order: 3,
  },

  // RUTIELLO 2.0
  {
    id: 'prod_rut_margherita',
    category_id: 'cat_rutiello',
    name: 'Margherita',
    slug: 'rutiello-margherita',
    description: 'Cotta nel tradizionale padellino rotondo in alluminio/rame: bordo alto, soffice e croccante.',
    ingredients: 'Pomodoro, mozzarella e basilico.',
    price: 7.5,
    image_url: ASSET_IMAGES.rutiello,
    availability_status: 'available',
    stock_management_enabled: false,
    stock_quantity: 30,
    featured: false,
    badge: 'none',
    visible: true,
    display_order: 1,
  },
  {
    id: 'prod_rut_marinara',
    category_id: 'cat_rutiello',
    name: 'Marinara',
    slug: 'rutiello-marinara',
    description: 'Semplicità napoletana profumata all\'origano di montagna e olive saporite.',
    ingredients: 'Pomodoro, origano, aglio e olive.',
    price: 6.0,
    image_url: ASSET_IMAGES.rutiello,
    availability_status: 'available',
    stock_management_enabled: false,
    stock_quantity: 20,
    featured: false,
    badge: 'none',
    visible: true,
    display_order: 2,
  },
  {
    id: 'prod_rut_mpastamm',
    category_id: 'cat_rutiello',
    name: "'Mpastamm",
    slug: 'rutiello-mpastamm',
    description: 'La nostra firma d\'autore: la cremosità delle patate schiacciate unita alla panna homemade e al fior di latte filante.',
    ingredients: 'Patate schiacciate, prosciutto cotto, panna homemade, pepe e mozzarella.',
    price: 9.5,
    image_url: ASSET_IMAGES.rutiello,
    availability_status: 'available',
    stock_management_enabled: true,
    stock_quantity: 16,
    featured: true,
    badge: 'Speciale del giorno',
    visible: true,
    display_order: 3,
  },
  {
    id: 'prod_rut_ortolana',
    category_id: 'cat_rutiello',
    name: 'Ortolana',
    slug: 'rutiello-ortolana',
    description: 'Verdure fresche saltate al momento e mozzarella campana.',
    ingredients: 'Verdure di stagione e mozzarella.',
    price: 8.0,
    image_url: ASSET_IMAGES.rutiello,
    availability_status: 'available',
    stock_management_enabled: false,
    stock_quantity: 15,
    featured: false,
    badge: 'none',
    visible: true,
    display_order: 4,
  },

  // PADELLINO
  {
    id: 'prod_pad_pistacchioso',
    category_id: 'cat_padellino',
    name: 'Pistacchioso',
    slug: 'padellino-pistacchioso',
    description: 'Un connubio goloso: mortadella Bologna IGP a fette sottili, stracciatella fresca e pesto di pistacchi tostati.',
    ingredients: 'Mortadella, stracciata e pesto di pistacchio.',
    price: 12.0,
    image_url: ASSET_IMAGES.padellino,
    availability_status: 'available',
    stock_management_enabled: true,
    stock_quantity: 10,
    featured: true,
    badge: 'Novità',
    visible: true,
    display_order: 1,
  },
  {
    id: 'prod_pad_modena',
    category_id: 'cat_padellino',
    name: 'Modena',
    slug: 'padellino-modena',
    description: 'Raffinato contrasto fra le scaglie di parmigiano 24 mesi e la riduzione di balsamico.',
    ingredients: 'Rucola, prosciutto crudo di Parma, scaglie di parmigiano e aceto balsamico.',
    price: 13.0,
    image_url: ASSET_IMAGES.padellino,
    availability_status: 'available',
    stock_management_enabled: false,
    stock_quantity: 12,
    featured: false,
    badge: 'none',
    visible: true,
    display_order: 2,
  },
  {
    id: 'prod_pad_sorrento',
    category_id: 'cat_padellino',
    name: 'Sorrento',
    slug: 'padellino-sorrento',
    description: 'I profumi della penisola sorrentina in un padellino dorato e fragrante.',
    ingredients: 'Mozzarella, pomodoro sorrentino e pesto di basilico.',
    price: 10.0,
    image_url: ASSET_IMAGES.padellino,
    availability_status: 'available',
    stock_management_enabled: false,
    stock_quantity: 15,
    featured: false,
    badge: 'none',
    visible: true,
    display_order: 3,
  },

  // FRIGGITORIA
  {
    id: 'prod_frig_arancino_bianco',
    category_id: 'cat_friggitoria',
    name: 'Arancino bianco',
    slug: 'arancino-bianco',
    description: 'Riso mantecato, besciamella densa homemade, dadolata di cotto e cuore filante.',
    ingredients: 'Mozzarella, cotto e besciamella.',
    price: 2.0,
    image_url: ASSET_IMAGES.friggitoria,
    availability_status: 'available',
    stock_management_enabled: true,
    stock_quantity: 24,
    featured: false,
    badge: 'none',
    visible: true,
    display_order: 1,
  },
  {
    id: 'prod_frig_arancino_ragu',
    category_id: 'cat_friggitoria',
    name: 'Arancino ragù',
    slug: 'arancino-ragu',
    description: 'Ragù napoletano pippato a lungo, piselli teneri e mozzarella filante.',
    ingredients: 'Ragù e mozzarella.',
    price: 2.0,
    image_url: ASSET_IMAGES.friggitoria,
    availability_status: 'available',
    stock_management_enabled: true,
    stock_quantity: 28,
    featured: true,
    badge: 'Consigliato',
    visible: true,
    display_order: 2,
  },
  {
    id: 'prod_frig_frittatina_classica',
    category_id: 'cat_friggitoria',
    name: 'Frittatina classica',
    slug: 'frittatina-classica',
    description: 'L\'icona dello street food campano: bucatini legati con besciamella vellutata, cotto e pepe.',
    ingredients: 'Cotto, mozzarella e pepe.',
    price: 2.5,
    image_url: ASSET_IMAGES.friggitoria,
    availability_status: 'available',
    stock_management_enabled: true,
    stock_quantity: 20,
    featured: false,
    badge: 'none',
    visible: true,
    display_order: 3,
  },
  {
    id: 'prod_frig_frittatina_pasta_patate',
    category_id: 'cat_friggitoria',
    name: 'Frittatina pasta e patate',
    slug: 'frittatina-pasta-patate',
    description: 'Omaggio al piatto di casa: pasta mista, crema di patate, pancetta croccante e provola affumicata.',
    ingredients: 'Patate, pancetta, provola, pepe e parmigiano.',
    price: 2.5,
    image_url: ASSET_IMAGES.friggitoria,
    availability_status: 'available',
    stock_management_enabled: true,
    stock_quantity: 15,
    featured: true,
    badge: 'Speciale del giorno',
    visible: true,
    display_order: 4,
  },
  {
    id: 'prod_frig_crocche',
    category_id: 'cat_friggitoria',
    name: 'Crocchè',
    slug: 'crocche',
    description: 'Purea di patate cotte al vapore, prezzemolo fresco e profumo di pepe macinato al momento.',
    ingredients: 'Patate, pepe e prezzemolo.',
    price: 1.5,
    image_url: ASSET_IMAGES.friggitoria,
    availability_status: 'available',
    stock_management_enabled: true,
    stock_quantity: 35,
    featured: false,
    badge: 'none',
    visible: true,
    display_order: 5,
  },
  {
    id: 'prod_frig_chips',
    category_id: 'cat_friggitoria',
    name: 'Porzione di chips',
    slug: 'chips-homemade',
    description: 'Patate fresche tagliate sottilissime, fritte dorate e salate al punto giusto.',
    ingredients: 'Homemade patate fresche.',
    price: 0, // Prezzo da impostare dall'admin prima della pubblicazione
    image_url: ASSET_IMAGES.friggitoria,
    availability_status: 'available',
    stock_management_enabled: false,
    stock_quantity: 40,
    featured: false,
    badge: 'none',
    visible: false,
    display_order: 6,
  },
];

export const INITIAL_SETTINGS: BusinessSettings = {
  id: 'settings_main',
  store_name: "'Mpastamm",
  tagline: 'Rosticceria & Forno Contemporaneo',
  hero_title: 'La Vetrina',
  hero_description: 'I nostri lievitati, la tradizione e il gusto di sempre, ogni giorno per te.',
  hero_image_url: ASSET_IMAGES.hero,
  hero_image_alt: 'Mpastamm Rosticceria Interno e Vetrina',
  footer_claim: "Nun c'è fame, è voglia e sfizio.",
  address: 'Via Roma, 42',
  city: 'Napoli (NA)',
  phone: '081 123 4567',
  whatsapp_notification_phone: '393331234567',
  instagram_handle: '@mpastamm.rosticceria',
  orders_enabled: true,
  orders_disabled_message: 'Le prenotazioni per oggi sono terminate. Puoi già prenotare per domani.',
  next_day_orders_allowed: true,
  slot_interval_minutes: 15,
};

export const INITIAL_OPENING_HOURS: OpeningHourDay[] = [
  { day_of_week: 1, day_name: 'Lunedì', is_open: false, morning_open: '11:30', morning_close: '14:30', evening_open: '18:30', evening_close: '23:00' },
  { day_of_week: 2, day_name: 'Martedì', is_open: true, morning_open: '11:30', morning_close: '14:30', evening_open: '18:30', evening_close: '23:00' },
  { day_of_week: 3, day_name: 'Mercoledì', is_open: true, morning_open: '11:30', morning_close: '14:30', evening_open: '18:30', evening_close: '23:00' },
  { day_of_week: 4, day_name: 'Giovedì', is_open: true, morning_open: '11:30', morning_close: '14:30', evening_open: '18:30', evening_close: '23:00' },
  { day_of_week: 5, day_name: 'Venerdì', is_open: true, morning_open: '11:30', morning_close: '14:30', evening_open: '18:30', evening_close: '23:30' },
  { day_of_week: 6, day_name: 'Sabato', is_open: true, morning_open: '11:30', morning_close: '14:30', evening_open: '18:00', evening_close: '00:00' },
  { day_of_week: 0, day_name: 'Domenica', is_open: true, morning_open: '18:00', morning_close: '23:30', evening_open: '18:00', evening_close: '23:30' },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_0048',
    order_number: 'MP-0048',
    customer_name: 'Mario',
    customer_surname: 'Rossi',
    customer_phone: '3331234567',
    pickup_date: new Date().toISOString().split('T')[0],
    pickup_time: '20:30',
    notes: 'Senza maionese sul Crunchy. Grazie!',
    subtotal: 25.0,
    total: 25.0,
    status: 'IN PREPARAZIONE',
    items: [
      {
        id: 'item_1',
        product_id: 'prod_bun_crunchy',
        product_name_snapshot: 'Crunchy',
        product_price_snapshot: 10.0,
        quantity: 2,
        notes: 'Senza maionese',
        subtotal: 20.0,
        image_url_snapshot: ASSET_IMAGES.bun,
      },
      {
        id: 'item_2',
        product_id: 'prod_frig_arancino_ragu',
        product_name_snapshot: 'Arancino ragù',
        product_price_snapshot: 2.0,
        quantity: 1,
        subtotal: 2.0,
        image_url_snapshot: ASSET_IMAGES.friggitoria,
      },
      {
        id: 'item_3',
        product_id: 'prod_frig_crocche',
        product_name_snapshot: 'Crocchè',
        product_price_snapshot: 1.5,
        quantity: 2,
        subtotal: 3.0,
        image_url_snapshot: ASSET_IMAGES.friggitoria,
      },
    ],
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ord_0047',
    order_number: 'MP-0047',
    customer_name: 'Chiara',
    customer_surname: 'Esposito',
    customer_phone: '3409876543',
    pickup_date: new Date().toISOString().split('T')[0],
    pickup_time: '19:45',
    notes: 'Tagliate i saltimbocca a metà per favore',
    subtotal: 24.5,
    total: 24.5,
    status: 'PRONTO',
    items: [
      {
        id: 'item_4',
        product_id: 'prod_sal_sfizioso',
        product_name_snapshot: 'Sfizioso',
        product_price_snapshot: 8.0,
        quantity: 1,
        subtotal: 8.0,
        image_url_snapshot: ASSET_IMAGES.saltimbocca,
      },
      {
        id: 'item_5',
        product_id: 'prod_sal_abatese',
        product_name_snapshot: 'Abatese',
        product_price_snapshot: 9.0,
        quantity: 1,
        subtotal: 9.0,
        image_url_snapshot: ASSET_IMAGES.saltimbocca,
      },
      {
        id: 'item_6',
        product_id: 'prod_rut_margherita',
        product_name_snapshot: 'Margherita',
        product_price_snapshot: 7.5,
        quantity: 1,
        subtotal: 7.5,
        image_url_snapshot: ASSET_IMAGES.rutiello,
      },
    ],
    created_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Helper keys for LocalStorage
const KEYS = {
  CATEGORIES: 'mpastamm_categories_v1',
  PRODUCTS: 'mpastamm_products_v1',
  ORDERS: 'mpastamm_orders_v1',
  SETTINGS: 'mpastamm_settings_v1',
  OPENING_HOURS: 'mpastamm_hours_v1',
  ADMIN_AUTH: 'mpastamm_admin_auth_v1',
  CART: 'mpastamm_cart_v1',
};

// Event emitter for local changes to notify React subscribers
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function emitUpdate() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error(e);
    }
  });
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'SYNC_UPDATE', timestamp: Date.now() });
  }
}

function reportRemoteSyncError(error: unknown) {
  console.error('Supabase sync failed:', error);
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', () => {
    emitUpdate();
  });
  if (broadcastChannel) {
    broadcastChannel.onmessage = () => {
      listeners.forEach((fn) => {
        try {
          fn();
        } catch (e) {
          console.error(e);
        }
      });
    };
  }
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// STORAGE REPOSITORY CLASS
export class StorageService {
  static getCategories(): Category[] {
    const raw = localStorage.getItem(KEYS.CATEGORIES);
    if (!raw) {
      this.saveCategories(INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  static saveCategories(cats: Category[]): void {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(cats));
    emitUpdate();
    void syncCategories(cats).catch(reportRemoteSyncError);
  }

  static hydrateRemoteSnapshot(snapshot: RemoteStoreSnapshot): void {
    if (snapshot.categories.length > 0) {
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(snapshot.categories));
    }
    if (snapshot.products.length > 0) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(snapshot.products));
    }
    if (snapshot.orders.length > 0) {
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(snapshot.orders));
    }
    if (snapshot.settings) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(snapshot.settings));
    }
    if (snapshot.openingHours.length > 0) {
      localStorage.setItem(KEYS.OPENING_HOURS, JSON.stringify(snapshot.openingHours));
    }
    emitUpdate();
  }

  static subscribeToStore(listener: Listener): () => void {
    return subscribeToStore(listener);
  }

  static createCategory(catInput: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Category {
    const cats = this.getCategories();
    const newCat: Category = {
      ...catInput,
      id: `cat_${Date.now()}`,
      display_order: catInput.display_order ?? cats.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    cats.push(newCat);
    this.saveCategories(cats);
    return newCat;
  }

  static updateCategory(id: string, partial: Partial<Category>): Category | null {
    const cats = this.getCategories();
    const idx = cats.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    cats[idx] = {
      ...cats[idx],
      ...partial,
      updated_at: new Date().toISOString(),
    };
    this.saveCategories(cats);
    return cats[idx];
  }

  static deleteCategory(id: string): void {
    const cats = this.getCategories().filter((c) => c.id !== id);
    this.saveCategories(cats);
    void deleteRemoteCategory(id).catch(reportRemoteSyncError);
  }

  static reorderCategory(id: string, direction: 'up' | 'down'): void {
    const cats = [...this.getCategories()].sort((a, b) => a.display_order - b.display_order);
    const index = cats.findIndex((c) => c.id === id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const prevOrder = cats[index - 1].display_order;
      cats[index - 1].display_order = cats[index].display_order;
      cats[index].display_order = prevOrder;
    } else if (direction === 'down' && index < cats.length - 1) {
      const nextOrder = cats[index + 1].display_order;
      cats[index + 1].display_order = cats[index].display_order;
      cats[index].display_order = nextOrder;
    }

    this.saveCategories(cats);
  }

  static getProducts(): Product[] {
    const raw = localStorage.getItem(KEYS.PRODUCTS);
    if (!raw) {
      this.saveProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    try {
      const parsed: Product[] = JSON.parse(raw);
      let changed = false;
      const updated = parsed.map((p) => {
        // If image is an older asset path or missing, update to the fresh high-res asset
        if (!p.image_url || (!p.image_url.startsWith('data:') && !p.image_url.startsWith('http://') && !p.image_url.startsWith('https://'))) {
          const freshImg = getProductFallbackImage(p.category_id.replace('cat_', ''));
          if (p.image_url !== freshImg) {
            changed = true;
            return { ...p, image_url: freshImg };
          }
        }
        return p;
      });
      if (changed) {
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updated));
        return updated;
      }
      return parsed;
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  static saveProducts(prods: Product[]): void {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(prods));
    emitUpdate();
    void syncProducts(prods).catch(reportRemoteSyncError);
  }

  static createProduct(prodInput: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product {
    const prods = this.getProducts();
    const newProd: Product = {
      ...prodInput,
      id: `prod_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    prods.push(newProd);
    this.saveProducts(prods);
    return newProd;
  }

  static updateProductStatus(id: string, status: Product['availability_status']): Product | null {
    return this.updateProductAvailability(id, status);
  }

  static updateProductAvailability(id: string, status: Product['availability_status']): Product | null {
    const prods = this.getProducts();
    const index = prods.findIndex((p) => p.id === id);
    if (index === -1) return null;

    prods[index] = {
      ...prods[index],
      availability_status: status,
      updated_at: new Date().toISOString(),
    };
    this.saveProducts(prods);
    return prods[index];
  }

  static updateProduct(idOrProduct: string | Product, partial?: Partial<Product>): void {
    const prods = this.getProducts();
    if (typeof idOrProduct === 'string') {
      const id = idOrProduct;
      const index = prods.findIndex((p) => p.id === id);
      if (index !== -1 && partial) {
        prods[index] = {
          ...prods[index],
          ...partial,
          updated_at: new Date().toISOString(),
        };
      }
    } else {
      const product = idOrProduct;
      const index = prods.findIndex((p) => p.id === product.id);
      if (index === -1) {
        prods.push({ ...product, updated_at: new Date().toISOString() });
      } else {
        prods[index] = { ...product, updated_at: new Date().toISOString() };
      }
    }
    this.saveProducts(prods);
  }

  static deleteProduct(id: string): void {
    const prods = this.getProducts().filter((p) => p.id !== id);
    this.saveProducts(prods);
    void deleteRemoteProduct(id).catch(reportRemoteSyncError);
  }

  static getOrders(): Order[] {
    const raw = localStorage.getItem(KEYS.ORDERS);
    if (!raw) {
      this.saveOrders(INITIAL_ORDERS);
      return INITIAL_ORDERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ORDERS;
    }
  }

  static saveOrders(orders: Order[]): void {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    emitUpdate();
    void syncOrders(orders).catch(reportRemoteSyncError);
  }

  static getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id || o.order_number === id);
  }

  static updateOrderStatus(orderId: string, status: Order['status']): Order | null {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;

    orders[idx] = {
      ...orders[idx],
      status,
      updated_at: new Date().toISOString(),
    };
    this.saveOrders(orders);
    return orders[idx];
  }

  static createOrder(orderInput: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Order {
    const orders = this.getOrders();
    const nextNum = (orders.length + 49).toString().padStart(4, '0');
    const orderNumber = `MP-${nextNum}`;
    const id = `ord_${Date.now()}`;

    const newOrder: Order = {
      ...orderInput,
      id,
      order_number: orderNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    this.saveOrders(orders);

    // Decrement stock for items with stock_management_enabled
    const prods = this.getProducts();
    let prodsChanged = false;

    for (const item of newOrder.items) {
      const prodIndex = prods.findIndex((p) => p.id === item.product_id);
      if (prodIndex !== -1 && prods[prodIndex].stock_management_enabled) {
        const currentQty = prods[prodIndex].stock_quantity || 0;
        const newQty = Math.max(0, currentQty - item.quantity);
        prods[prodIndex].stock_quantity = newQty;
        if (newQty === 0) {
          prods[prodIndex].availability_status = 'sold_out';
        } else if (newQty <= 5 && prods[prodIndex].availability_status === 'available') {
          prods[prodIndex].availability_status = 'low_stock';
        }
        prodsChanged = true;
      }
    }

    if (prodsChanged) {
      this.saveProducts(prods);
    }

    return newOrder;
  }

  static getSettings(): BusinessSettings {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) {
      this.saveSettings(INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  static saveSettings(settings: BusinessSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    emitUpdate();
    void syncSettings(settings).catch(reportRemoteSyncError);
  }

  static getOpeningHours(): OpeningHourDay[] {
    const raw = localStorage.getItem(KEYS.OPENING_HOURS);
    if (!raw) {
      this.saveOpeningHours(INITIAL_OPENING_HOURS);
      return INITIAL_OPENING_HOURS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_OPENING_HOURS;
    }
  }

  static saveOpeningHours(hours: OpeningHourDay[]): void {
    localStorage.setItem(KEYS.OPENING_HOURS, JSON.stringify(hours));
    emitUpdate();
    void syncOpeningHours(hours).catch(reportRemoteSyncError);
  }

  static getAdminAuth(): { isAuthenticated: boolean; email?: string } {
    const raw = sessionStorage.getItem(KEYS.ADMIN_AUTH) || localStorage.getItem(KEYS.ADMIN_AUTH);
    if (!raw) return { isAuthenticated: false };
    try {
      return JSON.parse(raw);
    } catch {
      return { isAuthenticated: false };
    }
  }

  static setAdminAuth(auth: { isAuthenticated: boolean; email?: string }): void {
    if (auth.isAuthenticated) {
      sessionStorage.setItem(KEYS.ADMIN_AUTH, JSON.stringify(auth));
      localStorage.setItem(KEYS.ADMIN_AUTH, JSON.stringify(auth));
    } else {
      sessionStorage.removeItem(KEYS.ADMIN_AUTH);
      localStorage.removeItem(KEYS.ADMIN_AUTH);
    }
    emitUpdate();
  }

  // CART STATE MANAGEMENT
  static getCart(): { product: Product; quantity: number; notes?: string }[] {
    const raw = localStorage.getItem(KEYS.CART);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveCart(items: { product: Product; quantity: number; notes?: string }[]): void {
    localStorage.setItem(KEYS.CART, JSON.stringify(items));
    emitUpdate();
  }

  static addToCart(product: Product, quantity: number = 1, notes?: string): void {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && (item.notes || '') === (notes || '')
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ product, quantity, notes });
    }

    this.saveCart(cart);
  }

  static updateCartQuantity(productId: string, quantity: number, notes?: string): void {
    let cart = this.getCart();
    const existingIndex = cart.findIndex(
      (item) => item.product.id === productId && (item.notes || '') === (notes || '')
    );

    if (existingIndex > -1) {
      if (quantity <= 0) {
        cart.splice(existingIndex, 1);
      } else {
        cart[existingIndex].quantity = quantity;
      }
      this.saveCart(cart);
    }
  }

  static removeFromCart(productId: string, notes?: string): void {
    let cart = this.getCart();
    cart = cart.filter(
      (item) => !(item.product.id === productId && (item.notes || '') === (notes || ''))
    );
    this.saveCart(cart);
  }

  static clearCart(): void {
    localStorage.removeItem(KEYS.CART);
    emitUpdate();
  }

  static resetToFactoryData(): void {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(KEYS.OPENING_HOURS, JSON.stringify(INITIAL_OPENING_HOURS));
    localStorage.removeItem(KEYS.CART);
    emitUpdate();
  }
}
