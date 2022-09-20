const express = require("express");
const dbPool = require("../db-config");

const router = express.Router();

router.post("/profile/save", async (req, res) => {
    const userId = req.userInfo.id;
    const { id, pastDiseases, location, lookingFor } = req.body;

    if (!id || !pastDiseases || !location || !lookingFor) {
        return res.status(400).send({ message: "All fields are required." });
    }

    if (userId !== id) {
        return res.status(400).send({ message: "Unauthorized operation." });
    }

    const text =
        "UPDATE user_patient " +
        "SET past_diseases = $2, location = $3, looking_for = $4 " + 
        "WHERE id = $1 RETURNING *";
    const values = [id, pastDiseases, location, lookingFor];
    dbPool.query(text, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            console.log(result.rows)
            const patientInfo = result.rows[0];
            return res.status(200).json(patientInfo);
        }
    });
});

router.get("/profile", async (req, res) => {
    const { id } = req.userInfo;

    const text = "SELECT * FROM user_patient WHERE id = $1";
    const values = [id];

    dbPool.query(text, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            const patientInfo = result.rows[0];
            return res.status(200).json(patientInfo);
        }
    })
});

module.exports = router;
