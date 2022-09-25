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