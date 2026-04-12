const vehicleModel = require("../models/vehicleModel");

function listVehicles(req, res) {
  const { page, limit, keyword, brand, status } = req.query;
  const data = vehicleModel.list({ page, limit, keyword, brand, status });

  res.json({
    success: true,
    data,
  });
}

function getVehicleById(req, res) {
  const vehicle = vehicleModel.findById(req.params.id);
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
