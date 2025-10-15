const { openDB } = require('./db')
const { v4: uuidv4 } = require('uuid');

const bcrypt = require('bcrypt');

async function signIn(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    const db = await openDB("mywebsite.db");

    const row = await db.get(`SELECT * FROM Accounts WHERE Username="${username}"`);
    
    if (row === undefined) {
        res.status(401).end("Invalid username or password");
        return false;
    }

    const hashedPassword = row["Password"];
    const id = row["ID"];

    const passwordValid = await bcrypt.compare(password, hashedPassword);

    if (!passwordValid) {
        res.status(401).end("Invalid username or password");
        return false;
    }

    const sessionID = uuidv4();

    await db.run("INSERT INTO Sessions (Session, UserID) VALUES (?, ?)", sessionID, id);

    res.cookie("session", sessionID, {
        expires: new Date(Date.now() + 31536000000)
    });

    await db.close();

    res.redirect('/');

    return true;
}

async function checkSignIn(req, res) {
    const sessionID = req.cookies["session"];

    if (sessionID === undefined) {
        res.jsonp({
            "signed_in": false
        });
        return false;
    }

    const db = await openDB("mywebsite.db");

    const row = await db.get("SELECT UserID FROM Sessions WHERE Session = ?", sessionID);

    if (row === undefined) {
        res.clearCookie("session");
        res.jsonp({
            "signed_in": false
        });
        return false;
    }

    const id = row["UserID"];

    const row2 = await db.get("SELECT * FROM Accounts WHERE ID = ?", id);

    if (row2 === undefined) {
        res.clearCookie("session");
        res.jsonp({
            "signed_in": false
        });
        return false;
    }

    const username = row2["Username"];

    res.jsonp({
        "signed_in": true,
        "username": username
    });

    res.end();

    return true;
}

module.exports = { signIn, checkSignIn };
