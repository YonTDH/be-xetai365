const express = require("express");
const { requireAdminAuth } = require("../middlewares/requireAdminAuth");
const adminHomeSlideController = require("../controllers/adminHomeSlideController");

const router = express.Router();

router.get("/", requireAdminAuth, adminHomeSlideController.listSlides);
router.post("/", requireAdminAuth, adminHomeSlideController.createSlide);
router.put("/:id", requireAdminAuth, adminHomeSlideController.updateSlide);
router.delete("/:id", requireAdminAuth, adminHomeSlideController.deleteSlide);

module.exports = router;
