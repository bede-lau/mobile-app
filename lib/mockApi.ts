// ─── Mock API Functions ────────────────────────────────────────────────────
// Mirrors real API signatures for development without backend

import { logMock } from './config';
import {
  MOCK_STORES,
  MOCK_GARMENTS,
  MOCK_FEED_ITEMS,
  MOCK_USER_LIKES,
  getGarmentsByIds,
} from './mockData';
import type {
  ApiResponse,
  OutfitFeedItem,
  Garment,
  Store,
  Order,
  CartItem,
  ShippingAddress,
  GarmentCategory,
  GarmentGender,
} from '@/types';

// Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Feed ───────────────────────────────────────────────────────────────────

export async function fetchFeedItems(
  cursor?: { relevance_score: number; id: string },
  limit: number = 5
): Promise<ApiResponse<OutfitFeedItem[]>> {
  await delay();
  logMock('fetchFeedItems', { cursor, limit });

  let items = [...MOCK_FEED_ITEMS];

  if (cursor) {
    const cursorIndex = items.findIndex(
      item => item.relevance_score <= cursor.relevance_score && item.id < cursor.id
    );
    if (cursorIndex !== -1) {
      items = items.slice(cursorIndex);
    }
  }

  const result = items.slice(0, limit);
  return { data: result, error: null, status: 200 };
}

// ─── Garments ───────────────────────────────────────────────────────────────

export async function fetchGarment(id: string): Promise<ApiResponse<Garment>> {
  await delay();
  logMock('fetchGarment', { id });

  const garment = MOCK_GARMENTS.find(g => g.id === id);
  if (!garment) {
    return { data: null, error: 'Garment not found', status: 404 };
  }
  return { data: garment, error: null, status: 200 };
}

export async function fetchGarments(params: {
  storeId?: string;
  category?: GarmentCategory;
  gender?: GarmentGender;
  cursor?: string;
  limit?: number;
}): Promise<ApiResponse<Garment[]>> {
  await delay();
  logMock('fetchGarments', params);

  let result = [...MOCK_GARMENTS];

  if (params.storeId) {
    result = result.filter(g => g.store_id === params.storeId);
  }
  if (params.category) {
    result = result.filter(g => g.category === params.category);
  }
  if (params.gender) {
    result = result.filter(g => g.gender === params.gender);
  }

  // Sort by created_at descending
  result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (params.cursor) {
    const cursorIndex = result.findIndex(g => g.created_at < params.cursor!);
    if (cursorIndex !== -1) {
      result = result.slice(cursorIndex);
    }
  }

  const limit = params.limit ?? 20;
  result = result.slice(0, limit);

  return { data: result, error: null, status: 200 };
}

// ─── Stores ─────────────────────────────────────────────────────────────────

export async function fetchStore(id: string): Promise<ApiResponse<Store>> {
  await delay();
  logMock('fetchStore', { id });

  const store = MOCK_STORES.find(s => s.id === id);
  if (!store) {
    return { data: null, error: 'Store not found', status: 404 };
  }
  return { data: store, error: null, status: 200 };
}

export async function fetchStores(): Promise<ApiResponse<Store[]>> {
  await delay();
  logMock('fetchStores');

  return { data: MOCK_STORES, error: null, status: 200 };
}

// ─── Favourites ─────────────────────────────────────────────────────────────

export async function fetchFavouriteGarments(
  userId: string
): Promise<ApiResponse<Garment[]>> {
  await delay(400); // Slightly longer for complex query
  logMock('fetchFavouriteGarments', { userId });

  // 1. Get user's liked feed items
  const likedFeedItemIds = MOCK_USER_LIKES.map(l => l.feed_item_id);

  // 2. Get garment_ids from those feed items
  const likedFeedItems = MOCK_FEED_ITEMS.filter(f => likedFeedItemIds.includes(f.id));
  const garmentIds = [...new Set(likedFeedItems.flatMap(f => f.garment_ids))];

  // 3. Fetch those garments
  const garments = getGarmentsByIds(garmentIds);

  return { data: garments, error: null, status: 200 };
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export async function createOrder(params: {
  userId: string;
  storeId: string;
  items: CartItem[];
  totalMyr: number;
  shippingAddress: ShippingAddress;
}): Promise<ApiResponse<Order>> {
  await delay(500);
  logMock('createOrder', params);

  const order: Order = {
    id: `order-mock-${Date.now()}`,
    user_id: params.userId,
    store_id: params.storeId,
    items: params.items.map(item => ({
      garment_id: item.garment_id,
      garment_name: item.name,
      size: item.size,
      quantity: item.quantity,
      unit_price_myr: item.unit_price_myr,
    })),
    total_myr: params.totalMyr,
    status: 'paid',
    shipping_address: params.shippingAddress,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return { data: order, error: null, status: 201 };
}

// ─── Body Scan ──────────────────────────────────────────────────────────────

export async function submitBodyScan(params: {
  userId: string;
  imageUrls: string[];
}): Promise<ApiResponse<{ scanId: string }>> {
  await delay(1000);
  logMock('submitBodyScan', { userId: params.userId, imageCount: params.imageUrls.length });

  return {
    data: { scanId: `scan-mock-${Date.now()}` },
    error: null,
    status: 201,
  };
}

// ─── User Likes ─────────────────────────────────────────────────────────────

export async function toggleLike(
  userId: string,
  feedItemId: string,
  isLiked: boolean
): Promise<void> {
  await delay(100);
  logMock('toggleLike', { userId, feedItemId, isLiked });
  // In mock mode, we don't persist likes
}
