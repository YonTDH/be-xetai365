const express = require("express");
const contactRequestController = require("../controllers/contactRequestController");
const { requireAdminAuth } = require("../middlewares/requireAdminAuth");

const router = express.Router();

router.get("/summary", requireAdminAuth, contactRequestController.getContactRequestsSummary);
router.get("/", requireAdminAuth, contactRequestController.listContactRequests);
router.post("/", contactRequestController.createContactRequest);
router.patch("/mark-viewed", requireAdminAuth, contactRequestController.markContactRequestsViewed);
router.patch("/:id/status", requireAdminAuth, contactRequestController.updateContactRequestStatus);

module.exports = router;
