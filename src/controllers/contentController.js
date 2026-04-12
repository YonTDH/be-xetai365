const catalogModel = require("../models/catalogModel");
const contentModel = require("../models/contentModel");
const settingModel = require("../models/settingModel");

function getHome(_req, res) {
  res.json({
    success: true,
    data: contentModel.getHomeData({
      featuredProducts: catalogModel.getFeaturedProducts(6),
      setting: settingModel.get(),
    }),
  });
}

function listNewsCategories(_req, res) {
  res.json({
    success: true,
    data: contentModel.listNewsCategories(),
  });
}

function listNews(req, res) {
  res.json({
    success: true,
    data: contentModel.listNews(req.query),
  });
}

function getNewsDetail(req, res) {
  const article = contentModel.findNewsByIdOrSlug(req.params.idOrSlug);
  if (!article) {
    return res.status(404).json({
      success: false,
      message: "Article not found",
    });
  }

  return res.json({
    success: true,
    data: article,
  });
}

function getPage(req, res) {
  const page = contentModel.findPageBySlug(req.params.slug);
  if (!page) {
    return res.status(404).json({
      success: false,
      message: "Page not found",
    });
  }

  return res.json({
    success: true,
    data: page,
  });
}

module.exports = {
  getHome,
  listNewsCategories,
  listNews,
  getNewsDetail,
  getPage,
};
