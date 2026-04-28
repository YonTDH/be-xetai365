const express = require("express");
const multer = require("multer");
const { requireAdminAuth } = require("../middlewares/requireAdminAuth");
const adminBulletinController = require("../controllers/adminBulletinController");
const adminDocxImportController = require("../controllers/adminDocxImportController");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

router.get("/", requireAdminAuth, adminBulletinController.listBulletins);
router.get("/:id", requireAdminAuth, adminBulletinController.getBulletinDetail);
router.post("/import-docx", requireAdminAuth, upload.single("file"), adminDocxImportController.importBulletinDocx);
router.post("/", requireAdminAuth, adminBulletinController.createBulletin);
router.put("/:id", requireAdminAuth, adminBulletinController.updateBulletin);
router.delete("/:id", requireAdminAuth, adminBulletinController.deleteBulletin);

module.exports = router;
