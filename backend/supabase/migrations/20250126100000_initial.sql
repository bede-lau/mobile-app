-- ═══════════════════════════════════════════════════════════════════════════
-- Olvon — Initial Schema Migration
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Custom Enums ────────────────────────────────────────────────────────────

CREATE TYPE garment_category AS ENUM (
  'tops', 'bottoms', 'dresses', 'outerwear', 'activewear', 'traditional', 'accessories'
);

CREATE TYPE garment_gender AS ENUM ('male', 'female', 'unisex');

CREATE TYPE order_status AS ENUM (
  'pending', 'payment_processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'
);

CREATE TYPE scan_status AS ENUM (
  'idle', 'capturing', 'uploading', 'processing', 'completed', 'failed'
);

-- ─── Updated-at Trigger Function ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Users ───────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  height_cm SMALLINT CHECK (height_cm IS NULL OR (height_cm BETWEEN 100 AND 250)),
  preferred_language TEXT NOT NULL DEFAULT 'en'
    CHECK (preferred_language IN ('en', 'ms', 'zh', 'th', 'vi', 'id')),
  style_preferences TEXT[] NOT NULL DEFAULT '{}',
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Stores ──────────────────────────────────────────────────────────────────

CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  banner_url TEXT,
  location TEXT NOT NULL DEFAULT '',
  website TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stores_owner_id ON stores(owner_id);

CREATE TRIGGER stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Garments ────────────────────────────────────────────────────────────────

CREATE TABLE garments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category garment_category NOT NULL,
  gender garment_gender NOT NULL DEFAULT 'unisex',
  price_myr NUMERIC(10, 2) NOT NULL CHECK (price_myr >= 0),
  sale_price_myr NUMERIC(10, 2) CHECK (sale_price_myr IS NULL OR sale_price_myr >= 0),
  sizes_available TEXT[] NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  glb_url TEXT,
  fabric_type TEXT NOT NULL DEFAULT '',
  fabric_composition TEXT NOT NULL DEFAULT '',
  care_instructions TEXT NOT NULL DEFAULT '',
  style_tags TEXT[] NOT NULL DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_new BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_garments_store_id ON garments(store_id);
CREATE INDEX idx_garments_category_published ON garments(category, is_published);
CREATE INDEX idx_garments_price_published ON garments(price_myr) WHERE is_published = TRUE;

CREATE TRIGGER garments_updated_at
  BEFORE UPDATE ON garments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Outfit Feed Items ───────────────────────────────────────────────────────

CREATE TABLE outfit_feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  video_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL DEFAULT '',
  garment_ids UUID[] NOT NULL DEFAULT '{}',
  style_tags TEXT[] NOT NULL DEFAULT '{}',
  likes_count INT NOT NULL DEFAULT 0,
  relevance_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feed_items_store_id ON outfit_feed_items(store_id);
CREATE INDEX idx_feed_items_relevance ON outfit_feed_items(relevance_score DESC, id)
  WHERE is_published = TRUE;

-- ─── Orders ──────────────────────────────────────────────────────────────────

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  total_myr NUMERIC(10, 2) NOT NULL CHECK (total_myr >= 0),
  status order_status NOT NULL DEFAULT 'pending',
  shipping_address JSONB NOT NULL DEFAULT '{}',
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── User Likes ──────────────────────────────────────────────────────────────

CREATE TABLE user_likes (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feed_item_id UUID NOT NULL REFERENCES outfit_feed_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, feed_item_id)
);

-- ─── Body Scans ──────────────────────────────────────────────────────────────

CREATE TABLE body_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status scan_status NOT NULL DEFAULT 'idle',
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  avatar_url TEXT,
  glb_url TEXT,
  measurements JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_body_scans_user_id ON body_scans(user_id);

CREATE TRIGGER body_scans_updated_at
  BEFORE UPDATE ON body_scans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
