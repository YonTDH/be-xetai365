const settingModel = require("../models/settingModel");

async function getSetting(_req, res) {
  try {
    const setting = await settingModel.get();

    res.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateSetting(req, res) {
  try {
    const updated = await settingModel.update(req.body || {});

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getSetting,
  updateSetting,
};
