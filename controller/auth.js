const { openDB } = require('./db')
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

    const passwordValid = await bcrypt.compare(password, hashedPassword);

    if (!passwordValid) {
        res.status(401).end("Invalid username or password");
        return false;
    }

    res.redirect('/');

    return true;
}

module.exports = { signIn };
