const express = require("express");
const dbPool = require("../db-config");
const { parse } = require("postgres-array");
const router = express.Router();

router.post("/profile/save", async (req, res) => {
    const userId = req.userInfo.id;
    const status = req.userInfo.status;
    const { id, qualification, experience, hospital, location, specialty } =
        req.body;

    if (
        !id ||
        !qualification ||
        !experience ||
        !hospital ||
        !location ||
        !specialty
    ) {
        return res.status(400).send({ message: "All fields are required." });
    }

    if (userId !== id) {
        return res.status(400).send({ message: "Unauthorized operation." });
    }

    const text =
        "UPDATE user_doctor " +
        "SET qualification = $2, experience = $3, hospital = $4, location = $5, specialty = $6 " +
        "WHERE id = $1 RETURNING *";
    const values = [
        id,
        qualification,
        experience,
        hospital,
        location,
        specialty,
    ];

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
    });
});

router.get("/specialties", async (req, res) => {
    const text = "SELECT * FROM specialty";
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

router.get("/list", async (req, res) => {
    const text = "SELECT * FROM user_doctor";
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

router.post("/timeslots", async (req, res) => {
    const { id, timeslots } = req.body;
    const userId = req.userInfo.id;

    if (userId !== id) {
        return res.status(400).send({ message: "Unauthorized operation." });
    }

    if (timeslots.slots.length !== 7) {
        return res.status(400).send({ message: "Invalid timeslots format." });
    }

    const text =
        "UPDATE user_doctor " +
        "SET timeslots = $2 " +
        "WHERE id = $1 RETURNING *";
    const values = [id, timeslots];
    dbPool.query(text, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            const doctorInfo = result.rows[0];
            return res.status(200).send(doctorInfo);
        }
    });
});

router.post("/rate", async (req, res) => {
    const { id, rate } = req.body;
    const userId = req.userInfo.id;

    if (userId !== id) {
        return res.status(400).send({ message: "Unauthorized operation." });
    }

    if (rate < 1) {
        return res
            .status(400)
            .send({ message: "Rate cannot be lower than 1." });
    }

    const text = "UPDATE user_doctor SET rate = $2 WHERE id = $1 RETURNING *";
    const values = [id, rate];

    dbPool.query(text, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            const doctorInfo = result.rows[0];
            return res.status(200).send(doctorInfo);
        }
    });
});

router.post("/consultation/update-status", async (req, res) => {
    const { id, status } = req.body;
    const doctor_id = req.userInfo.id;
    console.log(id, status, doctor_id)

    const text = "SELECT * FROM consultations WHERE id = $1 AND doctor_id = $2";
    const values = [id, doctor_id];

    dbPool.query(text, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            if (result.rows.length === 0) {
                return res
                    .status(400)
                    .send({ message: "Consultation not found." });
            }

            const consultInfo = result.rows[0];

            if (status === "Completed" && consultInfo.status !== "Approved") {
                return res
                    .status(400)
                    .send({ message: "Unauthorized operation." });
            }

            if (consultInfo.status === "Completed") {
                return res
                    .status(400)
                    .send({ message: "Unauthorized operation." });
            }

            if (consultInfo.status === "Rejected") {
                return res
                    .status(400)
                    .send({ message: "Unauthorized operation." });
            }

            const text =
                "UPDATE consultations SET status = $3 WHERE id = $1 AND doctor_id = $2 RETURNING *";
            const values = [id, doctor_id, status];

            dbPool.query(text, values, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send(err);
                } else {
                    return res.status(200).send(consultInfo);
                }
            });
        }
    });
});

router.post("/consultation/update", async (req, res) => {
    const { id, notes, prescription } = req.body;
    const doctor_id = req.userInfo.id;

    const text =
        "UPDATE consultations " +
        "SET notes = $3, prescription = $4 " +
        "WHERE id = $1 AND doctor_id = $2 RETURNING *";
    const values = [id, doctor_id, notes, prescription];

    dbPool.query(text, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            const consultInfo = result.rows[0];
            return res.status(200).send(consultInfo);
        }
    });
});

router.get("/consultation", async (req, res) => {
    const { id } = req.query;

    const text = "SELECT * FROM consultations WHERE doctor_id = $1";
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

module.exports = router;
