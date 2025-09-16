import knex, { Knex } from 'knex';
import { env } from '../config/env.js';

let _knex: Knex | null = null;

export function getKnex(): Knex {
  if (_knex) return _knex;
  _knex = knex({
    client: 'pg',
    connection: {
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
    },
    pool: { min: 0, max: 10 },
    migrations: { tableName: 'knex_migrations' },
  });
  return _knex;
}

export async function destroyKnex() {
  if (_knex) {
    await _knex.destroy();
    _knex = null;
  }
}
