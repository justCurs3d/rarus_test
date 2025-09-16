import { Router } from 'express';
import { z } from 'zod';
import { createCategory, deleteCategory, getActiveCategoriesWithCounts, getCategoryTreeWithProducts, updateCategory } from '../services/categoryService.js';
import { getKnex } from '../db/knex.js';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1),
  parent_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().optional(),
});

router.post('/', async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const row = await createCategory(getKnex(), data);
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  parent_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().optional(),
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const data = updateSchema.parse(req.body);
    const row = await updateCategory(getKnex(), id, data);
    res.json(row);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const row = await deleteCategory(getKnex(), id);
    res.json(row);
  } catch (e) {
    next(e);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    const rows = await getActiveCategoriesWithCounts(getKnex());
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.get('/tree', async (_req, res, next) => {
  try {
    const rows = await getCategoryTreeWithProducts(getKnex());
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

export default router;
