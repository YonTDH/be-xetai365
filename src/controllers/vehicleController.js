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
  const requiredFields = ["slug", "title", "brand", "year", "priceVnd"];
  const missing = requiredFields.filter((key) => !req.body?.[key]);

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(", ")}`,
    });
  }

  const vehicle = vehicleModel.create(req.body);

  return res.status(201).json({
    success: true,
    data: vehicle,
  });
}

function updateVehicle(req, res) {
  const vehicle = vehicleModel.update(req.params.id, req.body || {});
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

function deleteVehicle(req, res) {
  const deleted = vehicleModel.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: "Vehicle not found",
    });
  }

  return res.status(204).send();
}

module.exports = {
  listVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
