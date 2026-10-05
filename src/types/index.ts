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
  | 'IN ATTESA CLIENTE'
  | 'ACCETTATO'
  | 'IN PREPARAZIONE'
  | 'PRONTO'
  | 'RITIRATO'
  | 'ANNULLATO';

export type FulfillmentMethod = 'pickup' | 'delivery';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type CustomerOrderResponse = 'pending' | 'accepted' | 'declined' | 'alternative_selected';

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
  fulfillment_method?: FulfillmentMethod;
  delivery_address?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  pickup_date: string; // YYYY-MM-DD
  pickup_time: string; // HH:MM
  notes?: string;
  subtotal: number;
  total: number;
  status: OrderStatus;
  payment_status?: PaymentStatus;
  customer_token?: string;
  admin_message?: string;
  missing_product_ids?: string[];
  alternative_product_ids?: string[];
  customer_selected_alternative_product_ids?: string[];
  customer_response?: CustomerOrderResponse;
  stripe_checkout_session_id?: string;
  stripe_payment_intent_id?: string;
  paid_at?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface SiteContent {
  logo_image_url?: string;
  about_eyebrow: string;
  about_title: string;
  about_description: string;
  about_image_url: string;
  about_image_alt: string;
  about_feature_1_title: string;
  about_feature_1_description: string;
  about_feature_2_title: string;
  about_feature_2_description: string;
  about_feature_3_title: string;
  about_feature_3_description: string;
  about_cta_label: string;
  catering_eyebrow: string;
  catering_title: string;
  catering_description: string;
  catering_image_url: string;
  catering_image_alt: string;
  catering_feature_1_title: string;
  catering_feature_1_description: string;
  catering_feature_2_title: string;
  catering_feature_2_description: string;
  catering_feature_3_title: string;
  catering_feature_3_description: string;
  catering_action_title: string;
  catering_action_description: string;
  catering_whatsapp_label: string;
  location_eyebrow: string;
  location_title: string;
  location_description: string;
  location_image_url: string;
  location_image_alt: string;
  location_contact_title: string;
  location_hours_title: string;
  location_hours_note: string;
  location_map_button_label: string;
  footer_quality_title: string;
  footer_quality_text: string;
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
  site_content?: SiteContent;
  address: string;
  city: string;
  phone: string;
  whatsapp_notification_phone: string;
  instagram_handle: string;
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
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
