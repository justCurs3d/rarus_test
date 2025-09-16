import request from 'supertest';
import { createApp } from '../../src/app';

// Reuse the same mocked knex as other route tests
jest.mock('../../src/db/knex', () => {
  const { createMockKnex } = require('../helpers/mockKnex');
  const instance = createMockKnex();
  return { getKnex: () => instance.knex };
});

const app = createApp();

describe('routes validation and error paths', () => {
  it('GET /api/categories/tree succeeds', async () => {
    const r = await request(app).get('/api/categories/tree');
    expect(r.status).toBe(200);
    expect(Array.isArray(r.body)).toBe(true);
  });

  it('POST /api/categories with invalid parent_id returns 400 (zod error)', async () => {
    const r = await request(app).post('/api/categories').send({ name: 'X', parent_id: 'not-a-uuid' });
    expect(r.status).toBe(400);
  });

  it('PUT /api/categories/:id with invalid id returns 400', async () => {
    const r = await request(app).put('/api/categories/not-a-uuid').send({ name: 'Y' });
    expect(r.status).toBe(400);
  });

  it('DELETE /api/categories/:id with invalid id returns 400', async () => {
    const r = await request(app).delete('/api/categories/not-a-uuid');
    expect(r.status).toBe(400);
  });

  it('POST /api/products with invalid category_id returns 400', async () => {
    const r = await request(app).post('/api/products').send({ name: 'P', category_id: 'bad', price: 1 });
    expect(r.status).toBe(400);
  });

  it('PUT /api/products/:id with invalid id returns 400', async () => {
    const r = await request(app).put('/api/products/not-a-uuid').send({ price: 2 });
    expect(r.status).toBe(400);
  });

  it('DELETE /api/products/:id with invalid id returns 400', async () => {
    const r = await request(app).delete('/api/products/not-a-uuid');
    expect(r.status).toBe(400);
  });

  it('GET /api/products/by-category/:id with invalid id returns 400', async () => {
    const r = await request(app).get('/api/products/by-category/not-a-uuid');
    expect(r.status).toBe(400);
  });
});
