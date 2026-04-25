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

  async getLevel1ById(id, client = getPool()) {
    const result = await client.query(
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
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (!result.rows.length) {
      return null;
    }

    return mapLevel1Row(result.rows[0]);
  }

  async getLevel2ById(id, client = getPool()) {
    const result = await client.query(
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
      WHERE c2.id = $1
      LIMIT 1
      `,
      [id]
    );

    if (!result.rows.length) {
      return null;
    }

    return mapLevel2Row(result.rows[0]);
  }

  async updateLevel1(id, payload) {
    const client = await getPool().connect();

    try {
      await client.query("BEGIN");

      const current = await this.getLevel1ById(id, client);
      if (!current) {
        throw new Error("Category level 1 not found");
      }

      const nextData = {
        slug: String(payload?.slug || current.slug).trim().toLowerCase(),
        name: String(payload?.name || current.name).trim(),
        description: typeof payload?.description === "undefined" ? current.description : String(payload.description || "").trim(),
        titleSeo: typeof payload?.titleSeo === "undefined" && typeof payload?.title_seo === "undefined"
          ? current.titleSeo
          : String(payload?.titleSeo || payload?.title_seo || "").trim(),
        keywords: typeof payload?.keywords === "undefined" ? current.keywords : String(payload.keywords || "").trim(),
        imageUrl: typeof payload?.imageUrl === "undefined" && typeof payload?.image_url === "undefined"
          ? current.imageUrl
          : String(payload?.imageUrl || payload?.image_url || "").trim(),
        sortOrder: typeof payload?.sortOrder === "undefined" && typeof payload?.sort_order === "undefined"
          ? current.sortOrder
          : Number(payload?.sortOrder ?? payload?.sort_order),
        isVisible:
          typeof payload?.isVisible === "undefined" && typeof payload?.is_visible === "undefined"
            ? current.isVisible
            : Boolean(payload?.isVisible ?? payload?.is_visible),
        adminNote: typeof payload?.adminNote === "undefined" && typeof payload?.admin_note === "undefined"
          ? current.adminNote
          : String(payload?.adminNote || payload?.admin_note || "").trim(),
      };

      if (!nextData.slug) {
        throw new Error("Missing slug");
      }

      if (!nextData.name) {
        throw new Error("Missing name");
      }

      if (!Number.isInteger(nextData.sortOrder) || nextData.sortOrder < 1) {
        throw new Error("Invalid sortOrder");
      }

      const result = await client.query(
        `
        UPDATE category_level_1
        SET
          slug = $2,
          name = $3,
          description = $4,
          title_seo = $5,
          keywords = $6,
          image_url = $7,
          sort_order = $8,
          is_visible = $9,
          admin_note = $10,
          updated_at = NOW()
        WHERE id = $1
        RETURNING
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
        `,
        [
          id,
          nextData.slug,
          nextData.name,
          nextData.description,
          nextData.titleSeo,
          nextData.keywords,
          nextData.imageUrl,
          nextData.sortOrder,
          nextData.isVisible,
          nextData.adminNote,
        ]
      );

      await client.query("COMMIT");
      return mapLevel1Row(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async updateLevel2(id, payload) {
    const client = await getPool().connect();

    try {
      await client.query("BEGIN");

      const current = await this.getLevel2ById(id, client);
      if (!current) {
        throw new Error("Category level 2 not found");
      }

      const nextParentId =
        typeof payload?.parentId === "undefined" || payload?.parentId === null
          ? current.parentId
          : Number(payload.parentId);

      if (!Number.isInteger(nextParentId) || nextParentId < 1) {
        throw new Error("Invalid parentId");
      }

      const nextData = {
        parentId: nextParentId,
        slug: String(payload?.slug || current.slug).trim().toLowerCase(),
        name: String(payload?.name || current.name).trim(),
        description: typeof payload?.description === "undefined" ? current.description : String(payload.description || "").trim(),
        titleSeo: typeof payload?.titleSeo === "undefined" && typeof payload?.title_seo === "undefined"
          ? current.titleSeo
          : String(payload?.titleSeo || payload?.title_seo || "").trim(),
        keywords: typeof payload?.keywords === "undefined" ? current.keywords : String(payload.keywords || "").trim(),
        imageUrl: typeof payload?.imageUrl === "undefined" && typeof payload?.image_url === "undefined"
          ? current.imageUrl
          : String(payload?.imageUrl || payload?.image_url || "").trim(),
        sortOrder: typeof payload?.sortOrder === "undefined" && typeof payload?.sort_order === "undefined"
          ? current.sortOrder
          : Number(payload?.sortOrder ?? payload?.sort_order),
        isVisible:
          typeof payload?.isVisible === "undefined" && typeof payload?.is_visible === "undefined"
            ? current.isVisible
            : Boolean(payload?.isVisible ?? payload?.is_visible),
        adminNote: typeof payload?.adminNote === "undefined" && typeof payload?.admin_note === "undefined"
          ? current.adminNote
          : String(payload?.adminNote || payload?.admin_note || "").trim(),
      };

      if (!nextData.slug) {
        throw new Error("Missing slug");
      }

      if (!nextData.name) {
        throw new Error("Missing name");
      }

      if (!Number.isInteger(nextData.sortOrder) || nextData.sortOrder < 1) {
        throw new Error("Invalid sortOrder");
      }

      const result = await client.query(
        `
        UPDATE category_level_2
        SET
          category_level_1_id = $2,
          slug = $3,
          name = $4,
          description = $5,
          title_seo = $6,
          keywords = $7,
          image_url = $8,
          sort_order = $9,
          is_visible = $10,
          admin_note = $11,
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          slug,
          name,
          description,
          category_level_1_id,
          title_seo,
          keywords,
          image_url,
          sort_order,
          is_visible,
          admin_note,
          created_at,
          updated_at
        `,
        [
          id,
          nextData.parentId,
          nextData.slug,
          nextData.name,
          nextData.description,
          nextData.titleSeo,
          nextData.keywords,
          nextData.imageUrl,
          nextData.sortOrder,
          nextData.isVisible,
          nextData.adminNote,
        ]
      );

      const parentSlugResult = await client.query("SELECT slug AS parent_slug FROM category_level_1 WHERE id = $1 LIMIT 1", [nextData.parentId]);
      await client.query("COMMIT");
      return mapLevel2Row({
        ...result.rows[0],
        parent_slug: parentSlugResult.rows[0]?.parent_slug || null,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteLevel1(id) {
    const visibleChildrenResult = await getPool().query(
      `
      SELECT COUNT(*)::int AS total
      FROM category_level_2
      WHERE category_level_1_id = $1 AND is_visible = TRUE
      `,
      [id]
    );

    const visibleChildrenCount = Number(visibleChildrenResult.rows[0]?.total || 0);
    if (visibleChildrenCount > 0) {
      const error = new Error("Không thể xóa danh mục cấp 1 khi vẫn còn danh mục cấp 2 đang hiển thị.");
      error.code = "CATEGORY_LEVEL_1_HAS_VISIBLE_CHILDREN";
      throw error;
    }

    const result = await getPool().query(
      `
      DELETE FROM category_level_1
      WHERE id = $1
      RETURNING id, name
      `,
      [id]
    );

    if (!result.rows.length) {
      throw new Error("Category level 1 not found");
    }

    return {
      id: Number(result.rows[0].id),
      name: result.rows[0].name,
    };
  }

  async deleteLevel2(id) {
    const visibleProductsResult = await getPool().query(
      `
      SELECT COUNT(*)::int AS total
      FROM products
      WHERE category_level_2_id = $1 AND is_visible = TRUE
      `,
      [id]
    );

    const visibleProductsCount = Number(visibleProductsResult.rows[0]?.total || 0);
    if (visibleProductsCount > 0) {
      const error = new Error("Không thể xóa danh mục cấp 2 khi vẫn còn sản phẩm đang hiển thị.");
      error.code = "CATEGORY_LEVEL_2_HAS_VISIBLE_PRODUCTS";
      throw error;
    }

    const result = await getPool().query(
      `
      DELETE FROM category_level_2
      WHERE id = $1
      RETURNING id, name
      `,
      [id]
    );

    if (!result.rows.length) {
      throw new Error("Category level 2 not found");
    }

    return {
      id: Number(result.rows[0].id),
      name: result.rows[0].name,
    };
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
