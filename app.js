const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

const app = express();
const port = 5000;

app.use(express.static('public'));
app.use(bodyParser.json());
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const server = http.createServer(app);


function getDateTimeInMinutes() {
    var datetime = new Date();

    return parseInt(datetime.getTime() / 60000);  
}

app.post('/post/time', urlencodedParser, (req, res) => {
    let datetime = getDateTimeInMinutes();
    let timeDiff = req.body.dt - datetime;
    let hourDiff = parseInt(timeDiff / 60);
    let minuteDiff = parseInt(timeDiff - hourDiff*60);
    res.send({
        datetime: datetime,
        hourDiff: hourDiff,
        minuteDiff: minuteDiff
    });
    res.end();
});

let datetime;

const io = new Server(server);

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

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
