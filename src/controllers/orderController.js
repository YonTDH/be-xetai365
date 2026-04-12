const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");

function createOrder(req, res) {
  const { cartId, customer, note } = req.body || {};
  const cart = cartModel.getCart(cartId);

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cart is missing or empty",
    });
  }

  const missingFields = ["fullName", "phone", "address"].filter(
    (field) => !customer?.[field]
  );
  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing customer fields: ${missingFields.join(", ")}`,
    });
  }

  const order = orderModel.create({
    cart,
    customer,
    note,
  });

  cartModel.clearCart(cartId);

  return res.status(201).json({
    success: true,
    data: order,
  });
}

function getOrderById(req, res) {
  const order = orderModel.findById(req.params.id);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  return res.json({
    success: true,
    data: order,
  });
}

function listOrders(_req, res) {
  res.json({
    success: true,
    data: orderModel.list(),
  });
}

module.exports = {
  createOrder,
  getOrderById,
  listOrders,
};
