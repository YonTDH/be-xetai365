const express = require("express");
const contactRequestController = require("../controllers/contactRequestController");

const router = express.Router();

router.get("/", contactRequestController.listContactRequests);
router.post("/", contactRequestController.createContactRequest);

module.exports = router;
