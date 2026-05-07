# BE XeTai365

Demo API: https://be-xetai365.onrender.com/

Backend Node.js + Express cho hệ thống XeTai365. Dịch vụ này cung cấp public API cho frontend, admin API cho CMS, migration PostgreSQL, seed dữ liệu ban đầu và signed upload flow cho media.

## Mục tiêu dự án

- Cung cấp REST API cho public website và admin CMS.
- Tách dữ liệu động khỏi frontend để có thể quản lý nội dung từ admin.
- Hỗ trợ migration từ hệ thống legacy sang stack Node.js + PostgreSQL.
- Giữ được SEO route mapping cũ trong quá trình chuyển đổi.

## Phạm vi chức năng

### Public API

- Health check và root ping.
- Lấy dữ liệu trang chủ, danh mục, sản phẩm, chi tiết sản phẩm.
- Lấy dữ liệu settings, pages, news, bulletins.
- Search theo từ khóa.
- Nhận form contact request từ website.
- Resolve legacy routes để mapping URL cũ sang route mới.

### Admin API

- Đăng nhập admin bằng JWT.
- CRUD bulletins cho news, promotion, recruitment, services.
- CRUD sản phẩm.
- CRUD danh mục xe cấp 1, cấp 2.
- Cập nhật site settings.
- Xem và cập nhật trạng thái contact requests.
- Tạo Cloudinary signed upload signature.
- Import `.docx` và convert thành HTML cho bulletin/sản phẩm.

## Tech stack

- Node.js
- Express 5
- PostgreSQL (`pg`)
- JWT (`jsonwebtoken`)
- bcryptjs
- Multer
- Mammoth
- Cloudinary signed upload flow

## Cấu trúc thư mục

```text
src/
  app.js                  express app và route registration
  server.js               bootstrap server
  config/db.js            pool PostgreSQL, migration, seed
  controllers/            xử lý request/response
  middlewares/            auth middleware
  models/                 truy vấn database theo module
  routes/                 public + admin routes
  utils/                  jwt, cloudinary, pagination, request helpers
  data/siteData.js        dữ liệu seed/legacy content
migrations/               SQL migrations
scripts/migrate.js        chạy migration thủ công
```

## Môi trường chạy

- Node.js `18+`
- npm `9+`
- PostgreSQL

File mẫu đã có sẵn: `.env.example`

Biến môi trường chính:

```env
PORT=3000
CLIENT_URL=http://localhost:5173
DATABASE_URL=
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=
POSTGRES_SSL=false
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_FULL_NAME=System Admin
JWT_SECRET=change-this-jwt-secret
JWT_EXPIRES_IN=8h
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=xetai365
CLOUDINARY_UPLOAD_PRESET=xetai365_admin
SELF_PING_ENABLED=false
SELF_PING_URL=
SELF_PING_INTERVAL_MS=840000
SELF_PING_TIMEOUT_MS=10000
```

`DATABASE_URL` được ưu tiên cao hơn `POSTGRES_*`.

## Chạy local

```bash
npm install
cp .env.example .env
npm run dev
```

Mặc định server chạy tại `http://localhost:3000`.

## Scripts

- `npm run dev`: chạy local với nodemon
- `npm start`: chạy production mode
- `npm run migrate`: apply SQL migrations

## Database và bootstrap

Khi app khởi động, backend sẽ:

- kết nối PostgreSQL
- tạo bảng `schema_migrations` nếu chưa có
- apply các migration chưa chạy trong `migrations/`
- seed dữ liệu mặc định cho settings, pages, bulletins, products, legacy routes, admin users nếu bảng đang rỗng

Điều này giúp repo chạy nhanh trong giai đoạn migration, nhưng đồng thời cần quản lý seed cẩn thận khi đưa lên môi trường thật.

## Keep-alive cho Render

Backend có hỗ trợ self-ping dạng opt-in để giữ service hoạt động lâu hơn trên Render free instance.

Thiết lập:

```env
SELF_PING_ENABLED=true
SELF_PING_URL=https://be-xetai365.onrender.com/api/health
SELF_PING_INTERVAL_MS=840000
SELF_PING_TIMEOUT_MS=10000
```

Ghi chú:

- Cơ chế này sẽ gọi định kỳ vào health endpoint qua public URL của chính service.
- Theo docs của Render, free web service bị spin down sau 15 phút không có inbound traffic, nên interval mặc định đang để `14` phút.
- Cách này làm service gần như chạy liên tục, có thể tiêu tốn toàn bộ free instance hours trong tháng.
- Nếu dùng paid instance thì không cần bật self-ping.

## API modules

### System

- `GET /`
- `GET /api/health`

### Public content

- `GET /api/content/home`
- `GET /api/content/news`
- `GET /api/content/news/:idOrSlug`
- `GET /api/content/bulletins`
- `GET /api/content/bulletins/:idOrSlug`
- `GET /api/content/pages/:slug`
- `GET /api/settings`
- `GET /api/search?q=...`

### Catalog

- `GET /api/catalog/categories`
- `GET /api/catalog/categories/tree`
- `GET /api/catalog/products`
- `GET /api/catalog/products/:idOrSlug`
- `GET /api/vehicles`
- `GET /api/vehicles/:id`

### Contact requests

- `POST /api/contact-requests`
- `GET /api/contact-requests`
- `PATCH /api/contact-requests/:id/status`
- `PATCH /api/contact-requests/:id/viewed`
- `PATCH /api/contact-requests/mark-viewed`
- `GET /api/contact-requests/summary`

### Admin

- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`
- `GET|POST|PUT|DELETE /api/admin/bulletins`
- `POST /api/admin/bulletins/import-docx`
- `GET|POST|PUT|DELETE /api/admin/products`
- `GET /api/admin/vehicle-categories/tree`
- `POST|PUT|DELETE /api/admin/vehicle-categories/level-1`
- `POST|PUT|DELETE /api/admin/vehicle-categories/level-2`
- `POST /api/admin/uploads/signature`
- `PUT /api/settings`
