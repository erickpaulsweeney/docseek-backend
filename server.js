require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();

const authRouter = require("./routes/auth_route");
const doctorRouter = require("./routes/doctor_route");
const patientRouter = require("./routes/patient_route");

app.listen(process.env.PORT || 8000, () => {
    console.log("Server connected");
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Routes
app.use("/auth", authRouter);
app.use(authenticateRequest);
app.use("/doctor", doctorRouter);
app.use("/patient", patientRouter);

function authenticateRequest(req, res, next) {
    const authHeaderInfo = req.headers["authorization"];
    if (!authHeaderInfo) {
        return res.status(400).send({ message: "No token provided." });
    }

    const token = authHeaderInfo.split(" ")[1];
    if (!token) {
        return res.status(400).send({ message: "No proper token provided." });
    }

    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.userInfo = payload;
        next();
    } catch (error) {
        return res.status(403).send(error);
    }
}