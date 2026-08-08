const client = require("../config/db");

async function createBoard(req, res) {
    try {
        const workspaceId = req.params.workspaceId;
        const name = req.body.name;

        await client.query(
            `INSERT INTO boards
            (name, workspace_id)
            VALUES($1,$2)`,
            [
                name,
                workspaceId
            ]
        );

        res.status(201).send("Board Created Successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

async function getBoards(req, res) {
    try {
        const workspaceId = req.params.workspaceId;

       const access = await client.query(

    `
    SELECT 1
    FROM workspaces
    WHERE id = $1
    AND owner_id = $2

    UNION

    SELECT 1
    FROM workspace_members
    WHERE workspace_id = $1
    AND user_id = $2
    `,

    [

        workspaceId,

        req.user.id

    ]

);

if (access.rows.length === 0) {

    return res.status(403).send("Access Denied");

}

        const boards = await client.query(
            `SELECT *
             FROM boards
             WHERE workspace_id = $1`,
            [
                workspaceId
            ]
        );

        res.status(200).json(boards.rows);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

async function renameBoard(req, res) {
    try {
        const boardId = req.params.boardId;
        const name = req.body.name;

        if (!name) {
            return res.status(400).send("Board name is required");
        }

        await client.query(
            `UPDATE boards
             SET name = $1
             WHERE id = $2`,
            [name, boardId]
        );

        const io = req.app.get("io");
        io.to(String(boardId)).emit("board-updated");

        res.status(200).send("Board Renamed Successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

async function deleteBoard(req, res) {
    try {
        const boardId = req.params.boardId;

        await client.query(
            `DELETE FROM tasks 
             WHERE list_id IN (SELECT id FROM lists WHERE board_id = $1)`,
            [boardId]
        );

        await client.query(
            `DELETE FROM lists WHERE board_id = $1`,
            [boardId]
        );

        await client.query(
            `DELETE FROM boards WHERE id = $1`,
            [boardId]
        );

        const io = req.app.get("io");
        io.to(String(boardId)).emit("board-updated");

        res.status(200).send("Board Deleted Successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {
    createBoard: createBoard,
    getBoards: getBoards,
    renameBoard: renameBoard,
    deleteBoard: deleteBoard
};