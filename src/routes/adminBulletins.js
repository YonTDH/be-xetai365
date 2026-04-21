const express = require("express");
const { requireAdminAuth } = require("../middlewares/requireAdminAuth");
const adminBulletinController = require("../controllers/adminBulletinController");

const router = express.Router();

router.get("/", requireAdminAuth, adminBulletinController.listBulletins);
router.get("/:id", requireAdminAuth, adminBulletinController.getBulletinDetail);
router.post("/", requireAdminAuth, adminBulletinController.createBulletin);
router.put("/:id", requireAdminAuth, adminBulletinController.updateBulletin);
router.delete("/:id", requireAdminAuth, adminBulletinController.deleteBulletin);

module.exports = router;
