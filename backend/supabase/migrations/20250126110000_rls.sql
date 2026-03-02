-- ═══════════════════════════════════════════════════════════════════════════
-- Olvon — Row-Level Security Policies
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE garments ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_scans ENABLE ROW LEVEL SECURITY;

-- ─── Users ───────────────────────────────────────────────────────────────────
-- Users can read and update their own row only

CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "users_insert_own"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ─── Stores ──────────────────────────────────────────────────────────────────
-- Anyone can read stores. Owner can CRUD.

CREATE POLICY "stores_select_public"
  ON stores FOR SELECT
  USING (true);

CREATE POLICY "stores_insert_owner"
  ON stores FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "stores_update_owner"
  ON stores FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "stores_delete_owner"
  ON stores FOR DELETE
  USING (owner_id = auth.uid());

-- ─── Garments ────────────────────────────────────────────────────────────────
-- Anyone can read published garments. Store owner can CRUD.

CREATE POLICY "garments_select_published"
  ON garments FOR SELECT
  USING (
    is_published = TRUE
    OR store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "garments_insert_store_owner"
  ON garments FOR INSERT
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "garments_update_store_owner"
  ON garments FOR UPDATE
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "garments_delete_store_owner"
  ON garments FOR DELETE
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- ─── Outfit Feed Items ───────────────────────────────────────────────────────
-- Anyone can read published feed items. Store owner can CRUD.

CREATE POLICY "feed_items_select_published"
  ON outfit_feed_items FOR SELECT
  USING (
    is_published = TRUE
    OR store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "feed_items_insert_store_owner"
  ON outfit_feed_items FOR INSERT
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "feed_items_update_store_owner"
  ON outfit_feed_items FOR UPDATE
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

CREATE POLICY "feed_items_delete_store_owner"
  ON outfit_feed_items FOR DELETE
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- ─── Orders ──────────────────────────────────────────────────────────────────
-- Users can read their own orders and create orders

CREATE POLICY "orders_select_own"
  ON orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "orders_insert_own"
  ON orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Store owners can view orders for their stores
CREATE POLICY "orders_select_store_owner"
  ON orders FOR SELECT
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- ─── User Likes ──────────────────────────────────────────────────────────────
-- Users can manage their own likes

CREATE POLICY "likes_select_own"
  ON user_likes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "likes_insert_own"
  ON user_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "likes_delete_own"
  ON user_likes FOR DELETE
  USING (user_id = auth.uid());

-- ─── Body Scans ──────────────────────────────────────────────────────────────
-- Users can only access their own scans

CREATE POLICY "body_scans_select_own"
  ON body_scans FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "body_scans_insert_own"
  ON body_scans FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "body_scans_update_own"
  ON body_scans FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
