const express = require("express");
const cors = require("cors");
const healthRouter = require("./routes/health");
const adminAuthRouter = require("./routes/adminAuth");
const adminBulletinsRouter = require("./routes/adminBulletins");
const adminProductsRouter = require("./routes/adminProducts");
const adminHomeSlidesRouter = require("./routes/adminHomeSlides");
const adminUploadsRouter = require("./routes/adminUploads");
const adminVehicleCategoriesRouter = require("./routes/adminVehicleCategories");
const settingsRouter = require("./routes/settings");
const vehiclesRouter = require("./routes/vehicles");
const catalogRouter = require("./routes/catalog");
const contentRouter = require("./routes/content");
const searchRouter = require("./routes/search");
const contactRequestsRouter = require("./routes/contactRequests");
const legacyRoutesRouter = require("./routes/legacyRoutes");

const app = express();

function getAllowedOrigins() {
  const rawOrigins = [
    process.env.CLIENT_URL,
    process.env.CLIENT_URLS,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  if (!rawOrigins.length) {
    return ["*"];
  }

  return Array.from(new Set(rawOrigins));
}

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "XeTai365 backend is running",
  });
});

app.use("/api/health", healthRouter);
app.use("/api/admin/auth", adminAuthRouter);
app.use("/api/admin/bulletins", adminBulletinsRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/home-slides", adminHomeSlidesRouter);
app.use("/api/admin/uploads", adminUploadsRouter);
app.use("/api/admin/vehicle-categories", adminVehicleCategoriesRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/catalog", catalogRouter);
app.use("/api/content", contentRouter);
app.use("/api/search", searchRouter);
app.use("/api/contact-requests", contactRequestsRouter);
app.use("/api/legacy-routes", legacyRoutesRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

module.exports = app;
