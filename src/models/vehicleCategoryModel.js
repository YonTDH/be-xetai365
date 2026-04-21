const { getPool } = require("../config/db");

function mapRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class VehicleCategoryModel {
  async list() {
    const result = await getPool().query(
      `
      SELECT id, slug, name, type, description, created_at, updated_at
      FROM vehicle_categories
      ORDER BY id ASC
      `
    );

    return result.rows.map(mapRow);
  }

  async upsertMany(items) {
    const client = await getPool().connect();
    const createdOrUpdated = [];

    try {
      await client.query("BEGIN");

      for (const item of items) {
        const result = await client.query(
          `
          INSERT INTO vehicle_categories (slug, name, type, description, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            type = EXCLUDED.type,
            description = EXCLUDED.description,
            updated_at = NOW()
          RETURNING id, slug, name, type, description, created_at, updated_at
          `,
          [item.slug, item.name, item.type, item.description]
        );

        createdOrUpdated.push(mapRow(result.rows[0]));
      }

      await client.query("COMMIT");
      return createdOrUpdated;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new VehicleCategoryModel();
