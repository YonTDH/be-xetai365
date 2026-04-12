const now = new Date().toISOString();

const productCategories = [
  {
    id: 1,
    slug: "xe-tai-thung",
    name: "Xe tai thung",
    type: "product-list",
    description: "Dong xe tai thung kin, thung bat va thung lung.",
  },
  {
    id: 2,
    slug: "xe-dau-keo",
    name: "Xe dau keo",
    type: "product-list",
    description: "Xe dau keo van tai duong dai va container.",
  },
  {
    id: 3,
    slug: "xe-chuyen-dung",
    name: "Xe chuyen dung",
    type: "product-list",
    description: "Xe ben, xe bon, xe gan cau va cac dong xe chuyen dung.",
  },
];

const products = [
  {
    id: 1,
    slug: "dongfeng-b180-thung-bat-2023",
    legacyPath: "/dongfeng-b180-thung-bat-2023.html",
    title: "Dongfeng B180 thung bat 2023",
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
    shortDescription: "Xe tai thung bat may Cummins, phu hop van tai lien tinh.",
    content:
      "Dongfeng B180 doi 2023, thung bat dai 6m2, may manh, noi that con dep va da co ho so sang ten nhanh.",
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
      "https://images.unsplash.com/photo-1493238792000-8113da705763",
    ],
    seo: {
      title: "Dongfeng B180 thung bat 2023 | XeTai365",
      description: "Thong tin chi tiet Dongfeng B180 thung bat 2023 tai XeTai365.",
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 2,
    slug: "hyundai-hd72-thung-kin-2022",
    legacyPath: "/hyundai-hd72-thung-kin-2022.html",
    title: "Hyundai HD72 thung kin 2022",
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
    shortDescription: "Xe tai thung kin phuc vu giao nhan noi thanh va lien tinh.",
    content:
      "Hyundai HD72 dang ki 2022, may zin, thung kin 5m1, phu hop van chuyen hang gia dung va thuc pham kho.",
    images: [
      "https://images.unsplash.com/photo-1493238792000-8113da705763",
    ],
    seo: {
      title: "Hyundai HD72 thung kin 2022 | XeTai365",
      description: "Gia ban va tinh trang Hyundai HD72 thung kin 2022.",
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
    shortDescription: "Dong xe tai trung moi, tai trong linh hoat cho doanh nghiep van tai.",
    content:
      "Isuzu FRR 90N doi 2024, may Euro 5, thiet ke cabin rong, tiet kiem nhien lieu va phu hop chay duong dai.",
    images: [
      "https://images.unsplash.com/photo-1471478331149-c72f17e33c73",
    ],
    seo: {
      title: "Isuzu FRR 90N 2024 | XeTai365",
      description: "Thong tin san pham Isuzu FRR 90N 2024 va gia du kien.",
    },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 4,
    slug: "howo-a7-dau-keo-2021",
    legacyPath: "/howo-a7-dau-keo-2021.html",
    title: "Howo A7 dau keo 2021",
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
    shortDescription: "Xe dau keo da qua su dung, phu hop khai thac container.",
    content:
      "Howo A7 2021, cau lap dep, noi that nguyen ban, da tung chay tuyen Nam Bac va bao duong dinh ky.",
    images: [
      "https://images.unsplash.com/photo-1551830820-330a71b99659",
    ],
    seo: {
      title: "Howo A7 dau keo 2021 | XeTai365",
      description: "Thong tin Howo A7 dau keo 2021 da qua su dung.",
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
    shortDescription: "Xe ben 3 chan phuc vu cong trinh va khai thac vat lieu.",
    content:
      "Hino FG8JJSB 2024, thung ben dong co, khung gam chac chan, phu hop cong trinh va van tai vat lieu xay dung.",
    images: [
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c",
    ],
    seo: {
      title: "Hino FG8JJSB xe ben 2024 | XeTai365",
      description: "Xe ben Hino FG8JJSB 2024, thong so va gia ban tham khao.",
    },
    createdAt: now,
    updatedAt: now,
  },
];

const newsCategories = [
  {
    id: 1,
    slug: "tin-thi-truong",
    name: "Tin thi truong",
  },
  {
    id: 2,
    slug: "kinh-nghiem-mua-xe",
    name: "Kinh nghiem mua xe",
  },
];

const newsArticles = [
  {
    id: 1,
    slug: "thi-truong-xe-tai-quy-2-2026",
    legacyPath: "/thi-truong-xe-tai-quy-2-2026.html",
    categorySlug: "tin-thi-truong",
    title: "Thi truong xe tai quy 2/2026",
    excerpt: "Nhu cau xe tai trung va nang tang o nhom logistics va vat lieu xay dung.",
    content:
      "Bao cao noi bo cho thay nhom xe tai 8 tan va dau keo dang duoc quan tam manh nhat trong quy 2/2026.",
    publishedAt: now,
    seo: {
      title: "Thi truong xe tai quy 2/2026 | XeTai365",
      description: "Cap nhat thi truong xe tai va nhu cau van tai quy 2/2026.",
    },
  },
  {
    id: 2,
    slug: "kinh-nghiem-chon-xe-tai-cu",
    legacyPath: "/kinh-nghiem-chon-xe-tai-cu.html",
    categorySlug: "kinh-nghiem-mua-xe",
    title: "Kinh nghiem chon xe tai cu",
    excerpt: "5 diem can kiem tra truoc khi mua xe tai da qua su dung.",
    content:
      "Can kiem tra khung gam, dong co, lich su bao duong, giay to va tinh phu hop cua xe voi loai hang van chuyen.",
    publishedAt: now,
    seo: {
      title: "Kinh nghiem chon xe tai cu | XeTai365",
      description: "Huong dan kiem tra xe tai cu truoc khi xuong tien.",
    },
  },
];

const pages = [
  {
    slug: "gioi-thieu",
    title: "Gioi thieu XeTai365",
    content:
      "XeTai365 cung cap xe tai, xe dau keo, xe chuyen dung va dich vu tu van giai phap van tai cho doanh nghiep.",
    seo: {
      title: "Gioi thieu | XeTai365",
      description: "Thong tin gioi thieu ve XeTai365.",
    },
  },
  {
    slug: "lien-he",
    title: "Lien he",
    content:
      "Lien he XeTai365 qua hotline 0899.966.254 hoac den showroom tai Binh Duong de duoc tu van.",
    seo: {
      title: "Lien he | XeTai365",
      description: "Thong tin lien he XeTai365.",
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
