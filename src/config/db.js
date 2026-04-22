const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const {
  productCategories,
  products,
  newsArticles,
  legacyRoutes,
  pages,
} = require("../data/siteData");

let pool;

function toBoolean(value, fallback = false) {
  if (typeof value === "undefined") {
    return fallback;
  }

  return String(value).trim().toLowerCase() === "true";
}

function guessBulletinType(article) {
  const categorySlug = String(article?.categorySlug || "").trim().toLowerCase();
  if (categorySlug.includes("khuyen-mai") || categorySlug.includes("promotion")) {
    return "promotion";
  }

  return "news_event";
}

function toSafeString(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function toSafeObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value;
}

function resolveImageUrlFromImages(images) {
  if (!Array.isArray(images) || images.length === 0) {
    return "";
  }

  const first = images[0];
  if (typeof first === "string") {
    return first.trim();
  }

  if (first && typeof first === "object") {
    return toSafeString(first.url) || toSafeString(first.src);
  }

  return "";
}

function resolveImageUrlFromSeo(seo) {
  const safeSeo = toSafeObject(seo);
  return (
    toSafeString(safeSeo.imageUrl) ||
    toSafeString(safeSeo.image) ||
    toSafeString(safeSeo.thumbnail) ||
    toSafeString(safeSeo.thumbnailUrl) ||
    toSafeString(safeSeo.coverImage) ||
    toSafeString(safeSeo.cover_image) ||
    toSafeString(safeSeo.ogImage) ||
    ""
  );
}

function getPool() {
  if (pool) {
    return pool;
  }

  const useSsl = toBoolean(process.env.POSTGRES_SSL, false);

  pool = new Pool({
    host: process.env.POSTGRES_HOST || "127.0.0.1",
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "",
    database: process.env.POSTGRES_DB || "postgres",
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  });

  return pool;
}

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGSERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function getMigrationFiles() {
  const migrationsDir = path.resolve(__dirname, "../../migrations");
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((filename) => ({
      filename,
      fullPath: path.join(migrationsDir, filename),
    }));
}

async function hasMigration(client, filename) {
  const result = await client.query(
    "SELECT 1 FROM schema_migrations WHERE filename = $1 LIMIT 1",
    [filename]
  );
  return result.rowCount > 0;
}

