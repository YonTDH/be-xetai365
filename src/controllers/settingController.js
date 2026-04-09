const settingModel = require("../models/settingModel");

function getSetting(_req, res) {
  res.json({
    success: true,
    data: settingModel.get(),
  });
}

function updateSetting(req, res) {
  const updated = settingModel.update(req.body || {});

  res.json({
    success: true,
    data: updated,
  });
}

module.exports = {
  getSetting,
  updateSetting,
};
