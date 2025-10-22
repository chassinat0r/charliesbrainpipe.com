const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcrypt');
const readline = require('node:readline');

const saltRounds = 10;

async function openDB(filename) {
    return open({
        filename: filename,
        driver: sqlite3.Database
    });
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

    await db.run(`
        CREATE TABLE IF NOT EXISTS "Sessions" (
            "Session"	TEXT UNIQUE,
            "UserID"	TEXT,
            PRIMARY KEY("Session")
        );
    `);

    await db.run(`
        CREATE TABLE IF NOT EXISTS "Posts" (
            "ID"    	INTEGER NOT NULL UNIQUE,
            "AuthorID"  INTEGER NOT NULL,
            "Date"      INTEGER NOT NULL,
            "Title"     TEXT NOT NULL,
            "Body"      TEXT,
            PRIMARY KEY("ID" AUTOINCREMENT)
        );
    `);

    await db.run(`
        CREATE TABLE IF NOT EXISTS "Pages" (
            "URL"       TEXT NOT NULL UNIQUE,
            "AuthorID"  INTEGER NOT NULL,
            "Date"      INTEGER NOT NULL,
            "Title"     TEXT NOT NULL,
            "Body"      TEXT,
            PRIMARY KEY("URL")
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

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await db.run(`
            INSERT INTO Accounts (Username, Password)
            VALUES ("${username}", "${hashedPassword}");
        `);
    }

    await db.close();
}

module.exports = { openDB, initDB };
