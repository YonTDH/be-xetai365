const { getPool } = require("../config/db");
const { normalizeText } = require("../utils/request");

const BULLETIN_TYPE_NAMES = {
  news_event: "Tin tuc - Su kien",
  promotion: "Khuyen mai",
  recruitment: "Recruitment",
  services: "Dich vu",
};

const BULLETIN_TYPE_ALIASES = {
  news_event: "news_event",
  "news-event": "news_event",
  "tin-tuc-su-kien": "news_event",
  tintucsukien: "news_event",
  "tin-tuc": "news_event",
  sukien: "news_event",
  promotion: "promotion",
  "khuyen-mai": "promotion",
  khuyenmai: "promotion",
  recruitment: "recruitment",
  "tuyen-nhan-su": "recruitment",
  tuyennhansu: "recruitment",
  services: "services",
  service: "services",
  "dich-vu": "services",
  dichvu: "services",
};

const ALLOWED_STATUSES = new Set(["draft", "published", "archived"]);

function toIsoString(value) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeBulletinType(value) {
  const normalized = normalizeText(value).replace(/\s+/g, "-");
  return BULLETIN_TYPE_ALIASES[normalized] || null;
}

function normalizeStatus(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }
  return ALLOWED_STATUSES.has(normalized) ? normalized : null;
}

