const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dbPool = require("../db-config");
const router = express.Router();

router.post("/signup-doctor", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).send({ message: "All fields are required." });
    }
    if (password !== confirmPassword) {
        return res.status(400).send({ message: "Passwords do not match." });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const text =
        "INSERT INTO user_doctor(name, email, password) " +
        "VALUES($1, $2, $3) RETURNING *";
    const values = [
        name,
        email,
        hash, 
    ];
    dbPool.query(text, values, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        } else {
            console.log(result.rows);
            return res.status(201).json(result.rows[0]);
        }
    });
});

router.post("/login-doctor", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ message: "All fields are required." });
    }

    const text = "SELECT * FROM user_doctor WHERE email=$1"
    const values = [email];

    dbPool.query(text, values, async (err, result) => {
        if (err) {
            return res.status(500).send(err);
        } else {
            if (result.rows.length === 0) {
                return res.status(400).send({ message: "User not found." });
            }
            const foundUser = result.rows[0];
            const validate = await bcrypt.compare(password, foundUser.password);
            if (!validate) {
                return res.status(400).send({ message: "Incorrect password." });
            }

            const data = { id: foundUser.id, name: foundUser.name, email, user: "doctor" };
            const access_token = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXP_TIME });
            const refresh_token = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXP_TIME });
            return res.status(200).json({ access_token, refresh_token, data: foundUser });
        }
    });
});

router.post("/signup-patient", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).send({ message: "All fields are required." });
    }
    if (password !== confirmPassword) {
        return res.status(400).send({ message: "Passwords do not match." });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const text =
        "INSERT INTO user_patient(name, email, password) " +
        "VALUES($1, $2, $3) RETURNING *";
    const values = [
        name,
        email,
        hash, 
    ];
    dbPool.query(text, values, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        } else {
            return res.status(201).json(result.rows[0]);
        }
    });
});

router.post("/login-patient", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ message: "All fields are required." });
    }

    const text = "SELECT * FROM user_patient WHERE email=$1"
    const values = [email];

    dbPool.query(text, values, async (err, result) => {
        if (err) {
            return res.status(500).send(err);
        } else {
            if (result.rows.length === 0) {
                return res.status(400).send({ message: "User not found." });
            }
            const foundUser = result.rows[0];
            const validate = await bcrypt.compare(password, foundUser.password);
            if (!validate) {
                return res.status(400).send({ message: "Incorrect password." });
            }

            const data = { id: foundUser.id, name: foundUser.name, email, user: "patient" };
            const access_token = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXP_TIME });
            const refresh_token = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXP_TIME });
            return res.status(200).json({ access_token, refresh_token, data: foundUser });
        }
    });
});

router.post("/token", async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) {
        return res.status(400).send({ message: "Refresh token required." });
    }

    try {
        const payload = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
        delete payload.exp;
        const access_token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
        return res.status(200).json({ access_token });
    } catch (error) {
        return res.status(500).send(err);
    }
});



module.exports = router;
