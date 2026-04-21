const catalogModel = require("../models/catalogModel");

async function listCategories(_req, res) {
  try {
    const categories = await catalogModel.listCategories();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function listProducts(req, res) {
  try {
    const products = await catalogModel.listProducts(req.query);
    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getProductDetail(req, res) {
  try {
    const product = await catalogModel.findProductByIdOrSlug(req.params.idOrSlug);
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  listCategories,
  listProducts,
  getProductDetail,
};
