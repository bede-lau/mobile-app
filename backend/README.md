# Olvon Backend

Supabase-based backend for the Olvon virtual fitting app. Includes database migrations, Row-Level Security policies, storage bucket configuration, and Deno Edge Functions.

## Structure

```
backend/
  supabase/
    migrations/
      20250126_initial.sql      # Schema: enums, tables, indexes, triggers
      20250126_rls.sql          # Row-Level Security policies
      20250126_storage.sql      # Storage buckets + policies
    functions/
      create-payment-intent/    # Stripe PaymentIntent creation (MYR)
      process-body-scan/        # Queue body scan for GPU processing
      generate-size-recommendation/  # Server-side size recommendation
```

## Database Schema

### Tables
- **users** — User profiles, language pref, height, style preferences, onboarding state
- **stores** — Merchant stores with verification status
- **garments** — Product catalog with category, fabric, sizing, pricing (MYR)
- **outfit_feed_items** — TikTok-style video feed entries with relevance scoring
- **orders** — Purchase orders with status tracking
- **user_likes** — Feed item likes (unique per user)
- **body_scans** — Body scan jobs with status, measurements, avatar URLs

### Enums
- `garment_category`: tops, bottoms, dresses, outerwear, activewear, traditional, accessories
- `garment_gender`: men, women, unisex
- `order_status`: pending, confirmed, processing, shipped, delivered, cancelled
- `scan_status`: pending, processing, completed, failed

## Storage Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| `avatars` | Public read | User avatar images |
| `body-scans` | Private | Raw body scan frames (12 per scan) |
| `garment-assets` | Public read | Product images, 3D assets |
| `feed-videos` | Public read | Outfit feed video content |

## Edge Functions

### create-payment-intent
Creates a Stripe PaymentIntent for checkout. Validates auth JWT, calculates total from cart items, creates intent in MYR currency.

### process-body-scan
Receives a scan ID, updates status to `processing`, and queues the scan for the GPU worker pipeline (4D-Humans / ANNY). The GPU worker is external and runs on vast.ai.

### generate-size-recommendation
Server-side authoritative size recommendation. Compares user body measurements against garment size charts and returns recommended size, confidence score, fit type, and alternatives.

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

3. Link to your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Run migrations:
   ```bash
   supabase db push
   ```

5. Deploy Edge Functions:
   ```bash
   supabase functions deploy create-payment-intent
   supabase functions deploy process-body-scan
   supabase functions deploy generate-size-recommendation
   ```

6. Set Edge Function secrets:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   ```

## RLS Summary

All tables have Row-Level Security enabled. Policies use `auth.uid()` directly (no subqueries) for performance:

- **users**: Read/update own row only
- **stores**: Public read for all; owner can insert/update/delete
- **garments**: Public read where `is_published = true`; store owner CRUD
- **outfit_feed_items**: Public read where `is_published = true`; store owner CRUD
- **orders**: Read own orders; insert own orders on checkout
- **user_likes**: Read/insert/delete own likes only
- **body_scans**: Full CRUD on own scans only
