const vehicleModel = require("../models/vehicleModel");

async function listVehicles(req, res) {
  try {
    const { page, limit, keyword, brand, status } = req.query;
    const data = await vehicleModel.list({ page, limit, keyword, brand, status });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getVehicleById(req, res) {
  try {
    const vehicle = await vehicleModel.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

function createVehicle(req, res) {
  return res.status(501).json({
    success: false,
    message:
      "Vehicle write APIs are disabled in the migration skeleton. Use /api/catalog/products as the primary public read API.",
  });
}

function updateVehicle(req, res) {
  return res.status(501).json({
    success: false,
    message: "Vehicle write APIs are disabled in the migration skeleton.",
  });
}

function deleteVehicle(req, res) {
  return res.status(501).json({
    success: false,
    message: "Vehicle write APIs are disabled in the migration skeleton.",
  });
}

module.exports = {
  listVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
