const InvalidCredentialsError = require('../errors/InvalidCredentialsError');

const Authenticator = require('../controller/Authenticator');
const Account = require('../controller/Account');

const express = require('express');

const router = express.Router();

// For seeing if the user is signed in
router.get('/check_signin', async (req, res) => {
    if (req.cookies["session"] === undefined) { // If there is no session cookie
        // User is not signed in
        res.jsonp({
            signed_in: false
        });
        return false; // Halt further execution
    }
    try {
        // Try to get account corresponding to session stored as cookie
        let account = Authenticator.getAccount(req.cookies["session"]);
        // If that was successful, user is signed in so send both that and the username to frontend
        res.jsonp({
            signed_in: true,
            username: account.getUsername()
        });
        return true;
    } catch (error) { // Something went wrong (e.g. no account for that session)
        res.jsonp({
            signed_in: false,
        }); // User is not signed in
        return false;
    }
});

module.exports = router;
