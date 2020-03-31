const express = require('express');
const morgan = require("morgan");
const http = require('http');
const path = require('path');
const sqlite3 = require('sqlite-async');
const bodyParser = require('body-parser');
const uuidv4 = require('uuid/v4');
const fs = require("fs");
const url = require('url');

const port = 3001;
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

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());

app.get('/', async (req, res) => {
    try {
        await initDatabasePromise;
        const result = await database.all(`SELECT * FROM content`);
        res.json(result);
    } catch (error) {
        console.error(error);
    }
});

app.get('/folderName', async (req, res) => {
    try {
        await initDatabasePromise;
        const result = await database.all(`SELECT filename FROM content WHERE is_folder = 1`);
        res.json(result);
    } catch (error) {
        console.error(error);
    }
});

app.get('/fileName', async (req, res) => {
    try {
        await initDatabasePromise;
        const result = await database.all(`SELECT filename FROM content WHERE is_folder IS null`);
        res.json(result);
    } catch (error) {
        console.error(error);
    }
});

app.get('/fileContent', async (req, res) => {
    try {
        await initDatabasePromise;
        const queryObject = url.parse(req.url,true).query;
        
        const result = await database.get("SELECT guid FROM content WHERE filename = '" + queryObject.fileName + "'");
        let guid = result.guid;
        let filePath = "upload/" + guid + ".json";
        let file = fs.readFile(filePath, "utf8", function(err, data) {
            res.send(data);
        });
        
        /*
        fs.readFile(filePath, function(err, data) {
            // json object
            let json = JSON.parse(data);
            res.json(json);
        });
        */
    } catch (error) {
        console.error(error);
    }
});

app.get('/subFolder', async (req, res) => {
    try {
        await initDatabasePromise;
        const queryObject = url.parse(req.url,true).query;
        let currentFolder = queryObject.currentFolder;
        if (currentFolder === "rootFolder") {
            var parent = "IS null";
        } else {
            let parentId = await database.get("SELECT id FROM content WHERE filename = '" + currentFolder + "'");
            var parent = "= " + parentId.id;
        }
        console.log(parent);
        const result = await database.all(`SELECT filename FROM content WHERE is_folder = 1 AND parent ` + parent);
        res.json(result);
    } catch (error) {
        console.error(error);
    }
});

// all files under a specific folder
app.get('/fileList', async (req, res) => {
    try {
        await initDatabasePromise;
        const queryObject = url.parse(req.url,true).query;
        let currentFolder = queryObject.currentFolder;
        
        let parentId = await database.get("SELECT id FROM content WHERE filename = '" + currentFolder + "'");
        let sql = "SELECT filename FROM content WHERE is_folder IS NULL and parent =" + parentId.id;
      //  let sql = "SELECT filename FROM content WHERE is_folder IS NULL and parent ='" + currentFolder + "'";
        const result = await database.all(sql);
        res.json(result);
    } catch (error) {
        console.error(error);
    }
});

// all files not under a specific folder
app.get('/notFileList', async (req, res) => {
    try {
        await initDatabasePromise;
        const queryObject = url.parse(req.url,true).query;
        let currentFolder = queryObject.currentFolder;
        let parentId = await database.get("SELECT id FROM content WHERE filename = '" + currentFolder + "'");
        const result = await database.all("SELECT filename FROM content WHERE is_folder IS null AND parent !=" + parentId.id);
        console.log(result);
        //const result = await database.all("SELECT filename FROM content WHERE is_folder IS null AND parent !='" + currentFolder + "'");
        res.json(result);
    } catch (error) {
        console.error(error);
    }
});

app.post('/newFolder', async (req, res) => {
    try {
        await initDatabasePromise;

        let columnNames = 'id, filename, is_folder, parent, guid, size, upload_time, modified_time';
        let sql = 'INSERT INTO content(' + columnNames + ') VALUES(?, ?, ?, ?, ?, ?, ?, ?)';

        // get the last id
        let result = await database.get(`SELECT id FROM content ORDER BY id DESC`);

        let timeNow = getTimeNow();
        let body = req.body;
        if (body.parentFolder === "rootFolder") {
            var parent = null;
        } else {
            let parentId = await database.get("SELECT id FROM content WHERE filename = '" + body.parentFolder + "'");
            var parent = parentId.id;
        }
        let values = [result.id + 1, body.newFolderName, 1, parent, null, 0, timeNow, timeNow];
     //   let values = [result.id + 1, body.newFolderName, 1, body.parentFolder, null, 0, timeNow, timeNow];
        await database.run(sql, values, function(err) {
            if (err) {
              return console.log(err.message);
            }
            // get the last insert id
            console.log(`A row has been inserted with rowId ${this.lastID}`);
           // res.json({status: "success"});
        });
    } catch (error) {
        console.error(error);
    }
});

