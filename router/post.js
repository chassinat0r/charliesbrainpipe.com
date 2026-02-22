const InvalidCredentialsError = require('../errors/InvalidCredentialsError');

const Authenticator = require('../controller/Authenticator');

const express = require('express');

const router = express.Router();

// For signing in to an admin account
router.post('/signin', async (req, res) => {
    try {
        // Try to login using given details
        const session = await Authenticator.login(req.body["username"], req.body["password"]);
        
        res.cookie("session", session); // Save session cookie to browser

        res.redirect('/'); // Redirect to index page
    } catch (error) { // If an error occurred
        if (error instanceof InvalidCredentialsError) { // User entered wrong credentials
            res.status(401).end(error.message); // Return a 401 unauthorised error with message
        } else {
            res.status(500).end("Internal Server Error");
        }
    }
});

module.exports = router;
