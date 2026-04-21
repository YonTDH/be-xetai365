const catalogModel = require("../models/catalogModel");
const contentModel = require("../models/contentModel");
const settingModel = require("../models/settingModel");

async function getHome(_req, res) {
  try {
    const setting = await settingModel.get();
    const featuredProducts = await catalogModel.getFeaturedProducts(6);

    res.json({
      success: true,
      data: contentModel.getHomeData({
        featuredProducts,
        setting,
      }),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
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
