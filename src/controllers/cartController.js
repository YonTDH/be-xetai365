const cartModel = require("../models/cartModel");
const catalogModel = require("../models/catalogModel");
const { parsePositiveInt } = require("../utils/request");

async function getCart(req, res) {
  try {
    const cart = await cartModel.getCart(req.params.cartId);
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function addCartItem(req, res) {
  try {
    const productId = req.body?.productId;
    const quantity = parsePositiveInt(req.body?.quantity, 1);
    const product = catalogModel.findProductByIdOrSlug(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const cart = await cartModel.addItem(req.body?.cartId, product, quantity);

    return res.status(201).json({
      success: true,
      data: cartModel.serialize(cart),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateCartItem(req, res) {
  try {
    const quantity = Number(req.body?.quantity);
    if (Number.isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a number",
      });
    }

    const cart = await cartModel.updateItem(
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function removeCartItem(req, res) {
  try {
    const cart = await cartModel.removeItem(req.params.cartId, req.params.productId);
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
};
