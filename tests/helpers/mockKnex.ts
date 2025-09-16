import type { Knex } from 'knex';

type Row = Record<string, any>;

export function createMockKnex() {
  const store = {
    categories: new Map<string, Row>(),
    products: new Map<string, Row>(),
  };

  const api: any = (table: 'categories' | 'products') => {
    return {
      table,
      _where: {} as Row,
      select(this: any) { return this; },
      where(this: any, w: Row) { this._where = w; return this; },
      // Make the builder awaitable to return a list of matching rows
      then(this: any, resolve: (val: any[]) => any, _reject?: (err: any) => any) {
        const list = this.table === 'categories'
          ? [...store.categories.values()].filter((r) => matchWhere(r, this._where))
          : [...store.products.values()].filter((r) => matchWhere(r, this._where));
        return resolve(list);
      },
      first(this: any) {
        if (this.table === 'categories') {
          const row = [...store.categories.values()].find((r) => matchWhere(r, this._where));
          return Promise.resolve(row || undefined);
        }
        if (this.table === 'products') {
          const row = [...store.products.values()].find((r) => matchWhere(r, this._where));
          return Promise.resolve(row || undefined);
        }
        return Promise.resolve(undefined);
      },
      insert(this: any, data: Row | Row[]) {
        const insertOne = (d: Row) => {
          const id = crypto.randomUUID();
          const row = { id, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...d };
          if (this.table === 'categories') store.categories.set(id, row);
          else store.products.set(id, row);
          return row;
        };
        const rows = Array.isArray(data) ? data.map(insertOne) : [insertOne(data)];
        return { returning: (_: any) => Promise.resolve(rows) };
      },
      update(this: any, data: Row) {
        const id = (this._where as any).id;
        const map = this.table === 'categories' ? store.categories : store.products;
        const row = id ? map.get(id) : undefined;
        if (!row) return { returning: () => Promise.resolve([undefined]) };
        const updated = { ...row, ...data };
        map.set(id, updated);
        return { returning: () => Promise.resolve([updated]) };
      },
      count(this: any, _sel?: any) {
        // support pattern used in services: select('category_id').count({count:'*'}).where(...).groupBy('category_id')
        const self = this;
        return {
          where(w: Row) {
            self._where = w; return this;
          },
          groupBy(_col: string) {
            const list = [...store.products.values()].filter((r) => matchWhere(r, self._where));
            const map = new Map<string, number>();
            for (const r of list) map.set(r.category_id, (map.get(r.category_id) || 0) + 1);
            return Promise.resolve([...map.entries()].map(([category_id, count]) => ({ category_id, count: String(count) })));
          },
        } as any;
      },
      groupBy() { return Promise.resolve([]); },
      fn: { now: () => new Date().toISOString() },
    };
  };
  api.raw = () => Promise.resolve();
  api.fn = { now: () => new Date().toISOString() };
  return { knex: api as unknown as Knex, store };
}

function matchWhere(row: Row, where: Row) {
  return Object.entries(where || {}).every(([k, v]) => row[k] === v);
}
