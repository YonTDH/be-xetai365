const jwt = require("jsonwebtoken");

function getJwtSecret() {
  return process.env.JWT_SECRET || "xetai365-dev-secret-change-me";
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || "8h";
}

function signAdminToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getJwtExpiresIn(),
  });
}

function verifyAdminToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  signAdminToken,
  verifyAdminToken,
  getJwtExpiresIn,
};
