const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

pool.connect()
    .then(async (client) => {

        console.log("Database Connected Successfully");

        const result = await client.query(
            "SELECT current_database();"
        );

        console.log(result.rows);

        client.release();

    })
    .catch((err) => {

        console.log("Database Connection Failed");
        console.log(err);

    });

module.exports = pool;