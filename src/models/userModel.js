const { getPool } = require("../config/db");

function mapUserRow(row) {
  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
  };
}

class UserModel {
  async list({ page = 1, limit = 20, search = "" } = {}) {
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const offset = (safePage - 1) * safeLimit;
    const keyword = String(search || "").trim().toLowerCase();

    const whereSql = keyword
      ? `WHERE LOWER(username) LIKE $1 OR LOWER(full_name) LIKE $1 OR LOWER(email) LIKE $1`
      : "";
    const whereParams = keyword ? [`%${keyword}%`] : [];

    const countResult = await getPool().query(
      `SELECT COUNT(*)::int AS total FROM users ${whereSql}`,
      whereParams
    );
    const totalItems = countResult.rows[0]?.total || 0;

    const listParams = [...whereParams, safeLimit, offset];
    const itemsResult = await getPool().query(
      `
      SELECT id, username, full_name, email, phone, role, status, created_at
      FROM users
      ${whereSql}
      ORDER BY id ASC
      LIMIT $${whereParams.length + 1}
      OFFSET $${whereParams.length + 2}
      `,
      listParams
    );

    return {
      items: itemsResult.rows.map(mapUserRow),
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages: Math.ceil(totalItems / safeLimit),
      },
    };
  }

  async findById(id) {
    const parsedId = Number(id);
    if (!Number.isFinite(parsedId)) {
      return null;
    }

    const result = await getPool().query(
      `
      SELECT id, username, full_name, email, phone, role, status, created_at
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [parsedId]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return mapUserRow(result.rows[0]);
  }
}

module.exports = new UserModel();
