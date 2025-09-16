import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import categories from './routes/categories.js';
import products from './routes/products.js';
import { serveOpenApi } from './docs/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/categories', categories);
  app.use('/api/products', products);

  const { spec } = serveOpenApi();
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

  app.use(errorHandler);
  return app;
}
