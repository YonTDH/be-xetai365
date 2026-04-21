const adminUserModel = require("../models/adminUserModel");
const { verifyAdminToken } = require("../utils/jwt");

async function requireAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const payload = verifyAdminToken(token);
    const adminUser = await adminUserModel.findById(payload.sub);
    if (!adminUser || adminUser.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    req.adminUser = adminUser;
    return next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
}

module.exports = {
  requireAdminAuth,
};
