# be-xetai365

Backend Node.js + Express cho du an XeTai365.

Trang thai hien tai: migration skeleton tu PHP legacy sang API Node.js.
Du lieu static (catalog/content/legacy routes) dang doc tu `src/data/siteData.js`.
Du lieu stateful (`users`, `settings`, `cart`, `orders`) da chay tren PostgreSQL.

## Yeu cau

- Node.js 18+
- npm 9+

## Chay local

```bash
npm install
npm run dev
```

Mac dinh server chay tai `http://localhost:3000`.

## Bien moi truong

Tao file `.env` tu `.env.example`:

```env
PORT=3000
CLIENT_URL=http://localhost:5173
API_PREFIX=/api
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=xetai365
POSTGRES_SSL=false
```

## Migration PostgreSQL

Chay migration schema:

```bash
npm run migrate
```

Migration SQL nam trong thu muc `migrations/`.

Khi khoi dong app (`npm run dev` / `npm start`), backend se:
- ket noi PostgreSQL;
- kiem tra va apply migration chua chay;
- bo qua migration da ton tai;
- seed du lieu mac dinh cho `settings` va `users` neu bang rong.

## Cau truc chinh

- `src/app.js`: khoi tao express app va dang ky route.
- `src/server.js`: boot server.
- `src/data/siteData.js`: seed du lieu public (product/news/page/legacy route).
- `src/models/*`: xu ly du lieu theo module.
- `src/controllers/*`: xu ly request/response.
- `src/routes/*`: khai bao endpoint.

## API hien co

### He thong

- `GET /api/health`: health check.
- `GET /`: ping root message.

### Cau hinh

- `GET /api/settings`: lay setting website.
- `PUT /api/settings`: cap nhat setting (in-memory).

### Catalog / Public content

- `GET /api/catalog/categories`
- `GET /api/catalog/products`
  - query ho tro: `page, limit, keyword, brand, status, category, condition, featured`
- `GET /api/catalog/products/:idOrSlug`
- `GET /api/content/home`
- `GET /api/content/news/categories`
- `GET /api/content/news`
- `GET /api/content/news/:idOrSlug`
- `GET /api/content/pages/:slug`
- `GET /api/search?q=...`

### Gio hang / Don hang (demo in-memory)

- `POST /api/cart/items`
- `GET /api/cart/:cartId`
- `PATCH /api/cart/:cartId/items/:productId`
- `DELETE /api/cart/:cartId/items/:productId`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`

### Mapping URL legacy

- `GET /api/legacy-routes`
- `GET /api/legacy-routes/resolve?path=/gioi-thieu.html`

### Legacy compatibility

- `GET /api/users`
- `GET /api/users/:id`
- `GET /api/vehicles`
- `GET /api/vehicles/:id`
- `POST /api/vehicles` -> `501 Not Implemented`
- `PUT /api/vehicles/:id` -> `501 Not Implemented`
- `DELETE /api/vehicles/:id` -> `501 Not Implemented`

## Vi du nhanh

### Them vao gio hang

```bash
curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'
```

### Tao don hang

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "cartId":"<cart-id>",
    "customer":{
      "fullName":"Nguyen Van A",
      "phone":"0900000000",
      "address":"Binh Duong",
      "email":"a@example.com"
    },
    "note":"Giao gio hanh chinh"
  }'
```

## Ghi chu migration

- Skeleton nay uu tien luong public, search, cart, order va mapping route SEO legacy.
- Chua co auth/RBAC, validation schema day du, upload/media service, email queue.
- Buoc tiep theo: gan ORM + MySQL schema moi, bo sung auth va migration data tu legacy.
