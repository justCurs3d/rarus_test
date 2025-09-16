import request from 'supertest';
import { createApp } from '../../src/app';

jest.mock('../../src/db/knex', () => {
  const { createMockKnex } = require('../helpers/mockKnex');
  const instance = createMockKnex();
  return { getKnex: () => instance.knex };
});

const app = createApp();

describe('routes', () => {
  it('POST /api/categories creates category and counts include product', async () => {
    const c = await request(app).post('/api/categories').send({ name: 'Root' });
    expect(c.status).toBe(201);
    const catId = c.body.id;
    const p = await request(app).post('/api/products').send({ name: 'P', category_id: catId, price: 5 });
    expect(p.status).toBe(201);
    const list = await request(app).get('/api/categories');
    expect(list.status).toBe(200);
    const root = list.body.find((x: any) => x.id === catId);
    expect(root.productCount).toBe(1);
  });

  it('GET /api/products/by-category/:id returns list with total', async () => {
    const c = await request(app).post('/api/categories').send({ name: 'C1' });
    const catId = c.body.id;
    await request(app).post('/api/products').send({ name: 'P1', category_id: catId, price: 10 });
    await request(app).post('/api/products').send({ name: 'P2', category_id: catId, price: 20 });
    const r = await request(app).get(`/api/products/by-category/${catId}`);
    expect(r.status).toBe(200);
    expect(r.body.total).toBe(2);
  });
});

