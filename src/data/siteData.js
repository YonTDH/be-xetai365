const now = new Date().toISOString();

const productCategories = [
  {
    id: 1,
    slug: "xe-tai-thung",
    name: "Xe tải thùng",
    type: "product-list",
    description: "Dòng xe tải thùng kín, thùng bạt và thùng lửng.",
  },
  {
    id: 2,
    slug: "xe-dau-keo",
    name: "Xe đầu kéo",
    type: "product-list",
    description: "Xe đầu kéo vận tải đường dài và container.",
  },
  {
    id: 3,
    slug: "xe-chuyen-dung",
    name: "Xe chuyên dụng",
    type: "product-list",
    description: "Xe ben, xe bồn, xe gắn cẩu và các dòng xe chuyên dụng.",
  },
];

const products = [
  {
    id: 1,
    slug: "dongfeng-b180-thung-bat-2023",
    legacyPath: "/dongfeng-b180-thung-bat-2023.html",
    title: "Dongfeng B180 thùng bạt 2023",
    sku: "DF-B180-2023",
    brand: "Dongfeng",
    categorySlug: "xe-tai-thung",
    type: "truck",
    condition: "used",
    year: 2023,
    mileageKm: 32000,
    fuelType: "diesel",
    transmission: "manual",
    priceVnd: 890000000,
    status: "available",
    isFeatured: true,
    location: "Binh Duong",
    shortDescription: "Xe tải thùng bạt máy Cummins, phù hợp vận tải liên tỉnh.",
    content:
      "Dongfeng B180 đời 2023, thùng bạt dài 6m2, máy mạnh, nội thất còn đẹp và đã có hồ sơ sang tên nhanh.",
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
      "https://images.unsplash.com/photo-1493238792000-8113da705763",
    ],
    seo: {
      title: "Dongfeng B180 thùng bạt 2023 | XeTải365",
      description: "Thông tin chi tiết Dongfeng B180 thùng bạt 2023 tại XeTải365.",
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 2,
    slug: "hyundai-hd72-thung-kin-2022",
    legacyPath: "/hyundai-hd72-thung-kin-2022.html",
    title: "Hyundai HD72 thùng kín 2022",
    sku: "HD72-2022",
    brand: "Hyundai",
    categorySlug: "xe-tai-thung",
    type: "truck",
    condition: "used",
    year: 2022,
    mileageKm: 41000,
    fuelType: "diesel",
    transmission: "manual",
    priceVnd: 760000000,
    status: "available",
    isFeatured: false,
    location: "TP Ho Chi Minh",
    shortDescription: "Xe tải thùng kín phục vụ giao nhận nội thành và liên tỉnh.",
    content:
      "Hyundai HD72 đăng ký 2022, máy zin, thùng kín 5m1, phù hợp vận chuyển hàng gia dụng và thực phẩm khô.",
    images: [
      "https://images.unsplash.com/photo-1493238792000-8113da705763",
    ],
    seo: {
      title: "Hyundai HD72 thùng kín 2022 | XeTải365",
      description: "Giá bán và tình trạng Hyundai HD72 thùng kín 2022.",
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 3,
    slug: "isuzu-frr-90n-2024",
    legacyPath: "/isuzu-frr-90n-2024.html",
    title: "Isuzu FRR 90N 2024",
    sku: "ISUZU-FRR-90N-2024",
    brand: "Isuzu",
    categorySlug: "xe-tai-thung",
    type: "truck",
    condition: "new",
    year: 2024,
    mileageKm: 0,
    fuelType: "diesel",
    transmission: "manual",
    priceVnd: 1250000000,
    status: "available",
    isFeatured: true,
    location: "Dong Nai",
    shortDescription: "Dòng xe tải trung mới, tải trọng linh hoạt cho doanh nghiệp vận tải.",
    content:
      "Isuzu FRR 90N đời 2024, máy Euro 5, thiết kế cabin rộng, tiết kiệm nhiên liệu và phù hợp chạy đường dài.",
    images: [
      "https://images.unsplash.com/photo-1471478331149-c72f17e33c73",
    ],
    seo: {
      title: "Isuzu FRR 90N 2024 | XeTải365",
      description: "Thông tin sản phẩm Isuzu FRR 90N 2024 và giá dự kiến.",
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 4,
    slug: "howo-a7-dau-keo-2021",
    legacyPath: "/howo-a7-dau-keo-2021.html",
    title: "Howo A7 đầu kéo 2021",
    sku: "HOWO-A7-2021",
    brand: "Howo",
    categorySlug: "xe-dau-keo",
    type: "tractor-head",
    condition: "used",
    year: 2021,
    mileageKm: 98000,
    fuelType: "diesel",
    transmission: "manual",
    priceVnd: 1320000000,
    status: "sold",
    isFeatured: false,
    location: "Long An",
    shortDescription: "Xe đầu kéo đã qua sử dụng, phù hợp khai thác container.",
    content:
      "Howo A7 2021, cầu láp đẹp, nội thất nguyên bản, đã từng chạy tuyến Nam Bắc và bảo dưỡng định kỳ.",
    images: [
      "https://images.unsplash.com/photo-1551830820-330a71b99659",
    ],
    seo: {
      title: "Howo A7 đầu kéo 2021 | XeTải365",
      description: "Thông tin Howo A7 đầu kéo 2021 đã qua sử dụng.",
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 5,
    slug: "hino-fg8jjsb-xe-ben-2024",
    legacyPath: "/hino-fg8jjsb-xe-ben-2024.html",
    title: "Hino FG8JJSB xe ben 2024",
    sku: "HINO-FG8JJSB-2024",
    brand: "Hino",
    categorySlug: "xe-chuyen-dung",
    type: "dump-truck",
    condition: "new",
    year: 2024,
    mileageKm: 0,
    fuelType: "diesel",
    transmission: "manual",
    priceVnd: 1680000000,
    status: "available",
    isFeatured: true,
    location: "Binh Phuoc",
    shortDescription: "Xe ben 3 chân phục vụ công trình và khai thác vật liệu.",
    content:
      "Hino FG8JJSB 2024, thùng ben đóng cơ, khung gầm chắc chắn, phù hợp công trình và vận tải vật liệu xây dựng.",
    images: [
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c",
    ],
    seo: {
      title: "Hino FG8JJSB xe ben 2024 | XeTải365",
      description: "Xe ben Hino FG8JJSB 2024, thông số và giá bán tham khảo.",
    },
    createdAt: now,
    updatedAt: now,
  },
];

const newsCategories = [
  {
    id: 1,
    slug: "tin-thi-truong",
    name: "Tin thị trường",
  },
  {
    id: 2,
    slug: "kinh-nghiem-mua-xe",
    name: "Kinh nghiệm mua xe",
  },
];

const newsArticles = [
  {
    id: 1,
    slug: "thi-truong-xe-tai-quy-2-2026",
    legacyPath: "/thi-truong-xe-tai-quy-2-2026.html",
    categorySlug: "tin-thi-truong",
    title: "Thị trường xe tải quý 2/2026",
    excerpt: "Nhu cầu xe tải trung và nặng tăng ở nhóm logistics và vật liệu xây dựng.",
    content:
      "Báo cáo nội bộ cho thấy nhóm xe tải 8 tấn và đầu kéo đang được quan tâm mạnh nhất trong quý 2/2026.",
    publishedAt: now,
    seo: {
      title: "Thị trường xe tải quý 2/2026 | XeTải365",
      description: "Cập nhật thị trường xe tải và nhu cầu vận tải quý 2/2026.",
    },
  },
  {
    id: 2,
    slug: "kinh-nghiem-chon-xe-tai-cu",
    legacyPath: "/kinh-nghiem-chon-xe-tai-cu.html",
    categorySlug: "kinh-nghiem-mua-xe",
    title: "Kinh nghiệm chọn xe tải cũ",
    excerpt: "5 điểm cần kiểm tra trước khi mua xe tải đã qua sử dụng.",
    content:
      "Cần kiểm tra khung gầm, động cơ, lịch sử bảo dưỡng, giấy tờ và tính phù hợp của xe với loại hàng vận chuyển.",
    publishedAt: now,
    seo: {
      title: "Kinh nghiệm chọn xe tải cũ | XeTải365",
      description: "Hướng dẫn kiểm tra xe tải cũ trước khi xuống tiền.",
    },
  },
];

const pages = [
  {
    slug: "gioi-thieu",
    title: "Giới thiệu XeTải365",
    content:
      "XeTải365 cung cấp xe tải, xe đầu kéo, xe chuyên dụng và dịch vụ tư vấn giải pháp vận tải cho doanh nghiệp.",
    seo: {
      title: "Giới thiệu | XeTải365",
      description: "Thông tin giới thiệu về XeTải365.",
    },
  },
  {
    slug: "lien-he",
    title: "Liên hệ",
    content:
      "Liên hệ XeTải365 qua hotline 0899.966.254 hoặc đến showroom tại Bình Dương để được tư vấn.",
    seo: {
      title: "Liên hệ | XeTải365",
      description: "Thông tin liên hệ XeTải365.",
    },
  },
];

const legacyRoutes = [
  {
    path: "/",
    type: "home",
    target: "/",
    resourceType: "page",
  },
  {
    path: "/gioi-thieu.html",
    type: "page",
    target: "/gioi-thieu",
    resourceType: "page",
    resourceSlug: "gioi-thieu",
  },
  {
    path: "/lien-he.html",
    type: "page",
    target: "/lien-he",
    resourceType: "page",
    resourceSlug: "lien-he",
  },
  ...products.map((product) => ({
    path: product.legacyPath,
    type: "product-detail",
    target: `/san-pham/${product.slug}`,
    resourceType: "product",
    resourceSlug: product.slug,
  })),
  ...newsArticles.map((article) => ({
    path: article.legacyPath,
    type: "news-detail",
    target: `/tin-tuc/${article.slug}`,
    resourceType: "news",
    resourceSlug: article.slug,
  })),
];

module.exports = {
  productCategories,
  products,
  newsCategories,
  newsArticles,
  pages,
  legacyRoutes,
};
