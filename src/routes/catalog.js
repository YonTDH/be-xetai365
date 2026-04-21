const express = require("express");
const catalogController = require("../controllers/catalogController");

const router = express.Router();

router.get("/categories", catalogController.listCategories);
router.get("/categories/tree", catalogController.listCategoriesTree);
router.get("/products", catalogController.listProducts);
router.get("/products/:idOrSlug", catalogController.getProductDetail);

module.exports = router;
