# be-xetai365

Backend Node.js + Express cho du an XeTai365.

Trang thai hien tai: migration skeleton tu PHP legacy sang API Node.js.
Du lieu static (catalog/content/legacy routes) dang doc tu `src/data/siteData.js`.
Du lieu stateful (`settings`, `vehicles`, `vehicle_categories`, `contact_requests`, `legacy_routes`) da chay tren PostgreSQL.
Model `xe` va `loai xe` da migrate qua PostgreSQL (`vehicles`, `vehicle_categories`).

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
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_FULL_NAME=System Admin
JWT_SECRET=change-this-jwt-secret
JWT_EXPIRES_IN=8h
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
- seed du lieu mac dinh cho `settings`, `vehicle_categories`, `vehicles` neu bang rong.

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
- `POST /api/admin/auth/login`: dang nhap admin, tra JWT token.
- `GET /api/admin/auth/me`: thong tin admin dang nhap (can Bearer token).

### Cau hinh

- `GET /api/settings`: lay setting website.
- `PUT /api/settings`: cap nhat setting (can Bearer token admin).

### Xe / Noi dung cong khai

- `GET /api/catalog/categories`
- `GET /api/catalog/products`
  - query ho tro: `page, limit, keyword, brand, status, category, condition, featured`
- `GET /api/catalog/products/:idOrSlug`
- `GET /api/vehicles`
- `GET /api/vehicles/:id`
- `POST /api/vehicles` -> `501 Not Implemented`
- `PUT /api/vehicles/:id` -> `501 Not Implemented`
- `DELETE /api/vehicles/:id` -> `501 Not Implemented`
- `GET /api/content/home`
- `GET /api/content/news/categories`
- `GET /api/content/news`
- `GET /api/content/news/:idOrSlug`
- `GET /api/content/pages/:slug`
- `GET /api/search?q=...`

### Form lien he

- `POST /api/contact-requests`
- `GET /api/contact-requests` (can Bearer token admin)
- `PATCH /api/contact-requests/:id/status` (can Bearer token admin)

### Mapping URL legacy

- `GET /api/legacy-routes`
- `GET /api/legacy-routes/resolve?path=/gioi-thieu.html`

## Vi du nhanh

### Gui form lien he

```bash
curl -X POST http://localhost:3000/api/contact-requests \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Nguyen Van A","phone":"0900000000","email":"a@example.com","content":"Can tu van xe tai","vehicleId":1}'
```

## Ghi chu migration

- Skeleton nay uu tien luong public, lead form lien he va mapping route SEO legacy.
- Chua co auth/RBAC, validation schema day du, upload/media service, email queue.
- Buoc tiep theo: gan ORM + MySQL schema moi, bo sung auth va migration data tu legacy.
