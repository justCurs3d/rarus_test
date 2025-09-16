import { Knex } from 'knex';

export async function ensureSeedData(knex: Knex): Promise<boolean> {
  const existing = await knex('categories').count<{ count: string }[]>({ count: '*' });
  const count = Number(existing[0]?.count ?? 0);
  if (count > 0) return false;

  return await knex.transaction(async (trx) => {
    const [electronics] = await trx('categories').insert({ name: 'Electronics' }).returning('*');
    const [clothing] = await trx('categories').insert({ name: 'Clothing' }).returning('*');
    const [home] = await trx('categories').insert({ name: 'Home & Kitchen' }).returning('*');

    // level 2 under Electronics
    const [phones] = await trx('categories').insert({ name: 'Phones', parent_id: electronics.id }).returning('*');
    const [laptops] = await trx('categories').insert({ name: 'Laptops', parent_id: electronics.id }).returning('*');
    const [tablets] = await trx('categories').insert({ name: 'Tablets', parent_id: electronics.id }).returning('*');

    // level 2 under Clothing
    const [men] = await trx('categories').insert({ name: 'Men', parent_id: clothing.id }).returning('*');
    const [women] = await trx('categories').insert({ name: 'Women', parent_id: clothing.id }).returning('*');

    // level 2 under Home & Kitchen
    const [appliances] = await trx('categories').insert({ name: 'Appliances', parent_id: home.id }).returning('*');
    const [furniture] = await trx('categories').insert({ name: 'Furniture', parent_id: home.id }).returning('*');

    // level 3 under Phones
    const [android] = await trx('categories').insert({ name: 'Android', parent_id: phones.id }).returning('*');
    const [ios] = await trx('categories').insert({ name: 'iOS', parent_id: phones.id }).returning('*');

    // level 3 under Laptops
    const [ultrabooks] = await trx('categories').insert({ name: 'Ultrabooks', parent_id: laptops.id }).returning('*');
    const [gaming] = await trx('categories').insert({ name: 'Gaming', parent_id: laptops.id }).returning('*');

    // level 3 under Men
    const [menShirts] = await trx('categories').insert({ name: 'Shirts', parent_id: men.id }).returning('*');
    const [menShoes] = await trx('categories').insert({ name: 'Shoes', parent_id: men.id }).returning('*');

    // level 3 under Women
    const [womenDresses] = await trx('categories').insert({ name: 'Dresses', parent_id: women.id }).returning('*');
    const [womenShoes] = await trx('categories').insert({ name: 'Shoes', parent_id: women.id }).returning('*');

    // level 3 under Home
    const [kitchenAppl] = await trx('categories').insert({ name: 'Kitchen', parent_id: appliances.id }).returning('*');
    const [cleaningAppl] = await trx('categories').insert({ name: 'Cleaning', parent_id: appliances.id }).returning('*');
    const [livingRoom] = await trx('categories').insert({ name: 'Living Room', parent_id: furniture.id }).returning('*');
    const [bedroom] = await trx('categories').insert({ name: 'Bedroom', parent_id: furniture.id }).returning('*');

    await trx('products').insert([
      // Phones
      { name: 'iPhone 13', category_id: ios.id, price: 899, is_active: true },
      { name: 'iPhone 14', category_id: ios.id, price: 999, is_active: true },
      { name: 'Pixel 7', category_id: android.id, price: 699, is_active: true },
      { name: 'Samsung Galaxy S23', category_id: android.id, price: 799, is_active: true },

      // Tablets
      { name: 'iPad Air', category_id: tablets.id, price: 599, is_active: true },
      { name: 'Galaxy Tab S9', category_id: tablets.id, price: 749, is_active: true },

      // Laptops
      { name: 'MacBook Air', category_id: ultrabooks.id, price: 1199, is_active: true },
      { name: 'Dell XPS 13', category_id: ultrabooks.id, price: 1299, is_active: true },
      { name: 'Lenovo Legion 5', category_id: gaming.id, price: 1399, is_active: true },
      { name: 'ASUS ROG Strix', category_id: gaming.id, price: 1599, is_active: true },

      // Men
      { name: 'Basic T-Shirt', category_id: menShirts.id, price: 19.99, is_active: true },
      { name: 'Oxford Shirt', category_id: menShirts.id, price: 39.99, is_active: true },
      { name: 'Running Sneakers', category_id: menShoes.id, price: 89.99, is_active: true },
      { name: 'Leather Boots', category_id: menShoes.id, price: 129.99, is_active: true },

      // Women
      { name: 'Summer Dress', category_id: womenDresses.id, price: 49.99, is_active: true },
      { name: 'Evening Gown', category_id: womenDresses.id, price: 149.99, is_active: true },
      { name: 'Heels', category_id: womenShoes.id, price: 79.99, is_active: true },
      { name: 'Flats', category_id: womenShoes.id, price: 59.99, is_active: true },

      // Home & Kitchen
      { name: 'Blender', category_id: kitchenAppl.id, price: 69.99, is_active: true },
      { name: 'Air Fryer', category_id: kitchenAppl.id, price: 99.99, is_active: true },
      { name: 'Vacuum Cleaner', category_id: cleaningAppl.id, price: 149.99, is_active: true },
      { name: 'Robot Vacuum', category_id: cleaningAppl.id, price: 299.99, is_active: true },
      { name: 'Sofa', category_id: livingRoom.id, price: 499.99, is_active: true },
      { name: 'Coffee Table', category_id: livingRoom.id, price: 129.99, is_active: true },
      { name: 'Bed Frame', category_id: bedroom.id, price: 399.99, is_active: true },
      { name: 'Nightstand', category_id: bedroom.id, price: 89.99, is_active: true },
    ]);

    return true;
  });
}
