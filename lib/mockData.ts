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

// Color variants for deduplicating garment names within a store
const COLOR_VARIANTS = ['Ivory', 'Charcoal', 'Navy', 'Sage', 'Rust', 'Slate', 'Oat', 'Clay', 'Stone', 'Ink', 'Sand', 'Dusk', 'Fog', 'Mist'];

// ─── Curated Unsplash Clothing Images ──────────────────────────────────────
const CLOTHING_IMAGES: Record<GarmentCategory, string[]> = {
  tops: [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=500&fit=crop',
  ],
  bottoms: [
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
  ],
  dresses: [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=400&h=500&fit=crop',
  ],
  outerwear: [
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=500&fit=crop',
  ],
  activewear: [
    'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1515775538093-d2d95c5dc684?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=500&fit=crop',
  ],
  traditional: [
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1594112452609-8e5c1e25d4a0?w=400&h=500&fit=crop',
  ],
  accessories: [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&h=500&fit=crop',
  ],
};

// Curated fashion editorial images for feed thumbnails
const FEED_IMAGES = [
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1581044777550-4cfa60707998?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=600&fit=crop',
];

// Editorial feed titles (Vintage-Typewriter style)
const FEED_TITLES = [
  'Look 01 — The Silent Communicator',
  'Look 02 — After the Rain',
  'Look 03 — Geometry of Belonging',
  'Look 04 — Soft Architecture',
  'Look 05 — The Quiet Maximalist',
  'Look 06 — Between Seasons',
  'Look 07 — Urban Pastoral',
  'Look 08 — The Last Light',
  'Look 09 — Borrowed Comfort',
  'Look 10 — Edges and Echoes',
  'Look 11 — Still Life in Motion',
  'Look 12 — The Gentle Rebel',
  'Look 13 — Morning Ritual',
  'Look 14 — Shadow Play',
  'Look 15 — Woven Narratives',
  'Look 16 — The Slowdown',
  'Look 17 — Quiet Conversations',
  'Look 18 — Dusk Palette',
  'Look 19 — Unrehearsed',
  'Look 20 — The Collector',
];

// ─── Generate Garments ──────────────────────────────────────────────────────

const generateGarment = (storeId: string, index: number, category: GarmentCategory): Garment => {
  const baseName = categoryNames[category][index % categoryNames[category].length];
  // If index exceeds unique names, append a color variant to avoid duplicates
  const name = index < categoryNames[category].length
    ? baseName
    : `${COLOR_VARIANTS[index % COLOR_VARIANTS.length]} ${baseName}`;
  const price = randomPrice(29, 499);
  const isNew = Math.random() < 0.3;
  const hasSale = Math.random() < 0.2;
  const gender = category === 'traditional' ? randomFromArray(['male', 'female'] as GarmentGender[]) : randomFromArray(GENDERS);
  const availableSizes = SIZES.slice(randomInt(0, 2), randomInt(4, 6));

  const images = CLOTHING_IMAGES[category];
  const imageUrl = images[index % images.length];

  return {
    id: `garment-${storeId}-${category}-${index}`,
    store_id: storeId,
    name,
    description: `Beautiful ${name.toLowerCase()} from our latest collection. Perfect for any occasion.`,
    category,
    gender,
    price_myr: price,
    sizes_available: availableSizes,
    thumbnail_url: imageUrl,
    images: [
      imageUrl,
      images[(index + 1) % images.length],
      images[(index + 2) % images.length],
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

// Lazy-generated: only created on first access to avoid startup cost
let _mockGarments: Garment[] | null = null;
export const getMockGarments = (): Garment[] => {
  if (!_mockGarments) {
    _mockGarments = MOCK_STORES.flatMap((store) => {
      const distribution = storeGarmentDistribution[store.id] ?? {};
      return CATEGORIES.flatMap((category) => {
        const count = distribution[category] ?? 0;
        return Array.from({ length: count }, (_, i) => generateGarment(store.id, i, category));
      });
    });
  }
  return _mockGarments;
};
// Backward-compatible export (lazy getter)
export const MOCK_GARMENTS: Garment[] = new Proxy([] as Garment[], {
  get(_, prop) {
    const data = getMockGarments();
    return (data as any)[prop];
  },
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

let _feedTitleIndex = 0;
const generateFeedItem = (store: Store, index: number): OutfitFeedItem => {
  const storeGarments = getMockGarments().filter(g => g.store_id === store.id);
  const selectedGarments = storeGarments
    .sort(() => Math.random() - 0.5)
    .slice(0, randomInt(1, 4));

  // Use a rotating video URL from our sample list
  const videoIndex = (store.id.charCodeAt(store.id.length - 1) + index) % SAMPLE_VIDEO_URLS.length;

  // Editorial title and curated feed image
  const title = FEED_TITLES[_feedTitleIndex % FEED_TITLES.length];
  _feedTitleIndex++;
  const feedImageUrl = FEED_IMAGES[(_feedTitleIndex + index) % FEED_IMAGES.length];

  return {
    id: `feed-${store.id}-${index}`,
    store_id: store.id,
    store: {
      id: store.id,
      name: store.name,
      logo_url: store.logo_url,
    },
    title,
    video_url: SAMPLE_VIDEO_URLS[videoIndex],
    thumbnail_url: feedImageUrl,
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

// Lazy-generated feed items
let _mockFeedItems: OutfitFeedItem[] | null = null;
export const getMockFeedItems = (): OutfitFeedItem[] => {
  if (!_mockFeedItems) {
    _mockFeedItems = MOCK_STORES.flatMap((store) => {
      const count = randomInt(3, 5);
      return Array.from({ length: count }, (_, i) => generateFeedItem(store, i));
    }).sort((a, b) => b.relevance_score - a.relevance_score);
  }
  return _mockFeedItems;
};
export const MOCK_FEED_ITEMS: OutfitFeedItem[] = new Proxy([] as OutfitFeedItem[], {
  get(_, prop) {
    const data = getMockFeedItems();
    return (data as any)[prop];
  },
});

// Lazy-generated user likes
let _mockUserLikes: { feed_item_id: string }[] | null = null;
export const getMockUserLikes = () => {
  if (!_mockUserLikes) {
    _mockUserLikes = getMockFeedItems()
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)
      .map(item => ({ feed_item_id: item.id }));
  }
  return _mockUserLikes;
};
export const MOCK_USER_LIKES: { feed_item_id: string }[] = new Proxy([] as { feed_item_id: string }[], {
  get(_, prop) {
    const data = getMockUserLikes();
    return (data as any)[prop];
  },
});

// ─── Helper to get garments by IDs ──────────────────────────────────────────

export const getGarmentsByIds = (ids: string[]): Garment[] => {
  const idSet = new Set(ids);
  return getMockGarments().filter(g => idSet.has(g.id));
};

// ─── Category counts per store ──────────────────────────────────────────────

export const getCategoryCounts = (storeId: string): Record<GarmentCategory, number> => {
  const storeGarments = getMockGarments().filter(g => g.store_id === storeId);
  return CATEGORIES.reduce((acc, cat) => {
    acc[cat] = storeGarments.filter(g => g.category === cat).length;
    return acc;
  }, {} as Record<GarmentCategory, number>);
};
