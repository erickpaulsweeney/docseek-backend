const express = require("express");
const dbPool = require("../db-config");

const router = express.Router();

router.post("/profile/save", async (req, res) => {
    const userId = req.userInfo.id;
    const {
        id,
        past_diseases,
        location,
        looking_for,
        blood_group,
        weight,
        sex,
        age,
    } = req.body;

    if (
        !id ||
        !past_diseases ||
        !location ||
        !looking_for ||
        !blood_group ||
        !weight ||
        !sex ||
        !age
    ) {
        return res.status(400).send({ message: "All fields are required." });
    }

    if (userId !== id) {
        return res.status(400).send({ message: "Unauthorized operation." });
    }

    const text =
        "UPDATE user_patient " +
        "SET past_diseases = $2, location = $3, looking_for = $4, blood_group = $5, weight = $6, sex = $7, age = $8 " +
        "WHERE id = $1 RETURNING *";
    const values = [
        id,
        past_diseases,
        location,
        looking_for,
        blood_group,
        weight,
        sex,
        age,
    ];
    dbPool.query(text, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            console.log(result.rows);
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
    });
});

router.post("/consultation/new", async (req, res) => {
    const patient_id = req.userInfo.id;
    const { doctor_id, date, time, status, cost } = req.body;

    const checkText = "SELECT timeslots FROM user_doctor WHERE id = $1";
    const checkValue = [doctor_id];

    await dbPool.query(checkText, checkValue, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            const schedule = result.rows[0].timeslots.slots;
            const formatted = new Date(date);
            const day = formatted.getDay();
            if (!schedule[day].includes(time)) {
                return res.status(400).send({ message: "Invalid timeslot." });
            }

            const text =
                "INSERT INTO consultations(doctor_id, patient_id, date, time, status, cost) " +
                "VALUES($1, $2, $3, $4, $5, $6) RETURNING *";
            const values = [doctor_id, patient_id, date, time, status, cost];

            dbPool.query(text, values, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send(err);
                } else {
                    const consultInfo = result.rows[0];
                    return res.status(200).send(consultInfo);
                }
            });
        }
    });
});

router.get("/consultation", async (req, res) => {
    const id = req.userInfo.id;

    const text = "SELECT * FROM consultations WHERE patient_id = $1";
    const values = [id];

    dbPool.query(text, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            const consultInfo = result.rows;
            return res.status(200).send(consultInfo);
        }
    });
});

router.get("/list", async (req, res) => {
    const text = "SELECT * FROM user_patient";
    dbPool.query(text, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            const list = result.rows;
            return res.status(200).json(list);
        }
    });
});

module.exports = router;
