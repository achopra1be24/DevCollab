const client = require("../config/db");

async function createList(req, res) {
    try {
        const boardId = req.params.boardId;
        const name = req.body.name;

        if (!name) {
            return res.status(400).send("List name is required");
        }

        const boardResult = await client.query(
            `SELECT *
             FROM boards
             WHERE id = $1`,
            [boardId]
        );

        if (boardResult.rows.length === 0) {
            return res.status(404).send("Board Not Found");
        }

        const workspaceId = boardResult.rows[0].workspace_id;

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

        const positionResult = await client.query(
            `SELECT MAX(position) AS max_position
             FROM lists
             WHERE board_id = $1`,
            [boardId]
        );

        let newPosition;

        if (positionResult.rows[0].max_position === null) {
            newPosition = 1;
        } else {
            newPosition = positionResult.rows[0].max_position + 1;
        }

        await client.query(
            `INSERT INTO lists
             (name, position, board_id)
             VALUES($1,$2,$3)`,
            [
                name,
                newPosition,
                boardId
            ]
        );

        const io = req.app.get("io");
        io.to(String(boardId)).emit("board-updated");

        res.status(201).send("List Created Successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

async function getLists(req, res) {
    try {
        const boardId = req.params.boardId;

        const boardResult = await client.query(
            `SELECT *
             FROM boards
             WHERE id = $1`,
            [boardId]
        );

        if (boardResult.rows.length === 0) {
            return res.status(404).send("Board Not Found");
        }

        const workspaceId = boardResult.rows[0].workspace_id;
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

        const listsResult = await client.query(
            `SELECT *
             FROM lists
             WHERE board_id = $1
             ORDER BY position ASC`,
            [boardId]
        );

        res.status(200).json(listsResult.rows);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

async function renameList(req, res) {
    try {
        const listId = req.params.listId;
        const name = req.body.name;

        if (!name) {
            return res.status(400).send("List name is required");
        }

        const listResult = await client.query(
            `SELECT board_id FROM lists WHERE id = $1`,
            [listId]
        );

        if (listResult.rows.length === 0) {
            return res.status(404).send("List Not Found");
        }

        const boardId = listResult.rows[0].board_id;

        await client.query(
            `UPDATE lists
             SET name = $1
             WHERE id = $2`,
            [name, listId]
        );

        const io = req.app.get("io");
        io.to(String(boardId)).emit("board-updated");

        res.status(200).send("List Renamed Successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

async function deleteList(req, res) {
    try {
        const listId = req.params.listId;

        const listResult = await client.query(
            `SELECT board_id FROM lists WHERE id = $1`,
            [listId]
        );

        if (listResult.rows.length === 0) {
            return res.status(404).send("List Not Found");
        }

        const boardId = listResult.rows[0].board_id;

        await client.query(
            `DELETE FROM tasks WHERE list_id = $1`,
            [listId]
        );

        await client.query(
            `DELETE FROM lists WHERE id = $1`,
            [listId]
        );

        const io = req.app.get("io");
        io.to(String(boardId)).emit("board-updated");

        res.status(200).send("List Deleted Successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {
    createList: createList,
    getLists: getLists,
    renameList: renameList,
    deleteList: deleteList
};