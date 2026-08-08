const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const boardController = require("../controllers/boardController");

router.post("/workspaces/:workspaceId/boards", authMiddleware, boardController.createBoard);
router.get("/workspaces/:workspaceId/boards", authMiddleware, boardController.getBoards);
router.put("/boards/:boardId", authMiddleware, boardController.renameBoard);
router.delete("/boards/:boardId", authMiddleware, boardController.deleteBoard);

module.exports = router;