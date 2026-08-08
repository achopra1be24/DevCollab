const client = require("../config/db");
const logActivity = require("../utils/logActivity");

// Helper function: Ensures user is a member/admin of the workspace containing this board
async function verifyWorkspaceAccess(workspaceId, userId) {
    const memberCheck = await client.query(
        `SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
        [workspaceId, userId]
    );
    return memberCheck.rows.length > 0;
}

// 1. CREATE TASK
async function createTask(req, res) {

    try {

        const listId = req.params.listId;

        const {

            title,

            description,

            priority = "Low",

            dueDate = null

        } = req.body;

        if (!title) {

            return res.status(400).send("Task title is required");

        }

        // Verify list -> board -> workspace
        const listResult = await client.query(

            `
            SELECT

                l.board_id,

                b.workspace_id

            FROM lists l

            JOIN boards b

            ON l.board_id = b.id

            WHERE l.id = $1
            `,

            [listId]

        );

        if (listResult.rows.length === 0) {

            return res.status(404).send("List or Board Not Found");

        }

        const {

            board_id: boardId,

            workspace_id: workspaceId

        } = listResult.rows[0];

        // Permission Check
        const hasAccess = await verifyWorkspaceAccess(

            workspaceId,

            req.user.id

        );

        if (!hasAccess) {

            return res.status(403).send("Access Denied");

        }

        // Next Position
        const positionResult = await client.query(

            `
            SELECT

                COALESCE(MAX(position),0)+1 AS next_position

            FROM tasks

            WHERE list_id = $1
            `,

            [listId]

        );

        const newPosition = positionResult.rows[0].next_position;

        // Create Task
        await client.query(

            `
            INSERT INTO tasks

            (

                title,

                description,

                position,

                list_id,

                priority,

                due_date

            )

            VALUES

            (

                $1,

                $2,

                $3,

                $4,

                $5,

                $6

            )
            `,

            [

                title,

                description,

                newPosition,

                listId,

                priority,

                dueDate

            ]

        );

        // ⭐ Activity Log
        await logActivity(

            boardId,

            req.user.id,

            `Created task "${title}"`

        );

        // ⭐ Socket Events
        const io = req.app.get("io");

        if (io) {

            io.to(String(boardId)).emit("board-updated");

            io.to(String(boardId)).emit("activities-updated");

        }

        res.status(201).send("Task Created Successfully");

    }

    catch (error) {

        console.log(error);

        res.status(500).send("Internal Server Error");

    }

}

// 2. GET TASKS
async function getTasks(req, res) {
    try {
        const listId = req.params.listId;

        const listResult = await client.query(
            `SELECT l.board_id, b.workspace_id 
             FROM lists l 
             JOIN boards b ON l.board_id = b.id 
             WHERE l.id = $1`,
            [listId]
        );

        if (listResult.rows.length === 0) {
            return res.status(404).send("List Not Found");
        }

        const { workspace_id: workspaceId } = listResult.rows[0];

        const hasAccess = await verifyWorkspaceAccess(workspaceId, req.user.id);
        if (!hasAccess) {
            return res.status(403).send("Access Denied");
        }

        const tasksResult = await client.query(
            `SELECT * FROM tasks WHERE list_id = $1 ORDER BY position ASC`,
            [listId]
        );

        res.status(200).json(tasksResult.rows);
    } catch (error) {
        console.error("Error getting tasks:", error);
        res.status(500).send("Internal Server Error");
    }
}

// 3. UPDATE TASK
async function updateTask(req, res) {
    try {
        const taskId = req.params.taskId;
        const { title, description, priority = "Low", dueDate = null } = req.body;

        if (!title) {
            return res.status(400).send("Task title is required");
        }

        const taskResult = await client.query(
            `SELECT t.id, l.board_id, b.workspace_id 
             FROM tasks t
             JOIN lists l ON t.list_id = l.id
             JOIN boards b ON l.board_id = b.id
             WHERE t.id = $1`,
            [taskId]
        );

        if (taskResult.rows.length === 0) {
            return res.status(404).send("Task Not Found");
        }

        const { board_id: boardId, workspace_id: workspaceId } = taskResult.rows[0];

        const hasAccess = await verifyWorkspaceAccess(workspaceId, req.user.id);
        if (!hasAccess) {
            return res.status(403).send("Access Denied");
        }

        await client.query(
            `UPDATE tasks
             SET title = $1, description = $2, priority = $3, due_date = $4
             WHERE id = $5`,
            [title, description, priority, dueDate, taskId]
        );

        const io = req.app.get("io");
        if (io) io.to(String(boardId)).emit("board-updated");

        res.status(200).send("Task Updated Successfully");
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).send("Internal Server Error");
    }
}

// 4. DELETE TASK
async function deleteTask(req, res) {
    try {
        const taskId = req.params.taskId;

        const taskResult = await client.query(
            `SELECT t.id, l.board_id, b.workspace_id 
             FROM tasks t
             JOIN lists l ON t.list_id = l.id
             JOIN boards b ON l.board_id = b.id
             WHERE t.id = $1`,
            [taskId]
        );

        if (taskResult.rows.length === 0) {
            return res.status(404).send("Task Not Found");
        }

        const { board_id: boardId, workspace_id: workspaceId } = taskResult.rows[0];

        const hasAccess = await verifyWorkspaceAccess(workspaceId, req.user.id);
        if (!hasAccess) {
            return res.status(403).send("Access Denied");
        }

        await client.query(`DELETE FROM tasks WHERE id = $1`, [taskId]);

        const io = req.app.get("io");
        if (io) io.to(String(boardId)).emit("board-updated");

        res.status(200).send("Task Deleted Successfully");
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).send("Internal Server Error");
    }
}

// 5. MOVE TASK (WITH SQL TRANSACTIONS & REORDERING)
async function moveTask(req, res) {

    try {

        const taskId = req.params.taskId;
        const destinationListId = req.body.destinationListId;

        const countResult = await client.query(

            `
            SELECT COUNT(*) AS total
            FROM tasks
            WHERE list_id = $1
            `,

            [destinationListId]

        );

        let newPosition = Number(countResult.rows[0].total) + 1;

        const taskResult = await client.query(

            `
            SELECT
                t.*,
                b.workspace_id

            FROM tasks t

            JOIN lists l
            ON t.list_id = l.id

            JOIN boards b
            ON l.board_id = b.id

            WHERE t.id = $1
            `,

            [taskId]

        );

        if (taskResult.rows.length === 0) {

            return res.status(404).send("Task Not Found");

        }

        const sourceListId = taskResult.rows[0].list_id;
        const oldPosition = taskResult.rows[0].position;
        const workspaceId = taskResult.rows[0].workspace_id;

        const hasAccess = await verifyWorkspaceAccess(

            workspaceId,

            req.user.id

        );

        if (!hasAccess) {

            return res.status(403).send("Access Denied");

        }

        await client.query("BEGIN");

        await client.query(

            `
            UPDATE tasks

            SET position = position - 1

            WHERE list_id = $1

            AND position > $2
            `,

            [

                sourceListId,

                oldPosition

            ]

        );

        await client.query(

            `
            UPDATE tasks

            SET position = position + 1

            WHERE list_id = $1

            AND position >= $2
            `,

            [

                destinationListId,

                newPosition

            ]

        );

        await client.query(

            `
            UPDATE tasks

            SET

                list_id = $1,

                position = $2

            WHERE id = $3
            `,

            [

                destinationListId,

                newPosition,

                taskId

            ]

        );

        await client.query("COMMIT");

        const boardResult = await client.query(

            `
            SELECT board_id

            FROM lists

            WHERE id = $1
            `,

            [destinationListId]

        );

        const boardId = boardResult.rows[0].board_id;

        await logActivity(

            boardId,

            req.user.id,

            "Moved a task"

        );

        const io = req.app.get("io");

        if (io) {

            io.to(String(boardId)).emit("board-updated");

            io.to(String(boardId)).emit("activities-updated");

        }

        res.status(200).send("Task Moved Successfully");

    }

    catch (error) {

        await client.query("ROLLBACK");

        console.log(error);

        res.status(500).send("Internal Server Error");

    }

}
async function addComment(req, res) {

    try {

        const { taskId } = req.params;

        const { comment } = req.body;

        if (!comment) {

            return res.status(400).send("Comment required");

        }

        // Find board
        const taskResult = await client.query(

            `
            SELECT

                l.board_id

            FROM tasks

            JOIN lists l

            ON tasks.list_id = l.id

            WHERE tasks.id = $1
            `,

            [taskId]

        );

        if (taskResult.rows.length === 0) {

            return res.status(404).send("Task Not Found");

        }

        const boardId = taskResult.rows[0].board_id;

        await client.query(

            `
            INSERT INTO comments

            (task_id,user_id,comment)

            VALUES($1,$2,$3)
            `,

            [

                taskId,

                req.user.id,

                comment

            ]

        );

        await logActivity(

            boardId,

            req.user.id,

            "Added a comment"

        );

        const io = req.app.get("io");

        if (io) {

            io.to(String(boardId)).emit("comments-updated");

            io.to(String(boardId)).emit("activities-updated");

        }

        res.status(201).send("Comment Added");

    }

    catch (error) {

        console.log(error);

        res.status(500).send("Internal Server Error");

    }

}
async function getComments(req, res) {

    try {

        const { taskId } = req.params;

        const result = await client.query(

            `
            SELECT
                comments.id,
                comments.comment,
                comments.created_at,
                users.name,
                users.id AS user_id

            FROM comments

            JOIN users
            ON comments.user_id = users.id

            WHERE comments.task_id = $1

            ORDER BY comments.created_at ASC
            `,

            [taskId]

        );

        res.json(result.rows);

    }

    catch (error) {

        console.log(error);

        res.status(500).send("Internal Server Error");

    }

}
async function deleteComment(req, res) {

    try {

        const { commentId } = req.params;

        const result = await client.query(

            `
            DELETE FROM comments
            WHERE id = $1
            RETURNING *
            `,

            [commentId]

        );

        if (result.rows.length === 0) {

            return res.status(404).send("Comment not found");

        }

        res.send("Comment Deleted");

    }

    catch (error) {

        console.log(error);

        res.status(500).send("Internal Server Error");

    }

}
module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    moveTask,
    addComment,
    getComments,
    deleteComment
};