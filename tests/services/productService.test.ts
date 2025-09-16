import { createMockKnex } from '../helpers/mockKnex';
import * as productService from '../../src/services/productService';
import * as categoryService from '../../src/services/categoryService';

describe('productService', () => {
  it('requires active category on create and update', async () => {
    const { knex } = createMockKnex();
    await expect(productService.createProduct(knex, { name: 'P', category_id: crypto.randomUUID() })).rejects.toThrow('Category not found or inactive');

    const cat: any = await categoryService.createCategory(knex, { name: 'C' });
    const prod = await productService.createProduct(knex, { name: 'P1', category_id: cat.id, price: 10 });
    await expect(productService.updateProduct(knex, prod.id, { category_id: crypto.randomUUID() })).rejects.toThrow('Category not found or inactive');
  });

  it('updates, deletes and lists active products by category', async () => {
    const { knex } = createMockKnex();
    const cat: any = await categoryService.createCategory(knex, { name: 'C' });
    const prod = await productService.createProduct(knex, { name: 'P1', category_id: cat.id, price: 10 });
    const updated = await productService.updateProduct(knex, prod.id, { price: 12 });
    expect(Number(updated.price)).toBe(12);
    const list1 = await productService.getActiveProductsByCategory(knex, cat.id);
    expect(list1.total).toBe(1);
    await productService.deleteProduct(knex, prod.id);
    const list2 = await productService.getActiveProductsByCategory(knex, cat.id);
    expect(list2.total).toBe(0);
  });
});

