const { getPool } = require("../config/db");

function mapRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    description: row.description,
    parentId: row.parent_id || null,
    parentSlug: row.parent_slug || null,
    titleSeo: row.title_seo,
    keywords: row.keywords,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    isVisible: row.is_visible,
    adminLevel: row.admin_level,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class VehicleCategoryModel {
  async list() {
    const result = await getPool().query(
      `
      SELECT
        vc.id,
        vc.slug,
        vc.name,
        vc.type,
        vc.description,
        vc.parent_id,
        pvc.slug AS parent_slug,
        vc.title_seo,
        vc.keywords,
        vc.image_url,
        vc.sort_order,
        vc.is_visible,
        vc.admin_level,
        vc.admin_note,
        vc.created_at,
        vc.updated_at
      FROM vehicle_categories vc
      LEFT JOIN vehicle_categories pvc ON pvc.id = vc.parent_id
      ORDER BY vc.sort_order ASC, vc.id ASC
      `
    );

    return result.rows.map(mapRow);
  }

  async getSlugToIdMap(client) {
    const result = await client.query("SELECT id, slug FROM vehicle_categories");
    const map = new Map();
    for (const row of result.rows) {
      map.set(row.slug, Number(row.id));
    }
    return map;
  }

  resolveParentId(item, slugToIdMap) {
    const parsedParentId = Number(item.parentId);
    if (Number.isFinite(parsedParentId) && parsedParentId > 0) {
      return parsedParentId;
    }

    const parentSlug = String(item.parentSlug || "").trim().toLowerCase();
    if (!parentSlug) {
      return null;
    }

    if (!slugToIdMap.has(parentSlug)) {
      return undefined;
    }

    return slugToIdMap.get(parentSlug);
  }

  async upsertMany(items) {
    const client = await getPool().connect();
    const createdOrUpdated = [];

    try {
      await client.query("BEGIN");

      const slugToIdMap = await this.getSlugToIdMap(client);
      const pending = [...items];
      let hasProgress = true;

      while (pending.length > 0 && hasProgress) {
        hasProgress = false;
        const nextPending = [];

        for (const item of pending) {
          const parentId = this.resolveParentId(item, slugToIdMap);
          if (typeof parentId === "undefined") {
            nextPending.push(item);
            continue;
          }

          if (parentId && slugToIdMap.get(item.slug) === parentId) {
            throw new Error(`Category '${item.slug}' cannot be its own parent`);
          }

          const result = await client.query(
            `
            INSERT INTO vehicle_categories (
              slug,
              name,
              type,
              description,
              parent_id,
              title_seo,
              keywords,
              image_url,
              sort_order,
              is_visible,
              admin_level,
              admin_note,
              created_at,
              updated_at
            )
            VALUES (
              $1, $2, $3, $4, $5,
              $6, $7, $8, $9, $10, $11, $12,
              NOW(), NOW()
            )
            ON CONFLICT (slug) DO UPDATE SET
              name = EXCLUDED.name,
              type = EXCLUDED.type,
              description = EXCLUDED.description,
              parent_id = EXCLUDED.parent_id,
              title_seo = EXCLUDED.title_seo,
              keywords = EXCLUDED.keywords,
              image_url = EXCLUDED.image_url,
              sort_order = EXCLUDED.sort_order,
              is_visible = EXCLUDED.is_visible,
              admin_level = EXCLUDED.admin_level,
              admin_note = EXCLUDED.admin_note,
              updated_at = NOW()
            RETURNING id, slug
            `,
            [
              item.slug,
              item.name,
              item.type,
              item.description,
              parentId,
              item.titleSeo,
              item.keywords,
              item.imageUrl,
              item.sortOrder,
              item.isVisible,
              item.adminLevel,
              item.adminNote,
            ]
          );

          const id = Number(result.rows[0].id);
          slugToIdMap.set(item.slug, id);
          createdOrUpdated.push(item.slug);
          hasProgress = true;
        }

        pending.splice(0, pending.length, ...nextPending);
      }

      if (pending.length > 0) {
        throw new Error(
          `Cannot resolve parent for category slug(s): ${pending
            .map((item) => item.slug)
            .join(", ")}`
        );
      }

      const refreshed = await client.query(
        `
        SELECT
          vc.id,
          vc.slug,
          vc.name,
          vc.type,
          vc.description,
          vc.parent_id,
          pvc.slug AS parent_slug,
          vc.title_seo,
          vc.keywords,
          vc.image_url,
          vc.sort_order,
          vc.is_visible,
          vc.admin_level,
          vc.admin_note,
          vc.created_at,
          vc.updated_at
        FROM vehicle_categories vc
        LEFT JOIN vehicle_categories pvc ON pvc.id = vc.parent_id
        WHERE vc.slug = ANY($1::text[])
        ORDER BY vc.sort_order ASC, vc.id ASC
        `,
        [createdOrUpdated]
      );

      await client.query("COMMIT");
      return refreshed.rows.map(mapRow);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async listTree() {
    const categories = await this.list();
    const byId = new Map();
    const roots = [];

    for (const category of categories) {
      byId.set(category.id, {
        ...category,
        children: [],
      });
    }

    for (const category of byId.values()) {
      if (category.parentId && byId.has(category.parentId)) {
        byId.get(category.parentId).children.push(category);
      } else {
        roots.push(category);
      }
    }

    return roots;
  }
}

module.exports = new VehicleCategoryModel();
