const adminProductModel = require("../models/adminProductModel");

function toBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "undefined" || value === null) return fallback;

  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function normalizeProductPayload(payload) {
  return {
    categoryLevel2Id: Number(payload?.categoryLevel2Id ?? payload?.category_level_2_id),
    productCode: String(payload?.productCode || payload?.product_code || "").trim(),
    slug: String(payload?.slug || "").trim().toLowerCase(),
    title: String(payload?.title || "").trim(),
    shortDescription: String(payload?.shortDescription || payload?.short_description || "").trim(),
    content: String(payload?.content || "").trim(),
    priceVnd: String(payload?.priceVnd || payload?.price_vnd || "0").trim(),
    status: String(payload?.status || "available").trim().toLowerCase(),
    brand: String(payload?.brand || "").trim(),
    location: String(payload?.location || "").trim(),
    titleSeo: String(payload?.titleSeo || payload?.title_seo || "").trim(),
    keywords: String(payload?.keywords || "").trim(),
    metaDescription: String(payload?.metaDescription || payload?.meta_description || "").trim(),
    imageUrl: String(payload?.imageUrl || payload?.image_url || "").trim(),
    isFeatured: toBoolean(payload?.isFeatured ?? payload?.is_featured, false),
    isVisible: toBoolean(payload?.isVisible ?? payload?.is_visible, true),
    sortOrder: Number(payload?.sortOrder ?? payload?.sort_order),
  };
}

function validateProductPayload(payload) {
  if (!Number.isInteger(payload.categoryLevel2Id) || payload.categoryLevel2Id < 1) {
    return "Invalid categoryLevel2Id";
  }
  if (!payload.slug) {
    return "Missing slug";
  }
  if (!payload.title) {
    return "Missing title";
  }
  if (!Number.isFinite(Number(payload.priceVnd))) {
    return "Invalid priceVnd";
  }
  if (!Number.isInteger(payload.sortOrder) || payload.sortOrder < 1) {
    return "Invalid sortOrder";
  }
  return null;
}

async function listAdminProducts(req, res) {
  try {
    const items = await adminProductModel.list(req.query);
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

async function getAdminProductDetail(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    const data = await adminProductModel.getById(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function createAdminProduct(req, res) {
  try {
    const normalized = normalizeProductPayload(req.body);
    const errorMessage = validateProductPayload(normalized);
    if (errorMessage) {
      return res.status(400).json({ success: false, message: errorMessage });
    }

    const categoryExists = await adminProductModel.ensureCategoryLevel2Exists(normalized.categoryLevel2Id);
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: "Category level 2 not found" });
    }

    const data = await adminProductModel.create(normalized);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function updateAdminProduct(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    const normalized = normalizeProductPayload(req.body);
    const errorMessage = validateProductPayload(normalized);
    if (errorMessage) {
      return res.status(400).json({ success: false, message: errorMessage });
    }

    const categoryExists = await adminProductModel.ensureCategoryLevel2Exists(normalized.categoryLevel2Id);
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: "Category level 2 not found" });
    }

    const data = await adminProductModel.update(id, normalized);
    if (!data) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function deleteAdminProduct(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    const data = await adminProductModel.delete(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  listAdminProducts,
  getAdminProductDetail,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
};
