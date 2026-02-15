import { Knex } from 'knex';
import { seedAgeGroups, seedCountries, seedLabels, seedCoupons, seedPromises, seedEmailAndSmsTemplates } from './others';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries except users
  await knex('coupon_usages').del();
  await knex('promises').del();
  await knex('reviews').del();
  await knex('contact_messages').del();
  await knex('product_requests').del();
  await knex('stock_requests').del();
  await knex('order_items').del();
  await knex('orders').del();
  await knex('cart_items').del(); // Added
  await knex('carts').del(); // Added
  await knex('product_batches').del();
  await knex('product_variants').del();
  await knex('product_labels').del();
  await knex('products').del();
  await knex('categories').del();
  await knex('brands').del();
  await knex('mother_categories').del(); // Added
  await knex('age_groups').del();
  await knex('banners').del();
  await knex('media_files').del();
  await knex('media_folders').del();
  await knex('delivery_charges').del();
  await knex('coupons').del();
  await knex('labels').del();
  await knex('settings').del();
  await knex('countries').del();
  await knex('email_templates').del();
  await knex('sms_templates').del(); // Added

  // Get User IDs (assuming they exist from 01_users.ts)
  const admin = await knex('users').where({ role: 'admin' }).first();
  const customer = await knex('users').where({ role: 'customer' }).first();

  if (!admin || !customer) {
    console.log('Users not found. Please run 01_users seed first.');
    return;
  }

  // ============================================
  // INSERT MOTHER CATEGORIES (2)
  // ============================================
  const motherCategoriesData = [
    { name: 'Baby Care', name_bn: 'বেবি কেয়ার', slug: 'baby-care', sort_order: 1 },
    { name: 'Mom Care', name_bn: 'মায়ের যত্ন', slug: 'mom-care', sort_order: 2 },
  ];

  const motherCategories: Record<string, any> = {};
  for (const mc of motherCategoriesData) {
    const [inserted] = await knex('mother_categories').insert({ ...mc, is_active: true }).returning('*');
    motherCategories[mc.slug] = inserted;
  }

  // ============================================
  // INSERT AGE GROUPS (6)
  // ============================================
  const ageGroupsData = [
    { label: 'Newborn', label_bn: 'নবজাতক', icon: '👶', age_range: '0-3 months', description: 'Essentials for your newborn', description_bn: 'নবজাতকের জন্য প্রয়োজনীয়', sort_order: 1 },
    { label: 'Infant', label_bn: 'শিশু', icon: '🍼', age_range: '3-6 months', description: 'Growing baby needs', description_bn: 'বড় হওয়া শিশুর প্রয়োজন', sort_order: 2 },
    { label: 'Crawler', label_bn: 'হামাগুড়ি', icon: '🧸', age_range: '6-12 months', description: 'Active explorer stage', description_bn: 'সক্রিয় অন্বেষণ পর্যায়', sort_order: 3 },
    { label: 'Toddler', label_bn: 'বাচ্চা', icon: '🎈', age_range: '1-2 years', description: 'Fun learning products', description_bn: 'মজাদার শেখার পণ্য', sort_order: 4 },
    { label: 'Preschool', label_bn: 'প্রি-স্কুল', icon: '🎨', age_range: '2-4 years', description: 'Prepare for school', description_bn: 'স্কুলের জন্য প্রস্তুতি', sort_order: 5 },
    { label: 'Kids', label_bn: 'বাচ্চাদের', icon: '🎒', age_range: '4-8 years', description: 'Products for growing kids', description_bn: 'বড় বাচ্চাদের জন্য পণ্য', sort_order: 6 },
  ];

  const ageGroups: Record<string, any> = {};
  for (const ag of ageGroupsData) {
    const [inserted] = await knex('age_groups').insert({ 
        ...ag, 
        slug: slugify(ag.label), // Added Slug
        is_active: true, 
        tenant_id: 'default' 
    }).returning('*');
    ageGroups[ag.label.toLowerCase()] = inserted;
  }

  // ============================================
  // INSERT LABELS (8)
  // ============================================
  const labelsData = [
    { name: 'New Arrivals', name_bn: 'নতুন পণ্য', slug: 'new-arrivals', color: '#22c55e', bg_color: '#f0fdf4', description: 'Recently added products' },
    { name: 'Best Sellers', name_bn: 'সেরা বিক্রয়', slug: 'best-sellers', color: '#f59e0b', bg_color: '#fffbeb', description: 'Top selling products' },
    { name: 'Featured', name_bn: 'ফিচার্ড', slug: 'featured', color: '#8b5cf6', bg_color: '#f5f3ff', description: 'Hand-picked featured products' },
    { name: 'On Sale', name_bn: 'সেল', slug: 'on-sale', color: '#ef4444', bg_color: '#fef2f2', description: 'Products currently on sale' },
    { name: 'Trending', name_bn: 'ট্রেন্ডিং', slug: 'trending', color: '#ec4899', bg_color: '#fdf2f8', description: 'Currently trending products' },
    { name: 'Limited Edition', name_bn: 'সীমিত সংস্করণ', slug: 'limited-edition', color: '#6366f1', bg_color: '#eef2ff', description: 'Limited stock items' },
    { name: 'Eco Friendly', name_bn: 'পরিবেশ বান্ধব', slug: 'eco-friendly', color: '#10b981', bg_color: '#ecfdf5', description: 'Environmentally friendly products' },
    { name: 'Premium', name_bn: 'প্রিমিয়াম', slug: 'premium', color: '#d97706', bg_color: '#fef3c7', description: 'Premium quality products' },
  ];

  const labels: Record<string, any> = {};
  for (const label of labelsData) {
    const [inserted] = await knex('labels').insert({ ...label, is_active: true }).returning('*');
    labels[label.slug] = inserted;
  }

  // ============================================
  // INSERT COUNTRIES (10)
  // ============================================
  const countriesData = [
    { name: 'Bangladesh', name_bn: 'বাংলাদেশ', code: 'BD', flag: '🇧🇩' },
    { name: 'United States', name_bn: 'যুক্তরাষ্ট্র', code: 'US', flag: '🇺🇸' },
    { name: 'Japan', name_bn: 'জাপান', code: 'JP', flag: '🇯🇵' },
    { name: 'Germany', name_bn: 'জার্মানি', code: 'DE', flag: '🇩🇪' },
    { name: 'United Kingdom', name_bn: 'যুক্তরাজ্য', code: 'GB', flag: '🇬🇧' },
    { name: 'China', name_bn: 'চীন', code: 'CN', flag: '🇨🇳' },
    { name: 'India', name_bn: 'ভারত', code: 'IN', flag: '🇮🇳' },
    { name: 'South Korea', name_bn: 'দক্ষিণ কোরিয়া', code: 'KR', flag: '🇰🇷' },
    { name: 'France', name_bn: 'ফ্রান্স', code: 'FR', flag: '🇫🇷' },
    { name: 'Australia', name_bn: 'অস্ট্রেলিয়া', code: 'AU', flag: '🇦🇺' },
  ];

  const countries: Record<string, any> = {};
  for (const country of countriesData) {
    const [inserted] = await knex('countries').insert({ ...country, is_active: true }).returning('*');
    countries[country.code] = inserted;
  }

  // ============================================
  // INSERT BRANDS (25)
  // ============================================
  const brandsData = [
    // Skincare Brands (Mom Care)
    { name: 'CeraVe', name_bn: 'সেরাভি', logo: 'https://picsum.photos/seed/cerave/200/200', mother_category: 'mom-care' },
    { name: 'The Ordinary', name_bn: 'দ্য অর্ডিনারি', logo: 'https://picsum.photos/seed/ordinary/200/200', mother_category: 'mom-care' },
    { name: 'COSRX', name_bn: 'কোসআরএক্স', logo: 'https://picsum.photos/seed/cosrx/200/200', mother_category: 'mom-care' },
    { name: 'Simple', name_bn: 'সিম্পল', logo: 'https://picsum.photos/seed/simple/200/200', mother_category: 'mom-care' },
    { name: 'Neutrogena', name_bn: 'নিউট্রোজেনা', logo: 'https://picsum.photos/seed/neutrogena/200/200', mother_category: 'mom-care' },
    { name: 'Innisfree', name_bn: 'ইনিসফ্রি', logo: 'https://picsum.photos/seed/innisfree/200/200', mother_category: 'mom-care' },
    { name: 'Laneige', name_bn: 'ল্যানেজ', logo: 'https://picsum.photos/seed/laneige/200/200', mother_category: 'mom-care' },
    { name: 'Some By Mi', name_bn: 'সাম বাই মি', logo: 'https://picsum.photos/seed/somebymi/200/200', mother_category: 'mom-care' },
    { name: 'Bioderma', name_bn: 'বায়োডার্মা', logo: 'https://picsum.photos/seed/bioderma/200/200', mother_category: 'mom-care' },
    { name: 'Beauty of Joseon', name_bn: 'বিউটি অফ জেসন', logo: 'https://picsum.photos/seed/joseon/200/200', mother_category: 'mom-care' },
    { name: 'La Roche-Posay', name_bn: 'লা রোশ-পোজে', logo: 'https://picsum.photos/seed/laroche/200/200', mother_category: 'mom-care' },
    
    // Baby Brands (Baby Care)
    { name: 'Aveeno Baby', name_bn: 'অ্যাভিনো বেবি', logo: 'https://picsum.photos/seed/aveeno/200/200', mother_category: 'baby-care' },
    { name: 'Cetaphil', name_bn: 'সেটাফিল', logo: 'https://picsum.photos/seed/cetaphil/200/200', mother_category: 'baby-care' },
    { name: 'Johnson & Johnson', name_bn: 'জনসন অ্যান্ড জনসন', logo: 'https://picsum.photos/seed/jnj/200/200', mother_category: 'baby-care' },
    { name: 'Pampers', name_bn: 'প্যাম্পার্স', logo: 'https://picsum.photos/seed/pampers/200/200', mother_category: 'baby-care' },
    { name: 'Huggies', name_bn: 'হাগিস', logo: 'https://picsum.photos/seed/huggies/200/200', mother_category: 'baby-care' },
    { name: 'Sudocrem', name_bn: 'সুডোক ক্রিম', logo: 'https://picsum.photos/seed/sudocrem/200/200', mother_category: 'baby-care' },
    { name: 'Mustela', name_bn: 'মাস্টেলা', logo: 'https://picsum.photos/seed/mustela/200/200', mother_category: 'baby-care' },
    { name: 'Sebamed', name_bn: 'সেবামেড', logo: 'https://picsum.photos/seed/sebamed/200/200', mother_category: 'baby-care' },
    { name: 'Pigeon', name_bn: 'পিজিয়ন', logo: 'https://picsum.photos/seed/pigeon/200/200', mother_category: 'baby-care' },
    { name: 'Philips Avent', name_bn: 'ফিলিপস অ্যাভেন্ট', logo: 'https://picsum.photos/seed/avent/200/200', mother_category: 'baby-care' },
    { name: 'Dr. Browns', name_bn: 'ডক্টর ব্রাউনস', logo: 'https://picsum.photos/seed/drbrowns/200/200', mother_category: 'baby-care' },
    { name: 'Gerber', name_bn: 'গারবার', logo: 'https://picsum.photos/seed/gerber/200/200', mother_category: 'baby-care' },
    { name: 'Heinz', name_bn: 'হেইঞ্জ', logo: 'https://picsum.photos/seed/heinz/200/200', mother_category: 'baby-care' },
  ];

  const brands: Record<string, any> = {};
  for (const brand of brandsData) {
    const motherCat = motherCategories[brand.mother_category];
    const [inserted] = await knex('brands').insert({ 
        name: brand.name,
        name_bn: brand.name_bn,
        slug: slugify(brand.name), // Added Slug
        logo: brand.logo,
        mother_category_id: motherCat ? motherCat.id : null,
        is_active: true 
    }).returning('*');
    brands[brand.name.toLowerCase().replace(/[^a-z]/g, '')] = inserted;
  }

  // ============================================
  // INSERT CATEGORIES
  // ============================================

  // Parent Categories
  const parentCategoriesData = [
    { name: 'Skincare', name_bn: 'স্কিনকেয়ার', image: 'https://picsum.photos/seed/skincare/800/800', mother_category: 'mom-care' },
    { name: 'Baby Care', name_bn: 'বেবি কেয়ার', image: 'https://picsum.photos/seed/babycare/800/800', mother_category: 'baby-care' },
    { name: 'Hair Care', name_bn: 'হেয়ার কেয়ার', image: 'https://picsum.photos/seed/haircare/800/800', mother_category: 'mom-care' },
    { name: 'Makeup', name_bn: 'মেকআপ', image: 'https://picsum.photos/seed/makeup/800/800', mother_category: 'mom-care' },
    { name: 'Mom Care', name_bn: 'মায়ের যত্ন', image: 'https://picsum.photos/seed/momcare/800/800', mother_category: 'mom-care' },
    { name: 'Feeding', name_bn: 'ফিডিং', image: 'https://picsum.photos/seed/feeding/800/800', mother_category: 'baby-care' },
    { name: 'Diapers', name_bn: 'ডায়াপার', image: 'https://picsum.photos/seed/diapers/800/800', mother_category: 'baby-care' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of parentCategoriesData) {
    const motherCat = motherCategories[cat.mother_category];
    const [inserted] = await knex('categories').insert({ 
        name: cat.name,
        name_bn: cat.name_bn,
        slug: slugify(cat.name), // Added Slug
        image: cat.image,
        mother_category_id: motherCat ? motherCat.id : null,
        is_active: true 
    }).returning('*');
    categories[cat.name.toLowerCase().replace(/[^a-z]/g, '')] = inserted;
  }

  // Sub Categories
  const subCategoriesData = [
    // Skincare Subs
    { name: 'Cleansers', name_bn: 'ক্লিনজার', parent: 'skincare' },
    { name: 'Toners', name_bn: 'টোনার', parent: 'skincare' },
    { name: 'Serums', name_bn: 'সিরাম', parent: 'skincare' },
    { name: 'Moisturizers', name_bn: 'ময়েশ্চারাইজার', parent: 'skincare' },
    { name: 'Sunscreen', name_bn: 'সানস্ক্রিন', parent: 'skincare' },
    { name: 'Masks', name_bn: 'মাস্ক', parent: 'skincare' },
    
    // Baby Care Subs
    { name: 'Baby Lotion', name_bn: 'বেবি লোশন', parent: 'babycare' },
    { name: 'Baby Wash', name_bn: 'বেবি ওয়াশ', parent: 'babycare' },
    { name: 'Rash Cream', name_bn: 'র‍্যাশ ক্রিম', parent: 'babycare' },
    { name: 'Baby Oil', name_bn: 'বেবি অয়েল', parent: 'babycare' },
    
    // Feeding Subs
    { name: 'Baby Food', name_bn: 'বেবি ফুড', parent: 'feeding' },
    { name: 'Feeders', name_bn: 'ফিডার', parent: 'feeding' },
    { name: 'Accessories', name_bn: 'এক্সেসরিজ', parent: 'feeding' },

    // Diapers Subs
    { name: 'Tape Diapers', name_bn: 'টেপ ডায়াপার', parent: 'diapers' },
    { name: 'Pant Diapers', name_bn: 'প্যান্ট ডায়াপার', parent: 'diapers' },
    { name: 'Wipes', name_bn: 'ওয়াইপস', parent: 'diapers' },
  ];

  for (const subCat of subCategoriesData) {
    const parent = categories[subCat.parent];
    if (parent) {
      const [inserted] = await knex('categories').insert({
        name: subCat.name,
        name_bn: subCat.name_bn,
        slug: slugify(subCat.name), // Added Slug
        parent_id: parent.id,
        image: `https://picsum.photos/seed/${subCat.name.toLowerCase().replace(/\s/g, '')}/800/800`,
        is_active: true
      }).returning('*');
      categories[subCat.name.toLowerCase().replace(/[^a-z]/g, '')] = inserted;
    }
  }

  // ============================================
  // INSERT PRODUCTS (Updated with Klassy & Nuha style)
  // ============================================
  const productsData = [
    // --- SKINCARE (Klassy Style) ---
    { name: 'CeraVe Foaming Facial Cleanser', name_bn: 'সেরাভি ফোমিং ফেসিয়াল ক্লিনজার', description: 'For normal to oily skin. Cleanses and removes oil without disrupting the protective skin barrier.', price: 1850, old_price: 2200, category: 'cleansers', brand: 'cerave', country: 'US', sku: 'SKN-CER-001' },
    { name: 'The Ordinary Niacinamide 10% + Zinc 1%', name_bn: 'দ্য অর্ডিনারি নিয়াসিনামাইড ১০% + জিঙ্ক ১%', description: 'High-strength vitamin and mineral blemish formula.', price: 1250, old_price: 1500, category: 'serums', brand: 'theordinary', country: 'CA', sku: 'SKN-ORD-001' },
    { name: 'COSRX Advanced Snail 96 Mucin Power Essence', name_bn: 'কোসআরএক্স স্নেইল ৯৬ মিউসিন এসেন্স', description: 'Lightweight essence which absorbs into skin fast to give skin a natural glow from the inside.', price: 1650, old_price: 1900, category: 'serums', brand: 'cosrx', country: 'KR', sku: 'SKN-COS-001' },
    { name: 'Simple Kind to Skin Refreshing Facial Wash', name_bn: 'সিম্পল রিফ্রেশিং ফেসিয়াল ওয়াশ', description: '100% soap-free gel face wash removes dirt, oil and impurities.', price: 650, old_price: 850, category: 'cleansers', brand: 'simple', country: 'GB', sku: 'SKN-SIM-001' },
    { name: 'Neutrogena Hydro Boost Water Gel', name_bn: 'নিউট্রোজেনা হাইড্রো বুস্ট ওয়াটার জেল', description: 'Instantly quenches dry skin and keeps it looking smooth, supple and hydrated.', price: 1950, old_price: 2400, category: 'moisturizers', brand: 'neutrogena', country: 'US', sku: 'SKN-NEU-001' },
    { name: 'Innisfree Super Volcanic Pore Clay Mask', name_bn: 'ইনিসফ্রি সুপার ভলক্যানিক পোর ক্লে মাস্ক', description: '6-in-1 pore care: shrinks pores + controls sebum + exfoliates + deep cleanses + brightens tone + cools.', price: 1450, category: 'masks', brand: 'innisfree', country: 'KR', sku: 'SKN-INN-001' },
    { name: 'Bioderma Sensibio H2O Micellar Water', name_bn: 'বায়োডার্মা সেন্সিবিও এইচ২ও', description: 'Cleanses and removes make-up from the face and eyes.', price: 1550, category: 'cleansers', brand: 'bioderma', country: 'FR', sku: 'SKN-BIO-001' },
    { name: 'Some By Mi AHA BHA PHA 30 Days Miracle Toner', name_bn: 'সাম বাই মি মিরাকল টোনার', description: 'Exfoliating toner for clearer skin in 30 days.', price: 1600, old_price: 1800, category: 'toners', brand: 'somebymi', country: 'KR', sku: 'SKN-SBM-001' },
    { name: 'Laneige Lip Sleeping Mask Berry', name_bn: 'ল্যানেজ লিপ স্লিপিং মাস্ক', description: 'Gently melts away dead skin cells from the lips to make the lips feel smooth and elastic.', price: 1800, category: 'masks', brand: 'laneige', country: 'KR', sku: 'SKN-LAN-001' },
    { name: 'Beauty of Joseon Relief Sun: Rice + Probiotics', name_bn: 'বিউটি অফ জেসন রিলিফ সান', description: 'Organic sunscreen that applies gently on the skin.', price: 1550, old_price: 1800, category: 'sunscreen', brand: 'beautyofjoseon', country: 'KR', sku: 'SKN-BOJ-001' },
    { name: 'La Roche-Posay Effaclar Purifying Foaming Gel', name_bn: 'লা রোশ-পোজে এফাক্লার জেল', description: 'Foaming cleanser for oily sensitive skin.', price: 2100, category: 'cleansers', brand: 'larocheposay', country: 'FR', sku: 'SKN-LRP-001' },
    { name: 'Cetaphil Gentle Skin Cleanser', name_bn: 'সেটাফিল জেন্টল স্কিন ক্লিনজার', description: 'Mild, non-irritating formulation that soothes skin as it cleans.', price: 1350, category: 'cleansers', brand: 'cetaphil', country: 'US', sku: 'SKN-CET-001' },

    // --- BABY CARE (Nuha Baby Style) ---
    { name: 'Aveeno Baby Daily Moisture Lotion', name_bn: 'অ্যাভিনো বেবি ডেইলি ময়েশ্চার লোশন', description: 'Nourishes and protects baby’s sensitive skin for 24 hours.', price: 1650, old_price: 1900, category: 'babylotion', brand: 'aveenobaby', country: 'US', sku: 'BAB-AVE-001' },
    { name: 'Sudocrem Antiseptic Healing Cream 125g', name_bn: 'সুডোক ক্রিম ১২৫গ্রাম', description: 'For diaper rash, cuts, grazes and minor burns.', price: 850, old_price: 1000, category: 'rashcream', brand: 'sudocrem', country: 'GB', sku: 'BAB-SUD-001' },
    { name: 'Cetaphil Baby Wash & Shampoo', name_bn: 'সেটাফিল বেবি ওয়াশ ও শ্যাম্পু', description: 'Tear-free formula that gently cleanses baby’s skin and hair.', price: 1450, category: 'babywash', brand: 'cetaphil', country: 'DE', sku: 'BAB-CET-001' },
    { name: 'Pampers Premium Care Diapers (Newborn)', name_bn: 'প্যাম্পার্স প্রিমিয়াম কেয়ার (নিউবর্ন)', description: 'Softest comfort and best skin protection.', price: 2200, old_price: 2500, category: 'tapediapers', brand: 'pampers', country: 'US', sku: 'BAB-PAM-001' },
    { name: 'Huggies Wonder Pants (Large)', name_bn: 'হাগিস ওয়ান্ডার প্যান্টস (লার্জ)', description: 'Bubble-bed technology for soft comfort.', price: 1800, category: 'pantdiapers', brand: 'huggies', country: 'US', sku: 'BAB-HUG-001' },
    { name: 'Gerber Rice Cereal', name_bn: 'গারবার রাইস সিরিয়াল', description: 'Iron-fortified cereal for supported sitters.', price: 650, category: 'babyfood', brand: 'gerber', country: 'US', sku: 'BAB-GER-001' },
    { name: 'Heinz Biscotti', name_bn: 'হেইঞ্জ বিস্কটি', description: 'Delicious finger food for babies.', price: 450, category: 'babyfood', brand: 'heinz', country: 'IT', sku: 'BAB-HEI-001' },
    { name: 'Philips Avent Natural Feeding Bottle 260ml', name_bn: 'ফিলিপস অ্যাভেন্ট ফিডিং বোতল', description: 'Natural latch on due to the wide breast shaped nipple.', price: 1250, category: 'feeders', brand: 'philipsavent', country: 'GB', sku: 'BAB-AVE-002' },
    { name: 'Dr. Browns Options+ Wide-Neck Bottle', name_bn: 'ডক্টর ব্রাউনস ওয়াইড-নেক বোতল', description: 'Clinically proven to reduce colic.', price: 1350, old_price: 1500, category: 'feeders', brand: 'drbrowns', country: 'US', sku: 'BAB-DRB-001' },
    { name: 'Mustela Bebe Gentle Cleansing Gel', name_bn: 'মাস্টেলা বেবি ক্লিনজিং জেল', description: 'Cleanses and protects from birth on.', price: 1750, category: 'babywash', brand: 'mustela', country: 'FR', sku: 'BAB-MUS-001' },
    { name: 'Sebamed Baby Rash Cream', name_bn: 'সেবামেড বেবি র‍্যাশ ক্রিম', description: 'Promotes the development of the acid mantle.', price: 950, category: 'rashcream', brand: 'sebamed', country: 'DE', sku: 'BAB-SEB-001' },
    { name: 'Pigeon Peristaltic Nipple (M)', name_bn: 'পিজিয়ন নিপল (M)', description: 'Super soft and flexible nipple.', price: 350, category: 'accessories', brand: 'pigeon', country: 'JP', sku: 'BAB-PIG-001' },
    { name: 'Johnson\'s Baby Oil 500ml', name_bn: 'জনসন বেবি অয়েল', description: 'Locks in up to 10 times more moisture.', price: 850, category: 'babyoil', brand: 'johnsonjohnson', country: 'TH', sku: 'BAB-JNJ-001' },
    { name: 'Aveeno Baby Wash & Shampoo', name_bn: 'অ্যাভিনো বেবি ওয়াশ', description: 'Gentle cleansing for hair and body.', price: 1550, category: 'babywash', brand: 'aveenobaby', country: 'US', sku: 'BAB-AVE-003' },
    { name: 'Neutrogena Pure & Free Baby Sunscreen', name_bn: 'নিউট্রোজেনা বেবি সানস্ক্রিন', description: 'Zinc oxide sunscreen for baby protection.', price: 1600, category: 'babycare', brand: 'neutrogena', country: 'US', sku: 'BAB-NEU-001' },
  ];

  const products: Record<string, any> = {};
  for (const prod of productsData) {
    const categoryKey = prod.category.toLowerCase().replace(/[^a-z]/g, '');
    const brandKey = prod.brand.toLowerCase().replace(/[^a-z]/g, '');

    const [inserted] = await knex('products').insert({
      name: prod.name,
      name_bn: prod.name_bn,
      slug: slugify(prod.name), // Added Slug
      description: prod.description,
      description_bn: prod.description + ' (বাংলা)',
      price: prod.price,
      old_price: prod.old_price || null,
      cost_price: prod.price * 0.7,
      category_id: categories[categoryKey]?.id || null,
      brand_id: brands[brandKey]?.id || null,
      country_id: countries[prod.country]?.id || null,
      stock: Math.floor(Math.random() * 100) + 20,
      sku: prod.sku,
      has_variants: false,
      images: JSON.stringify([`https://picsum.photos/seed/${prod.sku}/800/800`]),
      is_active: true
    }).returning('*');

    products[prod.sku] = inserted;
  }

  // ============================================
  // ASSIGN PRODUCT LABELS
  // ============================================
  const productLabelAssignments = [
    { sku: 'SKN-CER-001', labels: ['best-sellers', 'featured'] },
    { sku: 'SKN-ORD-001', labels: ['trending', 'best-sellers'] },
    { sku: 'SKN-COS-001', labels: ['featured', 'premium'] },
    { sku: 'SKN-BOJ-001', labels: ['trending', 'new-arrivals'] },
    { sku: 'BAB-AVE-001', labels: ['best-sellers', 'premium'] },
    { sku: 'BAB-SUD-001', labels: ['best-sellers'] },
    { sku: 'BAB-PAM-001', labels: ['premium'] },
    { sku: 'BAB-HUG-001', labels: ['on-sale'] },
    { sku: 'SKN-SIM-001', labels: ['best-sellers'] },
    { sku: 'SKN-SBM-001', labels: ['trending'] },
  ];

  for (const assignment of productLabelAssignments) {
    const product = products[assignment.sku];
    if (product) {
      for (const labelSlug of assignment.labels) {
        const label = labels[labelSlug];
        if (label) {
          await knex('product_labels').insert({
            product_id: product.id,
            label_id: label.id
          });
        }
      }
    }
  }

  // ============================================
  // INSERT BANNERS (5)
  // ============================================
  await knex('banners').insert([
    {
      title: 'K-Beauty Essentials',
      title_bn: 'কোরিয়ান বিউটি এসেনশিয়ালস',
      image: 'https://picsum.photos/seed/kbeauty/1200/400',
      link: '/products?category=skincare',
      is_active: true,
      order: 1,
      no_expiry: false,
      starts_at: '2026-01-01',
      expires_at: '2026-03-31',
      position: 'hero',
      target: '_self',
      label_id: labels['trending'].id,
    },
    {
      title: 'Premium Baby Care',
      title_bn: 'প্রিমিয়াম বেবি কেয়ার',
      image: 'https://picsum.photos/seed/babybanner/1200/400',
      link: '/products?category=babycare',
      is_active: true,
      order: 2,
      no_expiry: true,
      position: 'hero',
      target: '_self',
      label_id: labels['premium'].id,
    },
    {
      title: 'Summer Skincare Sale',
      title_bn: 'সামার স্কিনকেয়ার সেল',
      image: 'https://picsum.photos/seed/summerskin/1200/400',
      link: '/products?label=on-sale',
      is_active: true,
      order: 3,
      no_expiry: true,
      position: 'hero',
      target: '_self',
      label_id: labels['on-sale'].id,
    },
    {
      title: 'Authentic Diapers & Wipes',
      title_bn: 'আসল ডায়াপার এবং ওয়াইপস',
      image: 'https://picsum.photos/seed/diaperbanner/1200/400',
      link: '/products?category=diapers',
      is_active: true,
      order: 4,
      no_expiry: true,
      position: 'hero',
      target: '_self',
      label_id: labels['best-sellers'].id,
    },
    {
      title: 'Free Shipping Over ৳5000',
      title_bn: '৳৫০০০ এর উপরে ফ্রি শিপিং',
      image: 'https://picsum.photos/seed/freeship/800/200',
      link: '/products',
      is_active: true,
      order: 1,
      no_expiry: true,
      position: 'sidebar',
      target: '_self',
    },
  ]);

  // ============================================
  // INSERT DELIVERY CHARGES
  // ============================================
  await knex('delivery_charges').insert([
    { name: 'Inside Dhaka', name_bn: 'ঢাকার ভিতরে', amount: 60.00 },
    { name: 'Outside Dhaka Metro', name_bn: 'ঢাকা মেট্রোর বাইরে', amount: 100.00 },
    { name: 'Outside Dhaka', name_bn: 'ঢাকার বাইরে', amount: 130.00 },
  ]);

  // ============================================
  // INSERT COUPONS (6)
  // ============================================
  await knex('coupons').insert([
    {
      code: 'WELCOME20',
      name: 'Welcome Discount',
      description: '20% off for new customers',
      type: 'percentage',
      value: 20.00,
      min_order_amount: 1000.00,
      max_discount_amount: 500.00,
      starts_at: '2026-01-01',
      expires_at: '2026-12-31',
      no_expiry: false,
      usage_limit: 1000,
      usage_limit_per_user: 1,
      first_order_only: true,
      free_shipping: false,
      is_active: true
    },
    {
      code: 'FLAT100',
      name: 'Flat 100 Off',
      description: 'Flat 100 Taka discount',
      type: 'fixed',
      value: 100.00,
      min_order_amount: 2000.00,
      starts_at: '2026-01-01',
      expires_at: '2026-12-31',
      no_expiry: false,
      usage_limit: null,
      usage_limit_per_user: 3,
      first_order_only: false,
      free_shipping: false,
      is_active: true
    },
    {
      code: 'FREESHIP',
      name: 'Free Shipping',
      description: 'Free shipping on orders above 3000',
      type: 'fixed',
      value: 0.00,
      min_order_amount: 3000.00,
      no_expiry: true,
      usage_limit: null,
      usage_limit_per_user: null,
      first_order_only: false,
      free_shipping: true,
      is_active: true
    },
    {
      code: 'BABY25',
      name: 'Baby Week Sale',
      description: '25% off during baby week',
      type: 'percentage',
      value: 25.00,
      min_order_amount: 1500.00,
      max_discount_amount: 750.00,
      starts_at: '2026-02-01',
      expires_at: '2026-02-28',
      no_expiry: false,
      usage_limit: 500,
      usage_limit_per_user: 2,
      first_order_only: false,
      free_shipping: false,
      is_active: true
    },
    {
      code: 'VIP500',
      name: 'VIP Customer Discount',
      description: 'Special discount for VIP customers',
      type: 'fixed',
      value: 500.00,
      min_order_amount: 5000.00,
      no_expiry: true,
      usage_limit: null,
      usage_limit_per_user: 10,
      first_order_only: false,
      free_shipping: true,
      is_active: true
    },
    {
      code: 'SUMMER30',
      name: 'Summer Sale',
      description: '30% off on summer collection',
      type: 'percentage',
      value: 30.00,
      min_order_amount: 2000.00,
      max_discount_amount: 1000.00,
      starts_at: '2026-04-01',
      expires_at: '2026-06-30',
      no_expiry: false,
      usage_limit: 2000,
      usage_limit_per_user: 5,
      first_order_only: false,
      free_shipping: false,
      is_active: true
    },
  ]);

  // ============================================
  // INSERT SETTINGS
  // ============================================
  await knex('settings').insert([
    { key: 'inventory_method', value: 'FIFO', description: 'Inventory valuation method: FIFO or LIFO' },
    { key: 'bkash_number', value: '01700000000', description: 'Bkash Merchant/Personal Number' },
    { key: 'nagad_number', value: '01700000000', description: 'Nagad Merchant/Personal Number' },
    { key: 'free_shipping_threshold', value: '5000', description: 'Minimum order amount for free shipping' },
    { key: 'shop_name', value: 'Prithibee', description: 'Name of the shop displayed in header/footer' },
    { key: 'shop_name_bn', value: 'পৃথিবী', description: 'Name of the shop in Bangla' },
    { key: 'shop_phone', value: '+880 1616-684803', description: 'Primary contact number' },
    { key: 'shop_address', value: 'Uttara Model Town, Dhaka-1230', description: 'Physical store address' },
    { key: 'support_email', value: 'support@prithibee.com', description: 'Support email address' },
    { key: 'facebook_link', value: 'https://www.facebook.com/prithibeeofficial', description: 'Facebook page URL' },
    { key: 'whatsapp_number', value: '+8801616684803', description: 'WhatsApp number for chat button' },
    { key: 'currency', value: 'BDT', description: 'Default currency' },
    { key: 'currency_symbol', value: '৳', description: 'Currency symbol' },
    { key: 'payment_methods', value: 'bKash,Nagad,Visa,Mastercard,COD', description: 'Available payment methods (comma separated)' },
    { key: 'points_earning_rate', value: '1', description: 'Points earned per 100 currency units' }, // 1 point per 100 BDT
    { key: 'points_redemption_rate', value: '0.1', description: 'Currency value per 1 point' }, // 1 point = 0.1 BDT (10 points = 1 BDT)
  ]);

  // ============================================
  // INSERT PROMISES
  // ============================================
  await knex('promises').insert([
    { title: 'Expertly Curated', title_bn: 'বিশেষজ্ঞ দ্বারা বাছাইকৃত', description: 'Every product is vetted by pediatricians and moms.', description_bn: 'প্রতিটি পণ্য শিশু বিশেষজ্ঞ এবং মায়েদের দ্বারা পরীক্ষিত।', icon: '🛡️', order: 1 },
    { title: 'Same-Day Delivery', title_bn: 'সেম-ডে ডেলিভারি', description: 'Order by 2PM and get it today.', description_bn: 'দুপুর ২টার মধ্যে অর্ডার করুন এবং আজই পান।', icon: '🚀', order: 2 },
    { title: '24/7 Parent Support', title_bn: '২৪/৭ প্যারেন্ট সাপোর্ট', description: 'Questions? Chat with our experts anytime.', description_bn: 'প্রশ্ন আছে? আমাদের বিশেষজ্ঞদের সাথে চ্যাট করুন।', icon: '💬', order: 3 },
    { title: 'Easy Returns', title_bn: 'সহজ রিটার্ন', description: '7-day hassle-free returns on all products.', description_bn: 'সমস্ত পণ্যে ৭ দিনের ঝামেলামুক্ত রিটার্ন।', icon: '↩️', order: 4 },
  ]);

  // ============================================
  // INSERT SAMPLE ORDERS AND REVIEWS
  // ============================================
  const [order] = await knex('orders').insert({
    user_id: customer.id,
    customer_name: 'John Doe',
    customer_phone: '01700000001',
    customer_address: 'Uttara Model Town, Dhaka-1230',
    subtotal: 5200,
    delivery_charge: 60,
    discount: 0,
    total_amount: 5260,
    status: 'delivered',
    payment_status: 'Paid',
    payment_method: 'cod',
    order_source: 'Website'
  }).returning('*');

  // Insert order items
  const productSkus = ['SKN-CER-001', 'BAB-AVE-001'];
  for (const sku of productSkus) {
    const product = products[sku];
    if (product) {
      await knex('order_items').insert({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: 1
      });
    }
  }

  // Insert reviews (testimonials for landing page)
  const reviewsData = [
    { sku: 'SKN-CER-001', rating: 5, comment: 'Amazing cleanser! Really helped with my oily skin.' },
    { sku: 'BAB-AVE-001', rating: 5, comment: 'Best lotion for my baby. Very gentle.' },
    { sku: 'SKN-ORD-001', rating: 4, comment: 'Good serum, saw results in 2 weeks.' },
    { sku: 'BAB-PAM-001', rating: 5, comment: 'Premium quality diapers. No leaks at all.' },
    { sku: 'SKN-BOJ-001', rating: 5, comment: 'Best sunscreen ever! No white cast.' },
  ];

  for (const review of reviewsData) {
    const product = products[review.sku];
    if (product) {
      await knex('reviews').insert({
        product_id: product.id,
        user_id: customer.id,
        order_id: order.id,
        rating: review.rating,
        comment: review.comment,
        status: 'approved',
        created_at: new Date()
      });
    }
  }

  // ============================================
  // INSERT EMAIL TEMPLATES
  // ============================================
  await knex('email_templates').insert([
    {
      name: 'order_placed',
      subject: 'Order #{{order_number}} Placed Successfully',
      body: `<p>Dear {{customer_name}},</p>
<p>Thank you for your order! Your order <strong>#{{order_number}}</strong> has been placed successfully.</p>
<p><strong>Total Amount:</strong> {{total_amount}}</p>
<p>We will contact you soon regarding the delivery.</p>
<p>Best regards,<br>Prithibee Team</p>`,
      variables: JSON.stringify(['customer_name', 'order_number', 'total_amount']),
      is_active: true,
    },
    {
      name: 'order_status_update',
      subject: 'Order #{{order_number}} Status Update',
      body: `<p>Dear {{customer_name}},</p>
<p>Your order <strong>#{{order_number}}</strong> status has been updated to: <strong>{{status}}</strong>.</p>
<p>Thank you for shopping with us.</p>
<p>Best regards,<br>Prithibee Team</p>`,
      variables: JSON.stringify(['customer_name', 'order_number', 'status']),
      is_active: true,
    },
    {
      name: 'verification_code',
      subject: 'Your Verification Code',
      body: `<p>Hello,</p>
<p>Your verification code is: <strong>{{otp}}</strong></p>
<p>This code is valid for 5 minutes.</p>
<p>If you did not request this code, please ignore this email.</p>
<p>Best regards,<br>Prithibee Team</p>`,
      variables: JSON.stringify(['otp']),
      is_active: true,
    },
  ]);

  // ============================================
  // INSERT SMS TEMPLATES
  // ============================================
  await knex('sms_templates').insert([
    {
      name: 'order_placed',
      body: `Dear {{customer_name}}, your order #{{order_number}} has been placed successfully. Total: {{total_amount}}. We will contact you soon.`,
      variables: JSON.stringify(['customer_name', 'order_number', 'total_amount']),
      is_active: true,
    },
    {
      name: 'order_status_update',
      body: `Your order #{{order_number}} status has been updated to: {{status}}.`,
      variables: JSON.stringify(['order_number', 'status']),
      is_active: true,
    },
    {
      name: 'verification_code',
      body: `Your Prithibee verification code is: {{otp}}. Valid for 5 minutes.`,
      variables: JSON.stringify(['otp']),
      is_active: true,
    },
  ]);

  console.log('Seeding completed successfully!');
  console.log(`- ${Object.keys(ageGroups).length} age groups`);
  console.log(`- ${Object.keys(labels).length} labels`);
  console.log(`- ${Object.keys(countries).length} countries`);
  console.log(`- ${Object.keys(brands).length} brands`);
  console.log(`- ${Object.keys(categories).length} categories`);
  console.log(`- ${Object.keys(products).length} products`);
  console.log(`- ${reviewsData.length} reviews`);
}
