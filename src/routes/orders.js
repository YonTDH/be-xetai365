const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.get("/", orderController.listOrders);
router.get("/:id", orderController.getOrderById);
router.post("/", orderController.createOrder);

module.exports = router;
