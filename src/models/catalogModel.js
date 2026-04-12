const { productCategories, products } = require("../data/siteData");
const { paginate } = require("../utils/pagination");
const { normalizeText } = require("../utils/request");

class CatalogModel {
  listCategories() {
    return productCategories.map((category) => ({
      ...category,
      productCount: products.filter(
        (product) => product.categorySlug === category.slug
      ).length,
    }));
  }

  listProducts(filters = {}) {
    const keyword = normalizeText(filters.keyword);
    const brand = normalizeText(filters.brand);
    const status = normalizeText(filters.status);
    const category = normalizeText(filters.category);
    const condition = normalizeText(filters.condition);
    const featuredOnly = String(filters.featured || "").trim() === "true";

    const filtered = products.filter((product) => {
      const matchesKeyword =
        keyword.length === 0 ||
        product.title.toLowerCase().includes(keyword) ||
        product.slug.toLowerCase().includes(keyword) ||
        product.shortDescription.toLowerCase().includes(keyword);
      const matchesBrand =
        brand.length === 0 || product.brand.toLowerCase() === brand;
      const matchesStatus =
        status.length === 0 || product.status.toLowerCase() === status;
      const matchesCategory =
        category.length === 0 || product.categorySlug.toLowerCase() === category;
      const matchesCondition =
        condition.length === 0 || product.condition.toLowerCase() === condition;
      const matchesFeatured = !featuredOnly || product.isFeatured;

      return (
        matchesKeyword &&
        matchesBrand &&
        matchesStatus &&
        matchesCategory &&
        matchesCondition &&
        matchesFeatured
      );
    });

    return paginate(filtered, filters.page, filters.limit);
  }

  findProductByIdOrSlug(value) {
    const asNumber = Number(value);

    return (
      products.find((product) => product.id === asNumber) ||
      products.find((product) => product.slug === value) ||
      null
    );
  }

  getFeaturedProducts(limit = 6) {
    return products.filter((product) => product.isFeatured).slice(0, limit);
  }
}

module.exports = new CatalogModel();
