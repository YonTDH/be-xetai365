const { newsCategories, newsArticles, pages } = require("../data/siteData");
const { paginate } = require("../utils/pagination");
const { normalizeText } = require("../utils/request");

class ContentModel {
  listNewsCategories() {
    return newsCategories.map((category) => ({
      ...category,
      articleCount: newsArticles.filter(
        (article) => article.categorySlug === category.slug
      ).length,
    }));
  }

  listNews(filters = {}) {
    const keyword = normalizeText(filters.keyword);
    const category = normalizeText(filters.category);

    const filtered = newsArticles.filter((article) => {
      const matchesKeyword =
        keyword.length === 0 ||
        article.title.toLowerCase().includes(keyword) ||
        article.excerpt.toLowerCase().includes(keyword) ||
        article.slug.toLowerCase().includes(keyword);
      const matchesCategory =
        category.length === 0 || article.categorySlug.toLowerCase() === category;

      return matchesKeyword && matchesCategory;
    });

    return paginate(filtered, filters.page, filters.limit);
  }

  findNewsByIdOrSlug(value) {
    const asNumber = Number(value);

    return (
      newsArticles.find((article) => article.id === asNumber) ||
      newsArticles.find((article) => article.slug === value) ||
      null
    );
  }

  findPageBySlug(slug) {
    return pages.find((page) => page.slug === slug) || null;
  }

  getHomeData({ featuredProducts, setting }) {
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
      latestNews: newsArticles.slice(0, 3),
    };
  }
}

module.exports = new ContentModel();
