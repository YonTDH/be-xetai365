const express = require("express");
const { requireAdminAuth } = require("../middlewares/requireAdminAuth");
const adminVehicleCategoryController = require("../controllers/adminVehicleCategoryController");

const router = express.Router();

router.get("/", requireAdminAuth, adminVehicleCategoryController.listVehicleCategories);
router.get("/tree", requireAdminAuth, adminVehicleCategoryController.listVehicleCategoriesTree);
router.post("/", requireAdminAuth, adminVehicleCategoryController.upsertVehicleCategories);
router.post("/level-1", requireAdminAuth, adminVehicleCategoryController.createLevel1VehicleCategory);
router.put("/level-1/:id", requireAdminAuth, adminVehicleCategoryController.updateLevel1VehicleCategory);
router.delete("/level-1/:id", requireAdminAuth, adminVehicleCategoryController.deleteLevel1VehicleCategory);
router.post("/level-2", requireAdminAuth, adminVehicleCategoryController.createLevel2VehicleCategory);
router.put("/level-2/:id", requireAdminAuth, adminVehicleCategoryController.updateLevel2VehicleCategory);
router.delete("/level-2/:id", requireAdminAuth, adminVehicleCategoryController.deleteLevel2VehicleCategory);

module.exports = router;
