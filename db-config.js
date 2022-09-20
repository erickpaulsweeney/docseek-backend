const pg = require("pg");
// const Pool = require("pg-pool");

// const dbPool = new Pool({
//     user: "postgres",
//     host: "127.0.0.1",
//     database: "docseek",
//     password: "test1234",
//     port: 5432,
// });

const dbPool = new pg.Client("postgres://ehtsiezm:63gh232sKp0qiSxGnzXu1PAC__r_jFWq@tiny.db.elephantsql.com/ehtsiezm");

dbPool.connect((err) => {
    if (err) {
        return console.log("Could not connect to postgres", err);
    }
    dbPool.query('SELECT NOW() AS "theTime"', (err, result) => {
        if (err) {
            return console.log("Error running query", err);
        }
        console.log("DB connected at" + result.rows[0].theTime);
    })
});

module.exports = dbPool;

// DOCTOR PROFILE
// ID SERIAL PRIMARY
// Name VARCHAR(30)
// Email VARCHAR(30)
// Password VARCHAR
// Qualification VARCHAR[]
// Experience VARCHAR[]
// Hospital
// Location

// SPECIALTIES
// ID SERIAL PRIMARY
// Name VARCHAR(20)

// DOCTOR SPECIALTY
// Doctor ID INT NOT NULL
// Specialty ID INT NOT NULL

// TIMESLOTS
// ID SERIAL PRIMARY
// DOCTOR ID INT
// DAY DATE
// START TIME VARCHAR 
// END TIME VARCHAR
// ISBOOKED BOOLEAN DEFAULT FALSE

// PATIENT PROFILE
// ID SERIAL PRIMARY
// NAME
// EMAIL
// PASSWORD
// Past Diseases JSON
// Location
// Looking for (Specialty?)

// CONSULTATIONS
// ID
// PATIENT ID
// TIMESLOT ID
// NOTES
// STATUS VARCHAR DEFAULT PENDING
// ISDONE

// REVIEWS
// ID
// PATIENT ID
// DOCTOR ID
// RATING
// REVIEW