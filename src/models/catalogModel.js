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

function mapVehicleRow(row) {
  const safeSeo = toSafeObject(row.seo);
  const imageUrl =
    toSafeString(row.image_url) ||
    toSafeString(safeSeo.imageUrl) ||
    toSafeString(safeSeo.image) ||
    resolveImageUrlFromImages(row.images);

  return {
    id: row.id,
    slug: row.slug,
    legacyPath: row.legacy_path,
    title: row.title,
    sku: row.sku,
    msp: row.msp,
    brand: row.brand,
    categorySlug: row.category_slug,
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
    images: row.images || [],
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
    const result = await getPool().query(`
      SELECT
        vc.id,
        vc.slug,
        vc.name,
        vc.type,
        vc.description,
        vc.parent_id,
        pvc.slug AS parent_slug,
        vc.title_seo,
        vc.keywords,
        vc.image_url,
        vc.sort_order,
        vc.is_visible,
        vc.admin_level,
        vc.admin_note,
        COUNT(v.id)::int AS product_count
      FROM vehicle_categories vc
      LEFT JOIN vehicle_categories pvc ON pvc.id = vc.parent_id
      LEFT JOIN vehicles v ON v.category_id = vc.id AND v.is_visible = TRUE
      WHERE vc.is_visible = TRUE
      GROUP BY
        vc.id,
        vc.slug,
        vc.name,
        vc.type,
        vc.description,
        vc.parent_id,
        pvc.slug,
        vc.title_seo,
        vc.keywords,
        vc.image_url,
        vc.sort_order,
        vc.is_visible,
        vc.admin_level,
        vc.admin_note
      ORDER BY vc.sort_order ASC, vc.id ASC
    `);

    return result.rows.map((row) => ({
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
    const categories = await this.listCategories();
    const byId = new Map();
    const roots = [];

    for (const category of categories) {
      byId.set(category.id, {
        ...category,
        children: [],
      });
    }

    for (const category of byId.values()) {
      if (category.parentId && byId.has(category.parentId)) {
        byId.get(category.parentId).children.push(category);
      } else {
        roots.push(category);
      }
    }

    return roots;
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
    const includeHidden = String(filters.includeHidden || "").trim() === "true";

    const whereClauses = [];
    const params = [];

    if (!includeHidden) {
      whereClauses.push("v.is_visible = TRUE");
    }

    if (keyword.length > 0) {
      params.push(`%${keyword}%`);
      whereClauses.push(
        `(
          LOWER(v.title) LIKE $${params.length}
          OR LOWER(v.slug) LIKE $${params.length}
          OR LOWER(v.short_description) LIKE $${params.length}
          OR LOWER(v.content) LIKE $${params.length}
          OR LOWER(v.msp) LIKE $${params.length}
        )`
      );
    }

    if (brand.length > 0) {
      params.push(brand);
      whereClauses.push(`LOWER(v.brand) = $${params.length}`);
    }

    if (status.length > 0) {
      params.push(status);
      whereClauses.push(`LOWER(v.status) = $${params.length}`);
    }

    if (category.length > 0) {
      params.push(category);
      whereClauses.push(`
        v.category_id IN (
          WITH RECURSIVE category_tree AS (
            SELECT id
            FROM vehicle_categories
            WHERE LOWER(slug) = $${params.length}
            UNION ALL
            SELECT vc2.id
            FROM vehicle_categories vc2
            JOIN category_tree ct ON vc2.parent_id = ct.id
          )
          SELECT id FROM category_tree
        )
      `);
    }

    if (condition.length > 0) {
      params.push(condition);
      whereClauses.push(`LOWER(v.condition) = $${params.length}`);
    }

    if (featuredOnly) {
      whereClauses.push("v.is_featured = TRUE");
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countResult = await getPool().query(
      `
      SELECT COUNT(*)::int AS total
      FROM vehicles v
      JOIN vehicle_categories vc ON vc.id = v.category_id
      ${whereSql}
      `,
      params
    );

    const totalItems = countResult.rows[0]?.total || 0;

    const listResult = await getPool().query(
      `
      SELECT
        v.id,
        v.slug,
        v.legacy_path,
        v.title,
        v.sku,
        v.msp,
        v.brand,
        v.vehicle_type,
        v.condition,
        v.year,
        v.mileage_km,
        v.fuel_type,
        v.transmission,
        v.price_vnd,
        v.status,
        v.is_featured,
        v.is_visible,
        v.sort_order,
        v.location,
        v.short_description,
        v.content,
        v.images,
        v.seo,
        v.image_url,
        v.title_seo,
        v.keywords,
        v.meta_description,
        v.created_at,
        v.updated_at,
        vc.slug AS category_slug
      FROM vehicles v
      JOIN vehicle_categories vc ON vc.id = v.category_id
      ${whereSql}
      ORDER BY v.sort_order ASC, v.id DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
      `,
      [...params, safeLimit, offset]
    );

    return {
      items: listResult.rows.map(mapVehicleRow),
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

    const conditions = ["(v.id = $1 OR v.slug = $2)"];
    if (!includeHidden) {
      conditions.push("v.is_visible = TRUE");
    }

    const result = await getPool().query(
      `
      SELECT
        v.id,
        v.slug,
        v.legacy_path,
        v.title,
        v.sku,
        v.msp,
        v.brand,
        v.vehicle_type,
        v.condition,
        v.year,
        v.mileage_km,
        v.fuel_type,
        v.transmission,
        v.price_vnd,
        v.status,
        v.is_featured,
        v.is_visible,
        v.sort_order,
        v.location,
        v.short_description,
        v.content,
        v.images,
        v.seo,
        v.image_url,
        v.title_seo,
        v.keywords,
        v.meta_description,
        v.created_at,
        v.updated_at,
        vc.slug AS category_slug
      FROM vehicles v
      JOIN vehicle_categories vc ON vc.id = v.category_id
      WHERE ${conditions.join(" AND ")}
      LIMIT 1
      `,
      [isNumeric ? asNumber : -1, String(value || "")]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return mapVehicleRow(result.rows[0]);
  }

  async getFeaturedProducts(limit = 6) {
    const safeLimit = Math.min(Math.max(Number(limit) || 6, 1), 50);

    const result = await getPool().query(
      `
      SELECT
        v.id,
        v.slug,
        v.legacy_path,
        v.title,
        v.sku,
        v.msp,
        v.brand,
        v.vehicle_type,
        v.condition,
        v.year,
        v.mileage_km,
        v.fuel_type,
        v.transmission,
        v.price_vnd,
        v.status,
        v.is_featured,
        v.is_visible,
        v.sort_order,
        v.location,
        v.short_description,
        v.content,
        v.images,
        v.seo,
        v.image_url,
        v.title_seo,
        v.keywords,
        v.meta_description,
        v.created_at,
        v.updated_at,
        vc.slug AS category_slug
      FROM vehicles v
      JOIN vehicle_categories vc ON vc.id = v.category_id
      WHERE v.is_featured = TRUE AND v.is_visible = TRUE
      ORDER BY v.sort_order ASC, v.id DESC
      LIMIT $1
      `,
      [safeLimit]
    );

    return result.rows.map(mapVehicleRow);
  }
}

module.exports = new CatalogModel();
