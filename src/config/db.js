const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const { newsArticles, legacyRoutes, pages, products: seedProducts } = require("../data/siteData");

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

function mapSeedCategorySlug(categorySlug) {
  const normalizedSlug = toSafeString(categorySlug).toLowerCase();

  if (normalizedSlug === "xe-dau-keo") {
    return "tong-hop-xe-dau-keo";
  }

  if (normalizedSlug === "xe-chuyen-dung") {
    return "tong-hop-xe-chuyen-dung";
  }

  return "tong-hop-xe-tai";
}

function getPool() {
  if (pool) {
    return pool;
  }

  const useSsl = toBoolean(process.env.POSTGRES_SSL, false);
  const connectionString = String(process.env.DATABASE_URL || "").trim();

  if (connectionString) {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
    return pool;
  }

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
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [file.filename]
        );
        console.log(`Applied migration: ${file.filename}`);
      } catch (error) {
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
      logo_url, dienthoai, diachi, fax, tennv, hotline, tennv1, hotline1, tennv2,
      hotline2, toado, facebook, youtube, zalo, skype, twitter, zing,
      google, tip, linktip, analytics, dangky, tietkiem, hailong, updated_at
    )
    VALUES (
      1,
      'Xe tai - Dau keo - Xe chuyen dung',
      'xe tai, dau keo, xe chuyen dung',
      'Thong tin cau hinh website va lien he cho XeTai365',
      0,
      'XE TAI 365 GROUP',
      'sale@xetai365.vn',
      'https://xetai365.vn',
      '',
      '0899966254',
      'Binh Duong, Viet Nam',
      '',
      '',
      '0899966254',
      '',
      '',
      '',
      '',
      '',
      'fb.com',
      'youtube.com',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      NOW()
    )
    ON CONFLICT (id) DO NOTHING
  `);

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

  const productCountResult = await getPool().query(
    "SELECT COUNT(*)::int AS total FROM products"
  );
  const productCount = productCountResult.rows[0]?.total || 0;

  if (productCount === 0) {
    const categorySlugSet = Array.from(
      new Set(seedProducts.map((product) => mapSeedCategorySlug(product.categorySlug)))
    );
    const categoryRowsResult = await getPool().query(
      `
      SELECT id, slug
      FROM category_level_2
      WHERE slug = ANY($1::text[])
      `,
      [categorySlugSet]
    );
    const categoryIdBySlug = new Map(
      categoryRowsResult.rows.map((row) => [row.slug, row.id])
    );

    for (let index = 0; index < seedProducts.length; index += 1) {
      const product = seedProducts[index];
      const categoryLevel2Slug = mapSeedCategorySlug(product.categorySlug);
      const categoryLevel2Id = categoryIdBySlug.get(categoryLevel2Slug);

      if (!categoryLevel2Id) {
        continue;
      }

      const seo = toSafeObject(product.seo);
      const imageUrl =
        toSafeString(product.imageUrl) ||
        resolveImageUrlFromImages(product.images) ||
        resolveImageUrlFromSeo(seo);
      const images = Array.isArray(product.images)
        ? product.images.filter((item) => typeof item === "string" && item.trim())
        : [];

      await getPool().query(
        `
        INSERT INTO products (
          category_level_2_id,
          product_code,
          slug,
          legacy_path,
          title,
          short_description,
          content,
          technical_specs,
          price_vnd,
          unit,
          status,
          brand,
          vehicle_type,
          condition,
          year,
          mileage_km,
          fuel_type,
          transmission,
          location,
          images,
          seo,
          title_seo,
          keywords,
          meta_description,
          image_url,
          is_featured,
          is_visible,
          sort_order,
          created_at,
          updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, '{}'::jsonb, $8, 'unit', $9, $10, $11, $12,
          $13, $14, $15, $16, $17, $18::jsonb, $19::jsonb, $20, $21, $22, $23, $24,
          TRUE, $25, $26::timestamptz, $27::timestamptz
        )
        ON CONFLICT (slug) DO NOTHING
        `,
        [
          categoryLevel2Id,
          toSafeString(product.sku),
          toSafeString(product.slug),
          toSafeString(product.legacyPath),
          toSafeString(product.title),
          toSafeString(product.shortDescription),
          toSafeString(product.content),
          toSafeString(product.priceVnd) || "0",
          toSafeString(product.status) || "available",
          toSafeString(product.brand),
          toSafeString(product.type),
          toSafeString(product.condition),
          Number(product.year) || 0,
          Number(product.mileageKm) || 0,
          toSafeString(product.fuelType),
          toSafeString(product.transmission),
          toSafeString(product.location),
          JSON.stringify(images),
          JSON.stringify(seo),
          toSafeString(product.titleSeo) || toSafeString(seo.title) || toSafeString(product.title),
          toSafeString(product.keywords) || toSafeString(seo.keywords),
          toSafeString(product.metaDescription) ||
            toSafeString(seo.description) ||
            toSafeString(product.shortDescription),
          imageUrl,
          Boolean(product.isFeatured),
          index + 1,
          product.createdAt || new Date().toISOString(),
          product.updatedAt || new Date().toISOString(),
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


