const express = require("express");
const cors = require("cors");
const healthRouter = require("./routes/health");
const usersRouter = require("./routes/users");
const settingsRouter = require("./routes/settings");
const vehiclesRouter = require("./routes/vehicles");

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

module.exports = app;
