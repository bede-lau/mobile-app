// ─── Mock Data for Development ─────────────────────────────────────────────
// 8-10 stores, ~200 garments, ~40 feed items for testing without backend

import type {
  Store,
  Garment,
  OutfitFeedItem,
  GarmentCategory,
  GarmentGender,
  GarmentSize,
} from '@/types';

// ─── Mock Stores (10) ───────────────────────────────────────────────────────

export const MOCK_STORES: Store[] = [
  {
    id: 'store-001',
    owner_id: 'owner-001',
    name: 'KLCC Fashion',
    description: 'Premium fashion from the heart of Kuala Lumpur. Trendy styles for the modern Malaysian.',
    logo_url: 'https://picsum.photos/seed/klcc/200',
    banner_url: 'https://picsum.photos/seed/klcc-banner/800/400',
    location: 'Kuala Lumpur',
    website: 'https://klccfashion.my',
    is_verified: true,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'store-002',
    owner_id: 'owner-002',
    name: 'Pavilion Style',
    description: 'Luxury and contemporary fashion for discerning shoppers.',
    logo_url: 'https://picsum.photos/seed/pavilion/200',
    banner_url: 'https://picsum.photos/seed/pavilion-banner/800/400',
    location: 'Kuala Lumpur',
    website: 'https://pavilionstyle.my',
    is_verified: true,
    created_at: '2024-02-20T09:00:00Z',
    updated_at: '2024-11-15T14:00:00Z',
  },
  {
    id: 'store-003',
    owner_id: 'owner-003',
    name: 'Baju Kurung House',
    description: 'Traditional Malaysian attire with modern twists. Perfect for Raya and special occasions.',
    logo_url: 'https://picsum.photos/seed/bajukurung/200',
    banner_url: 'https://picsum.photos/seed/baju-banner/800/400',
    location: 'Kuala Lumpur',
    website: null,
    is_verified: false,
    created_at: '2024-03-10T07:30:00Z',
    updated_at: '2024-10-20T16:00:00Z',
  },
  {
    id: 'store-004',
    owner_id: 'owner-004',
    name: 'Streetwear MY',
    description: 'Urban streetwear for the bold and expressive. Limited drops and exclusive collabs.',
    logo_url: 'https://picsum.photos/seed/streetwear/200',
    banner_url: 'https://picsum.photos/seed/street-banner/800/400',
    location: 'Selangor',
    website: 'https://streetwear.my',
    is_verified: false,
    created_at: '2024-04-05T11:00:00Z',
    updated_at: '2024-12-10T09:00:00Z',
  },
  {
    id: 'store-005',
    owner_id: 'owner-005',
    name: 'Borneo Threads',
    description: 'Authentic East Malaysian fashion. Sarawak and Sabah inspired designs.',
    logo_url: 'https://picsum.photos/seed/borneo/200',
    banner_url: 'https://picsum.photos/seed/borneo-banner/800/400',
    location: 'Sabah',
    website: 'https://borneothreads.com',
    is_verified: true,
    created_at: '2024-05-18T06:00:00Z',
    updated_at: '2024-11-28T12:00:00Z',
  },
  {
    id: 'store-006',
    owner_id: 'owner-006',
    name: 'Singapore Chic',
    description: 'Sophisticated fashion from our neighbors. Clean lines and modern aesthetics.',
    logo_url: 'https://picsum.photos/seed/singapore/200',
    banner_url: 'https://picsum.photos/seed/sg-banner/800/400',
    location: 'Singapore',
    website: 'https://singaporechic.sg',
    is_verified: true,
    created_at: '2024-06-22T08:30:00Z',
    updated_at: '2024-12-05T15:00:00Z',
  },
  {
    id: 'store-007',
    owner_id: 'owner-007',
    name: 'Bangkok Bazaar',
    description: 'Thai-inspired fashion at Malaysian prices. Colorful and vibrant styles.',
    logo_url: 'https://picsum.photos/seed/bangkok/200',
    banner_url: 'https://picsum.photos/seed/bangkok-banner/800/400',
    location: 'Thailand',
    website: null,
    is_verified: false,
    created_at: '2024-07-14T10:00:00Z',
    updated_at: '2024-11-10T11:00:00Z',
  },
  {
    id: 'store-008',
    owner_id: 'owner-008',
    name: 'Batik Collection',
    description: 'Premium batik wear for all occasions. Traditional patterns meet contemporary cuts.',
    logo_url: 'https://picsum.photos/seed/batik/200',
    banner_url: 'https://picsum.photos/seed/batik-banner/800/400',
    location: 'Kuala Lumpur',
    website: 'https://batikcollection.my',
    is_verified: true,
    created_at: '2024-08-03T09:00:00Z',
    updated_at: '2024-12-12T08:00:00Z',
  },
  {
    id: 'store-009',
    owner_id: 'owner-009',
    name: 'Active Life MY',
    description: 'Activewear and athleisure for the fitness enthusiast. Performance meets style.',
    logo_url: 'https://picsum.photos/seed/activelife/200',
    banner_url: 'https://picsum.photos/seed/active-banner/800/400',
    location: 'Selangor',
    website: 'https://activelife.my',
    is_verified: false,
    created_at: '2024-09-11T07:00:00Z',
    updated_at: '2024-11-25T13:00:00Z',
  },
  {
    id: 'store-010',
    owner_id: 'owner-010',
    name: 'Modest Fashion Co',
    description: 'Elegant modest fashion for the modern Muslim woman. Hijabs, abayas, and more.',
    logo_url: 'https://picsum.photos/seed/modest/200',
    banner_url: 'https://picsum.photos/seed/modest-banner/800/400',
    location: 'Kuala Lumpur',
    website: 'https://modestfashion.my',
    is_verified: true,
    created_at: '2024-10-01T08:00:00Z',
    updated_at: '2024-12-08T10:00:00Z',
  },
];

