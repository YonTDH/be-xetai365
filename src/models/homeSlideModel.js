const { getPool } = require("../config/db");

function toBoolean(value, fallback = true) {
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

function toInt(value, fallback = 1) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : fallback;
}

function toSafeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    imageUrl: row.image_url,
    linkUrl: row.link_url,
    sortOrder: row.sort_order,
    isVisible: row.is_visible,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class HomeSlideModel {
  async list({ publicOnly = false } = {}) {
    const where = publicOnly ? "WHERE is_visible = TRUE" : "";
    const result = await getPool().query(`
      SELECT id, title, image_url, link_url, sort_order, is_visible, created_at, updated_at
      FROM home_slides
      ${where}
      ORDER BY sort_order ASC, id ASC
    `);

    return result.rows.map(mapRow);
  }

  async findById(id) {
    const result = await getPool().query(
      `
      SELECT id, title, image_url, link_url, sort_order, is_visible, created_at, updated_at
      FROM home_slides
      WHERE id = $1
      LIMIT 1
      `,
      [Number(id)]
    );

    return result.rowCount ? mapRow(result.rows[0]) : null;
  }

  async create(payload = {}) {
    const imageUrl = toSafeString(payload.imageUrl || payload.image_url);
    if (!imageUrl) {
      throw new Error("Missing slide image URL");
    }

    const result = await getPool().query(
      `
      INSERT INTO home_slides (title, image_url, link_url, sort_order, is_visible)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, image_url, link_url, sort_order, is_visible, created_at, updated_at
      `,
      [
        toSafeString(payload.title),
        imageUrl,
        toSafeString(payload.linkUrl || payload.link_url),
        toInt(payload.sortOrder || payload.sort_order, 1),
        toBoolean(payload.isVisible ?? payload.is_visible, true),
      ]
    );

    return mapRow(result.rows[0]);
  }

  async update(id, payload = {}) {
    const current = await this.findById(id);
    if (!current) {
      return null;
    }

    const result = await getPool().query(
      `
      UPDATE home_slides
      SET
        title = $2,
        image_url = $3,
        link_url = $4,
        sort_order = $5,
        is_visible = $6,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, title, image_url, link_url, sort_order, is_visible, created_at, updated_at
      `,
      [
        Number(id),
        toSafeString(payload.title ?? current.title),
        toSafeString(payload.imageUrl || payload.image_url || current.imageUrl),
        toSafeString(payload.linkUrl ?? payload.link_url ?? current.linkUrl),
        toInt(payload.sortOrder ?? payload.sort_order, current.sortOrder),
        toBoolean(payload.isVisible ?? payload.is_visible, current.isVisible),
      ]
    );

    return mapRow(result.rows[0]);
  }

  async remove(id) {
    const result = await getPool().query(
      `
      DELETE FROM home_slides
      WHERE id = $1
      RETURNING id, title
      `,
      [Number(id)]
    );

    return result.rowCount ? result.rows[0] : null;
  }
}

module.exports = new HomeSlideModel();
