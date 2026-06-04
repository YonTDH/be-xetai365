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

async function listCloudinaryImages(options = {}) {
  const { cloudName, apiKey, apiSecret, baseFolder } = assertCloudinaryConfig();
  const folderLeaf = String(options.folder || "products")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  const shouldListAll = folderLeaf === "all" || folderLeaf === "*";
  const folder = shouldListAll ? baseFolder : `${baseFolder}/${folderLeaf}`;
  const maxResults = Math.min(Math.max(Number(options.maxResults) || 30, 1), 500);

  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const resources = [];
  let nextCursor = "";

  do {
    const url = new URL(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image`);
    url.searchParams.set("type", "upload");
    url.searchParams.set("prefix", folder);
    url.searchParams.set("max_results", String(Math.min(maxResults - resources.length, 100)));
    if (nextCursor) {
      url.searchParams.set("next_cursor", nextCursor);
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error?.message || "Cloudinary list failed.");
    }

    resources.push(...(Array.isArray(data.resources) ? data.resources : []));
    nextCursor = String(data.next_cursor || "");
  } while (nextCursor && resources.length < maxResults);

  return resources.map((resource) => ({
    publicId: String(resource.public_id || "").trim(),
    imageUrl: String(resource.secure_url || resource.url || "").trim(),
    width: Number(resource.width) || 0,
    height: Number(resource.height) || 0,
    format: String(resource.format || "").trim(),
    createdAt: String(resource.created_at || "").trim(),
  })).filter((item) => item.publicId && item.imageUrl);
}

module.exports = {
  getCloudinaryConfig,
  assertCloudinaryConfig,
  createCloudinarySignature,
  uploadBufferToCloudinary,
  listCloudinaryImages,
};
