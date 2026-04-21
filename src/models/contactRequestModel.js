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
    contactedAt: row.contacted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class ContactRequestModel {
  async create(payload) {
    const vehicleId = Number(payload.vehicleId);
    const safeVehicleId = Number.isFinite(vehicleId) ? vehicleId : null;

    const result = await getPool().query(
      `
      INSERT INTO contact_requests (
        full_name, email, phone, content, vehicle_id, status, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, 'new', NOW(), NOW())
      RETURNING
        id, full_name, email, phone, content, vehicle_id, status,
        contacted_at, created_at, updated_at
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

    const result = await getPool().query(
      `
      SELECT
        id, full_name, email, phone, content, vehicle_id, status,
        contacted_at, created_at, updated_at
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
    };
  }
}

module.exports = new ContactRequestModel();
