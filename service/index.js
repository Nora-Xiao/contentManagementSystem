const express = require('express');
const morgan = require("morgan");
const http = require('http');
const path = require('path');
const sqlite3 = require('sqlite-async');

const port = 3000;
const app = express();
const server = http.createServer(app);

let database = null;
const initDatabasePromise = new Promise((resolve, reject) => {
    const databaseFile = path.join(__dirname, 'cms.db');
    sqlite3.open(databaseFile).then(result => {
        database = result;
        console.log(` * Sqlite3 database [${databaseFile}] connected`);
        resolve();
    }).catch(error => {
        console.log(` * Sqlite3 database [${databaseFile}] error`);
        console.error(error);
    });
});

if (!module.parent) {
    app.use(morgan("dev"));
}

app.get('/', async (req, res) => {
    try {
        await initDatabasePromise;
        const result = await database.all(`SELECT * FROM content`);
        res.json(result);
    } catch (error) {
        console.error(error);
    }
});

/* istanbul ignore next */
if (!module.parent) {
    server.listen(port);
    console.log(` * Service started on Port ${port}`);
}