function normalizeBoolean(value, fallback = true) {
  if (typeof value === "undefined" || value === null) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function normalizePositiveInt(value, fallback = 1) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

function normalizeOptionalId(value) {
  if (typeof value === "undefined" || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return undefined;
  }

  return parsed;
}

function toSafeSeo(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value;
}

function toSafeString(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function resolveImageUrlFromSeo(seo) {
  const safeSeo = toSafeSeo(seo);
  const openGraph =
    safeSeo.openGraph && typeof safeSeo.openGraph === "object" && !Array.isArray(safeSeo.openGraph)
      ? safeSeo.openGraph
      : {};

  return (
    toSafeString(safeSeo.imageUrl) ||
    toSafeString(safeSeo.image) ||
    toSafeString(safeSeo.thumbnail) ||
    toSafeString(safeSeo.thumbnailUrl) ||
    toSafeString(safeSeo.coverImage) ||
    toSafeString(safeSeo.cover_image) ||
    toSafeString(safeSeo.ogImage) ||
    toSafeString(openGraph.image) ||
    ""
  );
}

function mapRow(row) {
  const safeSeo = toSafeSeo(row.seo);
  const directImageUrl = toSafeString(row.image_url);

  return {
    id: row.id,
    slug: row.slug,
    type: row.bulletin_type,
    bulletinType: row.bulletin_type,
    categoryId: row.category_id || null,
    title: row.title,
    name: row.name,
    excerpt: row.excerpt,
    descriptionShort: row.description_short,
    content: row.content,
    status: row.status,
    sortOrder: row.sort_order,
    isFeatured: row.is_featured,
    isVisible: row.is_visible,
    publishedAt: toIsoString(row.published_at),
    imageUrl: directImageUrl || resolveImageUrlFromSeo(safeSeo),
    titleSeo: row.title_seo,
    keywords: row.keywords,
    metaDescription: row.meta_description,
    seo: safeSeo,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

const BULLETIN_SELECT_COLUMNS = `
  id,
  slug,
  bulletin_type,
  category_id,
  title,
  name,
  excerpt,
  description_short,
  content,
  image_url,
  status,
  title_seo,
  keywords,
  meta_description,
  sort_order,
  is_featured,
  is_visible,
  published_at,
  seo,
  created_at,
  updated_at
`;

class BulletinModel {
  getTypes() {
    return Object.entries(BULLETIN_TYPE_NAMES).map(([slug, name], index) => ({
      id: index + 1,
      slug,
      name,
    }));
  }

  async listTypeStats() {
    const result = await getPool().query(`
      SELECT bulletin_type, COUNT(*)::int AS article_count
      FROM bulletins
      WHERE status = 'published' AND is_visible = TRUE
      GROUP BY bulletin_type
    `);

    const countByType = new Map(
      result.rows.map((row) => [row.bulletin_type, row.article_count])
    );

    return this.getTypes().map((type) => ({
      ...type,
      articleCount: countByType.get(type.slug) || 0,
    }));
  }

  async list(filters = {}, { publicOnly = false } = {}) {
    const safeLimit = Math.min(Math.max(Number(filters.limit) || 12, 1), 100);
    const safePage = Math.max(Number(filters.page) || 1, 1);
    const offset = (safePage - 1) * safeLimit;

    const keyword = normalizeText(filters.keyword);
    const type = normalizeBulletinType(filters.type || filters.category);
    const status = normalizeStatus(filters.status);

    const whereClauses = [];
    const params = [];

    if (keyword.length > 0) {
      params.push(`%${keyword}%`);
      whereClauses.push(
        `(
          LOWER(title) LIKE $${params.length}
          OR LOWER(name) LIKE $${params.length}
          OR LOWER(excerpt) LIKE $${params.length}
          OR LOWER(description_short) LIKE $${params.length}
          OR LOWER(content) LIKE $${params.length}
          OR LOWER(slug) LIKE $${params.length}
        )`
      );
    }

    if (type) {
      params.push(type);
      whereClauses.push(`LOWER(bulletin_type) = $${params.length}`);
    }

    const categoryId = normalizeOptionalId(filters.categoryId || filters.category_id);
    if (typeof categoryId === "undefined") {
      throw new Error("Invalid categoryId");
    }
    if (categoryId !== null) {
      params.push(categoryId);
      whereClauses.push(`category_id = $${params.length}`);
    }

    if (publicOnly) {
      whereClauses.push("LOWER(status) = 'published'");
      whereClauses.push("is_visible = TRUE");
    } else {
      if (status) {
        params.push(status);
        whereClauses.push(`LOWER(status) = $${params.length}`);
      }

      if (typeof filters.isVisible !== "undefined" || typeof filters.is_visible !== "undefined") {
        params.push(normalizeBoolean(filters.isVisible ?? filters.is_visible, true));
        whereClauses.push(`is_visible = $${params.length}`);
      }

      if (typeof filters.isFeatured !== "undefined" || typeof filters.is_featured !== "undefined") {
        params.push(normalizeBoolean(filters.isFeatured ?? filters.is_featured, false));
        whereClauses.push(`is_featured = $${params.length}`);
      }
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countResult = await getPool().query(
      `SELECT COUNT(*)::int AS total FROM bulletins ${whereSql}`,
      params
    );
    const totalItems = countResult.rows[0]?.total || 0;

    const listResult = await getPool().query(
      `
      SELECT
        ${BULLETIN_SELECT_COLUMNS}
      FROM bulletins
      ${whereSql}
      ORDER BY sort_order ASC, published_at DESC, id DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
      `,
      [...params, safeLimit, offset]
    );

    return {
      items: listResult.rows.map(mapRow),
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / safeLimit),
      },
    };
  }

  async findById(id) {
    const safeId = Number(id);
    if (!Number.isFinite(safeId)) {
      return null;
    }

    const result = await getPool().query(
      `
      SELECT
        ${BULLETIN_SELECT_COLUMNS}
      FROM bulletins
      WHERE id = $1
      LIMIT 1
      `,
      [safeId]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return mapRow(result.rows[0]);
  }

  async findByIdOrSlug(value, { publicOnly = false } = {}) {
    const asNumber = Number(value);
    const numericValue = Number.isFinite(asNumber) ? asNumber : -1;
    const conditions = ["(id = $1 OR slug = $2)"];

    if (publicOnly) {
      conditions.push("LOWER(status) = 'published'");
      conditions.push("is_visible = TRUE");
    }

    const result = await getPool().query(
      `
      SELECT
        ${BULLETIN_SELECT_COLUMNS}
      FROM bulletins
      WHERE ${conditions.join(" AND ")}
      LIMIT 1
      `,
      [numericValue, String(value || "")]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return mapRow(result.rows[0]);
  }

  async create(payload) {
    const title = String(payload?.title || "").trim();
    if (!title) {
      throw new Error("Missing title");
    }

    const type = normalizeBulletinType(payload?.type || payload?.bulletinType);
    if (!type) {
      throw new Error("Invalid bulletin type");
    }

    const status = normalizeStatus(payload?.status) || "published";
    const slug = slugify(payload?.slug || title);
    if (!slug) {
      throw new Error("Missing slug");
    }

    const categoryId = normalizeOptionalId(payload?.categoryId ?? payload?.category_id);
    if (typeof categoryId === "undefined") {
      throw new Error("Invalid categoryId");
    }

    const excerpt = String(payload?.excerpt || "").trim();
    const descriptionShort = String(payload?.descriptionShort || payload?.description_short || excerpt).trim();
    const name = String(payload?.name || title).trim();

    const publishedAt = payload?.publishedAt || new Date().toISOString();
    const seo = toSafeSeo(payload?.seo);
    const imageUrl = toSafeString(payload?.imageUrl || payload?.image_url) || resolveImageUrlFromSeo(seo);

    const titleSeo = String(payload?.titleSeo || payload?.title_seo || seo.title || title).trim();
    const keywords = String(payload?.keywords || seo.keywords || "").trim();
    const metaDescription = String(
      payload?.metaDescription || payload?.meta_description || seo.description || descriptionShort || excerpt
    ).trim();
    const sortOrder = normalizePositiveInt(payload?.sortOrder ?? payload?.sort_order, 1);
    const isVisible = normalizeBoolean(payload?.isVisible ?? payload?.is_visible, true);
    const rawIsFeatured = normalizeBoolean(payload?.isFeatured ?? payload?.is_featured, false);
    const isFeatured = isVisible ? rawIsFeatured : false;

    const result = await getPool().query(
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
        image_url,
        status,
        title_seo,
        keywords,
        meta_description,
        sort_order,
        is_featured,
        is_visible,
        published_at,
        seo,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16,
        $17::timestamptz, $18::jsonb, NOW(), NOW()
      )
      RETURNING
        ${BULLETIN_SELECT_COLUMNS}
      `,
      [
        slug,
        type,
        categoryId,
        title,
        name,
        excerpt,
        descriptionShort,
        String(payload?.content || "").trim(),
        imageUrl,
        status,
        titleSeo,
        keywords,
        metaDescription,
        sortOrder,
        isFeatured,
        isVisible,
        publishedAt,
        JSON.stringify(seo),
      ]
    );

    return mapRow(result.rows[0]);
  }

  async update(id, payload) {
    const current = await this.findById(id);
    if (!current) {
      return null;
    }

    const nextTitle =
      typeof payload?.title === "undefined"
        ? current.title
        : String(payload.title || "").trim();
    if (!nextTitle) {
      throw new Error("Missing title");
    }

    const nextType =
      typeof payload?.type === "undefined" && typeof payload?.bulletinType === "undefined"
        ? current.type
        : normalizeBulletinType(payload?.type || payload?.bulletinType);
    if (!nextType) {
      throw new Error("Invalid bulletin type");
    }

    const nextStatus =
      typeof payload?.status === "undefined"
        ? current.status
        : normalizeStatus(payload.status);
    if (!nextStatus) {
      throw new Error("Invalid status");
    }

    const nextSlug =
      typeof payload?.slug === "undefined"
        ? current.slug
        : slugify(String(payload.slug || "").trim());
    if (!nextSlug) {
      throw new Error("Missing slug");
    }

    const nextCategoryId =
      typeof payload?.categoryId === "undefined" && typeof payload?.category_id === "undefined"
        ? current.categoryId
        : normalizeOptionalId(payload?.categoryId ?? payload?.category_id);
    if (typeof nextCategoryId === "undefined") {
      throw new Error("Invalid categoryId");
    }

    const nextExcerpt =
      typeof payload?.excerpt === "undefined"
        ? current.excerpt
        : String(payload.excerpt || "").trim();
    const nextDescriptionShort =
      typeof payload?.descriptionShort === "undefined" && typeof payload?.description_short === "undefined"
        ? current.descriptionShort
        : String(payload?.descriptionShort || payload?.description_short || "").trim();
    const nextContent =
      typeof payload?.content === "undefined"
        ? current.content
        : String(payload.content || "").trim();
    const nextName =
      typeof payload?.name === "undefined"
        ? current.name
        : String(payload.name || "").trim();
    const nextImageUrl =
      typeof payload?.imageUrl === "undefined" && typeof payload?.image_url === "undefined"
        ? current.imageUrl
        : toSafeString(payload?.imageUrl || payload?.image_url);
    const nextPublishedAt =
      typeof payload?.publishedAt === "undefined"
        ? current.publishedAt
        : payload.publishedAt || new Date().toISOString();
    const nextSeo =
      typeof payload?.seo === "undefined" ? current.seo : toSafeSeo(payload.seo);

    const nextTitleSeo =
      typeof payload?.titleSeo === "undefined" && typeof payload?.title_seo === "undefined"
        ? current.titleSeo
        : String(payload?.titleSeo || payload?.title_seo || "").trim();
    const nextKeywords =
      typeof payload?.keywords === "undefined"
        ? current.keywords
        : String(payload.keywords || "").trim();
    const nextMetaDescription =
      typeof payload?.metaDescription === "undefined" && typeof payload?.meta_description === "undefined"
        ? current.metaDescription
        : String(payload?.metaDescription || payload?.meta_description || "").trim();
    const nextSortOrder =
      typeof payload?.sortOrder === "undefined" && typeof payload?.sort_order === "undefined"
        ? current.sortOrder
        : normalizePositiveInt(payload?.sortOrder ?? payload?.sort_order, current.sortOrder);
    const nextIsVisible =
      typeof payload?.isVisible === "undefined" && typeof payload?.is_visible === "undefined"
        ? current.isVisible
        : normalizeBoolean(payload?.isVisible ?? payload?.is_visible, current.isVisible);
    const rawNextIsFeatured =
      typeof payload?.isFeatured === "undefined" && typeof payload?.is_featured === "undefined"
        ? current.isFeatured
        : normalizeBoolean(payload?.isFeatured ?? payload?.is_featured, current.isFeatured);
    const nextIsFeatured = nextIsVisible ? rawNextIsFeatured : false;

    const result = await getPool().query(
      `
      UPDATE bulletins
      SET
        slug = $2,
        bulletin_type = $3,
        category_id = $4,
        title = $5,
        name = $6,
        excerpt = $7,
        description_short = $8,
        content = $9,
        image_url = $10,
        status = $11,
        title_seo = $12,
        keywords = $13,
        meta_description = $14,
        sort_order = $15,
        is_featured = $16,
        is_visible = $17,
        published_at = $18::timestamptz,
        seo = $19::jsonb,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        ${BULLETIN_SELECT_COLUMNS}
      `,
      [
        Number(id),
        nextSlug,
        nextType,
        nextCategoryId,
        nextTitle,
        nextName,
        nextExcerpt,
        nextDescriptionShort,
        nextContent,
        nextImageUrl,
        nextStatus,
        nextTitleSeo,
        nextKeywords,
        nextMetaDescription,
        nextSortOrder,
        nextIsFeatured,
        nextIsVisible,
        nextPublishedAt,
        JSON.stringify(nextSeo),
      ]
    );

    return mapRow(result.rows[0]);
  }

  async remove(id) {
    const safeId = Number(id);
    if (!Number.isFinite(safeId)) {
      return false;
    }

    const result = await getPool().query("DELETE FROM bulletins WHERE id = $1", [safeId]);
    return result.rowCount > 0;
  }
}

module.exports = new BulletinModel();
