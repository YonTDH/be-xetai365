const { getPool } = require("../config/db");
const { normalizeText } = require("../utils/request");

function toIsoString(value) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
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

function toSafeImages(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item) => {
    if (typeof item === "string") {
      return item.trim().length > 0;
    }

    if (!item || typeof item !== "object") {
      return false;
    }

    return toSafeString(item.url) || toSafeString(item.src);
  });
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

function mapProductRow(row) {
  const safeSeo = toSafeObject(row.seo);
  const safeImages = toSafeImages(row.images);
  const imageUrl =
    toSafeString(row.image_url) ||
    toSafeString(safeSeo.imageUrl) ||
    toSafeString(safeSeo.image) ||
    resolveImageUrlFromImages(safeImages);

  return {
    id: row.id,
    slug: row.slug,
    legacyPath: row.legacy_path,
    title: row.title,
    sku: row.product_code || "",
    msp: row.product_code || "",
    brand: row.brand,
    categorySlug: row.category_slug,
    categoryName: row.category_name || "",
    type: row.vehicle_type,
    condition: row.condition,
    year: row.year,
    mileageKm: row.mileage_km,
    fuelType: row.fuel_type,
    transmission: row.transmission,
    priceVnd: row.price_vnd,
    status: row.status,
    isFeatured: row.is_featured,
    isVisible: row.is_visible,
    sortOrder: row.sort_order,
    location: row.location,
    shortDescription: row.short_description,
    content: row.content,
    images: safeImages,
    imageUrl,
    seo: safeSeo,
    titleSeo: row.title_seo,
    keywords: row.keywords,
    metaDescription: row.meta_description,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

class CatalogModel {
  async listCategories() {
    const level1Result = await getPool().query(
      `
      SELECT
        c1.id,
        c1.slug,
        c1.name,
        'product-list'::varchar AS type,
        c1.description,
        NULL::bigint AS parent_id,
        NULL::varchar AS parent_slug,
        c1.title_seo,
        c1.keywords,
        c1.image_url,
        c1.sort_order,
        c1.is_visible,
        1::smallint AS admin_level,
        c1.admin_note,
        COUNT(p.id)::int AS product_count
      FROM category_level_1 c1
      LEFT JOIN category_level_2 c2 ON c2.category_level_1_id = c1.id AND c2.is_visible = TRUE
      LEFT JOIN products p ON p.category_level_2_id = c2.id AND p.is_visible = TRUE
      WHERE c1.is_visible = TRUE
      GROUP BY
        c1.id,
        c1.slug,
        c1.name,
        c1.description,
        c1.title_seo,
        c1.keywords,
        c1.image_url,
        c1.sort_order,
        c1.is_visible,
        c1.admin_note
      ORDER BY c1.sort_order ASC, c1.id ASC
      `
    );

    const level2Result = await getPool().query(
      `
      SELECT
        c2.id,
        c2.slug,
        c2.name,
        'product-list'::varchar AS type,
        c2.description,
        c2.category_level_1_id AS parent_id,
        c1.slug AS parent_slug,
        c2.title_seo,
        c2.keywords,
        c2.image_url,
        c2.sort_order,
        c2.is_visible,
        2::smallint AS admin_level,
        c2.admin_note,
        COUNT(p.id)::int AS product_count
      FROM category_level_2 c2
      JOIN category_level_1 c1 ON c1.id = c2.category_level_1_id
      LEFT JOIN products p ON p.category_level_2_id = c2.id AND p.is_visible = TRUE
      WHERE c2.is_visible = TRUE AND c1.is_visible = TRUE
      GROUP BY
        c2.id,
        c2.slug,
        c2.name,
        c2.description,
        c2.category_level_1_id,
        c1.slug,
        c2.title_seo,
        c2.keywords,
        c2.image_url,
        c2.sort_order,
        c2.is_visible,
        c2.admin_note
      ORDER BY c2.sort_order ASC, c2.id ASC
      `
    );

    return [...level1Result.rows, ...level2Result.rows].map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      type: row.type,
      description: row.description,
      parentId: row.parent_id || null,
      parentSlug: row.parent_slug || null,
      titleSeo: row.title_seo,
      keywords: row.keywords,
      imageUrl: row.image_url,
      sortOrder: row.sort_order,
      isVisible: row.is_visible,
      adminLevel: row.admin_level,
      adminNote: row.admin_note,
      productCount: row.product_count,
    }));
  }

  async listCategoriesTree() {
    const level1Result = await getPool().query(
      `
      SELECT
        id, slug, name, description, title_seo, keywords,
        image_url, sort_order, is_visible, admin_note
      FROM category_level_1
      WHERE is_visible = TRUE
      ORDER BY sort_order ASC, id ASC
      `
    );

    const level2Result = await getPool().query(
      `
      SELECT
        c2.id,
        c2.slug,
        c2.name,
        c2.description,
        c2.category_level_1_id,
        c2.title_seo,
        c2.keywords,
        c2.image_url,
        c2.sort_order,
        c2.is_visible,
        c2.admin_note
      FROM category_level_2 c2
      JOIN category_level_1 c1 ON c1.id = c2.category_level_1_id
      WHERE c2.is_visible = TRUE AND c1.is_visible = TRUE
      ORDER BY c2.sort_order ASC, c2.id ASC
      `
    );

    const byLevel1Id = new Map();
    for (const row of level1Result.rows) {
      byLevel1Id.set(row.id, {
        id: row.id,
        slug: row.slug,
        name: row.name,
        type: "product-list",
        description: row.description,
        parentId: null,
        parentSlug: null,
        titleSeo: row.title_seo,
        keywords: row.keywords,
        imageUrl: row.image_url,
        sortOrder: row.sort_order,
        isVisible: row.is_visible,
        adminLevel: 1,
        adminNote: row.admin_note,
        children: [],
      });
    }

    for (const row of level2Result.rows) {
      if (!byLevel1Id.has(row.category_level_1_id)) {
        continue;
      }

      byLevel1Id.get(row.category_level_1_id).children.push({
        id: row.id,
        slug: row.slug,
        name: row.name,
        type: "product-list",
        description: row.description,
        parentId: row.category_level_1_id,
        parentSlug: byLevel1Id.get(row.category_level_1_id).slug,
        titleSeo: row.title_seo,
        keywords: row.keywords,
        imageUrl: row.image_url,
        sortOrder: row.sort_order,
        isVisible: row.is_visible,
        adminLevel: 2,
        adminNote: row.admin_note,
        children: [],
      });
    }

    return Array.from(byLevel1Id.values());
  }

  async listProducts(filters = {}) {
    const safeLimit = Math.min(Math.max(Number(filters.limit) || 20, 1), 100);
    const safePage = Math.max(Number(filters.page) || 1, 1);
    const offset = (safePage - 1) * safeLimit;

    const keyword = normalizeText(filters.keyword);
    const brand = normalizeText(filters.brand);
    const status = normalizeText(filters.status);
    const category = normalizeText(filters.category);
    const condition = normalizeText(filters.condition);
    const featuredOnly = String(filters.featured || "").trim() === "true";
    const includeHidden =
      filters.allowIncludeHidden === true &&
      String(filters.includeHidden || "").trim() === "true";

    const whereClauses = [];
    const params = [];

    if (!includeHidden) {
      whereClauses.push("p.is_visible = TRUE");
      whereClauses.push("c2.is_visible = TRUE");
      whereClauses.push("c1.is_visible = TRUE");
    }

    if (keyword.length > 0) {
      params.push(`%${keyword}%`);
      whereClauses.push(
        `(
          LOWER(p.title) LIKE $${params.length}
          OR LOWER(p.slug) LIKE $${params.length}
          OR LOWER(p.short_description) LIKE $${params.length}
          OR LOWER(p.content) LIKE $${params.length}
          OR LOWER(p.product_code) LIKE $${params.length}
          OR LOWER(p.title_seo) LIKE $${params.length}
          OR LOWER(p.keywords) LIKE $${params.length}
          OR LOWER(p.meta_description) LIKE $${params.length}
          OR LOWER(p.brand) LIKE $${params.length}
          OR LOWER(c2.name) LIKE $${params.length}
          OR LOWER(c2.slug) LIKE $${params.length}
          OR LOWER(c1.name) LIKE $${params.length}
          OR LOWER(c1.slug) LIKE $${params.length}
        )`
      );
    }

    if (brand.length > 0) {
      params.push(brand);
      whereClauses.push(`LOWER(p.brand) = $${params.length}`);
    }

    if (status.length > 0) {
      params.push(status);
      whereClauses.push(`LOWER(p.status::text) = $${params.length}`);
    }

    if (category.length > 0) {
      params.push(category);
      whereClauses.push(`(LOWER(c2.slug) = $${params.length} OR LOWER(c1.slug) = $${params.length})`);
    }

    if (condition.length > 0) {
      params.push(condition);
      whereClauses.push(`LOWER(p.condition) = $${params.length}`);
    }

    if (featuredOnly) {
      whereClauses.push("p.is_featured = TRUE");
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countResult = await getPool().query(
      `
      SELECT COUNT(*)::int AS total
      FROM products p
      JOIN category_level_2 c2 ON c2.id = p.category_level_2_id
      JOIN category_level_1 c1 ON c1.id = c2.category_level_1_id
      ${whereSql}
      `,
      params
    );

    const totalItems = countResult.rows[0]?.total || 0;

    const listResult = await getPool().query(
      `
      SELECT
        p.id,
        p.slug,
        p.legacy_path,
        p.title,
        p.product_code,
        p.brand,
        p.vehicle_type,
        p.condition,
        p.year,
        p.mileage_km,
        p.fuel_type,
        p.transmission,
        p.price_vnd,
        p.status,
        p.is_featured,
        p.is_visible,
        p.sort_order,
        p.location,
        p.short_description,
        p.content,
        p.images,
        p.seo,
        p.image_url,
        p.title_seo,
        p.keywords,
        p.meta_description,
        p.created_at,
        p.updated_at,
        c2.slug AS category_slug,
        c2.name AS category_name
      FROM products p
      JOIN category_level_2 c2 ON c2.id = p.category_level_2_id
      JOIN category_level_1 c1 ON c1.id = c2.category_level_1_id
      ${whereSql}
      ORDER BY p.sort_order ASC, p.id DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
      `,
      [...params, safeLimit, offset]
    );

    return {
      items: listResult.rows.map(mapProductRow),
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / safeLimit),
      },
    };
  }

  async findProductByIdOrSlug(value, { includeHidden = false } = {}) {
    const asNumber = Number(value);
    const isNumeric = Number.isFinite(asNumber);

    const conditions = ["(p.id = $1 OR p.slug = $2)"];
    if (!includeHidden) {
      conditions.push("p.is_visible = TRUE");
      conditions.push("c2.is_visible = TRUE");
      conditions.push("c1.is_visible = TRUE");
    }

    const result = await getPool().query(
      `
      SELECT
        p.id,
        p.slug,
        p.legacy_path,
        p.title,
        p.product_code,
        p.brand,
        p.vehicle_type,
        p.condition,
        p.year,
        p.mileage_km,
        p.fuel_type,
        p.transmission,
        p.price_vnd,
        p.status,
        p.is_featured,
        p.is_visible,
        p.sort_order,
        p.location,
        p.short_description,
        p.content,
        p.images,
        p.seo,
        p.image_url,
        p.title_seo,
        p.keywords,
        p.meta_description,
        p.created_at,
        p.updated_at,
        c2.slug AS category_slug,
        c2.name AS category_name
      FROM products p
      JOIN category_level_2 c2 ON c2.id = p.category_level_2_id
      JOIN category_level_1 c1 ON c1.id = c2.category_level_1_id
      WHERE ${conditions.join(" AND ")}
      LIMIT 1
      `,
      [isNumeric ? asNumber : -1, String(value || "")]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return mapProductRow(result.rows[0]);
  }

  async getFeaturedProducts(limit = 6) {
    const safeLimit = Math.min(Math.max(Number(limit) || 6, 1), 50);

    const result = await getPool().query(
      `
      SELECT
        p.id,
        p.slug,
        p.legacy_path,
        p.title,
        p.product_code,
        p.brand,
        p.vehicle_type,
        p.condition,
        p.year,
        p.mileage_km,
        p.fuel_type,
        p.transmission,
        p.price_vnd,
        p.status,
        p.is_featured,
        p.is_visible,
        p.sort_order,
        p.location,
        p.short_description,
        p.content,
        p.images,
        p.seo,
        p.image_url,
        p.title_seo,
        p.keywords,
        p.meta_description,
        p.created_at,
        p.updated_at,
        c2.slug AS category_slug,
        c2.name AS category_name
      FROM products p
      JOIN category_level_2 c2 ON c2.id = p.category_level_2_id
      JOIN category_level_1 c1 ON c1.id = c2.category_level_1_id
      WHERE p.is_featured = TRUE
        AND p.is_visible = TRUE
        AND c2.is_visible = TRUE
        AND c1.is_visible = TRUE
      ORDER BY p.sort_order ASC, p.id DESC
      LIMIT $1
      `,
      [safeLimit]
    );

    return result.rows.map(mapProductRow);
  }
}

module.exports = new CatalogModel();
