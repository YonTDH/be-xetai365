const catalogModel = require("../models/catalogModel");
const contentModel = require("../models/contentModel");
const { normalizeText } = require("../utils/request");

function search(req, res) {
  const keyword = normalizeText(req.query.q);
  if (!keyword) {
    return res.status(400).json({
      success: false,
      message: "Missing search query",
    });
  }

  const productItems = catalogModel.listProducts({
    keyword,
    page: 1,
    limit: 6,
  }).items;
  const newsItems = contentModel.listNews({
    keyword,
    page: 1,
    limit: 6,
  }).items;

  return res.json({
    success: true,
    data: {
      keyword,
      products: productItems,
      news: newsItems,
    },
  });
}

module.exports = {
  search,
};
