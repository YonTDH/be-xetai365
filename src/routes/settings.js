const express = require("express");
const settingController = require("../controllers/settingController");

const router = express.Router();

router.get("/", settingController.getSetting);
router.put("/", settingController.updateSetting);

module.exports = router;
