# Rarus Test API

Express + TypeScript (ESM) + Knex + PostgreSQL. Категории (до 3 уровней вложенности) и товары. REST JSON + Swagger.

**Требования**
- Node.js 18+
- Docker (для PostgreSQL и/или полного запуска)

**Быстрый старт (Docker Compose)**
- Запуск Postgres и API: `docker compose up --build`
- Swagger: `http://localhost:3000/docs`
- Миграции применяются автоматически; демо‑данные загружаются при первом запуске пустой БД.

**Локальная разработка (PostgreSQL в Docker)**
- Скопируйте `.env.example` → `.env`
- Установите зависимости: `npm install`
- Поднимите БД: `docker compose up -d postgres`
- Примените миграции: `npm run migrate`
- Запустите dev: `npm run dev`
- Swagger: `http://localhost:3000/docs`

**Скрипты**
- `npm run dev` — dev‑запуск (ESM через `tsx watch`)
- `npm run build` — компиляция в `dist`
- `npm start` — запуск собранного кода
- `npm run migrate` — `knex migrate:latest` (использует `knexfile.cjs`)
- `npm test` — юнит‑тесты с покрытием

**Демо‑данные при старте**
- Если таблица `categories` пуста, при старте сервера автоматически создаются примерные категории и товары (см. `src/bootstrap/seed.ts`).
- Повторные запуски не дублируют данные.

**Эндпоинты**
- `GET /health` — проверка состояния
- `GET /api/categories` — активные категории с количеством товаров
- `POST /api/categories` — создать категорию
- `PUT /api/categories/:id` — обновить категорию
- `DELETE /api/categories/:id` — мягкое удаление категории (`is_active=false`)
- `GET /api/categories/tree` — дерево категорий с товарами
- `POST /api/products` — создать товар
- `PUT /api/products/:id` — обновить товар
- `DELETE /api/products/:id` — мягкое удаление товара
- `GET /api/products/by-category/:categoryId` — активные товары по категории

**Тесты**
- `npm test` — Jest (ts‑jest ESM), unit и route тесты

