const contactRequestModel = require("../models/contactRequestModel");

const ALLOWED_STATUS = new Set(["new", "contacted", "closed"]);

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

async function updateContactRequestStatus(req, res) {
  try {
    const status = String(req.body?.status || "").trim().toLowerCase();
    if (!ALLOWED_STATUS.has(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: new, contacted, closed",
      });
    }

    const updated = await contactRequestModel.updateStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Contact request not found",
      });
    }

    return res.json({
      success: true,
      data: updated,
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
  updateContactRequestStatus,
};
