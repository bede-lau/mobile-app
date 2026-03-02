// ─── Language ────────────────────────────────────────────────────────────────
export type Language = 'en' | 'ms' | 'zh' | 'th' | 'vi' | 'id';

// ─── API ─────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  height_cm: number | null;
  preferred_language: Language;
  style_preferences: string[];
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Body ────────────────────────────────────────────────────────────────────
export interface BodyMeasurements {
  chest_cm: number;
  waist_cm: number;
  hips_cm: number;
  shoulder_width_cm: number;
  arm_length_cm: number;
  inseam_cm: number;
  neck_cm: number;
  thigh_cm: number;
}

export type ScanStatus = 'idle' | 'capturing' | 'uploading' | 'processing' | 'completed' | 'failed';

export interface ScanResult {
  scan_id: string;
  avatar_url: string;
  glb_url: string | null;
  measurements: BodyMeasurements | null;
  status: ScanStatus;
  created_at: string;
}

// ─── Garment ─────────────────────────────────────────────────────────────────
export type GarmentCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'activewear'
  | 'traditional'
  | 'accessories';

export type GarmentGender = 'male' | 'female' | 'unisex';

export type GarmentSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL';

export interface Garment {
  id: string;
  store_id: string;
  name: string;
  description: string;
  category: GarmentCategory;
  gender: GarmentGender;
  price_myr: number;
  sizes_available: GarmentSize[];
  thumbnail_url: string;
  images: string[];
  glb_url: string | null;
  fabric_type: string;
  fabric_composition: string;
  care_instructions: string;
  style_tags: string[];
  is_published: boolean;
  is_new: boolean;
  sale_price_myr: number | null;
  created_at: string;
  updated_at: string;
}

// ─── Store ───────────────────────────────────────────────────────────────────
export interface Store {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  logo_url: string | null;
  banner_url: string | null;
  location: string;
  website: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Feed ────────────────────────────────────────────────────────────────────
export interface OutfitFeedItem {
  id: string;
  store_id: string;
  store: Pick<Store, 'id' | 'name' | 'logo_url'>;
  title: string;
  video_url: string;
  thumbnail_url: string;
  garment_ids: string[];
  garments: Pick<Garment, 'id' | 'name' | 'thumbnail_url' | 'price_myr'>[];
  style_tags: string[];
  likes_count: number;
  relevance_score: number;
  is_published: boolean;
  created_at: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'payment_processing'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  garment_id: string;
  garment_name: string;
  size: GarmentSize;
  quantity: number;
  unit_price_myr: number;
}

export interface Order {
  id: string;
  user_id: string;
  store_id: string;
  items: OrderItem[];
  total_myr: number;
  status: OrderStatus;
  shipping_address: ShippingAddress;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

// ─── Size Recommendation ─────────────────────────────────────────────────────
export type FitType = 'tight' | 'fitted' | 'regular' | 'relaxed' | 'oversized';

export interface SizeRecommendation {
  recommended_size: GarmentSize;
  confidence: number;
  fit_type: FitType;
  alternatives: {
    size: GarmentSize;
    fit_type: FitType;
    note: string;
  }[];
  measurement_comparison: {
    measurement: keyof BodyMeasurements;
    user_cm: number;
    garment_cm: number;
    difference_cm: number;
  }[];
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface CartItem {
  garment_id: string;
  store_id: string;
  name: string;
  thumbnail_url: string;
  size: GarmentSize;
  quantity: number;
  unit_price_myr: number;
}

// ─── Onboarding ──────────────────────────────────────────────────────────────
export interface OnboardingData {
  language: Language;
  style_preferences: string[];
  height_cm: number;
}

// ─── User Likes ──────────────────────────────────────────────────────────────
export interface UserLike {
  user_id: string;
  feed_item_id: string;
  created_at: string;
}

// ─── Dressing Room ──────────────────────────────────────────────────────────
export type DressingRoomView = 'stores' | 'categories' | 'garments';
