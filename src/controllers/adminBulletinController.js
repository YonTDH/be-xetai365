const bulletinModel = require("../models/bulletinModel");

function isUniqueViolation(error) {
  return error?.code === "23505";
}

async function listBulletins(req, res) {
  try {
    const data = await bulletinModel.list(req.query, { publicOnly: false });
    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.message.startsWith("Invalid")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getBulletinDetail(req, res) {
  try {
    const item = await bulletinModel.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Bulletin not found",
      });
    }

    return res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function createBulletin(req, res) {
  try {
    const item = await bulletinModel.create(req.body || {});
    return res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return res.status(409).json({
        success: false,
        message: "Slug already exists",
      });
    }

    if (error.message.startsWith("Missing") || error.message.startsWith("Invalid")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateBulletin(req, res) {
  try {
    const item = await bulletinModel.update(req.params.id, req.body || {});
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Bulletin not found",
      });
    }

    return res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return res.status(409).json({
        success: false,
        message: "Slug already exists",
      });
    }

    if (error.message.startsWith("Missing") || error.message.startsWith("Invalid")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteBulletin(req, res) {
  try {
    const deleted = await bulletinModel.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Bulletin not found",
      });
    }

    return res.json({
      success: true,
      message: "Bulletin deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  listBulletins,
  getBulletinDetail,
  createBulletin,
  updateBulletin,
  deleteBulletin,
};
