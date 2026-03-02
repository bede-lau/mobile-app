-- ═══════════════════════════════════════════════════════════════════════════
-- Olvon — Storage Bucket Configuration
-- ═══════════════════════════════════════════════════════════════════════════

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('body-scans', 'body-scans', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('garment-assets', 'garment-assets', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('feed-videos', 'feed-videos', true);

-- ─── Avatars (public read, owner write) ──────────────────────────────────────

CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_owner_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─── Body Scans (private — owner only) ──────────────────────────────────────

CREATE POLICY "body_scans_owner_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'body-scans'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "body_scans_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'body-scans'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─── Garment Assets (public read, store owner write via service role) ────────

CREATE POLICY "garment_assets_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'garment-assets');

-- ─── Feed Videos (public read, store owner write via service role) ───────────

CREATE POLICY "feed_videos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'feed-videos');
