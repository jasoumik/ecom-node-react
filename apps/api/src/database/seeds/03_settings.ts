import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('settings').del();

  // Inserts seed entries
  await knex('settings').insert([
    // General Site Settings
    {
      key: 'site_name',
      value: 'Prithibee',
      description: 'The name of the website',
      is_active: true,
    },
    {
      key: 'site_description',
      value: 'Premium baby care and skin care products in Bangladesh.',
      description: 'Meta description for the website',
      is_active: true,
    },
    {
      key: 'site_logo',
      value: '/prithibee.png',
      description: 'Path to the site logo',
      is_active: true,
    },
    {
      key: 'site_favicon',
      value: '/favicon.ico',
      description: 'Path to the site favicon',
      is_active: true,
    },

    // Contact Information
    {
      key: 'contact_email',
      value: 'prithibee.official@gmail.com',
      description: 'Main contact email address',
      is_active: true,
    },
    {
      key: 'contact_phone',
      value: '+8801616-684803',
      description: 'Main contact phone number',
      is_active: true,
    },
    {
      key: 'contact_address',
      value: 'Dhaka, Bangladesh',
      description: 'Physical office address',
      is_active: true,
    },

    // Social Media Links
    {
      key: 'social_facebook',
      value: 'https://facebook.com/prithibeeofficial',
      description: 'Facebook page URL',
      is_active: true,
    },
    {
      key: 'social_instagram',
      value: 'https://instagram.com/prithibeeofficial',
      description: 'Instagram profile URL',
      is_active: true,
    },
    {
      key: 'social_whatsapp',
      value: 'https://wa.me/8801616684803',
      description: 'WhatsApp link',
      is_active: true,
    },

    // Coming Soon Settings
    {
      key: 'coming_soon_mode',
      value: 'true',
      description: 'Enable or disable coming soon mode',
      is_active: true,
    },
    {
      key: 'coming_soon_date',
      value: '2026-02-17T00:00:00',
      description: 'Target date for the countdown',
      is_active: true,
    },
    {
      key: 'coming_soon_title',
      value: 'Coming Soon',
      description: 'Title for the coming soon page',
      is_active: true,
    },
    {
      key: 'coming_soon_message',
      value: 'We are getting ready to launch something amazing. Stay tuned for the big reveal!',
      description: 'Message for the coming soon page',
      is_active: true,
    },

    // Delivery & Payment
    {
      key: 'delivery_charge_inside_dhaka',
      value: '60',
      description: 'Delivery charge inside Dhaka',
      is_active: true,
    },
    {
      key: 'delivery_charge_outside_dhaka',
      value: '120',
      description: 'Delivery charge outside Dhaka',
      is_active: true,
    },
    {
      key: 'free_delivery_threshold',
      value: '5000',
      description: 'Minimum order amount for free delivery',
      is_active: true,
    },
    {
      key: 'currency_symbol',
      value: '৳',
      description: 'Currency symbol',
      is_active: true,
    },
    {
      key: 'bkash_number',
      value: '01XXXXXXXXX',
      description: 'Personal bKash number for payments',
      is_active: true,
    },
    {
      key: 'nagad_number',
      value: '01XXXXXXXXX',
      description: 'Personal Nagad number for payments',
      is_active: true,
    },
  ]);
}
