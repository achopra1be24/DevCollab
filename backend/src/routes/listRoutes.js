const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const listController = require("../controllers/listController");

router.post("/boards/:boardId/lists", authMiddleware, listController.createList);
router.get("/boards/:boardId/lists", authMiddleware, listController.getLists);
router.put("/lists/:listId", authMiddleware, listController.renameList);
router.delete("/lists/:listId", authMiddleware, listController.deleteList);

module.exports = router;