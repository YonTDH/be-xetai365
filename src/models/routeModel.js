const { getPool } = require("../config/db");

function mapRow(row) {
  return {
    path: row.path,
    type: row.type,
    target: row.target,
    resourceType: row.resource_type,
    resourceSlug: row.resource_slug || undefined,
  };
}

class RouteModel {
  async resolve(pathname) {
    const result = await getPool().query(
      `
      SELECT path, type, target, resource_type, resource_slug
      FROM legacy_routes
      WHERE path = $1
      LIMIT 1
      `,
      [pathname]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return mapRow(result.rows[0]);
  }

  async list() {
    const result = await getPool().query(
      `
      SELECT path, type, target, resource_type, resource_slug
      FROM legacy_routes
      ORDER BY id ASC
      `
    );

    return result.rows.map(mapRow);
  }
}

module.exports = new RouteModel();
