const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const workspaceController = require("../controllers/workspaceController");
const invitationController = require("../controllers/invitationController");

// Workspace
router.post(
    "/workspaces",
    authMiddleware,
    workspaceController.createWorkspace
);

router.get(
    "/workspaces",
    authMiddleware,
    workspaceController.getWorkspaces
);

// Invitation
router.post(
    "/workspaces/:workspaceId/invite",
    authMiddleware,
    invitationController.sendInvitation
);

// Members
router.get(
    "/workspaces/:workspaceId/members",
    authMiddleware,
    workspaceController.getWorkspaceMembers
);
router.delete(

    "/workspaces/:workspaceId/members/:userId",

    authMiddleware,

    workspaceController.removeMember

);

module.exports = router;