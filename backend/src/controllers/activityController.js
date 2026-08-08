const client = require("../config/db");

// Get Board Activity
async function getActivities(req, res) {

    try {

        const { boardId } = req.params;

        const result = await client.query(

            `
            SELECT
                activities.id,
                activities.action,
                activities.created_at,
                users.name

            FROM activities

            JOIN users
            ON activities.user_id = users.id

            WHERE activities.board_id = $1

            ORDER BY activities.created_at DESC
            `,

            [boardId]

        );

        res.json(result.rows);

    }

    catch (error) {

        console.log(error);

        res.status(500).send("Internal Server Error");

    }

}

module.exports = {

    getActivities

};