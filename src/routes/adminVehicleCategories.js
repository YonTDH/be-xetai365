const express = require("express");
const { requireAdminAuth } = require("../middlewares/requireAdminAuth");
const adminVehicleCategoryController = require("../controllers/adminVehicleCategoryController");

const router = express.Router();

router.get("/", adminVehicleCategoryController.listVehicleCategories);
router.post("/", requireAdminAuth, adminVehicleCategoryController.upsertVehicleCategories);

module.exports = router;
