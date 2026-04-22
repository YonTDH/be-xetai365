const catalogModel = require("../models/catalogModel");
const contentModel = require("../models/contentModel");
const bulletinModel = require("../models/bulletinModel");
const settingModel = require("../models/settingModel");

async function getHome(_req, res) {
  try {
    const setting = await settingModel.get();
    const featuredProducts = await catalogModel.getFeaturedProducts(6);
    const latestNews = (await bulletinModel.list({ page: 1, limit: 3 }, { publicOnly: true }))
      .items;

    res.json({
      success: true,
      data: contentModel.getHomeData({
        featuredProducts,
        setting,
        latestNews,
      }),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function listNewsCategories(_req, res) {
  try {
    const data = await bulletinModel.listTypeStats();
    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function listNews(req, res) {
  try {
    const data = await bulletinModel.list(req.query, { publicOnly: true });
    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getNewsDetail(req, res) {
  try {
    const article = await bulletinModel.findByIdOrSlug(req.params.idOrSlug, {
      publicOnly: true,
    });
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function listBulletins(req, res) {
  try {
    const data = await bulletinModel.list(req.query, { publicOnly: true });
    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.message.startsWith("Invalid")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getBulletinDetail(req, res) {
  try {
    const item = await bulletinModel.findByIdOrSlug(req.params.idOrSlug, { publicOnly: true });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Bulletin not found",
      });
    }

    return res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getPage(req, res) {
  try {
    const page = await contentModel.findPageBySlug(req.params.slug);
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getHome,
  listNewsCategories,
  listNews,
  getNewsDetail,
  listBulletins,
  getBulletinDetail,
  getPage,
};
