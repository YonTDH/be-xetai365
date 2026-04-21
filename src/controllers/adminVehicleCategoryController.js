const vehicleCategoryModel = require("../models/vehicleCategoryModel");

function normalizeInputItem(item) {
  const parsedParentId = Number(item?.parentId);

  return {
    slug: String(item?.slug || "").trim().toLowerCase(),
    name: String(item?.name || "").trim(),
    type: String(item?.type || "product-list").trim(),
    description: String(item?.description || "").trim(),
    parentId: Number.isFinite(parsedParentId) ? parsedParentId : null,
    parentSlug: String(item?.parentSlug || "").trim().toLowerCase(),
  };
}

function validateItem(item) {
  if (!item.slug) {
    return "Missing slug";
  }
  if (!item.name) {
    return "Missing name";
  }
  if (item.parentId && item.parentId < 1) {
    return "Invalid parentId";
  }
  return null;
}

async function listVehicleCategories(_req, res) {
  try {
    const data = await vehicleCategoryModel.list();
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

async function upsertVehicleCategories(req, res) {
  try {
    const payload = req.body;
    const items = Array.isArray(payload) ? payload : [payload];
    const normalized = items.map(normalizeInputItem);

    for (let i = 0; i < normalized.length; i += 1) {
      const errorMessage = validateItem(normalized[i]);
      if (errorMessage) {
        return res.status(400).json({
          success: false,
          message: `${errorMessage} at item index ${i}`,
        });
      }
    }

    const data = await vehicleCategoryModel.upsertMany(normalized);
    return res.status(201).json({
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
  listVehicleCategories,
  upsertVehicleCategories,
};
