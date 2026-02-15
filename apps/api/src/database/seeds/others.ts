import { Knex } from 'knex';

// Shared seed helper functions and data for various lookup tables.

const localSlugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

export async function seedAgeGroups(knex: Knex, tenantId: string = 'default') {
  await knex('age_groups').del();

  const ageGroupsData = [
    { label: 'Newborn', label_bn: 'নবজাতক', icon: '👶', age_range: '0-3 months', description: 'Essentials for your newborn', description_bn: 'নবজাতকের জন্য প্রয়োজনীয়', sort_order: 1 },
    { label: 'Infant', label_bn: 'শিশু', icon: '🍼', age_range: '3-6 months', description: 'Growing baby needs', description_bn: 'বড় হওয়া শিশুর প্রয়োজন', sort_order: 2 },
    { label: 'Crawler', label_bn: 'হামাগুড়ি', icon: '🦸', age_range: '6-12 months', description: 'Active explorer stage', description_bn: 'সক্রিয় অন্বেষণ পর্যায়', sort_order: 3 },
    { label: 'Toddler', label_bn: 'বাচ্চা', icon: '🎈', age_range: '1-2 years', description: 'Fun learning products', description_bn: 'মজার শেখার পণ্য', sort_order: 4 },
    { label: 'Preschool', label_bn: 'প্রি-স্কুল', icon: '🎨', age_range: '2-4 years', description: 'Prepare for school', description_bn: 'স্কুলের জন্য প্রস্তুতি', sort_order: 5 },
    { label: 'Kids', label_bn: 'বাচ্চাদের', icon: '🎒', age_range: '4-8 years', description: 'Products for growing kids', description_bn: 'বড় বাচ্চাদের জন্য পণ্য', sort_order: 6 },
  ];

  const slugify = (text: string) =>
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');

  const ageGroups: Record<string, any> = {};
  for (const ag of ageGroupsData) {
    const [inserted] = await knex('age_groups')
      .insert({
        ...ag,
        slug: slugify(ag.label),
        is_active: true,
        tenant_id: tenantId,
      })
      .returning('*');
    ageGroups[ag.label.toLowerCase()] = inserted;
  }

  return ageGroups;
}

export async function seedCountries(knex: Knex) {
  await knex('countries').del();

  const countriesData = [
    { name: 'Bangladesh', name_bn: 'বাংলাদেশ', code: 'BD', flag: '🇧🇩' },
    { name: 'United States', name_bn: 'যুক্তরাষ্ট্র', code: 'US', flag: '🇺🇸' },
    { name: 'Japan', name_bn: 'জাপান', code: 'JP', flag: '🇯🇵' },
    { name: 'Germany', name_bn: 'জার্মানি', code: 'DE', flag: '🇩🇪' },
    { name: 'United Kingdom', name_bn: 'যুক্তরাজ্য', code: 'GB', flag: '🇬🇧' },
    { name: 'China', name_bn: 'চীন', code: 'CN', flag: '🇨🇳' },
    { name: 'India', name_bn: 'ভারত', code: 'IN', flag: '🇮🇳' },
    { name: 'South Korea', name_bn: 'দক্ষিণ কোরিয়া', code: 'KR', flag: '🇰🇷' },
    { name: 'France', name_bn: 'ফ্রান্স', code: 'FR', flag: '🇫🇷' },
    { name: 'Australia', name_bn: 'অস্ট্রেলিয়া', code: 'AU', flag: '🇦🇺' },
  ];

  const countries: Record<string, any> = {};
  for (const country of countriesData) {
    const [inserted] = await knex('countries')
      .insert({ ...country, is_active: true })
      .returning('*');
    countries[country.code] = inserted;
  }

  return countries;
}

