const express = require('express');
const http = require('http');
const https = require('https');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const fs = require('fs');

const DBHandler = require('./controller/DBHandler');

const getRouter = require('./router/get');
const postRouter = require('./router/post');

DBHandler.initDB("mywebsite.db"); // Open DB and setup tables if not done already

// Create two Express apps, one for the site itself and the other
// for redirecting HTTP to HTTPS
const app = express();
const redirectApp = express();

// Set ports for server to run on
const httpPort = 5000;
const httpsPort = 5443;

// Load SSL certificate and key
var options = {
    key: fs.readFileSync('ssl/charliesbrainpipe.com_key.txt'),
    cert: fs.readFileSync('ssl/charliesbrainpipe.com.crt'),
    ca: fs.readFileSync('ssl/charliesbrainpipe.com.ca-bundle')
};

// Setup middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Set routes
app.use("/", getRouter);
app.use("/api", postRouter);

// Create a server for HTTP and HTTPS
const httpServer = http.createServer(redirectApp);
const httpsServer = https.createServer(options, app);

// Redirect all HTTP requests to HTTPS
redirectApp.get("/{*any}", (req, res, next) => {
    res.redirect("https://" + req.headers.host + req.path);
});

// Listen HTTP redirect server
httpServer.listen(httpPort, () => {
  console.log(`HTTP server listening to redirect traffic on port ${httpPort}`);
});

// Listen HTTPS server
httpsServer.listen(httpsPort, () => {
    console.log(`HTTPS server listening on port ${httpsPort}`);
});
