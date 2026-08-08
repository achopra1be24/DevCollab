const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const activityController = require("../controllers/activityController");

router.get(

    "/boards/:boardId/activities",

    authMiddleware,

    activityController.getActivities

);

module.exports = router;