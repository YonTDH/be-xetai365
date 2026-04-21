const { pages } = require("../data/siteData");

class ContentModel {
  findPageBySlug(slug) {
    return pages.find((page) => page.slug === slug) || null;
  }

  getHomeData({ featuredProducts, setting, latestNews = [] }) {
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
    };
  }
}

module.exports = new ContentModel();
