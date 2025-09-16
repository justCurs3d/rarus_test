import { Router } from 'express';
import { z } from 'zod';
import { createProduct, deleteProduct, getActiveProductsByCategory, updateProduct } from '../services/productService.js';
import { getKnex } from '../db/knex.js';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1),
  category_id: z.string().uuid(),
  price: z.number().nonnegative().optional(),
  is_active: z.boolean().optional(),
});

router.post('/', async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const row = await createProduct(getKnex(), data);
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  category_id: z.string().uuid().optional(),
  price: z.number().nonnegative().optional(),
  is_active: z.boolean().optional(),
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const data = updateSchema.parse(req.body);
    const row = await updateProduct(getKnex(), id, data);
    res.json(row);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const row = await deleteProduct(getKnex(), id);
    res.json(row);
  } catch (e) {
    next(e);
  }
});

router.get('/by-category/:categoryId', async (req, res, next) => {
  try {
    const categoryId = z.string().uuid().parse(req.params.categoryId);
    const list = await getActiveProductsByCategory(getKnex(), categoryId);
    res.json(list);
  } catch (e) {
    next(e);
  }
});

export default router;
