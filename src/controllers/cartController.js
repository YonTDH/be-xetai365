const cartModel = require("../models/cartModel");
const catalogModel = require("../models/catalogModel");
const { parsePositiveInt } = require("../utils/request");

function getCart(req, res) {
  const cart = cartModel.getCart(req.params.cartId);
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  return res.json({
    success: true,
    data: cartModel.serialize(cart),
  });
}

function addCartItem(req, res) {
  const productId = req.body?.productId;
  const quantity = parsePositiveInt(req.body?.quantity, 1);
  const product = catalogModel.findProductByIdOrSlug(productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const cart = cartModel.addItem(req.body?.cartId, product, quantity);

  return res.status(201).json({
    success: true,
    data: cartModel.serialize(cart),
  });
}

function updateCartItem(req, res) {
  const quantity = Number(req.body?.quantity);
  if (Number.isNaN(quantity)) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be a number",
    });
  }

  const cart = cartModel.updateItem(
    req.params.cartId,
    req.params.productId,
    quantity
  );
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart item not found",
    });
  }

  return res.json({
    success: true,
    data: cartModel.serialize(cart),
  });
}

function removeCartItem(req, res) {
  const cart = cartModel.removeItem(req.params.cartId, req.params.productId);
  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart item not found",
    });
  }

  return res.json({
    success: true,
    data: cartModel.serialize(cart),
  });
}

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
};
