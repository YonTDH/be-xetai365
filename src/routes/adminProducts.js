const express = require("express");
const { requireAdminAuth } = require("../middlewares/requireAdminAuth");
const adminProductsController = require("../controllers/adminProductsController");

const router = express.Router();

router.get("/", requireAdminAuth, adminProductsController.listAdminProducts);
router.get("/:id", requireAdminAuth, adminProductsController.getAdminProductDetail);
router.post("/", requireAdminAuth, adminProductsController.createAdminProduct);
router.put("/:id", requireAdminAuth, adminProductsController.updateAdminProduct);
router.delete("/:id", requireAdminAuth, adminProductsController.deleteAdminProduct);

module.exports = router;
