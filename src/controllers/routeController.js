const routeModel = require("../models/routeModel");

function listRoutes(_req, res) {
  res.json({
    success: true,
    data: routeModel.list(),
  });
}

function resolveLegacyRoute(req, res) {
  const path = req.query.path || "/";
  const route = routeModel.resolve(path);

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
}

module.exports = {
  listRoutes,
  resolveLegacyRoute,
};
