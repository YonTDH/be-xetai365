const express = require("express");
const { requireAdminAuth } = require("../middlewares/requireAdminAuth");
const adminUploadController = require("../controllers/adminUploadController");

const router = express.Router();

router.post("/signature", requireAdminAuth, adminUploadController.createUploadSignature);
router.get("/images", requireAdminAuth, adminUploadController.listUploadedImages);

module.exports = router;
