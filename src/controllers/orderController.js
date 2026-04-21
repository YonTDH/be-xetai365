const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");

async function createOrder(req, res) {
  try {
    const { cartId, customer, note } = req.body || {};
    const cart = await cartModel.getCart(cartId);

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

    const order = await orderModel.create({
      cart,
      customer,
      note,
    });

    await cartModel.clearCart(cartId);

    return res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getOrderById(req, res) {
  try {
    const order = await orderModel.findById(req.params.id);
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function listOrders(_req, res) {
  try {
    const orders = await orderModel.list();
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createOrder,
  getOrderById,
  listOrders,
};
