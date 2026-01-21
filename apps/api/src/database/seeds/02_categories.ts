import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('categories').del();
  await knex('products').del();

  const categoriesData = [
    { name: 'Diapers & Wipes', seed: 'diapers' },
    { name: 'Skincare', seed: 'skincare' },
    { name: 'Feeding', seed: 'feeding' },
    { name: 'Clothing', seed: 'clothing' },
    { name: 'Toys', seed: 'toys' },
    { name: 'Gear', seed: 'gear' },
    { name: 'Nursery', seed: 'nursery' },
    { name: 'Health', seed: 'health' },
    { name: 'Maternity', seed: 'maternity' },
    { name: 'Gifts', seed: 'gifts' },
  ];

  const categoryIds: string[] = [];

  for (const cat of categoriesData) {
    const [inserted] = await knex('categories').insert({ 
        name: cat.name, 
        image: `https://picsum.photos/seed/${cat.seed}/800/800` 
    }).returning('id');
    categoryIds.push(inserted.id);
  }

  // Generate 100 products
  const products: any[] = []; // Explicitly type as any[] to avoid 'never' inference
  const adjectives = ['Premium', 'Organic', 'Soft', 'Gentle', 'Eco-Friendly', 'Cozy', 'Durable', 'Safe', 'Natural', 'Luxury'];
  const nouns = ['Diapers', 'Lotion', 'Bottle', 'Onesie', 'Toy', 'Stroller', 'Crib', 'Thermometer', 'Cream', 'Blanket'];

  for (let i = 0; i < 100; i++) {
    const categoryId = categoryIds[Math.floor(Math.random() * categoryIds.length)];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    products.push({
      name: `${adj} ${noun} ${i + 1}`,
      description: `This is a high-quality ${adj.toLowerCase()} ${noun.toLowerCase()} perfect for your baby. Made with care and safety in mind.`,
      price: Math.floor(Math.random() * 5000) + 500, // Random price between 500 and 5500
      category_id: categoryId,
      stock: Math.floor(Math.random() * 100),
      images: JSON.stringify([
          `https://picsum.photos/seed/prod${i}/800/800`,
          `https://picsum.photos/seed/prod${i}detail/800/800`
      ]),
    });
  }

  // Insert in batches to avoid query size limits
  const chunkSize = 50;
  for (let i = 0; i < products.length; i += chunkSize) {
    await knex('products').insert(products.slice(i, i + chunkSize));
  }
}
