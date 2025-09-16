import { Knex } from 'knex';
import { badRequest, notFound } from '../utils/errors.js';


export interface CreateProductInput {
  name: string;
  category_id: string;
  price?: number;
  is_active?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  category_id?: string;
  price?: number;
  is_active?: boolean;
}

export async function createProduct(knex: Knex, input: CreateProductInput) {
  const category = await knex('categories').select('id', 'is_active').where({ id: input.category_id }).first();
  if (!category || !category.is_active) throw badRequest('Category not found or inactive');
  const [row] = await knex('products')
    .insert({ name: input.name, category_id: input.category_id, price: input.price ?? 0, is_active: input.is_active ?? true })
    .returning('*');
  return row;
}

export async function updateProduct(knex: Knex, id: string, input: UpdateProductInput) {
  if (input.category_id) {
    const category = await knex('categories').select('id', 'is_active').where({ id: input.category_id }).first();
    if (!category || !category.is_active) throw badRequest('Category not found or inactive');
  }
  const [row] = await knex('products').where({ id }).update({ ...input, updated_at: knex.fn.now() }).returning('*');
  if (!row) throw notFound('Product not found');
  return row;
}

export async function deleteProduct(knex: Knex, id: string) {
  const [row] = await knex('products').where({ id }).update({ is_active: false, updated_at: knex.fn.now() }).returning('*');
  if (!row) throw notFound('Product not found');
  return row;
}

export async function getActiveProductsByCategory(knex: Knex, categoryId: string) {
  const list = await knex('products').select('*').where({ category_id: categoryId, is_active: true });
  return { items: list, total: list.length };
}
