const Client = require('ssh2').Client;
const express = require('express');
const socket = require('socket.io');
const basicAuth = require('./_helpers/basic-auth');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

const HOST = 'app-sandbox.southeastasia.cloudapp.azure.com'
const PORT = '22'
const USERNAME = 'ubpchaindev'
const PASSWORD = 'P@ssw0rd1234'

const requests = [];
const hashes = [];

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(basicAuth);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.post('/uploadFile', (req, res) => {
    let connSettings = {
        host: HOST,
        port: PORT,
        username: USERNAME,
        password: PASSWORD
    };
    let body = req.body || {};
    let source = body.source || null;
    let target = body.target || null;
    var conn = new Client();
    conn.on('ready', function () {
        conn.sftp(function (err, sftp) {
            if (err) {
                conn.end();
            };
            var fs = require("fs"); // Use node filesystem
            var readStream = fs.createReadStream("public/" + source);
            var writeStream = sftp.createWriteStream("LMS/" + target);

            writeStream.on('close', function () {
                console.log(target + " - file transferred succesfully");
            });

            writeStream.on('end', function () {
                console.log("sftp connection closed");
                conn.close();
            });

            // initiate transfer of file
            readStream.pipe(writeStream);
        });
    }).connect(connSettings);
    res.status(200).json({ status: 'success' });
});

app.get('/:name', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.all('/', (req, res) => {
    let body = req.body || {};
    let header = req.headers || {};
    let room = req.params.name || "default";
    let details = {
        path: req.path,
        method: req.method
    }
    emit(room, body, header, details);
    res.status(200).json({ status: 'success' });
});

app.all('/:name', (req, res) => {
    let body = req.body || {};
    let header = req.headers || {};
    let room = req.params.name || "default";
    let details = {
        path: req.path,
        method: req.method
    }
    emit(room, body, header, details);
    res.status(200).json({ status: 'success' });
});

function emit(room, body, header, details) {
    io.sockets.in(room).emit('request', {
        details,
        header,
        body
    });
}

let port = process.env.PORT;
if (port == null || port == "") {
    port = 8000;
}

let server = app.listen(port, (err) => {
    if (err) { return console.error(err); }
    console.log('Listening to port ' + port);
})

let io = socket(server);
io.on('connection', (socket) => {
    console.log('made socket connection', socket.id);

    socket.on('path', function (path) {
        let room = path === "" ? "default" : path;
        socket.join(room);
    });
});