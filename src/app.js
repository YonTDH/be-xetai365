const express = require("express");
const cors = require("cors");
const healthRouter = require("./routes/health");
const usersRouter = require("./routes/users");
const settingsRouter = require("./routes/settings");
const vehiclesRouter = require("./routes/vehicles");
const catalogRouter = require("./routes/catalog");
const contentRouter = require("./routes/content");
const searchRouter = require("./routes/search");
const cartRouter = require("./routes/cart");
const ordersRouter = require("./routes/orders");
const legacyRoutesRouter = require("./routes/legacyRoutes");

const app = express();

const corsOrigin = process.env.CLIENT_URL || "*";

app.use(
  cors({
    origin: corsOrigin,
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "XeTai365 backend is running",
  });
});

app.use("/api/health", healthRouter);
app.use("/api/users", usersRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/catalog", catalogRouter);
app.use("/api/content", contentRouter);
app.use("/api/search", searchRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/legacy-routes", legacyRoutesRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

module.exports = app;
