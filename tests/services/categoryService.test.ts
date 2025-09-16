import { createMockKnex } from '../helpers/mockKnex';
import * as categoryService from '../../src/services/categoryService';

describe('categoryService', () => {
  it('creates categories with nesting, enforces max depth', async () => {
    const { knex } = createMockKnex();
    const a: any = await categoryService.createCategory(knex, { name: 'A' });
    const b: any = await categoryService.createCategory(knex, { name: 'B', parent_id: a.id });
    const c: any = await categoryService.createCategory(knex, { name: 'C', parent_id: b.id });
    const d: any = await categoryService.createCategory(knex, { name: 'D', parent_id: c.id });
    await expect(categoryService.createCategory(knex, { name: 'E', parent_id: d.id })).rejects.toThrow('Max depth of 3 exceeded');
  });

  it('throws on non-existent parent and self-parent', async () => {
    const { knex } = createMockKnex();
    await expect(categoryService.createCategory(knex, { name: 'X', parent_id: crypto.randomUUID() })).rejects.toThrow('Parent category not found');
    const root: any = await categoryService.createCategory(knex, { name: 'Root' });
    await expect(categoryService.updateCategory(knex, root.id, { parent_id: root.id })).rejects.toThrow('Category cannot be its own parent');
  });

  it('soft-deletes, updates, gets counts and tree', async () => {
    const { knex } = createMockKnex();
    const cat: any = await categoryService.createCategory(knex, { name: 'Root' });
    // add child and grandchild
    const sub: any = await categoryService.createCategory(knex, { name: 'Sub', parent_id: cat.id });
    const leaf: any = await categoryService.createCategory(knex, { name: 'Leaf', parent_id: sub.id });
    // attach active products via products service shape -> simulated directly through mock
    await (knex as any)('products').insert({ name: 'P1', category_id: leaf.id, price: 10, is_active: true }).returning('*');
    await (knex as any)('products').insert({ name: 'P2', category_id: leaf.id, price: 20, is_active: false }).returning('*');

    const counts = await categoryService.getActiveCategoriesWithCounts(knex);
    const leafCount = counts.find((c: any) => c.id === leaf.id)!.productCount;
    expect(leafCount).toBe(1);

    const tree = await categoryService.getCategoryTreeWithProducts(knex);
    expect(tree[0].children[0].children[0].products.length).toBe(1);
    expect(tree[0].children[0].children[0].products.some((p: any) => p.name === 'P1')).toBe(true);

    const updated = await categoryService.updateCategory(knex, leaf.id, { name: 'Leaf2' });
    expect(updated.name).toBe('Leaf2');

    const deleted = await categoryService.deleteCategory(knex, leaf.id);
    expect(deleted.is_active).toBe(false);
  });

  it('updateCategory enforces max depth on parent change', async () => {
    const { knex } = createMockKnex();
    const a: any = await categoryService.createCategory(knex, { name: 'A' });
    const b: any = await categoryService.createCategory(knex, { name: 'B', parent_id: a.id });
    const c: any = await categoryService.createCategory(knex, { name: 'C', parent_id: b.id });
    const d: any = await categoryService.createCategory(knex, { name: 'D', parent_id: c.id });
    const x: any = await categoryService.createCategory(knex, { name: 'X' });
    await expect(categoryService.updateCategory(knex, x.id, { parent_id: d.id })).rejects.toThrow('Max depth of 3 exceeded');
  });
});