export async function seedLabels(knex: Knex) {
  await knex('labels').del();

  const labelsData = [
    {
      name: 'New Arrivals',
      name_bn: 'নতুন পণ্য',
      slug: 'new-arrivals',
      color: '#22c55e',
      bg_color: '#f0fdf4',
      description: 'Recently added products',
    },
    {
      name: 'Best Sellers',
      name_bn: 'সেরা বিক্রয়',
      slug: 'best-sellers',
      color: '#f59e0b',
      bg_color: '#fffbeb',
      description: 'Top selling products',
    },
    {
      name: 'Featured',
      name_bn: 'ফিচার্ড',
      slug: 'featured',
      color: '#8b5cf6',
      bg_color: '#f5f3ff',
      description: 'Hand-picked featured products',
    },
    {
      name: 'On Sale',
      name_bn: 'সেল',
      slug: 'on-sale',
      color: '#ef4444',
      bg_color: '#fef2f2',
      description: 'Products currently on sale',
    },
    {
      name: 'Trending',
      name_bn: 'ট্রেন্ডিং',
      slug: 'trending',
      color: '#ec4899',
      bg_color: '#fdf2f8',
      description: 'Currently trending products',
    },
    {
      name: 'Limited Edition',
      name_bn: 'সীমিত সংস্করণ',
      slug: 'limited-edition',
      color: '#6366f1',
      bg_color: '#eef2ff',
      description: 'Limited stock items',
    },
    {
      name: 'Eco Friendly',
      name_bn: 'পরিবেশ বান্ধব',
      slug: 'eco-friendly',
      color: '#10b981',
      bg_color: '#ecfdf5',
      description: 'Environmentally friendly products',
    },
    {
      name: 'Premium',
      name_bn: 'প্রিমিয়াম',
      slug: 'premium',
      color: '#d97706',
      bg_color: '#fef3c7',
      description: 'Premium quality products',
    },
  ];

  const labels: Record<string, any> = {};

  for (const label of labelsData) {
    const [inserted] = await knex('labels')
      .insert({
        ...label,
        slug: label.slug || localSlugify(label.name),
        is_active: true,
      })
      .returning('*');

    labels[label.slug] = inserted;
  }

  return labels;
}

export async function seedCoupons(knex: Knex) {
  await knex('coupons').del();

  await knex('coupons').insert([
    {
      code: 'WELCOME20',
      name: 'Welcome Discount',
      description: '20% off for new customers',
      type: 'percentage',
      value: 20.0,
      min_order_amount: 1000.0,
      max_discount_amount: 500.0,
      starts_at: '2026-01-01',
      expires_at: '2026-12-31',
      no_expiry: false,
      usage_limit: 1000,
      usage_limit_per_user: 1,
      first_order_only: true,
      free_shipping: false,
      is_active: true,
    },
    {
      code: 'FLAT100',
      name: 'Flat 100 Off',
      description: 'Flat 100 Taka discount',
      type: 'fixed',
      value: 100.0,
      min_order_amount: 2000.0,
      starts_at: '2026-01-01',
      expires_at: '2026-12-31',
      no_expiry: false,
      usage_limit: null,
      usage_limit_per_user: 3,
      first_order_only: false,
      free_shipping: false,
      is_active: true,
    },
    {
      code: 'FREESHIP',
      name: 'Free Shipping',
      description: 'Free shipping on orders above 3000',
      type: 'fixed',
      value: 0.0,
      min_order_amount: 3000.0,
      no_expiry: true,
      usage_limit: null,
      usage_limit_per_user: null,
      first_order_only: false,
      free_shipping: true,
      is_active: true,
    },
    {
      code: 'BABY25',
      name: 'Baby Week Sale',
      description: '25% off during baby week',
      type: 'percentage',
      value: 25.0,
      min_order_amount: 1500.0,
      max_discount_amount: 750.0,
      starts_at: '2026-02-01',
      expires_at: '2026-02-28',
      no_expiry: false,
      usage_limit: 500,
      usage_limit_per_user: 2,
      first_order_only: false,
      free_shipping: false,
      is_active: true,
    },
    {
      code: 'VIP500',
      name: 'VIP Customer Discount',
      description: 'Special discount for VIP customers',
      type: 'fixed',
      value: 500.0,
      min_order_amount: 5000.0,
      no_expiry: true,
      usage_limit: null,
      usage_limit_per_user: 10,
      first_order_only: false,
      free_shipping: true,
      is_active: true,
    },
    {
      code: 'SUMMER30',
      name: 'Summer Sale',
      description: '30% off on summer collection',
      type: 'percentage',
      value: 30.0,
      min_order_amount: 2000.0,
      max_discount_amount: 1000.0,
      starts_at: '2026-04-01',
      expires_at: '2026-06-30',
      no_expiry: false,
      usage_limit: 2000,
      usage_limit_per_user: 5,
      first_order_only: false,
      free_shipping: false,
      is_active: true,
    },
  ]);
}

