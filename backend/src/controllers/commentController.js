const client = require("../config/db");

// Create Comment
async function createComment(req, res) {

    try {

        const taskId = req.params.taskId;
        const userId = req.user.id;
        const { comment } = req.body;

        if (!comment) {

            return res.status(400).send("Comment cannot be empty");

        }

        // Check task exists
        const taskResult = await client.query(

            `
            SELECT
                t.id,
                l.board_id
            FROM tasks t

            JOIN lists l
            ON t.list_id = l.id

            WHERE t.id = $1
            `,

            [taskId]

        );

        if (taskResult.rows.length === 0) {

            return res.status(404).send("Task Not Found");

        }

        const boardId = taskResult.rows[0].board_id;

        const result = await client.query(

            `
            INSERT INTO comments
            (task_id,user_id,comment)

            VALUES($1,$2,$3)

            RETURNING *
            `,

            [

                taskId,
                userId,
                comment

            ]

        );

        const io = req.app.get("io");

        if(io){

            io.to(String(boardId)).emit("comments-updated");

        }

        res.status(201).json(result.rows[0]);

    }

    catch(error){

        console.log(error);

        res.status(500).send("Internal Server Error");

    }

}



// Get Comments
async function getComments(req,res){

    try{

        const taskId=req.params.taskId;

        const result=await client.query(

            `
            SELECT

                comments.id,
                comments.comment,
                comments.created_at,

                users.id AS user_id,
                users.name

            FROM comments

            JOIN users

            ON comments.user_id=users.id

            WHERE comments.task_id=$1

            ORDER BY comments.created_at ASC
            `,

            [taskId]

        );

        res.json(result.rows);

    }

    catch(error){

        console.log(error);

        res.status(500).send("Internal Server Error");

    }

}



// Delete Comment
// Delete Comment
async function deleteComment(req, res) {

    try {

        const { commentId } = req.params;

        const userId = req.user.id;

        // Get comment + workspace information
        const commentResult = await client.query(

            `
            SELECT
                comments.id,
                comments.user_id,
                l.board_id,
                b.workspace_id

            FROM comments

            JOIN tasks
            ON comments.task_id = tasks.id

            JOIN lists l
            ON tasks.list_id = l.id

            JOIN boards b
            ON l.board_id = b.id

            WHERE comments.id = $1
            `,

            [commentId]

        );

        if (commentResult.rows.length === 0) {

            return res.status(404).send("Comment Not Found");

        }

        const comment = commentResult.rows[0];

        // Is the user the owner of the comment?
        let canDelete = String(comment.user_id) === String(userId);

        // If not owner, check if Admin
        if (!canDelete) {

            const adminResult = await client.query(

                `
                SELECT role

                FROM workspace_members

                WHERE workspace_id = $1
                AND user_id = $2
                `,

                [comment.workspace_id, userId]

            );

            if (

                adminResult.rows.length > 0 &&
                adminResult.rows[0].role === "Admin"

            ) {

                canDelete = true;

            }

        }

        if (!canDelete) {

            return res.status(403).send("You cannot delete this comment");

        }

        await client.query(

            `
            DELETE FROM comments

            WHERE id = $1
            `,

            [commentId]

        );

        // Real-time update
        const io = req.app.get("io");

        if (io) {

            io.to(String(comment.board_id)).emit("comments-updated");

        }

        res.send("Comment Deleted Successfully");

    }

    catch (error) {

        console.log(error);

        res.status(500).send("Internal Server Error");

    }

}

module.exports={

    createComment,

    getComments,

    deleteComment

};