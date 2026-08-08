const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const commentController = require("../controllers/commentController");


// Create Comment
router.post(

    "/tasks/:taskId/comments",

    authMiddleware,

    commentController.createComment

);


// Get All Comments of a Task
router.get(

    "/tasks/:taskId/comments",

    authMiddleware,

    commentController.getComments

);


// Delete Comment
router.delete(

    "/comments/:commentId",

    authMiddleware,

    commentController.deleteComment

);


module.exports = router;