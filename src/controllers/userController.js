const userModel = require("../models/userModel");

function listUsers(req, res) {
  const { page, limit, search } = req.query;
  const data = userModel.list({ page, limit, search });

  res.json({
    success: true,
    data,
  });
}

function getUserById(req, res) {
  const user = userModel.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.json({
    success: true,
    data: user,
  });
}

module.exports = {
  listUsers,
  getUserById,
};
