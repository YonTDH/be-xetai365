const { getPool } = require("../config/db");

function mapPageRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    pageType: row.page_type,
    title: row.title,
    greeting: row.greeting,
    content: row.content,
    imageUrl: row.image_url,
    keywords: row.keywords,
    metaDescription: row.meta_description,
    sortOrder: row.sort_order,
    isVisible: row.is_visible,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class ContentModel {
  async findPageBySlug(slug) {
    const result = await getPool().query(
      `
      SELECT
        id,
        slug,
        page_type,
        title,
        greeting,
        content,
        image_url,
        keywords,
        meta_description,
        sort_order,
        is_visible,
        created_at,
        updated_at
      FROM site_pages
      WHERE slug = $1 AND is_visible = TRUE
      LIMIT 1
      `,
      [String(slug || "").trim()]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return mapPageRow(result.rows[0]);
  }

  getHomeData({ featuredProducts, setting, latestNews = [], slides = [] }) {
    const safeSetting = setting || {
      title: "",
      description: "",
      hotline: "",
    };

    return {
      hero: {
        title: safeSetting.title,
        description: safeSetting.description,
        hotline: safeSetting.hotline,
      },
      featuredProducts,
      latestNews,
      slides,
    };
  }
}

module.exports = new ContentModel();
