const express = require("express");
const routeController = require("../controllers/routeController");

const router = express.Router();

router.get("/", routeController.listRoutes);
router.get("/resolve", routeController.resolveLegacyRoute);

module.exports = router;
