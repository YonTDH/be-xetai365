const express = require("express");
const settingController = require("../controllers/settingController");
const { requireAdminAuth } = require("../middlewares/requireAdminAuth");

const router = express.Router();

router.get("/", settingController.getSetting);
router.put("/", requireAdminAuth, settingController.updateSetting);

module.exports = router;
