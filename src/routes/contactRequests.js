const express = require("express");
const contactRequestController = require("../controllers/contactRequestController");
const { requireAdminAuth } = require("../middlewares/requireAdminAuth");

const router = express.Router();

router.get("/", requireAdminAuth, contactRequestController.listContactRequests);
router.post("/", contactRequestController.createContactRequest);
router.patch("/:id/status", requireAdminAuth, contactRequestController.updateContactRequestStatus);

module.exports = router;
