const homeSlideModel = require("../models/homeSlideModel");

async function listSlides(_req, res) {
  try {
    const items = await homeSlideModel.list({ publicOnly: false });
    return res.json({
      success: true,
      data: { items },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function createSlide(req, res) {
  try {
    const item = await homeSlideModel.create(req.body || {});
    return res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    if (error.message.startsWith("Missing")) {
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

async function updateSlide(req, res) {
  try {
    const item = await homeSlideModel.update(req.params.id, req.body || {});
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Slide not found",
      });
    }

    return res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    if (error.message.startsWith("Missing")) {
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

async function deleteSlide(req, res) {
  try {
    const deleted = await homeSlideModel.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Slide not found",
      });
    }

    return res.json({
      success: true,
      data: {
        id: deleted.id,
        title: deleted.title,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  listSlides,
  createSlide,
  updateSlide,
  deleteSlide,
};
