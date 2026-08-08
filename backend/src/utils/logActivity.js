const client = require("../config/db");

async function logActivity(boardId, userId, action) {

    try {

        await client.query(

            `
            INSERT INTO activities
            (board_id,user_id,action)

            VALUES($1,$2,$3)
            `,

            [

                boardId,

                userId,

                action

            ]

        );

    }

    catch(error){

        console.log(error);

    }

}

module.exports = logActivity;