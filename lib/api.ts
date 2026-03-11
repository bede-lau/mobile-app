import { supabase } from './supabase';
import { isMockMode } from './config';
import * as mockApi from './mockApi';
import type {
  ApiResponse,
  OutfitFeedItem,
  Garment,
  Store,
  Order,
  OrderItem,
  ShippingAddress,
  CartItem,
  GarmentCategory,
  GarmentGender,
} from '@/types';

// ─── Feed ────────────────────────────────────────────────────────────────────

export async function fetchFeedItems(
  cursor?: { relevance_score: number; id: string },
  limit: number = 5
): Promise<ApiResponse<OutfitFeedItem[]>> {
  if (isMockMode()) return mockApi.fetchFeedItems(cursor, limit);

  try {
    let query = supabase
      .from('outfit_feed_items')
      .select(`
        *,
        store:stores!inner(id, name, logo_url)
      `)
      .eq('is_published', true)
      .order('relevance_score', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.or(
        `relevance_score.lt.${cursor.relevance_score},and(relevance_score.eq.${cursor.relevance_score},id.lt.${cursor.id})`
      );
    }

    const { data, error } = await query;
    if (error) return { data: null, error: error.message, status: 500 };
    return { data: data as OutfitFeedItem[], error: null, status: 200 };
  } catch (e) {
    return { data: null, error: (e as Error).message, status: 500 };
  }
}

// ─── Garments ────────────────────────────────────────────────────────────────

export async function fetchGarment(id: string): Promise<ApiResponse<Garment>> {
  if (isMockMode()) return mockApi.fetchGarment(id);

  try {
    const { data, error } = await supabase
      .from('garments')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return { data: null, error: error.message, status: 404 };
    return { data: data as Garment, error: null, status: 200 };
  } catch (e) {
    return { data: null, error: (e as Error).message, status: 500 };
  }
}

export async function fetchGarments(params: {
  storeId?: string;
  category?: GarmentCategory;
  gender?: GarmentGender;
  cursor?: string;
  limit?: number;
}): Promise<ApiResponse<Garment[]>> {
  if (isMockMode()) return mockApi.fetchGarments(params);

  try {
    let query = supabase
      .from('garments')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(params.limit ?? 20);

    if (params.storeId) query = query.eq('store_id', params.storeId);
    if (params.category) query = query.eq('category', params.category);
    if (params.gender) query = query.eq('gender', params.gender);
    if (params.cursor) query = query.lt('created_at', params.cursor);

    const { data, error } = await query;
    if (error) return { data: null, error: error.message, status: 500 };
    return { data: data as Garment[], error: null, status: 200 };
  } catch (e) {
    return { data: null, error: (e as Error).message, status: 500 };
  }
}

// ─── Store ───────────────────────────────────────────────────────────────────

export async function fetchStore(id: string): Promise<ApiResponse<Store>> {
  if (isMockMode()) return mockApi.fetchStore(id);

  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return { data: null, error: error.message, status: 404 };
    return { data: data as Store, error: null, status: 200 };
  } catch (e) {
    return { data: null, error: (e as Error).message, status: 500 };
  }
}

// ─── Stores ─────────────────────────────────────────────────────────────────

export async function fetchStores(): Promise<ApiResponse<Store[]>> {
  if (isMockMode()) return mockApi.fetchStores();

  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('is_verified', { ascending: false })
      .order('name', { ascending: true });
    if (error) return { data: null, error: error.message, status: 500 };
    return { data: data as Store[], error: null, status: 200 };
  } catch (e) {
    return { data: null, error: (e as Error).message, status: 500 };
  }
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function createOrder(params: {
  userId: string;
  storeId: string;
  items: CartItem[];
  totalMyr: number;
  shippingAddress: ShippingAddress;
}): Promise<ApiResponse<Order>> {
  if (isMockMode()) return mockApi.createOrder(params);

  try {
    const orderItems: OrderItem[] = params.items.map((item) => ({
      garment_id: item.garment_id,
      garment_name: item.name,
      size: item.size,
      quantity: item.quantity,
      unit_price_myr: item.unit_price_myr,
    }));

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: params.userId,
        store_id: params.storeId,
        items: orderItems,
        total_myr: params.totalMyr,
        shipping_address: params.shippingAddress,
        status: 'paid',
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message, status: 500 };
    return { data: data as Order, error: null, status: 201 };
  } catch (e) {
    return { data: null, error: (e as Error).message, status: 500 };
  }
}

// ─── Body Scan ───────────────────────────────────────────────────────────────

export async function submitBodyScan(params: {
  userId: string;
  imageUrls: string[];
}): Promise<ApiResponse<{ scanId: string }>> {
  if (isMockMode()) return mockApi.submitBodyScan(params);

  try {
    const { data, error } = await supabase
      .from('body_scans')
      .insert({
        user_id: params.userId,
        status: 'uploading',
        image_urls: params.imageUrls,
      })
      .select('id')
      .single();

    if (error) return { data: null, error: error.message, status: 500 };

    // Trigger processing via Edge Function
    await supabase.functions.invoke('process-body-scan', {
      body: { scan_id: data.id },
    });

    return { data: { scanId: data.id }, error: null, status: 201 };
  } catch (e) {
    return { data: null, error: (e as Error).message, status: 500 };
  }
}

// ─── Favourites ─────────────────────────────────────────────────────────────

export async function fetchFavouriteGarments(
  userId: string
): Promise<ApiResponse<Garment[]>> {
  if (isMockMode()) return mockApi.fetchFavouriteGarments(userId);

  try {
    // 1. Get user's liked feed items
    const { data: likes, error: likesError } = await supabase
      .from('user_likes')
      .select('feed_item_id')
      .eq('user_id', userId);

    if (likesError) return { data: null, error: likesError.message, status: 500 };
    if (!likes || likes.length === 0) return { data: [], error: null, status: 200 };

    // 2. Get garment_ids from those feed items
    const { data: feedItems, error: feedError } = await supabase
      .from('outfit_feed_items')
      .select('garment_ids')
      .in('id', likes.map(l => l.feed_item_id));

    if (feedError) return { data: null, error: feedError.message, status: 500 };
    if (!feedItems || feedItems.length === 0) return { data: [], error: null, status: 200 };

    // 3. Flatten and dedupe garment IDs
    const garmentIds = [...new Set(feedItems.flatMap(f => f.garment_ids as string[]))];
    if (garmentIds.length === 0) return { data: [], error: null, status: 200 };

    // 4. Fetch those garments
    const { data: garments, error: garmentsError } = await supabase
      .from('garments')
      .select('*')
      .in('id', garmentIds);

    if (garmentsError) return { data: null, error: garmentsError.message, status: 500 };
    return { data: garments as Garment[], error: null, status: 200 };
  } catch (e) {
    return { data: null, error: (e as Error).message, status: 500 };
  }
}

// ─── User Likes ──────────────────────────────────────────────────────────────

export async function toggleLike(
  userId: string,
  feedItemId: string,
  isLiked: boolean
): Promise<void> {
  if (isMockMode()) return mockApi.toggleLike(userId, feedItemId, isLiked);

  if (isLiked) {
    await supabase
      .from('user_likes')
      .delete()
      .eq('user_id', userId)
      .eq('feed_item_id', feedItemId);
  } else {
    await supabase
      .from('user_likes')
      .insert({ user_id: userId, feed_item_id: feedItemId });
  }
}