app.post('/uploadFile', async (req, res) => {
    try {
        await initDatabasePromise;
        
        let columnNames = 'id, filename, is_folder, parent, guid, size, upload_time, modified_time';
        let sql = 'INSERT INTO content(' + columnNames + ') VALUES(?, ?, ?, ?, ?, ?, ?, ?)';

        // get the last id
        let result = await database.get(`SELECT id FROM content ORDER BY id DESC`);

        let timeNow = getTimeNow();
        let body = req.body;
        // both are string, uuidv4() and guid
        let guid = uuidv4();
        let parentId = await database.get("SELECT id FROM content WHERE filename = '" + body.folder + "'");
        let values = [result.id + 1, body.fileName, null, parentId.id, guid, body.fileSize, timeNow, timeNow];
       //let values = [result.id + 1, body.fileName, null, body.folder, guid, body.fileSize, timeNow, timeNow]

        fs.writeFile("upload/" + guid + ".json", body.fileContent, "utf8", console.log);
        
        await database.run(sql, values, function(err) {
            if (err) {
              return console.log(err.message);
            }
            // get the last insert id
            console.log(`A row has been inserted with rowId ${this.lastID}`);
        });
    } catch (error) {
        console.error(error);
    }
});

app.post('/updateFile', async (req, res) => {
    try {
        await initDatabasePromise;
        
        let body = req.body;
        let fileName = body.fileName;
        let newSize = body.size;
        let newString = body.string;

        let guid = await database.get("SELECT guid FROM content WHERE filename = '" + fileName + "'");

        fs.writeFile("upload/" + guid.guid + ".json", newString, "utf8", console.log);

        let time = getTimeNow();
        let sql = "UPDATE content SET modified_time = '" + time + "', size = " + newSize + " WHERE filename = '" + fileName + "'";

        await database.run(sql, function(err) {
            if (err) {
              return console.log(err.message);
            }
            // get the last insert id
            console.log(`A row has been inserted with rowId ${this.lastID}`);
        });
    } catch (error) {
        console.error(error);
    }
});

app.post('/deleteFolder', async (req, res) => {
    try {
        await initDatabasePromise;

        let sql = "DELETE FROM content WHERE filename = '" + req.body + "'";
        
        await database.run(sql, function(err) {
            if (err) {
              return console.log(err.message);
            }
            // get the last insert id
            console.log(`A row has been inserted with rowId ${this.lastID}`);
        });
    } catch (error) {
        console.error(error);
    }
});

app.post('/deleteFiles', async (req, res) => {
    try {
        await initDatabasePromise;
        let fileNames = req.body.filesNames;
        for (let i = 0; i < fileNames.length; i++) {
            let result = await database.get("SELECT guid FROM content WHERE filename = '" + fileNames[i] + "'");
            let guid = result.guid;
            fs.unlink("upload/" + guid + ".json", function (err) {
                if (err) throw err;
                // if no error, file has been deleted successfully
                console.log('File deleted!');
            }); 

            let sql = "DELETE FROM content WHERE filename = '" + fileNames[i] + "'";
            await database.run(sql, function(err) {
                if (err) {
                  return console.log(err.message);
                }
            });
        }
    } catch (error) {
        console.error(error);
    }
});

function getTimeNow() {
    // get time now
    let date_ob = new Date();
    
    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();

    // current milliseconds
    let milliseconds = date_ob.getMilliseconds();

    // date & time in YYYY-MM-DD HH:MM:SS format
    let timeNow = year + "-" + month + "-" + date + " " + hours + ":" + minutes + 
                  ":" + seconds + "." + milliseconds;
    return timeNow;
}

/* istanbul ignore next */
if (!module.parent) {
    server.listen(port);
    console.log(` * Service started on Port ${port}`);
}