const vehicleCategoryModel = require("../models/vehicleCategoryModel");

function toBoolean(value, fallback = true) {
  if (typeof value === "undefined" || value === null) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function normalizeInputItem(item) {
  const parsedParentId = Number(item?.parentId);
  const parsedSortOrder = Number(item?.sortOrder);
  const parsedAdminLevel = Number(item?.adminLevel);

  return {
    slug: String(item?.slug || "").trim().toLowerCase(),
    name: String(item?.name || "").trim(),
    type: String(item?.type || "product-list").trim(),
    description: String(item?.description || "").trim(),
    parentId: Number.isFinite(parsedParentId) ? parsedParentId : null,
    parentSlug: String(item?.parentSlug || "").trim().toLowerCase(),
    titleSeo: String(item?.titleSeo || item?.title_seo || "").trim(),
    keywords: String(item?.keywords || "").trim(),
    imageUrl: String(item?.imageUrl || item?.image_url || "").trim(),
    sortOrder: Number.isFinite(parsedSortOrder) ? parsedSortOrder : 1,
    isVisible: toBoolean(item?.isVisible ?? item?.is_visible, true),
    adminLevel: Number.isFinite(parsedAdminLevel) ? parsedAdminLevel : 1,
    adminNote: String(item?.adminNote || item?.admin_note || "").trim(),
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
  if (!Number.isInteger(item.sortOrder) || item.sortOrder < 1) {
    return "Invalid sortOrder";
  }
  if (!Number.isInteger(item.adminLevel) || ![1, 2].includes(item.adminLevel)) {
    return "Invalid adminLevel";
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
