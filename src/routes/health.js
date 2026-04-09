const express = require("express");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "be-xetai365",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
