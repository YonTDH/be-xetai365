const routeModel = require("../models/routeModel");

async function listRoutes(_req, res) {
  try {
    const routes = await routeModel.list();

    res.json({
      success: true,
      data: routes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function resolveLegacyRoute(req, res) {
  try {
    const path = req.query.path || "/";
    const route = await routeModel.resolve(path);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Legacy route not found",
      });
    }

    return res.json({
      success: true,
      data: route,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  listRoutes,
  resolveLegacyRoute,
};
