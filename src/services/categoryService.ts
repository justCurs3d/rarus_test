import { Knex } from 'knex';
import { badRequest, notFound } from '../utils/errors.js';

export interface CreateCategoryInput {
  name: string;
  parent_id?: string | null;
  is_active?: boolean;
}

export interface UpdateCategoryInput {
  name?: string;
  parent_id?: string | null;
  is_active?: boolean;
}

async function getDepth(knex: Knex, parentId: string | null): Promise<number> {
  let depth = 0;
  let current = parentId;
  const seen = new Set<string>();
  while (current) {
    if (seen.has(current)) throw badRequest('Category parent cycle detected');
    seen.add(current);
    const row = await knex('categories').select('parent_id').where({ id: current }).first();
    if (!row) throw badRequest('Parent category not found');
    current = row.parent_id;
    depth += 1;
  }
  return depth;
}

export async function createCategory(knex: Knex, input: CreateCategoryInput) {
  const parentId = input.parent_id ?? null;
  if (parentId) {
    const depth = await getDepth(knex, parentId);
    if (depth >= 4) throw badRequest('Max depth of 3 exceeded');
  }
  const [row] = await knex('categories')
    .insert({ name: input.name, parent_id: parentId, is_active: input.is_active ?? true })
    .returning('*');
  return row;
}

export async function updateCategory(knex: Knex, id: string, input: UpdateCategoryInput) {
  if (input.parent_id !== undefined) {
    const parentId = input.parent_id;
    if (parentId === id) throw badRequest('Category cannot be its own parent');
    if (parentId) {
      const depth = await getDepth(knex, parentId);
      if (depth >= 4) throw badRequest('Max depth of 3 exceeded');
    }
  }
  const [row] = await knex('categories').where({ id }).update({ ...input, updated_at: knex.fn.now() }).returning('*');
  if (!row) throw notFound('Category not found');
  return row;
}

export async function deleteCategory(knex: Knex, id: string) {
  const [row] = await knex('categories').where({ id }).update({ is_active: false, updated_at: knex.fn.now() }).returning('*');
  if (!row) throw notFound('Category not found');
  return row;
}

export async function getActiveCategoriesWithCounts(knex: Knex) {
  const categories = await knex('categories').select('*').where({ is_active: true });
  const counts = await knex('products')
    .select('category_id')
    .count<{ category_id: string; count: string }[]>({ count: '*' })
    .where({ is_active: true })
    .groupBy('category_id');
  const countMap = new Map<string, number>(counts.map((c) => [c.category_id, Number(c.count)]));
  return categories.map((c) => ({ ...c, productCount: countMap.get(c.id) ?? 0 }));
}

export async function getCategoryTreeWithProducts(knex: Knex) {
  const categories = await knex('categories').select('*').where({ is_active: true });
  const products = await knex('products').select('*').where({ is_active: true });
  const byParent = new Map<string | null, any[]>();
  for (const c of categories) {
    const key = c.parent_id as string | null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push({ ...c, products: [] as any[], children: [] as any[] });
  }
  const byId = new Map<string, any>();
  for (const list of byParent.values()) for (const c of list) byId.set(c.id, c);
  for (const p of products) {
    const node = byId.get(p.category_id);
    if (node) node.products.push(p);
  }
  const attachChildren = (node: any) => {
    const children = byParent.get(node.id) || [];
    node.children = children;
    for (const ch of children) attachChildren(ch);
  };
  const roots = byParent.get(null) || [];
  for (const r of roots) attachChildren(r);
  return roots;
}
