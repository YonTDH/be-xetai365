const crypto = require("crypto");

function getCloudinaryConfig() {
  return {
    cloudName: String(process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
    apiKey: String(process.env.CLOUDINARY_API_KEY || "").trim(),
    apiSecret: String(process.env.CLOUDINARY_API_SECRET || "").trim(),
    baseFolder: String(process.env.CLOUDINARY_FOLDER || "xetai365")
      .trim()
      .replace(/^\/+|\/+$/g, ""),
  };
}

function assertCloudinaryConfig() {
  const config = getCloudinaryConfig();
  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    throw new Error("Cloudinary env is not configured.");
  }
  return config;
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

async function uploadBufferToCloudinary(buffer, options = {}) {
  const { cloudName, apiKey, apiSecret, baseFolder } = assertCloudinaryConfig();
  const folderLeaf = String(options.folder || "products")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  const folder = `${baseFolder}/${folderLeaf}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createCloudinarySignature(
    {
      folder,
      timestamp,
    },
    apiSecret
  );

  const formData = new FormData();
  const mimeType = String(options.mimeType || "image/jpeg").trim() || "image/jpeg";
  const fileName = String(options.fileName || "upload.jpg").trim() || "upload.jpg";

  formData.set("file", new Blob([buffer], { type: mimeType }), fileName);
  formData.set("api_key", apiKey);
  formData.set("timestamp", String(timestamp));
  formData.set("signature", signature);
  formData.set("folder", folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || "Cloudinary upload failed.");
  }

  return {
    imageUrl: String(data.secure_url || data.url || "").trim(),
    publicId: String(data.public_id || "").trim(),
  };
}

module.exports = {
  getCloudinaryConfig,
  assertCloudinaryConfig,
  createCloudinarySignature,
  uploadBufferToCloudinary,
};
