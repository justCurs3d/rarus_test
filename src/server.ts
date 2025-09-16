

import { createApp } from './app.js';
import { env } from './config/env.js';
import { getKnex } from './db/knex.js';
import { ensureSeedData } from './bootstrap/seed.js';

const app = createApp();

const port = env.port;
app.listen(port, async () => {
  // touch knex to initialize and validate connection on start
  try {
    await getKnex().raw('select 1+1 as result');
    const seeded = await ensureSeedData(getKnex());
    if (seeded) console.log('Seeded demo data into empty database');
    console.log(`Server listening on http://localhost:${port}`);
    console.log(`Swagger UI: http://localhost:${port}/docs`);
  } catch (err) {
    console.error('Database connection error', err);
  }
});
