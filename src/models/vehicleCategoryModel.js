const { getPool } = require("../config/db");

function mapLevel1Row(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: "product-list",
    description: row.description,
    parentId: null,
    parentSlug: null,
    titleSeo: row.title_seo,
    keywords: row.keywords,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    isVisible: row.is_visible,
    adminLevel: 1,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapLevel2Row(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: "product-list",
    description: row.description,
    parentId: row.category_level_1_id,
    parentSlug: row.parent_slug || null,
    titleSeo: row.title_seo,
    keywords: row.keywords,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    isVisible: row.is_visible,
    adminLevel: 2,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class VehicleCategoryModel {
  async list() {
    const level1Result = await getPool().query(
      `
      SELECT
        id,
        slug,
        name,
        description,
        title_seo,
        keywords,
        image_url,
        sort_order,
        is_visible,
        admin_note,
        created_at,
        updated_at
      FROM category_level_1
      ORDER BY sort_order ASC, id ASC
      `
    );

    const level2Result = await getPool().query(
      `
      SELECT
        c2.id,
        c2.slug,
        c2.name,
        c2.description,
        c2.category_level_1_id,
        c1.slug AS parent_slug,
        c2.title_seo,
        c2.keywords,
        c2.image_url,
        c2.sort_order,
        c2.is_visible,
        c2.admin_note,
        c2.created_at,
        c2.updated_at
      FROM category_level_2 c2
      JOIN category_level_1 c1 ON c1.id = c2.category_level_1_id
      ORDER BY c2.sort_order ASC, c2.id ASC
      `
    );

    return [...level1Result.rows.map(mapLevel1Row), ...level2Result.rows.map(mapLevel2Row)];
  }

  async getLevel1SlugToIdMap(client) {
    const result = await client.query("SELECT id, slug FROM category_level_1");
    const map = new Map();
    for (const row of result.rows) {
      map.set(row.slug, Number(row.id));
    }
    return map;
  }

  resolveParentLevel1Id(item, level1SlugToIdMap) {
    const parsedParentId = Number(item.parentId);
    if (Number.isFinite(parsedParentId) && parsedParentId > 0) {
      return parsedParentId;
    }

    const parentSlug = String(item.parentSlug || "").trim().toLowerCase();
    if (!parentSlug) {
      return undefined;
    }

    if (!level1SlugToIdMap.has(parentSlug)) {
      return undefined;
    }

    return level1SlugToIdMap.get(parentSlug);
  }

  async upsertMany(items) {
    const client = await getPool().connect();

    try {
      await client.query("BEGIN");

      const normalized = Array.isArray(items) ? items : [];
      const level1Items = normalized.filter((item) => Number(item.adminLevel) === 1);
      const level2Items = normalized.filter((item) => Number(item.adminLevel) === 2);

      for (const item of level1Items) {
        await client.query(
          `
          INSERT INTO category_level_1 (
            slug,
            name,
            description,
            title_seo,
            keywords,
            image_url,
            sort_order,
            is_visible,
            admin_note,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
          ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            title_seo = EXCLUDED.title_seo,
            keywords = EXCLUDED.keywords,
            image_url = EXCLUDED.image_url,
            sort_order = EXCLUDED.sort_order,
            is_visible = EXCLUDED.is_visible,
            admin_note = EXCLUDED.admin_note,
            updated_at = NOW()
          `,
          [
            item.slug,
            item.name,
            item.description,
            item.titleSeo,
            item.keywords,
            item.imageUrl,
            item.sortOrder,
            item.isVisible,
            item.adminNote,
          ]
        );
      }

      const level1SlugToIdMap = await this.getLevel1SlugToIdMap(client);

      for (const item of level2Items) {
        const parentLevel1Id = this.resolveParentLevel1Id(item, level1SlugToIdMap);
        if (!parentLevel1Id) {
          throw new Error(`Cannot resolve level 1 parent for category '${item.slug}'`);
        }

        await client.query(
          `
          INSERT INTO category_level_2 (
            category_level_1_id,
            slug,
            name,
            description,
            title_seo,
            keywords,
            image_url,
            sort_order,
            is_visible,
            admin_note,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
          ON CONFLICT (slug) DO UPDATE SET
            category_level_1_id = EXCLUDED.category_level_1_id,
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            title_seo = EXCLUDED.title_seo,
            keywords = EXCLUDED.keywords,
            image_url = EXCLUDED.image_url,
            sort_order = EXCLUDED.sort_order,
            is_visible = EXCLUDED.is_visible,
            admin_note = EXCLUDED.admin_note,
            updated_at = NOW()
          `,
          [
            parentLevel1Id,
            item.slug,
            item.name,
            item.description,
            item.titleSeo,
            item.keywords,
            item.imageUrl,
            item.sortOrder,
            item.isVisible,
            item.adminNote,
          ]
        );
      }

      await client.query("COMMIT");
      return this.list();
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async listTree() {
    const level1Result = await getPool().query(
      `
      SELECT
        id, slug, name, description, title_seo, keywords,
        image_url, sort_order, is_visible, admin_note, created_at, updated_at
      FROM category_level_1
      ORDER BY sort_order ASC, id ASC
      `
    );

    const level2Result = await getPool().query(
      `
      SELECT
        c2.id,
        c2.slug,
        c2.name,
        c2.description,
        c2.category_level_1_id,
        c1.slug AS parent_slug,
        c2.title_seo,
        c2.keywords,
        c2.image_url,
        c2.sort_order,
        c2.is_visible,
        c2.admin_note,
        c2.created_at,
        c2.updated_at
      FROM category_level_2 c2
      JOIN category_level_1 c1 ON c1.id = c2.category_level_1_id
      ORDER BY c2.sort_order ASC, c2.id ASC
      `
    );

    const byId = new Map();
    const roots = [];

    for (const row of level1Result.rows) {
      const item = {
        ...mapLevel1Row(row),
        children: [],
      };
      byId.set(item.id, item);
      roots.push(item);
    }

    for (const row of level2Result.rows) {
      const item = {
        ...mapLevel2Row(row),
        children: [],
      };
      if (byId.has(item.parentId)) {
        byId.get(item.parentId).children.push(item);
      }
    }

    return roots;
  }
}

module.exports = new VehicleCategoryModel();
