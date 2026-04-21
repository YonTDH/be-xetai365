const contactRequestModel = require("../models/contactRequestModel");

async function createContactRequest(req, res) {
  try {
    const payload = req.body || {};
    const missingFields = ["fullName", "phone"].filter((field) => !payload[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const created = await contactRequestModel.create(payload);
    return res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function listContactRequests(req, res) {
  try {
    const data = await contactRequestModel.list(req.query || {});
    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createContactRequest,
  listContactRequests,
};
