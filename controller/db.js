const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcrypt');
const readline = require('node:readline');

async function openDB(filename) {
    return open({
        filename: filename,
        driver: sqlite3.Database
    });
}

async function hash(plaintext) {
    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(plaintext, 10, (err, hash) => {
            if (err) reject(err);
            resolve(hash);
        });
    });

    return hashedPassword;
}

async function initDB() {
    const db = await openDB("mywebsite.db");

    await db.run(`
        CREATE TABLE IF NOT EXISTS "Accounts" (
            "ID"	INTEGER NOT NULL UNIQUE,
            "Username"	TEXT,
            "Password"	TEXT,
            PRIMARY KEY("ID" AUTOINCREMENT)
        );
    `);

    var row = await db.get("SELECT ID FROM Accounts");

    if (row === undefined) {
        const rl = readline.promises.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        
        console.log("No admin account set up yet!");
        const username = await rl.question("Enter username: ");
        const password = await rl.question("Enter password: ");

        rl.close();

        const hashedPassword = await hash(password);

        await db.run(`
            INSERT INTO Accounts (Username, Password)
            VALUES ("${username}", "${hashedPassword}");
        `);
    }

    await db.close();
}

module.exports = { openDB, hash, initDB };
