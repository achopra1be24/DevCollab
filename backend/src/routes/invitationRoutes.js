const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const invitationController = require("../controllers/invitationController");

router.post(
    "/:workspaceId/send",
    authMiddleware,
    invitationController.sendInvitation
);

router.get(
    "/pending",
    authMiddleware,
    invitationController.getInvitations
);

router.put(
    "/:id/accept",
    authMiddleware,
    invitationController.acceptInvitation
);

router.put(
    "/:id/reject",
    authMiddleware,
    invitationController.rejectInvitation
);

module.exports = router;