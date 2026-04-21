const { getPool } = require("../config/db");
const { normalizeText } = require("../utils/request");

const BULLETIN_TYPE_NAMES = {
  news_event: "Tin tuc - Su kien",
  promotion: "Khuyen mai",
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

function mapRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    type: row.bulletin_type,
    bulletinType: row.bulletin_type,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    status: row.status,
    publishedAt: toIsoString(row.published_at),
    seo: row.seo || {},
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function toSafeSeo(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value;
}

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
      WHERE status = 'published'
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
        `(LOWER(title) LIKE $${params.length} OR LOWER(excerpt) LIKE $${params.length} OR LOWER(content) LIKE $${params.length} OR LOWER(slug) LIKE $${params.length})`
      );
    }

    if (type) {
      params.push(type);
      whereClauses.push(`LOWER(bulletin_type) = $${params.length}`);
    }

    if (publicOnly) {
      whereClauses.push(`LOWER(status) = 'published'`);
    } else if (status) {
      params.push(status);
      whereClauses.push(`LOWER(status) = $${params.length}`);
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
        id, slug, bulletin_type, title, excerpt, content, status,
        published_at, seo, created_at, updated_at
      FROM bulletins
      ${whereSql}
      ORDER BY published_at DESC, id DESC
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
        id, slug, bulletin_type, title, excerpt, content, status,
        published_at, seo, created_at, updated_at
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
      conditions.push(`LOWER(status) = 'published'`);
    }

    const result = await getPool().query(
      `
      SELECT
        id, slug, bulletin_type, title, excerpt, content, status,
        published_at, seo, created_at, updated_at
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

    const publishedAt = payload?.publishedAt || new Date().toISOString();

    const result = await getPool().query(
      `
      INSERT INTO bulletins (
        slug, bulletin_type, title, excerpt, content, status,
        published_at, seo, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz, $8::jsonb, NOW(), NOW())
      RETURNING
        id, slug, bulletin_type, title, excerpt, content, status,
        published_at, seo, created_at, updated_at
      `,
      [
        slug,
        type,
        title,
        String(payload?.excerpt || "").trim(),
        String(payload?.content || "").trim(),
        status,
        publishedAt,
        JSON.stringify(toSafeSeo(payload?.seo)),
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

    const nextExcerpt =
      typeof payload?.excerpt === "undefined"
        ? current.excerpt
        : String(payload.excerpt || "").trim();
    const nextContent =
      typeof payload?.content === "undefined"
        ? current.content
        : String(payload.content || "").trim();
    const nextPublishedAt =
      typeof payload?.publishedAt === "undefined"
        ? current.publishedAt
        : payload.publishedAt || new Date().toISOString();
    const nextSeo =
      typeof payload?.seo === "undefined" ? current.seo : toSafeSeo(payload.seo);

    const result = await getPool().query(
      `
      UPDATE bulletins
      SET
        slug = $2,
        bulletin_type = $3,
        title = $4,
        excerpt = $5,
        content = $6,
        status = $7,
        published_at = $8::timestamptz,
        seo = $9::jsonb,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id, slug, bulletin_type, title, excerpt, content, status,
        published_at, seo, created_at, updated_at
      `,
      [
        Number(id),
        nextSlug,
        nextType,
        nextTitle,
        nextExcerpt,
        nextContent,
        nextStatus,
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
