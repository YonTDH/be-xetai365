const express = require("express");
const cartController = require("../controllers/cartController");

const router = express.Router();

router.get("/:cartId", cartController.getCart);
router.post("/items", cartController.addCartItem);
router.patch("/:cartId/items/:productId", cartController.updateCartItem);
router.delete("/:cartId/items/:productId", cartController.removeCartItem);

module.exports = router;
