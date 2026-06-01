const { getPool } = require("../config/db");

function mapRow(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    content: row.content,
    vehicleId: row.vehicle_id,
    status: row.status,
    isViewed: row.is_viewed,
    contactedAt: row.contacted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class ContactRequestModel {
  async create(payload) {
    const rawVehicleId = payload.vehicleId;
    const safeVehicleId =
      rawVehicleId === null || rawVehicleId === undefined || rawVehicleId === ""
        ? null
        : Number.isFinite(Number(rawVehicleId))
          ? Number(rawVehicleId)
          : null;

    const result = await getPool().query(
      `
      INSERT INTO contact_requests (
        full_name, email, phone, content, vehicle_id, status, is_viewed, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, 'new', FALSE, NOW(), NOW())
      RETURNING
        id, full_name, email, phone, content, vehicle_id, status,
        is_viewed, contacted_at, created_at, updated_at
      `,
      [
        payload.fullName,
        payload.email || "",
        payload.phone,
        payload.content || "",
        safeVehicleId,
      ]
    );

    return mapRow(result.rows[0]);
  }

  async list({ page = 1, limit = 20, status = "" } = {}) {
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const offset = (safePage - 1) * safeLimit;
    const normalizedStatus = String(status || "").trim().toLowerCase();

    const whereSql = normalizedStatus ? "WHERE LOWER(status) = $1" : "";
    const whereParams = normalizedStatus ? [normalizedStatus] : [];

    const countResult = await getPool().query(
      `SELECT COUNT(*)::int AS total FROM contact_requests ${whereSql}`,
      whereParams
    );
    const totalItems = countResult.rows[0]?.total || 0;

    const unviewedCountResult = await getPool().query(
      `SELECT COUNT(*)::int AS total FROM contact_requests WHERE is_viewed = FALSE`
    );
    const unviewedCount = unviewedCountResult.rows[0]?.total || 0;

    const result = await getPool().query(
      `
      SELECT
        id, full_name, email, phone, content, vehicle_id, status,
        is_viewed, contacted_at, created_at, updated_at
      FROM contact_requests
      ${whereSql}
      ORDER BY id DESC
      LIMIT $${whereParams.length + 1}
      OFFSET $${whereParams.length + 2}
      `,
      [...whereParams, safeLimit, offset]
    );

    return {
      items: result.rows.map(mapRow),
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages: Math.ceil(totalItems / safeLimit),
      },
      summary: {
        unviewedCount,
      },
    };
  }

  async getSummary() {
    const result = await getPool().query(
      `
      SELECT COUNT(*)::int AS unviewed_count
      FROM contact_requests
      WHERE is_viewed = FALSE
      `
    );

    return {
      unviewedCount: result.rows[0]?.unviewed_count || 0,
    };
  }

  async markViewed() {
    const result = await getPool().query(
      `
      UPDATE contact_requests
      SET is_viewed = TRUE, updated_at = NOW()
      WHERE is_viewed = FALSE
      RETURNING id
      `
    );

    return {
      updatedCount: result.rowCount || 0,
    };
  }

  async markViewedById(id) {
    const safeId = Number(id);
    if (!Number.isFinite(safeId)) {
      return null;
    }

    const result = await getPool().query(
      `
      UPDATE contact_requests
      SET is_viewed = TRUE, updated_at = NOW()
      WHERE id = $1
      RETURNING
        id, full_name, email, phone, content, vehicle_id, status,
        is_viewed, contacted_at, created_at, updated_at
      `,
      [safeId]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return mapRow(result.rows[0]);
  }

  async updateStatus(id, status) {
    const safeId = Number(id);
    if (!Number.isFinite(safeId)) {
      return null;
    }

    const normalizedStatus = String(status || "").trim().toLowerCase();

    const result = await getPool().query(
      `
      UPDATE contact_requests
      SET
        status = $2::text,
        contacted_at = CASE
          WHEN $2::text = 'contacted' AND contacted_at IS NULL THEN NOW()::timestamptz
          ELSE contacted_at
        END::timestamptz,
        is_viewed = TRUE,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id, full_name, email, phone, content, vehicle_id, status,
        is_viewed, contacted_at, created_at, updated_at
      `,
      [safeId, normalizedStatus]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return mapRow(result.rows[0]);
  }
}

module.exports = new ContactRequestModel();
