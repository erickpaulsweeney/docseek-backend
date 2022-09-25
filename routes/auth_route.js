const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const dbPool = require("../db-config");
const sendEmail = require("../utils/sendEmail");
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
    const values = [name, email, hash];
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

    const text = "SELECT * FROM user_doctor WHERE email=$1";
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

            const data = {
                id: foundUser.id,
                name: foundUser.name,
                email,
                user: "doctor",
            };
            const access_token = jwt.sign(
                data,
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: process.env.ACCESS_TOKEN_EXP_TIME }
            );
            const refresh_token = jwt.sign(
                data,
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: process.env.REFRESH_TOKEN_EXP_TIME }
            );
            return res
                .status(200)
                .json({ access_token, refresh_token, data: foundUser });
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
    const values = [name, email, hash];
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

    const text = "SELECT * FROM user_patient WHERE email=$1";
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

            const data = {
                id: foundUser.id,
                name: foundUser.name,
                email,
                user: "patient",
            };
            const access_token = jwt.sign(
                data,
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: process.env.ACCESS_TOKEN_EXP_TIME }
            );
            const refresh_token = jwt.sign(
                data,
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: process.env.REFRESH_TOKEN_EXP_TIME }
            );
            return res
                .status(200)
                .json({ access_token, refresh_token, data: foundUser });
        }
    });
});

router.post("/token", async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) {
        return res.status(400).send({ message: "Refresh token required." });
    }

    try {
        const payload = jwt.verify(
            refresh_token,
            process.env.REFRESH_TOKEN_SECRET
        );
        delete payload.exp;
        const access_token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
        return res.status(200).json({ access_token });
    } catch (error) {
        return res.status(500).send(err);
    }
});

router.post("/password-reset", async (req, res) => {
    const { email, role } = req.body;

    const text = `SELECT * FROM user_${role} WHERE email = '${email}'`;
    dbPool.query(text, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            if (result.rows.length === 0) {
                return res.status(400).send({ message: "Email not in use." });
            }

            const user = result.rows[0];
            const userId = role === "patient" ? "P-" + user.id : "D-" + user.id;
            const text = `SELECT * FROM reset_token WHERE user_id = '${userId}'`;

            dbPool.query(text, async (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send(err);
                } else {
                    if (result.rows.length === 0) {
                        const token = uuidv4();

                        const text =
                            "INSERT INTO reset_token(user_id, token, created_at, expired_in) VALUES($1, $2, NOW(), (NOW() + interval '1 day'))";
                        const values = [userId, token];

                        dbPool.query(text, values, async (err, result) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                const input = {
                                    email,
                                    link: `http://localhost:3000/password-reset/${userId}/${token}`,
                                };

                                await sendEmail(input);

                                return res.status(200).send({
                                    message:
                                        "Password reset link sent to your email account.",
                                });
                            }
                        });
                    } else {
                        const token = result.rows[0].token;

                        const input = {
                            email,
                            link: `http://localhost:3000/password-reset/${userId}/${token}`,
                        };

                        await sendEmail(input);

                        return res.status(200).send({
                            message:
                                "Password reset link sent to your email account.",
                        });
                    }
                }
            });
        }
    });
});

router.post("/password-reset/:userId/:token", async (req, res) => {
    const { userId, token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).send({ message: "Passwords do not match." });
    }

    const text = "SELECT * FROM reset_token WHERE user_id = $1 AND token = $2";
    const values = [userId, token];

    dbPool.query(text, values, async (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            if (result.rows.length === 0) {
                return res.status(400).send({ message: "Invalid link." });
            } else {
                const token_details = result.rows[0];

                if (token_details.expired_in < new Date()) {
                    const text = "DELETE FROM reset_token WHERE user_id = $1";
                    const values = [userId];

                    dbPool.query(text, values, (err, result) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).send(err);
                        } else {
                            return res.status(400).send({
                                message:
                                    "Link expired. Please request another link.",
                            });
                        }
                    });
                } else {
                    const table =
                        userId[0] === "P" ? "user_patient" : "user_doctor";
                    const id = userId.split("-")[1];

                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash(password, salt);

                    const text = `UPDATE ${table} SET password = '${hash}' WHERE id = ${id}`;

                    dbPool.query(text, (err, result) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).send(err);
                        } else {
                            const text =
                                "DELETE FROM reset_token WHERE user_id = $1";
                            const values = [userId];

                            dbPool.query(text, values, (err, result) => {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).send(err);
                                } else {
                                    return res.status(200).send({
                                        message: "Password reset successfully.",
                                    });
                                }
                            });
                        }
                    });
                }
            }
        }
    });
});

module.exports = router;
