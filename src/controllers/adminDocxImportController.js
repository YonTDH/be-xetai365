const mammoth = require("mammoth");
const { uploadBufferToCloudinary } = require("../utils/cloudinary");

function resolveFolderByBulletinType(type) {
  if (type === "products" || type === "product") return "products";
  if (type === "recruitment") return "recruitment";
  if (type === "promotion") return "promotions";
  return "news";
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findFirstParagraphText(html) {
  const match = String(html || "").match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!match) {
    return "";
  }
  return stripHtml(match[1]);
}

async function importBulletinDocx(req, res) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Missing .docx file",
      });
    }

    const bulletinType = String(req.body?.type || req.body?.bulletinType || "news_event").trim();
    const imageFolder = resolveFolderByBulletinType(bulletinType);
    let firstImageUrl = "";

    const result = await mammoth.convertToHtml(
      { buffer: file.buffer },
      {
        convertImage: mammoth.images.inline(async (image) => {
          const contentType = image.contentType || "image/jpeg";
          const extension = contentType.split("/")[1] || "jpg";
          const imageBuffer = await image.readAsBuffer();
          const uploaded = await uploadBufferToCloudinary(imageBuffer, {
            folder: imageFolder,
            mimeType: contentType,
            fileName: `docx-image.${extension}`,
          });
          if (!firstImageUrl) {
            firstImageUrl = uploaded.imageUrl;
          }

          return {
            src: uploaded.imageUrl,
          };
        }),
      }
    );

    const contentHtml = String(result.value || "").trim();
    const plainText = stripHtml(contentHtml);
    const firstParagraph = findFirstParagraphText(contentHtml);

    return res.json({
      success: true,
      data: {
        title: firstParagraph,
        excerpt: firstParagraph,
        content: contentHtml,
        imageUrl: firstImageUrl,
        plainText,
        warnings: Array.isArray(result.messages)
          ? result.messages.map((item) => item.message).filter(Boolean)
          : [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to import .docx file",
    });
  }
}

module.exports = {
  importBulletinDocx,
};
