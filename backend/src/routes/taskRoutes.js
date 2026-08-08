const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const taskController = require("../controllers/taskController");

router.post("/lists/:listId/tasks", authMiddleware, taskController.createTask);
router.get("/lists/:listId/tasks", authMiddleware, taskController.getTasks);
router.put("/tasks/:taskId", authMiddleware, taskController.updateTask);
router.delete("/tasks/:taskId", authMiddleware, taskController.deleteTask);
router.put("/tasks/:taskId/move", authMiddleware, taskController.moveTask);


router.post("/tasks/:taskId/comments", authMiddleware, taskController.addComment);
router.get("/tasks/:taskId/comments", authMiddleware, taskController.getComments);
router.delete("/comments/:commentId", authMiddleware, taskController.deleteComment);






module.exports = router;