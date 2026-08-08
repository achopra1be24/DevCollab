const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const client = require("../config/db");

async function signup(req, res) {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        const result = await client.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length > 0) {
            return res.status(400).send("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await client.query(
            "INSERT INTO users(name,email,password) VALUES($1,$2,$3)",
            [name, email, hashedPassword]
        );

        res.status(201).send("User Registered Successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

async function login(req, res) {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const result = await client.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).send("User does not exist");
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).send("Invalid Password");
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
            message: "Login Successful",
            token: token,
            user: {

        id: user.id,

        name: user.name,

        email: user.email

    }});
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

function getProfile(req, res) {
    res.json(req.user);
}

module.exports = {
    signup: signup,
    login: login,
    getProfile: getProfile
};