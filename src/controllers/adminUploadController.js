const crypto = require("crypto");

function normalizeFolder(folder) {
  const baseFolder = String(process.env.CLOUDINARY_FOLDER || "xetai365")
    .trim()
    .replace(/^\/+|\/+$/g, "");

  const folderMap = {
    products: "products",
    news: "news",
    promotions: "promotions",
    recruitment: "recruitment",
    pages: "pages",
  };

  const leafFolder = folderMap[String(folder || "").trim()] || "products";
  return `${baseFolder}/${leafFolder}`;
}

function createCloudinarySignature(params, apiSecret) {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${serialized}${apiSecret}`)
    .digest("hex");
}

async function createUploadSignature(req, res) {
  const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  const apiKey = String(process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = String(process.env.CLOUDINARY_API_SECRET || "").trim();
  const uploadPreset = String(process.env.CLOUDINARY_UPLOAD_PRESET || "").trim();

  if (!cloudName || !apiKey || !apiSecret || !uploadPreset) {
    return res.status(500).json({
      success: false,
      message: "Cloudinary env is not configured.",
    });
  }

  const folder = normalizeFolder(req.body?.folder);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createCloudinarySignature(
    {
      folder,
      timestamp,
      upload_preset: uploadPreset,
    },
    apiSecret
  );

  return res.json({
    success: true,
    data: {
      cloudName,
      apiKey,
      uploadPreset,
      folder,
      timestamp,
      signature,
    },
  });
}

module.exports = {
  createUploadSignature,
};
