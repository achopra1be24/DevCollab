require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const activityRoutes = require("./routes/activityRoutes");
const invitationRoutes = require("./routes/invitationRoutes");
const commentRoutes = require("./routes/commentRoutes");

// Database Connection
require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const boardRoutes = require("./routes/boardRoutes");
const listRoutes = require("./routes/listRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const server = http.createServer(app);


// ---------------- Middleware ----------------

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

app.use(express.json());

// ---------------- Socket.IO ----------------

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Make Socket.IO available inside controllers
app.set("io", io);

// ---------------- Socket Connection ----------------

io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);

    socket.on("join-user", (userId) => {

        socket.join(`user-${userId}`);

        console.log(`User ${userId} joined personal room`);

    });

    socket.on("join-board", (boardId) => {

        socket.join(String(boardId));

        console.log(`Joined Board ${boardId}`);

    });

    socket.on("leave-board", (boardId) => {

        socket.leave(String(boardId));

        console.log(`Left Board ${boardId}`);

    });

    socket.on("disconnect", () => {

        console.log("User Disconnected:", socket.id);

    });

});

// ---------------- Routes ----------------

app.use(authRoutes);
app.use(workspaceRoutes);
app.use(boardRoutes);
app.use(listRoutes);
app.use(taskRoutes);
app.use(commentRoutes);
app.use(activityRoutes);
app.use("/invitations", invitationRoutes);

// ---------------- Health Check ----------------

app.get("/", (req, res) => {

    res.send("DevCollab Backend Running");

});

// ---------------- Start Server ----------------

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

    console.log(`Server Running On Port ${PORT}`);

});