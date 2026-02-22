const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcrypt');
const readline = require('node:readline');

const saltRounds = 10;

class DBHandler {
    static db; // Store sqlite object as a static variable

    /* initDB
    Description: Open the database and create tables and first account if they
    don't already exist
    Params:
    - filename: File the database is stored at
    */
    static async initDB(filename) {
        // Open database using the sqlite3 driver
        this.db = await open({
            filename: filename,
            driver: sqlite3.Database
        });

        // Create tables if they do not already exist
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS "Accounts" (
                "ID"	INTEGER NOT NULL UNIQUE,
                "Username"	TEXT,
                "Password"	TEXT,
                PRIMARY KEY("ID" AUTOINCREMENT)
            );
        `);

        await this.db.run(`
            CREATE TABLE IF NOT EXISTS "Sessions" (
                "Session"	TEXT UNIQUE,
                "UserID"	TEXT,
                PRIMARY KEY("Session")
            );
        `);

        await this.db.run(`
            CREATE TABLE IF NOT EXISTS "Posts" (
                "ID"    	INTEGER NOT NULL UNIQUE,
                "AuthorID"  INTEGER NOT NULL,
                "Date"      INTEGER NOT NULL,
                "Title"     TEXT NOT NULL,
                "Body"      TEXT,
                PRIMARY KEY("ID" AUTOINCREMENT)
            );
        `);

        await this.db.run(`
            CREATE TABLE IF NOT EXISTS "Pages" (
                "URL"       TEXT NOT NULL UNIQUE,
                "AuthorID"  INTEGER NOT NULL,
                "Date"      INTEGER NOT NULL,
                "Title"     TEXT NOT NULL,
                "Body"      TEXT,
                PRIMARY KEY("URL")
            );
        `);

        // Check if an account exists
        var row = await this.db.get("SELECT ID FROM Accounts");

        if (row === undefined) { // No account exists
            // Setup readline interface
            const rl = readline.promises.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            
            // Prompt the admin for a username and password
            console.log("No admin account set up yet!");
            const username = await rl.question("Enter username: ");
            const password = await rl.question("Enter password: ");

            rl.close(); // Close readline interface

            const hashedPassword = await bcrypt.hash(password, saltRounds); // Hash given password

            // Write to database
            await this.db.run(`
                INSERT INTO Accounts (Username, Password)
                VALUES ("${username}", "${hashedPassword}");
            `);
        }
    }

    /* Getter functions */

    /* getDO
    Returns: The database object
    */
    static getDO() { return this.db; }
}

module.exports = DBHandler;
