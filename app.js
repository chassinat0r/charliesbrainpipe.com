const express = require('express');
const http = require('http');
const https = require('https');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const fs = require('fs');

const { initDB } = require('./controller/db');
const { signIn, checkSignIn } = require('./controller/auth');
const { submitPost } = require('./controller/blog');

const app = express();
const redirectApp = express();

const httpPort = 5000;
const httpsPort = 5443;

var options = {
    key: fs.readFileSync('ssl/charliesbrainpipe.com_key.txt'),
    cert: fs.readFileSync('ssl/charliesbrainpipe.com.crt'),
    ca:fs.readFileSync('ssl/charliesbrainpipe.com.ca-bundle')
};

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cookieParser());

var urlencodedParser = bodyParser.urlencoded({ extended: false });

const httpServer = http.createServer(app);
const httpsServer = https.createServer(options, app);

redirectApp.get("/{*any}", (req, res, next) => {
    res.redirect("https://" + req.headers.host + req.path);
});

function getDateTimeInMinutes() {
    var datetime = new Date();

    return parseInt(datetime.getTime() / 60000);  
}

app.get('/blog', (req, res) => {
    res.sendFile("public/blog.html", {root: __dirname });
});

app.post('/api/signin', urlencodedParser, signIn);

app.post('/api/check_signin', urlencodedParser, checkSignIn);

app.post('/api/submit_post', urlencodedParser, submitPost);

let datetime;

const io = new Server(httpServer);

io.on('connection', (socket) => {
    socket.emit('time changed', datetime);

    socket.on('disconnect', () => {
        console.log("A user disconnected");
    });

    socket.on('get time diff', (data) => {
        let dt = getDateTimeInMinutes();
        let timeDiff = data - dt;
        let hourDiff = parseInt(timeDiff / 60);
        let minuteDiff = parseInt(timeDiff - hourDiff*60);

        socket.emit('return time diff', {
            hours: hourDiff,
            minutes: minuteDiff
        });
    })
});

function updateDateTime() {
    let newDatetime = getDateTimeInMinutes();
    if (datetime != newDatetime) {        
        datetime = newDatetime;
        io.emit('time changed', datetime);
    }
    
    setTimeout(updateDateTime, 1000);
}

updateDateTime();

initDB();

httpServer.listen(httpPort, () => {
  console.log(`HTTP server listening to redirect traffic on port ${httpPort}`);
});

httpsServer.listen(httpsPort, () => {
    console.log(`HTTPS server listening on port ${httpsPort}`);
});