// ─── Helper Functions ───────────────────────────────────────────────────────

const CATEGORIES: GarmentCategory[] = ['tops', 'bottoms', 'dresses', 'outerwear', 'activewear', 'traditional', 'accessories'];
const GENDERS: GarmentGender[] = ['male', 'female', 'unisex'];
const SIZES: GarmentSize[] = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomPrice = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Category-specific naming
const categoryNames: Record<GarmentCategory, string[]> = {
  tops: ['Classic Shirt', 'Polo Tee', 'Blouse', 'Tank Top', 'Crop Top', 'Oversized Tee', 'Button-Down', 'Henley', 'V-Neck', 'Graphic Tee'],
  bottoms: ['Slim Jeans', 'Wide Leg Pants', 'Cargo Shorts', 'Chinos', 'Joggers', 'Midi Skirt', 'Pleated Trousers', 'Denim Shorts', 'Palazzo Pants', 'Culottes'],
  dresses: ['Maxi Dress', 'Midi Dress', 'Wrap Dress', 'Shift Dress', 'A-Line Dress', 'Bodycon Dress', 'Shirt Dress', 'Sundress', 'Cocktail Dress', 'Slip Dress'],
  outerwear: ['Blazer', 'Denim Jacket', 'Cardigan', 'Windbreaker', 'Bomber Jacket', 'Trench Coat', 'Hoodie', 'Vest', 'Parka', 'Leather Jacket'],
  activewear: ['Sports Bra', 'Leggings', 'Running Shorts', 'Track Jacket', 'Yoga Pants', 'Gym Tank', 'Compression Tights', 'Training Tee', 'Sweatpants', 'Performance Top'],
  traditional: ['Baju Kurung', 'Baju Melayu', 'Kebaya', 'Cheongsam', 'Batik Shirt', 'Sarong', 'Songket Top', 'Traditional Blouse', 'Sampin', 'Tudung'],
  accessories: ['Hijab', 'Scarf', 'Belt', 'Watch', 'Sunglasses', 'Hat', 'Handbag', 'Tote Bag', 'Jewelry Set', 'Hair Accessories'],
};

const fabricTypes = ['Cotton', 'Polyester', 'Linen', 'Silk', 'Denim', 'Chiffon', 'Rayon', 'Wool', 'Nylon', 'Lycra'];
const styleTagOptions = ['casual', 'formal', 'streetwear', 'minimalist', 'traditional', 'sporty', 'vintage', 'bohemian', 'preppy', 'elegant'];

// ─── Generate Garments ──────────────────────────────────────────────────────

