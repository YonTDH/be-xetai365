const { getPool } = require("../config/db");

function toIsoString(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function toSafeString(value) {
  return typeof value === "string" ? value.trim() : "";
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

function mapAdminProductRow(row) {
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
    title: row.title,
    productCode: row.product_code || "",
    shortDescription: row.short_description || "",
    content: row.content || "",
    brand: row.brand || "",
    status: row.status || "",
    priceVnd: String(row.price_vnd ?? "0"),
    location: row.location || "",
    imageUrl,
    images: safeImages,
    isFeatured: row.is_featured,
    isVisible: row.is_visible,
    sortOrder: row.sort_order,
    categoryLevel2Id: row.category_level_2_id,
    categoryLevel2Name: row.category_level_2_name || "",
    categoryLevel2Slug: row.category_level_2_slug || "",
    categoryLevel1Id: row.category_level_1_id,
    categoryLevel1Name: row.category_level_1_name || "",
    categoryLevel1Slug: row.category_level_1_slug || "",
    vehicleType: row.vehicle_type || "",
    condition: row.condition || "",
    year: row.year || 0,
    mileageKm: row.mileage_km || 0,
    fuelType: row.fuel_type || "",
    transmission: row.transmission || "",
    titleSeo: row.title_seo || "",
    keywords: row.keywords || "",
    metaDescription: row.meta_description || "",
    seo: safeSeo,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

class AdminProductModel {
  async list(filters = {}) {
    const keyword = toSafeString(filters.keyword).toLowerCase();
    const status = toSafeString(filters.status).toLowerCase();
    const visibility = toSafeString(filters.visibility).toLowerCase();
    const categoryLevel2Id = Number(filters.categoryLevel2Id || filters.category_level_2_id);

    const whereClauses = [];
    const params = [];

    if (keyword) {
      params.push(`%${keyword}%`);
      whereClauses.push(
        `(
          LOWER(p.title) LIKE $${params.length}
          OR LOWER(p.slug) LIKE $${params.length}
          OR LOWER(p.brand) LIKE $${params.length}
          OR LOWER(c2.name) LIKE $${params.length}
          OR LOWER(c1.name) LIKE $${params.length}
        )`
      );
    }

    if (status) {
      params.push(status);
      whereClauses.push(`LOWER(p.status) = $${params.length}`);
    }

    if (visibility === "visible") {
      whereClauses.push("p.is_visible = TRUE");
    }

    if (visibility === "hidden") {
      whereClauses.push("p.is_visible = FALSE");
    }

    if (Number.isInteger(categoryLevel2Id) && categoryLevel2Id > 0) {
      params.push(categoryLevel2Id);
      whereClauses.push(`p.category_level_2_id = $${params.length}`);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const result = await getPool().query(
      `
      SELECT
        p.id,
        p.category_level_2_id,
        p.product_code,
        p.slug,
        p.title,
        p.short_description,
        p.content,
        p.price_vnd,
        p.status,
        p.brand,
        p.vehicle_type,
        p.condition,
        p.year,
        p.mileage_km,
        p.fuel_type,
        p.transmission,
        p.location,
        p.images,
        p.seo,
        p.title_seo,
        p.keywords,
        p.meta_description,
        p.image_url,
        p.is_featured,
        p.is_visible,
        p.sort_order,
        p.created_at,
        p.updated_at,
        c2.id AS category_level_2_id,
        c2.name AS category_level_2_name,
        c2.slug AS category_level_2_slug,
        c1.id AS category_level_1_id,
        c1.name AS category_level_1_name,
        c1.slug AS category_level_1_slug
      FROM products p
      JOIN category_level_2 c2 ON c2.id = p.category_level_2_id
      JOIN category_level_1 c1 ON c1.id = c2.category_level_1_id
      ${whereSql}
      ORDER BY p.sort_order ASC, p.id DESC
      `,
      params
    );

    return result.rows.map(mapAdminProductRow);
  }

  async getById(id) {
    const result = await getPool().query(
      `
      SELECT
        p.id,
        p.category_level_2_id,
        p.product_code,
        p.slug,
        p.title,
        p.short_description,
        p.content,
        p.price_vnd,
        p.status,
        p.brand,
        p.vehicle_type,
        p.condition,
        p.year,
        p.mileage_km,
        p.fuel_type,
        p.transmission,
        p.location,
        p.images,
        p.seo,
        p.title_seo,
        p.keywords,
        p.meta_description,
        p.image_url,
        p.is_featured,
        p.is_visible,
        p.sort_order,
        p.created_at,
        p.updated_at,
        c2.id AS category_level_2_id,
        c2.name AS category_level_2_name,
        c2.slug AS category_level_2_slug,
        c1.id AS category_level_1_id,
        c1.name AS category_level_1_name,
        c1.slug AS category_level_1_slug
      FROM products p
      JOIN category_level_2 c2 ON c2.id = p.category_level_2_id
      JOIN category_level_1 c1 ON c1.id = c2.category_level_1_id
      WHERE p.id = $1
      LIMIT 1
      `,
      [id]
    );

    if (!result.rows.length) {
      return null;
    }

    return mapAdminProductRow(result.rows[0]);
  }

  async ensureCategoryLevel2Exists(categoryLevel2Id) {
    const result = await getPool().query("SELECT id FROM category_level_2 WHERE id = $1 LIMIT 1", [categoryLevel2Id]);
    return result.rows.length > 0;
  }

  async create(payload) {
    const result = await getPool().query(
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
        $1, $2, $3, '', $4, $5, $6, '{}'::jsonb, $7, 'unit', $8, $9, '', '', 0, 0, '', '', $10, '[]'::jsonb, '{}'::jsonb,
        $11, $12, $13, $14, $15, $16, $17, NOW(), NOW()
      )
      RETURNING id
      `,
      [
        payload.categoryLevel2Id,
        payload.productCode,
        payload.slug,
        payload.title,
        payload.shortDescription,
        payload.content,
        payload.priceVnd,
        payload.status,
        payload.brand,
        payload.location,
        payload.titleSeo,
        payload.keywords,
        payload.metaDescription,
        payload.imageUrl,
        payload.isFeatured,
        payload.isVisible,
        payload.sortOrder,
      ]
    );

    return this.getById(result.rows[0].id);
  }

  async update(id, payload) {
    const result = await getPool().query(
      `
      UPDATE products
      SET
        category_level_2_id = $2,
        product_code = $3,
        slug = $4,
        title = $5,
        short_description = $6,
        content = $7,
        price_vnd = $8,
        status = $9,
        brand = $10,
        location = $11,
        title_seo = $12,
        keywords = $13,
        meta_description = $14,
        image_url = $15,
        is_featured = $16,
        is_visible = $17,
        sort_order = $18,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id
      `,
      [
        id,
        payload.categoryLevel2Id,
        payload.productCode,
        payload.slug,
        payload.title,
        payload.shortDescription,
        payload.content,
        payload.priceVnd,
        payload.status,
        payload.brand,
        payload.location,
        payload.titleSeo,
        payload.keywords,
        payload.metaDescription,
        payload.imageUrl,
        payload.isFeatured,
        payload.isVisible,
        payload.sortOrder,
      ]
    );

    if (!result.rows.length) {
      return null;
    }

    return this.getById(result.rows[0].id);
  }

  async delete(id) {
    const result = await getPool().query(
      `
      DELETE FROM products
      WHERE id = $1
      RETURNING id, title
      `,
      [id]
    );

    if (!result.rows.length) {
      return null;
    }

    return {
      id: Number(result.rows[0].id),
      title: result.rows[0].title,
    };
  }
}

module.exports = new AdminProductModel();
