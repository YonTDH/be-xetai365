const catalogModel = require("../models/catalogModel");
const bulletinModel = require("../models/bulletinModel");
const { normalizeText } = require("../utils/request");

async function search(req, res) {
  try {
    const keyword = normalizeText(req.query.q);
    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Missing search query",
      });
    }

    const productItems = (
      await catalogModel.listProducts({
        keyword,
        page: 1,
        limit: 6,
      })
    ).items;
    const newsItems = (
      await bulletinModel.list(
        {
          keyword,
          page: 1,
          limit: 6,
        },
        { publicOnly: true }
      )
    ).items;

    return res.json({
      success: true,
      data: {
        keyword,
        products: productItems,
        news: newsItems,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  search,
};