export async function seedPromises(knex: Knex) {
  await knex('promises').del();

  await knex('promises').insert([
    {
      title: 'Expertly Curated',
      title_bn: 'বিশেষজ্ঞ দ্বারা বাছাইকৃত',
      description: 'Every product is vetted by pediatricians and moms.',
      description_bn: 'প্রতিটি পণ্য শিশু বিশেষজ্ঞ এবং মায়েদের দ্বারা পরিক্ষিত।',
      icon: '🛡️',
      order: 1,
    },
    {
      title: 'Same-Day Delivery',
      title_bn: 'সেম-ডে ডেলিভারি',
      description: 'Order by 2PM and get it today.',
      description_bn: 'দুপুর ২টার মধ্যে অর্ডার করলে আজই ডেলিভারি।',
      icon: '🚀',
      order: 2,
    },
    {
      title: '24/7 Parent Support',
      title_bn: '২৪/৭ প্যারেন্ট সাপোর্ট',
      description: 'Questions? Chat with our experts anytime.',
      description_bn: 'প্রশ্ন আছে? যেকোন সময় আমাদের বিশেষজ্ঞদের সাথে কথা বলুন।',
      icon: '💬',
      order: 3,
    },
    {
      title: 'Easy Returns',
      title_bn: 'সহজ রিটার্ন',
      description: '7-day hassle-free returns on all products.',
      description_bn: 'সব পণ্যের উপর ৭ দিনের ঝামেলা-মুক্ত রিটার্ন।',
      icon: '↩️',
      order: 4,
    },
  ]);
}

export async function seedEmailAndSmsTemplates(knex: Knex) {
  await knex('email_templates').del();
  await knex('sms_templates').del();

  const emailTemplates = [
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
  ];

  const smsTemplates = [
    {
      name: 'order_placed',
      body: `Dear {{customer_name}}, your order #{{order_number}} has been placed successfully. Total: {{total_amount}}. We will contact you soon.`,
      variables: JSON.stringify(['customer_name', 'order_number', 'total_amount']),
      is_active: true,
    },
    {
      name: 'verification_code',
      body: `Your Prithibee verification code is: {{otp}}. Valid for 5 minutes.`,
      variables: JSON.stringify(['otp']),
      is_active: true,
    },
  ];

  if (emailTemplates.length) {
    await knex('email_templates').insert(emailTemplates);
  }

  if (smsTemplates.length) {
    await knex('sms_templates').insert(smsTemplates);
  }
}

// Default Knex seed entrypoint so this file can be run directly
export async function seed(knex: Knex): Promise<void> {
  // Clear only the lookup-style tables this module owns
  await knex('coupon_usages').del();
  await knex('coupons').del();
  await knex('promises').del();
  await knex('reviews').del(); // optional: if you consider reviews sample/lookup data
  await knex('age_groups').del();
  await knex('labels').del();
  await knex('countries').del();
  await knex('email_templates').del();
  await knex('sms_templates').del();

  const ageGroups = await seedAgeGroups(knex, 'default');
  const countries = await seedCountries(knex);
  const labels = await seedLabels(knex);
  await seedCoupons(knex);
  await seedPromises(knex);
  await seedEmailAndSmsTemplates(knex);

  console.log('[others.ts] lookup seeding completed');
  console.log({
    ageGroups: Object.keys(ageGroups).length,
    countries: Object.keys(countries).length,
    labels: Object.keys(labels).length,
  });
}
