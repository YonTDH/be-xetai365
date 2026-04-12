const { legacyRoutes } = require("../data/siteData");

class RouteModel {
  resolve(pathname) {
    return legacyRoutes.find((route) => route.path === pathname) || null;
  }

  list() {
    return legacyRoutes;
  }
}

module.exports = new RouteModel();
