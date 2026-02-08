import { Knex } from 'knex';

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
  await knex('product_batches').del();
  await knex('product_variants').del();
  await knex('product_labels').del();
  await knex('products').del();
  await knex('categories').del();
  await knex('age_groups').del();
  await knex('banners').del();
  await knex('media_files').del();
  await knex('media_folders').del();
  await knex('delivery_charges').del();
  await knex('coupons').del();
  await knex('labels').del();
  await knex('brands').del();
  await knex('settings').del();
  await knex('countries').del();

  // Get User IDs (assuming they exist from 01_users.ts)
  const admin = await knex('users').where({ role: 'admin' }).first();
  const customer = await knex('users').where({ role: 'customer' }).first();

  if (!admin || !customer) {
    console.log('Users not found. Please run 01_users seed first.');
    return;
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
    const [inserted] = await knex('age_groups').insert({ ...ag, is_active: true, tenant_id: 'default' }).returning('*');
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
  // INSERT BRANDS (15)
  // ============================================
  const brandsData = [
    { name: 'Huggies', name_bn: 'হাগিস', logo: 'https://picsum.photos/seed/huggies/200/200' },
    { name: 'Pampers', name_bn: 'প্যাম্পার্স', logo: 'https://picsum.photos/seed/pampers/200/200' },
    { name: 'Johnson & Johnson', name_bn: 'জনসন অ্যান্ড জনসন', logo: 'https://picsum.photos/seed/jnj/200/200' },
    { name: 'Aveeno Baby', name_bn: 'অ্যাভিনো বেবি', logo: 'https://picsum.photos/seed/aveeno/200/200' },
    { name: 'Mustela', name_bn: 'মাস্টেলা', logo: 'https://picsum.photos/seed/mustela/200/200' },
    { name: 'Chicco', name_bn: 'চিক্কো', logo: 'https://picsum.photos/seed/chicco/200/200' },
    { name: 'Philips Avent', name_bn: 'ফিলিপস অ্যাভেন্ট', logo: 'https://picsum.photos/seed/avent/200/200' },
    { name: 'Dr. Browns', name_bn: 'ডক্টর ব্রাউনস', logo: 'https://picsum.photos/seed/drbrowns/200/200' },
    { name: 'Fisher-Price', name_bn: 'ফিশার-প্রাইস', logo: 'https://picsum.photos/seed/fisherprice/200/200' },
    { name: 'Graco', name_bn: 'গ্রেকো', logo: 'https://picsum.photos/seed/graco/200/200' },
    { name: 'Carters', name_bn: 'কার্টার্স', logo: 'https://picsum.photos/seed/carters/200/200' },
    { name: 'Gerber', name_bn: 'গারবার', logo: 'https://picsum.photos/seed/gerber/200/200' },
    { name: 'Pigeon', name_bn: 'পিজিয়ন', logo: 'https://picsum.photos/seed/pigeon/200/200' },
    { name: 'Mee Mee', name_bn: 'মি মি', logo: 'https://picsum.photos/seed/meemee/200/200' },
    { name: 'Babyhug', name_bn: 'বেবিহাগ', logo: 'https://picsum.photos/seed/babyhug/200/200' },
  ];

  const brands: Record<string, any> = {};
  for (const brand of brandsData) {
    const [inserted] = await knex('brands').insert({ ...brand, is_active: true }).returning('*');
    brands[brand.name.toLowerCase().replace(/[^a-z]/g, '')] = inserted;
  }

  // ============================================
  // INSERT CATEGORIES (25) - With hierarchy
  // ============================================

  // Parent Categories
  const parentCategoriesData = [
    { name: 'Diapers & Wipes', name_bn: 'ডায়াপার এবং ওয়াইপস', image: 'https://picsum.photos/seed/diapers/800/800' },
    { name: 'Feeding', name_bn: 'ফিডিং', image: 'https://picsum.photos/seed/feeding/800/800' },
    { name: 'Clothing', name_bn: 'পোশাক', image: 'https://picsum.photos/seed/clothing/800/800' },
    { name: 'Skincare', name_bn: 'স্কিনকেয়ার', image: 'https://picsum.photos/seed/skincare/800/800' },
    { name: 'Toys & Games', name_bn: 'খেলনা ও গেমস', image: 'https://picsum.photos/seed/toys/800/800' },
    { name: 'Nursery & Furniture', name_bn: 'নার্সারি ও ফার্নিচার', image: 'https://picsum.photos/seed/nursery/800/800' },
    { name: 'Bath & Safety', name_bn: 'গোসল ও নিরাপত্তা', image: 'https://picsum.photos/seed/bath/800/800' },
    { name: 'Health & Medicine', name_bn: 'স্বাস্থ্য ও ওষুধ', image: 'https://picsum.photos/seed/health/800/800' },
    { name: 'Travel & Gear', name_bn: 'ভ্রমণ ও গিয়ার', image: 'https://picsum.photos/seed/travel/800/800' },
    { name: 'Mom Care', name_bn: 'মায়ের যত্ন', image: 'https://picsum.photos/seed/momcare/800/800' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of parentCategoriesData) {
    const [inserted] = await knex('categories').insert({ ...cat, is_active: true }).returning('*');
    categories[cat.name.toLowerCase().replace(/[^a-z]/g, '')] = inserted;
  }

  // Sub Categories
  const subCategoriesData = [
    { name: 'Disposable Diapers', name_bn: 'ডিসপোজেবল ডায়াপার', parent: 'diaperswipes' },
    { name: 'Cloth Diapers', name_bn: 'কাপড়ের ডায়াপার', parent: 'diaperswipes' },
    { name: 'Wipes', name_bn: 'ওয়াইপস', parent: 'diaperswipes' },
    { name: 'Baby Bottles', name_bn: 'বেবি বোতল', parent: 'feeding' },
    { name: 'Breast Pumps', name_bn: 'ব্রেস্ট পাম্প', parent: 'feeding' },
    { name: 'Baby Food', name_bn: 'বেবি ফুড', parent: 'feeding' },
    { name: 'Bodysuits', name_bn: 'বডিসুট', parent: 'clothing' },
    { name: 'Sleepwear', name_bn: 'স্লিপওয়্যার', parent: 'clothing' },
    { name: 'Winter Wear', name_bn: 'শীতের পোশাক', parent: 'clothing' },
    { name: 'Lotions & Creams', name_bn: 'লোশন ও ক্রিম', parent: 'skincare' },
    { name: 'Baby Oil', name_bn: 'বেবি অয়েল', parent: 'skincare' },
    { name: 'Sunscreen', name_bn: 'সানস্ক্রিন', parent: 'skincare' },
    { name: 'Educational Toys', name_bn: 'শিক্ষামূলক খেলনা', parent: 'toysgames' },
    { name: 'Soft Toys', name_bn: 'নরম খেলনা', parent: 'toysgames' },
    { name: 'Strollers', name_bn: 'স্ট্রলার', parent: 'travelgear' },
  ];

  for (const subCat of subCategoriesData) {
    const parent = categories[subCat.parent];
    if (parent) {
      const [inserted] = await knex('categories').insert({
        name: subCat.name,
        name_bn: subCat.name_bn,
        parent_id: parent.id,
        image: `https://picsum.photos/seed/${subCat.name.toLowerCase().replace(/\s/g, '')}/800/800`,
        is_active: true
      }).returning('*');
      categories[subCat.name.toLowerCase().replace(/[^a-z]/g, '')] = inserted;
    }
  }

  // ============================================
  // INSERT PRODUCTS (50)
  // ============================================
  const productsData = [
    // Diapers & Wipes (8 products)
    { name: 'Premium Soft Diapers - Small', name_bn: 'প্রিমিয়াম সফট ডায়াপার - ছোট', description: 'Ultra-soft diapers for sensitive skin. 12-hour protection.', price: 2800, old_price: 3200, category: 'diaperswipes', brand: 'huggies', country: 'US', sku: 'DIA-S-001' },
    { name: 'Premium Soft Diapers - Medium', name_bn: 'প্রিমিয়াম সফট ডায়াপার - মাঝারি', description: 'Ultra-soft diapers for growing babies. 12-hour protection.', price: 3200, old_price: 3500, category: 'diaperswipes', brand: 'huggies', country: 'US', sku: 'DIA-M-001' },
    { name: 'Premium Soft Diapers - Large', name_bn: 'প্রিমিয়াম সফট ডায়াপার - বড়', description: 'Ultra-soft diapers for active toddlers. 12-hour protection.', price: 3500, old_price: 3800, category: 'diaperswipes', brand: 'huggies', country: 'US', sku: 'DIA-L-001' },
    { name: 'Baby Dry Diapers Pack', name_bn: 'বেবি ড্রাই ডায়াপার প্যাক', description: 'Extra dry layer keeps baby comfortable all day.', price: 2500, category: 'diaperswipes', brand: 'pampers', country: 'US', sku: 'DIA-DRY-001' },
    { name: 'Organic Cotton Diapers', name_bn: 'অর্গানিক কটন ডায়াপার', description: '100% organic cotton, gentle on baby skin.', price: 4200, old_price: 4800, category: 'diaperswipes', brand: 'babyhug', country: 'BD', sku: 'DIA-ORG-001' },
    { name: 'Sensitive Baby Wipes 80pcs', name_bn: 'সেনসিটিভ বেবি ওয়াইপস ৮০টি', description: 'Alcohol-free, fragrance-free wipes for sensitive skin.', price: 350, category: 'diaperswipes', brand: 'johnsonjohnson', country: 'US', sku: 'WIP-SEN-001' },
    { name: 'Water Wipes 60pcs', name_bn: 'ওয়াটার ওয়াইপস ৬০টি', description: 'Pure water and fruit extract. Worlds purest wipes.', price: 450, old_price: 520, category: 'diaperswipes', brand: 'mustela', country: 'FR', sku: 'WIP-WAT-001' },
    { name: 'Diaper Rash Cream', name_bn: 'ডায়াপার র‍্যাশ ক্রিম', description: 'Zinc oxide cream for diaper rash prevention and treatment.', price: 680, category: 'diaperswipes', brand: 'aveenobaby', country: 'US', sku: 'CRM-RSH-001' },

    // Feeding (8 products)
    { name: 'Anti-Colic Bottle 250ml', name_bn: 'অ্যান্টি-কলিক বোতল ২৫০মিলি', description: 'Reduces colic, gas and reflux with unique vent system.', price: 1200, old_price: 1400, category: 'feeding', brand: 'drbrowns', country: 'US', sku: 'BOT-AC-001' },
    { name: 'Natural Glass Bottle Set', name_bn: 'ন্যাচারাল গ্লাস বোতল সেট', description: 'Set of 3 glass bottles with silicone sleeve.', price: 2800, category: 'feeding', brand: 'philipsavent', country: 'GB', sku: 'BOT-GL-001' },
    { name: 'Electric Breast Pump', name_bn: 'ইলেকট্রিক ব্রেস্ট পাম্প', description: 'Quiet and efficient double electric pump.', price: 8500, old_price: 9500, category: 'feeding', brand: 'philipsavent', country: 'GB', sku: 'PMP-EL-001' },
    { name: 'Manual Breast Pump', name_bn: 'ম্যানুয়াল ব্রেস্ট পাম্প', description: 'Portable and easy to use manual pump.', price: 2200, category: 'feeding', brand: 'pigeon', country: 'JP', sku: 'PMP-MN-001' },
    { name: 'Silicone Feeding Set', name_bn: 'সিলিকন ফিডিং সেট', description: 'BPA-free silicone bowl, spoon and bib set.', price: 1800, old_price: 2200, category: 'feeding', brand: 'chicco', country: 'DE', sku: 'FED-SIL-001' },
    { name: 'Baby Food Maker', name_bn: 'বেবি ফুড মেকার', description: 'Steam, blend and warm baby food in one device.', price: 6500, category: 'feeding', brand: 'chicco', country: 'DE', sku: 'FED-MKR-001' },
    { name: 'Organic Rice Cereal', name_bn: 'অর্গানিক রাইস সিরিয়াল', description: 'Iron-fortified organic rice cereal for babies.', price: 480, category: 'feeding', brand: 'gerber', country: 'US', sku: 'FOD-RIC-001' },
    { name: 'Fruit Puree Variety Pack', name_bn: 'ফ্রুট পিউরি ভ্যারাইটি প্যাক', description: 'Pack of 6 organic fruit purees.', price: 850, old_price: 950, category: 'feeding', brand: 'gerber', country: 'US', sku: 'FOD-FRT-001' },

    // Clothing (8 products)
    { name: 'Organic Cotton Onesie Set', name_bn: 'অর্গানিক কটন ওয়ানসি সেট', description: 'Set of 5 soft organic cotton onesies.', price: 2500, old_price: 2900, category: 'clothing', brand: 'carters', country: 'US', sku: 'CLO-ONE-001' },
    { name: 'Baby Romper Pack', name_bn: 'বেবি রম্পার প্যাক', description: 'Pack of 3 colorful rompers with snaps.', price: 1800, category: 'clothing', brand: 'babyhug', country: 'BD', sku: 'CLO-ROM-001' },
    { name: 'Newborn Sleep Suit', name_bn: 'নবজাতক স্লিপ স্যুট', description: 'Cozy zip-up sleep suit for newborns.', price: 950, category: 'clothing', brand: 'carters', country: 'US', sku: 'CLO-SLP-001' },
    { name: 'Winter Jacket with Hood', name_bn: 'হুডসহ শীতের জ্যাকেট', description: 'Warm padded jacket with removable hood.', price: 3200, old_price: 3800, category: 'clothing', brand: 'meemee', country: 'IN', sku: 'CLO-WIN-001' },
    { name: 'Baby Socks 6-Pack', name_bn: 'বেবি মোজা ৬-প্যাক', description: 'Soft cotton socks with grip bottoms.', price: 450, category: 'clothing', brand: 'babyhug', country: 'BD', sku: 'CLO-SOC-001' },
    { name: 'Muslin Swaddle Blanket Set', name_bn: 'মসলিন স্বাডল ব্ল্যাংকেট সেট', description: 'Set of 3 breathable muslin swaddles.', price: 1600, old_price: 1900, category: 'clothing', brand: 'carters', country: 'US', sku: 'CLO-SWD-001' },
    { name: 'Baby Hat and Mittens Set', name_bn: 'বেবি টুপি ও হাতমোজা সেট', description: 'Soft knitted hat and mittens for cold weather.', price: 680, category: 'clothing', brand: 'meemee', country: 'IN', sku: 'CLO-HAT-001' },
    { name: 'Formal Baby Dress', name_bn: 'ফরমাল বেবি ড্রেস', description: 'Beautiful dress for special occasions.', price: 2200, category: 'clothing', brand: 'carters', country: 'US', sku: 'CLO-DRS-001' },

    // Skincare (8 products)
    { name: 'Organic Baby Lotion', name_bn: 'অর্গানিক বেবি লোশন', description: 'Gentle moisturizing lotion with aloe and chamomile.', price: 750, category: 'skincare', brand: 'aveenobaby', country: 'US', sku: 'SKN-LOT-001' },
    { name: 'Baby Massage Oil', name_bn: 'বেবি ম্যাসাজ অয়েল', description: 'Natural oil blend for baby massage.', price: 520, old_price: 620, category: 'skincare', brand: 'johnsonjohnson', country: 'US', sku: 'SKN-OIL-001' },
    { name: 'Baby Shampoo 500ml', name_bn: 'বেবি শ্যাম্পু ৫০০মিলি', description: 'No tears gentle baby shampoo.', price: 480, category: 'skincare', brand: 'johnsonjohnson', country: 'US', sku: 'SKN-SHP-001' },
    { name: 'Baby Body Wash', name_bn: 'বেবি বডি ওয়াশ', description: 'Tear-free, soap-free body wash.', price: 420, category: 'skincare', brand: 'pigeon', country: 'JP', sku: 'SKN-BWS-001' },
    { name: 'Baby Sunscreen SPF50', name_bn: 'বেবি সানস্ক্রিন এসপিএফ৫০', description: 'Mineral sunscreen safe for sensitive baby skin.', price: 980, old_price: 1100, category: 'skincare', brand: 'mustela', country: 'FR', sku: 'SKN-SUN-001' },
    { name: 'Eczema Care Cream', name_bn: 'একজিমা কেয়ার ক্রিম', description: 'Soothing cream for eczema-prone skin.', price: 1200, category: 'skincare', brand: 'aveenobaby', country: 'US', sku: 'SKN-ECZ-001' },
    { name: 'Baby Powder 400g', name_bn: 'বেবি পাউডার ৪০০গ্রাম', description: 'Talc-free baby powder for freshness.', price: 380, category: 'skincare', brand: 'johnsonjohnson', country: 'US', sku: 'SKN-PWD-001' },
    { name: 'Nipple Cream for Moms', name_bn: 'মায়েদের জন্য নিপল ক্রিম', description: 'Lanolin cream for breastfeeding moms.', price: 850, category: 'skincare', brand: 'mustela', country: 'FR', sku: 'SKN-NIP-001' },

    // Toys & Games (6 products)
    { name: 'Stacking Rings Toy', name_bn: 'স্ট্যাকিং রিংস টয়', description: 'Classic colorful stacking rings for motor skills.', price: 450, category: 'toysgames', brand: 'fisherprice', country: 'US', sku: 'TOY-STK-001' },
    { name: 'Musical Activity Gym', name_bn: 'মিউজিক্যাল অ্যাক্টিভিটি জিম', description: 'Play gym with lights, music and hanging toys.', price: 4500, old_price: 5200, category: 'toysgames', brand: 'fisherprice', country: 'US', sku: 'TOY-GYM-001' },
    { name: 'Soft Plush Teddy Bear', name_bn: 'সফট প্লাশ টেডি বিয়ার', description: 'Cuddly teddy bear with embroidered eyes.', price: 850, category: 'toysgames', brand: 'meemee', country: 'IN', sku: 'TOY-TED-001' },
    { name: 'Baby Rattle Set', name_bn: 'বেবি র‍্যাটল সেট', description: 'Set of 4 colorful rattles for sensory play.', price: 580, category: 'toysgames', brand: 'fisherprice', country: 'US', sku: 'TOY-RAT-001' },
    { name: 'Shape Sorter Cube', name_bn: 'শেপ সর্টার কিউব', description: 'Educational shape sorting toy.', price: 780, old_price: 880, category: 'toysgames', brand: 'fisherprice', country: 'US', sku: 'TOY-SHP-001' },
    { name: 'Bath Toys Set', name_bn: 'বাথ টয়স সেট', description: 'Set of 8 floating bath toys.', price: 650, category: 'toysgames', brand: 'meemee', country: 'IN', sku: 'TOY-BTH-001' },

    // Nursery & Furniture (4 products)
    { name: 'Baby Crib with Mattress', name_bn: 'ম্যাট্রেসসহ বেবি ক্রিব', description: 'Convertible crib with organic mattress.', price: 28000, old_price: 32000, category: 'nurseryfurniture', brand: 'graco', country: 'US', sku: 'NUR-CRB-001' },
    { name: 'Baby Changing Table', name_bn: 'বেবি চেঞ্জিং টেবিল', description: 'Sturdy changing table with storage.', price: 12000, category: 'nurseryfurniture', brand: 'graco', country: 'US', sku: 'NUR-CHG-001' },
    { name: 'Baby Monitor with Camera', name_bn: 'ক্যামেরাসহ বেবি মনিটর', description: 'HD video monitor with night vision.', price: 8500, old_price: 9500, category: 'nurseryfurniture', brand: 'philipsavent', country: 'GB', sku: 'NUR-MON-001' },
    { name: 'Nursery Night Light', name_bn: 'নার্সারি নাইট লাইট', description: 'Soft glow night light with timer.', price: 1200, category: 'nurseryfurniture', brand: 'chicco', country: 'DE', sku: 'NUR-NIT-001' },

    // Bath & Safety (4 products)
    { name: 'Baby Bath Tub', name_bn: 'বেবি বাথ টাব', description: 'Ergonomic bath tub with temperature indicator.', price: 2200, old_price: 2600, category: 'bathsafety', brand: 'chicco', country: 'DE', sku: 'BTH-TUB-001' },
    { name: 'Hooded Baby Towel Set', name_bn: 'হুডেড বেবি তোয়ালে সেট', description: 'Soft cotton hooded towel with washcloths.', price: 950, category: 'bathsafety', brand: 'babyhug', country: 'BD', sku: 'BTH-TWL-001' },
    { name: 'Safety Cabinet Locks 10-Pack', name_bn: 'সেফটি ক্যাবিনেট লক ১০-প্যাক', description: 'Child-proof cabinet locks.', price: 580, category: 'bathsafety', brand: 'meemee', country: 'IN', sku: 'SAF-LCK-001' },
    { name: 'Corner Protectors 8-Pack', name_bn: 'কর্নার প্রোটেক্টর ৮-প্যাক', description: 'Soft corner guards for furniture.', price: 380, category: 'bathsafety', brand: 'meemee', country: 'IN', sku: 'SAF-CRN-001' },

    // Travel & Gear (4 products)
    { name: 'Lightweight Stroller', name_bn: 'লাইটওয়েট স্ট্রলার', description: 'Compact foldable stroller for travel.', price: 15000, old_price: 18000, category: 'travelgear', brand: 'graco', country: 'US', sku: 'TRV-STR-001' },
    { name: 'Baby Car Seat', name_bn: 'বেবি কার সিট', description: 'Rear-facing infant car seat with base.', price: 18000, category: 'travelgear', brand: 'graco', country: 'US', sku: 'TRV-CAR-001' },
    { name: 'Baby Carrier Wrap', name_bn: 'বেবি ক্যারিয়ার র‍্যাপ', description: 'Ergonomic baby carrier for newborns.', price: 3500, old_price: 4000, category: 'travelgear', brand: 'chicco', country: 'DE', sku: 'TRV-CRR-001' },
    { name: 'Diaper Bag Backpack', name_bn: 'ডায়াপার ব্যাগ ব্যাকপ্যাক', description: 'Stylish backpack with multiple compartments.', price: 2800, category: 'travelgear', brand: 'babyhug', country: 'BD', sku: 'TRV-BAG-001' },
  ];

  const products: Record<string, any> = {};
  for (const prod of productsData) {
    const categoryKey = prod.category.toLowerCase().replace(/[^a-z]/g, '');
    const brandKey = prod.brand.toLowerCase().replace(/[^a-z]/g, '');

    const [inserted] = await knex('products').insert({
      name: prod.name,
      name_bn: prod.name_bn,
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
    { sku: 'DIA-S-001', labels: ['best-sellers', 'featured'] },
    { sku: 'DIA-M-001', labels: ['best-sellers'] },
    { sku: 'DIA-ORG-001', labels: ['eco-friendly', 'premium'] },
    { sku: 'BOT-AC-001', labels: ['best-sellers'] },
    { sku: 'PMP-EL-001', labels: ['featured', 'premium'] },
    { sku: 'CLO-ONE-001', labels: ['new-arrivals'] },
    { sku: 'CLO-WIN-001', labels: ['trending'] },
    { sku: 'SKN-LOT-001', labels: ['best-sellers'] },
    { sku: 'SKN-SUN-001', labels: ['eco-friendly'] },
    { sku: 'TOY-GYM-001', labels: ['featured', 'trending'] },
    { sku: 'NUR-CRB-001', labels: ['premium'] },
    { sku: 'TRV-STR-001', labels: ['on-sale', 'best-sellers'] },
    { sku: 'TRV-CAR-001', labels: ['featured'] },
    { sku: 'FED-SIL-001', labels: ['new-arrivals', 'eco-friendly'] },
    { sku: 'WIP-WAT-001', labels: ['eco-friendly', 'premium'] },
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
      title: 'Summer Sale - Up to 40% Off',
      title_bn: 'গ্রীষ্মকালীন সেল - ৪০% পর্যন্ত ছাড়',
      image: 'https://picsum.photos/seed/summersale/1200/400',
      link: '/products?label=on-sale',
      is_active: true,
      order: 1,
      no_expiry: false,
      starts_at: '2026-01-01',
      expires_at: '2026-03-31',
      position: 'hero',
      target: '_self',
      label_id: labels['on-sale'].id,
    },
    {
      title: 'New Arrivals Collection',
      title_bn: 'নতুন কালেকশন',
      image: 'https://picsum.photos/seed/newarrivals/1200/400',
      link: '/products?label=new-arrivals',
      is_active: true,
      order: 2,
      no_expiry: true,
      position: 'hero',
      target: '_self',
      label_id: labels['new-arrivals'].id,
    },
    {
      title: 'Premium Baby Essentials',
      title_bn: 'প্রিমিয়াম বেবি এসেনশিয়ালস',
      image: 'https://picsum.photos/seed/premium/1200/400',
      link: '/products?label=premium',
      is_active: true,
      order: 3,
      no_expiry: true,
      position: 'hero',
      target: '_self',
      label_id: labels['premium'].id,
    },
    {
      title: 'Eco Friendly Products',
      title_bn: 'পরিবেশ বান্ধব পণ্য',
      image: 'https://picsum.photos/seed/ecofriendly/1200/400',
      link: '/products?label=eco-friendly',
      is_active: true,
      order: 4,
      no_expiry: true,
      position: 'hero',
      target: '_self',
      label_id: labels['eco-friendly'].id,
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
    { key: 'shop_address', value: 'House 12, Road 5, Dhanmondi, Dhaka-1209', description: 'Physical store address' },
    { key: 'support_email', value: 'support@prithibee.com', description: 'Support email address' },
    { key: 'facebook_link', value: 'https://www.facebook.com/prithibeeofficial', description: 'Facebook page URL' },
    { key: 'whatsapp_number', value: '+8801616684803', description: 'WhatsApp number for chat button' },
    { key: 'currency', value: 'BDT', description: 'Default currency' },
    { key: 'currency_symbol', value: '৳', description: 'Currency symbol' },
    { key: 'payment_methods', value: 'bKash,Nagad,Visa,Mastercard,COD', description: 'Available payment methods (comma separated)' },
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
    customer_address: 'House 5, Road 10, Dhanmondi, Dhaka',
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
  const productSkus = ['DIA-S-001', 'SKN-LOT-001', 'CLO-ONE-001'];
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
    { sku: 'DIA-S-001', rating: 5, comment: 'Best diapers we have ever used! Super soft and no leaks.' },
    { sku: 'SKN-LOT-001', rating: 5, comment: 'My baby loves this lotion. Great for sensitive skin.' },
    { sku: 'CLO-ONE-001', rating: 4, comment: 'Good quality onesies. Soft cotton fabric.' },
    { sku: 'BOT-AC-001', rating: 5, comment: 'Reduced colic significantly. Highly recommended!' },
    { sku: 'TOY-GYM-001', rating: 5, comment: 'Our baby loves playing with this gym. Great quality.' },
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

  console.log('Seeding completed successfully!');
  console.log(`- ${Object.keys(ageGroups).length} age groups`);
  console.log(`- ${Object.keys(labels).length} labels`);
  console.log(`- ${Object.keys(countries).length} countries`);
  console.log(`- ${Object.keys(brands).length} brands`);
  console.log(`- ${Object.keys(categories).length} categories`);
  console.log(`- ${Object.keys(products).length} products`);
  console.log(`- ${reviewsData.length} reviews`);
}

