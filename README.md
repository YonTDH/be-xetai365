# be-xetai365

Backend Node.js + Express cho dự án XeTai365.

## Chạy local

```bash
npm install
npm run dev
```

## API mẫu

- `GET /api/health`: kiểm tra server đang hoạt động
- `GET /api/users`: danh sách user mẫu (seed 1000 user)
- `GET /api/users/:id`: chi tiết 1 user
- `GET /api/settings`: cấu hình website mẫu
- `PUT /api/settings`: cập nhật cấu hình mẫu (in-memory)
- `GET /api/vehicles`: danh sách xe (hỗ trợ `page,limit,keyword,brand,status`)
- `GET /api/vehicles/:id`: chi tiết xe
- `POST /api/vehicles`: tạo tin xe mới
- `PUT /api/vehicles/:id`: cập nhật tin xe
- `DELETE /api/vehicles/:id`: xóa tin xe
