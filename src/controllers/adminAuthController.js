const bcrypt = require("bcryptjs");
const adminUserModel = require("../models/adminUserModel");
const { signAdminToken, getJwtExpiresIn } = require("../utils/jwt");

async function login(req, res) {
  try {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "");

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing username or password",
      });
    }

    const adminUser = await adminUserModel.findByUsername(username);
    if (!adminUser || adminUser.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = signAdminToken({
      sub: adminUser.id,
      username: adminUser.username,
      role: "admin",
    });

    await adminUserModel.touchLastLogin(adminUser.id);

    return res.json({
      success: true,
      data: {
        accessToken: token,
        tokenType: "Bearer",
        expiresIn: getJwtExpiresIn(),
        user: {
          id: adminUser.id,
          username: adminUser.username,
          fullName: adminUser.fullName,
          status: adminUser.status,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

function me(req, res) {
  return res.json({
    success: true,
    data: req.adminUser,
  });
}

module.exports = {
  login,
  me,
};
