const express = require("express");
const { checkDatabaseHealth } = require("../config/db");

const router = express.Router();

router.get("/", async (_req, res) => {
  const database = await checkDatabaseHealth();

  res.json({
    status: database.status === "up" ? "ok" : "degraded",
    service: "be-xetai365",
    timestamp: new Date().toISOString(),
    database,
  });
});

module.exports = router;
