const { getPool } = require("../config/db");

function mapRow(row) {
  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    status: row.status,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class AdminUserModel {
  async findByUsername(username) {
    const normalized = String(username || "").trim().toLowerCase();
    if (!normalized) {
      return null;
    }

    const result = await getPool().query(
      `
      SELECT
        id, username, password_hash, full_name, status,
        last_login_at, created_at, updated_at
      FROM admin_users
      WHERE LOWER(username) = $1
      LIMIT 1
      `,
      [normalized]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return {
      ...mapRow(result.rows[0]),
      passwordHash: result.rows[0].password_hash,
    };
  }

  async findById(id) {
    const safeId = Number(id);
    if (!Number.isFinite(safeId)) {
      return null;
    }

    const result = await getPool().query(
      `
      SELECT id, username, full_name, status, last_login_at, created_at, updated_at
      FROM admin_users
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

  async touchLastLogin(id) {
    const safeId = Number(id);
    if (!Number.isFinite(safeId)) {
      return;
    }

    await getPool().query(
      `
      UPDATE admin_users
      SET last_login_at = NOW(), updated_at = NOW()
      WHERE id = $1
      `,
      [safeId]
    );
  }
}

module.exports = new AdminUserModel();
