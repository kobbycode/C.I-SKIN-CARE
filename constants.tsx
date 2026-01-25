
import { Product, Review } from './types';

const baseProducts: Product[] = [
  {
    id: '1',
    name: 'BEL ECLAT Tumeric+ Gluta Plus Lotion',
    price: 45.00,
    description: 'Anti-wrinkle and revitalizing body lotion enriched with Tumeric and Honey for a radiant glow.',
    category: 'Body Care',
    image: '/products/bel-eclat-hero.jpg',
    tags: ['Brightening', 'Anti-Aging'],
    sku: 'BE-TGP-L01',
    stock: 150,
    status: 'Active',
    brand: 'BEL ECLAT',
    skinTypes: ['All Skin Types'],
    concerns: ['Dullness', 'Aging']
  },
  {
    id: '2',
    name: 'Gluta Master 7 Days Advanced Whitening Serum',
    price: 35.00,
    description: 'Powerful whitening therapy with Glutathione and Vitamin C for intense spot correction.',
    category: 'Serums & Elixirs',
    image: '/products/gluta-master-set.jpg',
    tags: ['Whitening', 'Spot Correction'],
    sku: 'GM-7D-S02',
    stock: 85,
    status: 'Active',
    brand: 'Gluta Master',
    skinTypes: ['All Skin Types'],
    concerns: ['Dark Spots', 'Uneven Tone']
  },
  {
    id: '3',
    name: 'SPA Exfoliating Gel - Lemon Extract',
    price: 15.00,
    description: 'L-Glutathione vegetable extract exfoliating gel for smooth and clean elastic skin.',
    category: 'Cleansers',
    image: '/products/spa-gels.jpg',
    tags: ['Exfoliating', 'Vegetable Extracts'],
    sku: 'SPA-LG-L03',
    stock: 300,
    status: 'Active',
    brand: 'SPA Rituals',
    skinTypes: ['All Skin Types'],
    concerns: ['Texture', 'Pores']
  },
  {
    id: '4',
    name: '5D Gluta Anti-Redness & Facial Burns Toner',
    price: 28.00,
    description: 'Soothes visible redness for sensitive skin and treats conditions like Melasma.',
    category: 'Treatments',
    image: '/products/5d-gluta-box-full.jpg',
    tags: ['Sensitive', 'Melasma'],
    sku: '5D-AR-T04',
    stock: 45,
    status: 'Active',
    brand: '5D Gluta',
    skinTypes: ['Sensitive Skins'],
    concerns: ['Redness', 'Facial Burns']
  },
  {
    id: '5',
    name: 'Activate Cream Super Whitening',
    price: 55.00,
    description: 'Premium face cream for extreme hydration and advanced skin brightening.',
    category: 'Treatments',
    image: '/products/5d-gluta-white.jpg',
    tags: ['Hydration', 'Brightening'],
    sku: 'CI-AC-105',
    stock: 60,
    status: 'Active',
    brand: 'C.I Skin Care',
    skinTypes: ['Dry & Dehydrated'],
    concerns: ['Dullness', 'Dehydration']
  },
  {
    id: '6',
    name: 'Gluta Master Lait Corps - Collection Snapchat',
    price: 48.00,
    description: 'Special edition body milk for illuminating radiance and skin rejuvenation.',
    category: 'Body Care',
    image: '/products/gluta-master-set.jpg',
    tags: ['Limited Edition', 'Illuminating'],
    sku: 'GM-SC-L06',
    stock: 120,
    status: 'Active',
    brand: 'Gluta Master',
    skinTypes: ['All Skin Types'],
    concerns: ['Dullness', 'Texture']
  },
  {
    id: '7',
    name: '5D Gluta Turmeric Oil Super SPF50',
    price: 32.00,
    description: '100% natural essential oil for face and body correction with sun protection.',
    category: 'Serums & Elixirs',
    image: '/products/bel-eclat-tumericSet.jpg',
    tags: ['SPF50', 'Essential Oil'],
    sku: '5D-TO-O07',
    stock: 95,
    status: 'Active',
    brand: '5D Gluta',
    skinTypes: ['All Skin Types'],
    concerns: ['Dark Spots', 'Sun Damage']
  },
  {
    id: '8',
    name: 'Healthy Glow Alpha Arbutin Wash',
    price: 38.00,
    description: 'Deep cleansing and skin brightening body wash with Alpha Arbutin and Lactic Acid.',
    category: 'Cleansers',
    image: '/products/shelf-display.jpg',
    tags: ['Brightening', 'Cleansing'],
    sku: 'HG-AA-W08',
    stock: 210,
    status: 'Active',
    brand: 'C.I Skin Care',
    skinTypes: ['Oily & Acne-Prone'],
    concerns: ['Impurity', 'Dullness']
  },
  {
    id: '9',
    name: '5D Gluta Miracle Super White Lotion',
    price: 65.00,
    description: 'Miracle whitening body lotion for uneven skin tone and dark spots correction.',
    category: 'Body Care',
    image: '/products/5d-gluta-miracle.jpg',
    tags: ['Super White', 'Intense Correction'],
    sku: '5D-MSW-L09',
    stock: 75,
    status: 'Active',
    brand: '5D Gluta',
    skinTypes: ['All Skin Types'],
    concerns: ['Uneven Tone', 'Dark Spots']
  },
  {
    id: '10',
    name: 'Pomegranate L-Glutathione Strong Whitening Set',
    price: 120.00,
    description: 'Complete 4-step whitening system: Lotion, Serum, Cream, and Soap with Pomegranate extracts.',
    category: 'Bundles & Sets',
    image: '/products/pomegranate-set.jpg',
    tags: ['Full Set', 'Botanical Whitening'],
    sku: 'PG-SW-S10',
    stock: 30,
    status: 'Active',
    brand: 'Pomegranate Line',
    skinTypes: ['All Skin Types'],
    concerns: ['Dullness', 'Resilience']
  },
  {
    id: '11',
    name: 'Bismid Intensive Whitening Exfoliating Wash',
    price: 42.00,
    description: 'Professional grade triple action exfoliating body wash for a luminous radiant look.',
    category: 'Cleansers',
    image: '/products/bismid-red.jpg',
    tags: ['Triple Action', 'Professional'],
    sku: 'BI-IWE-W11',
    stock: 140,
    status: 'Active',
    brand: 'Bismid Cosmetics',
    skinTypes: ['All Skin Types'],
    concerns: ['Texture', 'Dead Skin Cells']
  },
  {
    id: '12',
    name: '5D Gluta Diamond Facial Cream',
    price: 52.00,
    description: 'Advanced Vitamin C facial cream for dark spots and brightening clear skin.',
    category: 'Treatments',
    image: '/products/5d-gluta-diamond-box.jpg',
    tags: ['Diamond Glow', 'Vitamin C'],
    sku: '5D-GDF-C12',
    stock: 90,
    status: 'Active',
    brand: '5D Gluta',
    skinTypes: ['All Skin Types'],
    concerns: ['Dark Spots', 'Brightening']
  }
];