const generateGarment = (storeId: string, index: number, category: GarmentCategory): Garment => {
  const name = `${randomFromArray(categoryNames[category])} ${index + 1}`;
  const price = randomPrice(29, 499);
  const isNew = Math.random() < 0.3;
  const hasSale = Math.random() < 0.2;
  const gender = category === 'traditional' ? randomFromArray(['male', 'female'] as GarmentGender[]) : randomFromArray(GENDERS);
  const availableSizes = SIZES.slice(randomInt(0, 2), randomInt(4, 6));

  return {
    id: `garment-${storeId}-${category}-${index}`,
    store_id: storeId,
    name,
    description: `Beautiful ${name.toLowerCase()} from our latest collection. Perfect for any occasion.`,
    category,
    gender,
    price_myr: price,
    sizes_available: availableSizes,
    thumbnail_url: `https://picsum.photos/seed/${storeId}-${category}-${index}/400/500`,
    images: [
      `https://picsum.photos/seed/${storeId}-${category}-${index}/800/1000`,
      `https://picsum.photos/seed/${storeId}-${category}-${index}-2/800/1000`,
      `https://picsum.photos/seed/${storeId}-${category}-${index}-3/800/1000`,
    ],
    glb_url: null,
    fabric_type: randomFromArray(fabricTypes),
    fabric_composition: `${randomInt(60, 100)}% ${randomFromArray(fabricTypes)}, ${randomInt(0, 40)}% ${randomFromArray(fabricTypes)}`,
    care_instructions: 'Machine wash cold. Tumble dry low. Do not bleach.',
    style_tags: [randomFromArray(styleTagOptions), randomFromArray(styleTagOptions)].filter((v, i, a) => a.indexOf(v) === i),
    is_published: true,
    is_new: isNew,
    sale_price_myr: hasSale ? Math.round(price * 0.7 * 100) / 100 : null,
    created_at: new Date(Date.now() - randomInt(1, 365) * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
  };
};

// Distribution of garments per store with some intentional gaps (for "No stock" testing)
const storeGarmentDistribution: Record<string, Partial<Record<GarmentCategory, number>>> = {
  'store-001': { tops: 8, bottoms: 6, dresses: 4, outerwear: 3, activewear: 0, traditional: 2, accessories: 3 },
  'store-002': { tops: 6, bottoms: 5, dresses: 7, outerwear: 4, activewear: 0, traditional: 0, accessories: 5 },
  'store-003': { tops: 2, bottoms: 2, dresses: 3, outerwear: 0, activewear: 0, traditional: 12, accessories: 4 },
  'store-004': { tops: 10, bottoms: 8, dresses: 0, outerwear: 5, activewear: 3, traditional: 0, accessories: 6 },
  'store-005': { tops: 5, bottoms: 4, dresses: 3, outerwear: 2, activewear: 0, traditional: 8, accessories: 5 },
  'store-006': { tops: 7, bottoms: 6, dresses: 8, outerwear: 3, activewear: 0, traditional: 0, accessories: 4 },
  'store-007': { tops: 9, bottoms: 7, dresses: 5, outerwear: 2, activewear: 2, traditional: 3, accessories: 5 },
  'store-008': { tops: 4, bottoms: 3, dresses: 2, outerwear: 1, activewear: 0, traditional: 15, accessories: 3 },
  'store-009': { tops: 6, bottoms: 4, dresses: 0, outerwear: 3, activewear: 12, traditional: 0, accessories: 2 },
  'store-010': { tops: 8, bottoms: 5, dresses: 10, outerwear: 4, activewear: 0, traditional: 6, accessories: 8 },
};

export const MOCK_GARMENTS: Garment[] = MOCK_STORES.flatMap((store) => {
  const distribution = storeGarmentDistribution[store.id] ?? {};
  return CATEGORIES.flatMap((category) => {
    const count = distribution[category] ?? 0;
    return Array.from({ length: count }, (_, i) => generateGarment(store.id, i, category));
  });
});

// ─── Generate Feed Items ────────────────────────────────────────────────────

// Free sample videos from Google's public GTV bucket
// These are publicly accessible without authentication
const SAMPLE_VIDEO_URLS = [
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
];

const generateFeedItem = (store: Store, index: number): OutfitFeedItem => {
  const storeGarments = MOCK_GARMENTS.filter(g => g.store_id === store.id);
  const selectedGarments = storeGarments
    .sort(() => Math.random() - 0.5)
    .slice(0, randomInt(1, 4));

  // Use a rotating video URL from our sample list
  const videoIndex = (store.id.charCodeAt(store.id.length - 1) + index) % SAMPLE_VIDEO_URLS.length;

  return {
    id: `feed-${store.id}-${index}`,
    store_id: store.id,
    store: {
      id: store.id,
      name: store.name,
      logo_url: store.logo_url,
    },
    title: `${store.name} - Look ${index + 1}`,
    video_url: SAMPLE_VIDEO_URLS[videoIndex],
    thumbnail_url: `https://picsum.photos/seed/feed-${store.id}-${index}/400/600`,
    garment_ids: selectedGarments.map(g => g.id),
    garments: selectedGarments.map(g => ({
      id: g.id,
      name: g.name,
      thumbnail_url: g.thumbnail_url,
      price_myr: g.price_myr,
    })),
    style_tags: [randomFromArray(styleTagOptions), randomFromArray(styleTagOptions)].filter((v, i, a) => a.indexOf(v) === i),
    likes_count: randomInt(50, 5000),
    relevance_score: Math.random() * 100,
    is_published: true,
    created_at: new Date(Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000).toISOString(),
  };
};

// 3-5 feed items per store = ~40 total
export const MOCK_FEED_ITEMS: OutfitFeedItem[] = MOCK_STORES.flatMap((store) => {
  const count = randomInt(3, 5);
  return Array.from({ length: count }, (_, i) => generateFeedItem(store, i));
}).sort((a, b) => b.relevance_score - a.relevance_score);

// ─── Mock User Likes (for testing favourites) ───────────────────────────────

export const MOCK_USER_LIKES: { feed_item_id: string }[] = MOCK_FEED_ITEMS
  .sort(() => Math.random() - 0.5)
  .slice(0, 10)
  .map(item => ({ feed_item_id: item.id }));

// ─── Helper to get garments by IDs ──────────────────────────────────────────

export const getGarmentsByIds = (ids: string[]): Garment[] => {
  return MOCK_GARMENTS.filter(g => ids.includes(g.id));
};

// ─── Category counts per store ──────────────────────────────────────────────

export const getCategoryCounts = (storeId: string): Record<GarmentCategory, number> => {
  const storeGarments = MOCK_GARMENTS.filter(g => g.store_id === storeId);
  return CATEGORIES.reduce((acc, cat) => {
    acc[cat] = storeGarments.filter(g => g.category === cat).length;
    return acc;
  }, {} as Record<GarmentCategory, number>);
};
