const express = require("express");
const contentController = require("../controllers/contentController");

const router = express.Router();

router.get("/home", contentController.getHome);
router.get("/news/categories", contentController.listNewsCategories);
router.get("/news", contentController.listNews);
router.get("/news/:idOrSlug", contentController.getNewsDetail);
router.get("/bulletins", contentController.listBulletins);
router.get("/bulletins/:idOrSlug", contentController.getBulletinDetail);
router.get("/pages/:slug", contentController.getPage);

module.exports = router;
