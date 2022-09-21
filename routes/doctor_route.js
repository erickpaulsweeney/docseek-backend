const express = require("express");
const dbPool = require("../db-config");

const router = express.Router();

router.post("/profile/save", async (req, res) => {
    const userId = req.userInfo.id;
    const status = req.userInfo.status;
    const { id, qualification, experience, hospital, location, specialty } =
        req.body;
    
    if (!id || !qualification || !experience || !hospital || !location || !specialty) {
        return res.status(400).send({ message: "All fields are required." });
    }

    if (userId !== id) {
        return res.status(400).send({ message: "Unauthorized operation." });
    }

    const text =
        "UPDATE user_doctor " +
        "SET qualification = $2, experience = $3, hospital = $4, location = $5, specialty = $6 " +
        "WHERE id = $1 RETURNING *";
    const values = [id, qualification, experience, hospital, location, specialty];

    dbPool.query(text, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            const doctorInfo = result.rows[0];
            return res.status(200).json(doctorInfo);
        }
    });
});

router.get("/profile", async (req, res) => {
    const { id } = req.userInfo;

    const text = "SELECT * FROM user_doctor WHERE id = $1";
    const values = [id];

    dbPool.query(text, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            const doctorInfo = result.rows[0];
            return res.status(200).json(doctorInfo);
        }
    })
});

router.get("/specialties", async (req, res) => {
    const text = "SELECT * FROM specialty";
    dbPool.query(text, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            const list = resultrows;
            return res.status(200).json(list);
        }
    })
});

module.exports = router;