async function applyPendingMigrations() {
  const client = await getPool().connect();

  try {
    await ensureMigrationsTable(client);
    const files = getMigrationFiles();

    for (const file of files) {
      const applied = await hasMigration(client, file.filename);
      if (applied) {
        continue;
      }

      const sql = fs.readFileSync(file.fullPath, "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [
          file.filename,
        ]);
        await client.query("COMMIT");
        console.log(`Applied migration: ${file.filename}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    client.release();
  }
}

async function ensureSeedData() {
  await getPool().query(`
    INSERT INTO settings (
      id, title, keywords, description, giupdochiase, ten, email, website,
      dienthoai, diachi, fax, tennv, hotline, tennv1, hotline1, tennv2,
      hotline2, toado, facebook, youtube, yahoo, skype, twitter, zing,
      google, tip, linktip, analytics, dangky, tietkiem, hailong, updated_at
    )
    VALUES (
      1,
      'Xe tải - Xe đầu kéo - Xe chuyên dụng',
      'dongfeng, howo, hyundai, xe tải',
      'Thông tin cấu hình website và liên hệ cho XeTải365',
      3,
      'XE TẢI 365 GROUP',
      'vanducbon99@gmail.com',
      'https://xetai365.vn',
      '0899.966.254',
      'Số 16, Đường Dẫn Cầu Phú Long, Bình Dương',
      '0899.966.254',
      '',
      '0899.966.254',
      '',
      '',
      '',
      '',
      '',
      'https://www.facebook.com/profile.php?id=100072217597486',
      'https://www.youtube.com/channel/UC24fCjRcXuDH1dnbgGewb1A',
      '',
      '',
      'http://twitter.com',
      '',
      'https://plus.google.com/u/0/',
      '<button>Chat</button>',
      '',
      '',
      '',
      '<iframe src=''https://www.google.com/maps/embed?pb=sample''></iframe>',
      '',
      NOW()
    )
    ON CONFLICT (id) DO NOTHING
  `);

  const categoryCountResult = await getPool().query(
    "SELECT COUNT(*)::int AS total FROM vehicle_categories"
  );
  const categoryCount = categoryCountResult.rows[0]?.total || 0;

  if (categoryCount === 0) {
    for (const category of productCategories) {
      await getPool().query(
        `
        INSERT INTO vehicle_categories (
          id,
          slug,
          name,
          type,
          description,
          title_seo,
          keywords,
          image_url,
          sort_order,
          is_visible,
          admin_level,
          admin_note,
          created_at,
          updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11, $12,
          NOW(), NOW()
        )
        ON CONFLICT (id) DO NOTHING
        `,
        [
          category.id,
          category.slug,
          category.name,
          category.type || "product-list",
          category.description || "",
          category.titleSeo || category.seoTitle || category.name || "",
          category.keywords || "",
          category.imageUrl || "",
          Number(category.sortOrder) || 1,
          true,
          1,
          "",
        ]
      );
    }
  }

  const vehicleCountResult = await getPool().query(
    "SELECT COUNT(*)::int AS total FROM vehicles"
  );
  const vehicleCount = vehicleCountResult.rows[0]?.total || 0;

  if (vehicleCount === 0) {
    const categoryIdBySlug = new Map(
      productCategories.map((category) => [category.slug, category.id])
    );

    for (const vehicle of products) {
      const seo = vehicle.seo || {};
      const imageUrl =
        toSafeString(vehicle.imageUrl) ||
        resolveImageUrlFromSeo(seo) ||
        resolveImageUrlFromImages(vehicle.images);

      await getPool().query(
        `
        INSERT INTO vehicles (
          id,
          category_id,
          slug,
          legacy_path,
          title,
          sku,
          msp,
          brand,
          vehicle_type,
          condition,
          year,
          mileage_km,
          fuel_type,
          transmission,
          price_vnd,
          status,
          is_featured,
          is_visible,
          sort_order,
          location,
          short_description,
          content,
          images,
          seo,
          title_seo,
          keywords,
          meta_description,
          image_url,
          created_at,
          updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22,
          $23::jsonb, $24::jsonb, $25, $26, $27, $28,
          $29::timestamptz, $30::timestamptz
        )
        ON CONFLICT (id) DO NOTHING
        `,
        [
          vehicle.id,
          categoryIdBySlug.get(vehicle.categorySlug),
          vehicle.slug,
          vehicle.legacyPath || "",
          vehicle.title,
          vehicle.sku || "",
          vehicle.msp || "",
          vehicle.brand || "",
          vehicle.type || "",
          vehicle.condition || "",
          Number(vehicle.year) || 0,
          Number(vehicle.mileageKm) || 0,
          vehicle.fuelType || "",
          vehicle.transmission || "",
          Number(vehicle.priceVnd) || 0,
          vehicle.status || "available",
          Boolean(vehicle.isFeatured),
          true,
          Number(vehicle.sortOrder) || 1,
          vehicle.location || "",
          vehicle.shortDescription || "",
          vehicle.content || "",
          JSON.stringify(vehicle.images || []),
          JSON.stringify(seo),
          vehicle.titleSeo || seo.title || vehicle.title || "",
          vehicle.keywords || seo.keywords || "",
          vehicle.metaDescription || seo.description || vehicle.shortDescription || "",
          imageUrl,
          vehicle.createdAt || new Date().toISOString(),
          vehicle.updatedAt || new Date().toISOString(),
        ]
      );
    }
  }

  const legacyRouteCountResult = await getPool().query(
    "SELECT COUNT(*)::int AS total FROM legacy_routes"
  );
  const legacyRouteCount = legacyRouteCountResult.rows[0]?.total || 0;

  if (legacyRouteCount === 0) {
    for (const route of legacyRoutes) {
      await getPool().query(
        `
        INSERT INTO legacy_routes (
          path, type, target, resource_type, resource_slug, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT (path) DO NOTHING
        `,
        [
          route.path,
          route.type || "page",
          route.target || "/",
          route.resourceType || "page",
          route.resourceSlug || "",
        ]
      );
    }
  }

  const bulletinCountResult = await getPool().query(
    "SELECT COUNT(*)::int AS total FROM bulletins"
  );
  const bulletinCount = bulletinCountResult.rows[0]?.total || 0;

  if (bulletinCount === 0) {
    for (const article of newsArticles) {
      const seo = article.seo || {};
      const excerpt = article.excerpt || "";
      const imageUrl =
        toSafeString(article.imageUrl) || resolveImageUrlFromSeo(seo);

      await getPool().query(
        `
        INSERT INTO bulletins (
          slug,
          bulletin_type,
          category_id,
          title,
          name,
          excerpt,
          description_short,
          content,
          status,
          image_url,
          title_seo,
          keywords,
          meta_description,
          sort_order,
          is_visible,
          published_at,
          seo,
          created_at,
          updated_at
        )
        VALUES (
          $1, $2, NULL, $3, $4, $5, $6, $7,
          'published', $8, $9, $10, $11, $12, $13,
          $14::timestamptz, $15::jsonb, NOW(), NOW()
        )
        ON CONFLICT (slug) DO NOTHING
        `,
        [
          article.slug,
          guessBulletinType(article),
          article.title,
          article.name || article.title,
          excerpt,
          article.descriptionShort || excerpt,
          article.content || "",
          imageUrl,
          article.titleSeo || seo.title || article.title,
          article.keywords || seo.keywords || "",
          article.metaDescription || seo.description || excerpt,
          Number(article.sortOrder) || 1,
          true,
          article.publishedAt || new Date().toISOString(),
          JSON.stringify(seo),
        ]
      );
    }
  }

  const sitePageCountResult = await getPool().query(
    "SELECT COUNT(*)::int AS total FROM site_pages"
  );
  const sitePageCount = sitePageCountResult.rows[0]?.total || 0;

  if (sitePageCount === 0) {
    for (const page of pages) {
      const seo = page.seo || {};
      await getPool().query(
        `
        INSERT INTO site_pages (
          slug,
          page_type,
          title,
          greeting,
          content,
          image_url,
          keywords,
          meta_description,
          sort_order,
          is_visible,
          created_at,
          updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
        )
        ON CONFLICT (slug) DO NOTHING
        `,
        [
          page.slug,
          page.pageType || "company",
          page.title || "",
          page.greeting || "",
          page.content || "",
          page.imageUrl || "",
          page.keywords || seo.keywords || "",
          page.metaDescription || seo.description || "",
          Number(page.sortOrder) || 1,
          true,
        ]
      );
    }
  }

  const adminUserCountResult = await getPool().query(
    "SELECT COUNT(*)::int AS total FROM admin_users"
  );
  const adminUserCount = adminUserCountResult.rows[0]?.total || 0;

  if (adminUserCount === 0) {
    const username = String(process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
    const plainPassword = String(process.env.ADMIN_PASSWORD || "admin123");
    const fullName = String(process.env.ADMIN_FULL_NAME || "System Admin");
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    await getPool().query(
      `
      INSERT INTO admin_users (
        username, password_hash, full_name, status, created_at, updated_at
      )
      VALUES ($1, $2, $3, 'active', NOW(), NOW())
      ON CONFLICT (username) DO NOTHING
      `,
      [username, passwordHash, fullName]
    );
  }
}

async function connectDatabase() {
  const instance = getPool();
  const client = await instance.connect();

  try {
    await client.query("SELECT 1");
    await applyPendingMigrations();
    await ensureSeedData();
    console.log("PostgreSQL connected successfully");
  } finally {
    client.release();
  }
}

async function checkDatabaseHealth() {
  try {
    await getPool().query("SELECT 1");
    return { status: "up" };
  } catch (error) {
    return {
      status: "down",
      message: error.message,
    };
  }
}

module.exports = {
  getPool,
  connectDatabase,
  applyPendingMigrations,
  checkDatabaseHealth,
};
