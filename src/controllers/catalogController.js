const catalogModel = require("../models/catalogModel");

function listCategories(_req, res) {
  res.json({
    success: true,
    data: catalogModel.listCategories(),
  });
}

function listProducts(req, res) {
  res.json({
    success: true,
    data: catalogModel.listProducts(req.query),
  });
}

function getProductDetail(req, res) {
  const product = catalogModel.findProductByIdOrSlug(req.params.idOrSlug);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  return res.json({
    success: true,
    data: product,
  });
}

module.exports = {
  listCategories,
  listProducts,
  getProductDetail,
};