// Generate more variations for scrolling
export const MOCK_PRODUCTS: Product[] = [
  ...baseProducts,
  ...baseProducts.slice(0, 4).map(p => ({ ...p, id: p.id + '-v1', name: p.name + ' (Limited Gift Edition)', price: p.price * 1.25 })),
  ...baseProducts.slice(4, 8).map(p => ({ ...p, id: p.id + '-v2', name: 'Deluxe ' + p.name, price: p.price * 1.4, status: 'Active' as const })),
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    productId: 'p1',
    author: 'Sophia R.',
    rating: 5,
    date: '2 days ago',
    title: 'A literal game changer for my morning routine',
    content: "I've tried dozens of luxury serums, but none have provided this level of instant hydration without feeling greasy. My skin feels bouncy and looks noticeably brighter after just one week. Highly recommend the Vitamin C complex!",
    verified: true,
    images: [
      '/assets/review-1.png',
      '/assets/review-2.png'
    ],
    status: 'Approved'
  },
  {
    id: 'r2',
    productId: 'p2',
    author: 'Marcus L.',
    rating: 5,
    date: '1 week ago',
    title: 'Worth every single penny',
    content: "The packaging alone is a masterpiece, but the products inside are what matter. The moisturizer is thick and rich yet absorbs perfectly. My dry patches have completely disappeared. It's the ultimate luxury self-care.",
    verified: true,
    images: ['/assets/review-3.png'],
    status: 'Approved'
  },
  {
    id: 'r3',
    productId: 'p3',
    author: 'Ama O.',
    rating: 4,
    date: '2 weeks ago',
    title: 'Great for sensitivity',
    content: 'I have very reactive skin, and usually "luxury" means "lots of perfume." This brand actually cares. The cleanser is gentle but effective. Only 4 stars because the shipping took a day longer than expected.',
    verified: true,
    status: 'Approved'
  }
];

export const MOCK_JOURNAL_POSTS = [
  {
    id: '1',
    title: 'The Art of the Midnight Ritual',
    category: 'Rituals',
    date: 'Jan 20, 2026',
    author: 'Isabella M.',
    excerpt: 'Discover why your skin’s nocturnal cycle is the most critical window for transformation and how to optimize it.',
    image: '/products/shelf-display.jpg',
    readTime: '6 min read'
  },
  {
    id: '2',
    title: 'Botanical Science: The Rare Orchid Extract',
    category: 'Formulation',
    date: 'Jan 15, 2026',
    author: 'Dr. Julian Thorne',
    excerpt: 'Tracing the journey of our signature ingredient from the Swiss Alps to our clinical laboratories.',
    image: '/products/bel-eclat-hero.jpg',
    readTime: '8 min read'
  },
  {
    id: '3',
    title: 'Hydration vs. Moisture: A Masterclass',
    category: 'Education',
    date: 'Jan 12, 2026',
    author: 'Sarah Chen',
    excerpt: 'Understanding the cellular difference between water-based hydration and oil-based moisture for a glass-skin finish.',
    image: '/products/spa-gels.jpg',
    readTime: '5 min read'
  }
];

export const LOYALTY_TIERS = [
  {
    name: 'Silver Ritual',
    threshold: 'Entry Level',
    benefits: ['Early access to seasonal drops', '5% points back on every order', 'Annual birthday gift'],
    color: 'stone-400'
  },
  {
    name: 'Gold Ritual',
    threshold: '1,000 Points',
    benefits: ['Free express shipping on all orders', '10% points back', 'Personalized skin consultation', 'Exclusive event invitations'],
    color: 'amber-500'
  },
  {
    name: 'Platinum Ritual',
    threshold: '2,500 Points',
    benefits: ['First access to Limited Editions', '15% points back', 'Private concierge support', 'Customized routine development', 'Luxury gift on every milestone'],
    color: 'blue-400'
  }
];
