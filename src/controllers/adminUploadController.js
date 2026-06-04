const { assertCloudinaryConfig, createCloudinarySignature, listCloudinaryImages } = require("../utils/cloudinary");

function normalizeFolder(folder) {
  const { baseFolder } = assertCloudinaryConfig();

  const folderMap = {
    products: "products",
    news: "news",
    promotions: "promotions",
    recruitment: "recruitment",
    services: "services",
    pages: "pages",
    logos: "logos",
    slides: "slides",
  };

  const leafFolder = folderMap[String(folder || "").trim()] || "products";
  return `${baseFolder}/${leafFolder}`;
}

async function createUploadSignature(req, res) {
  const { cloudName, apiKey, apiSecret } = assertCloudinaryConfig();
  const uploadPreset = String(process.env.CLOUDINARY_UPLOAD_PRESET || "").trim();

  if (!uploadPreset) {
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

async function listUploadedImages(req, res) {
  try {
    const items = await listCloudinaryImages({
      folder: req.query?.folder,
      maxResults: req.query?.limit,
    });

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

module.exports = {
  createUploadSignature,
  listUploadedImages,
};
