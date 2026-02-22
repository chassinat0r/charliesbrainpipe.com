const DBHandler  = require('./DBHandler');
const UsernameAlreadyTakenError = require('../errors/UsernameAlreadyTakenError');
const AccountNotFoundError = require('../errors/AccountNotFoundError');

const bcrypt = require('bcrypt');

// Account data object
class Account {
    /* constructor
    Description: Set the ID and username of the account
    Params:
    - id: Unique numeric ID for account
    - username: Username of the account
    */
    constructor(id, username) {
        this.id = id;
        this.username = username;
    }

    /* load
    Description: Load an account by its ID
    Params:
    - id: Unique numeric ID for account
    Returns: An account object corresponding to given ID
    */
    static async load(id) {
        var db = await DBHandler.getDO(); // Get database object

        var row = await db.get("SELECT Username FROM Accounts WHERE ID = ?", id); // Query username corresponding to ID

        if (row === undefined) { // No account was found with that ID
            // Throw an AccountNotFoundError
            throw new AccountNotFoundError(`No account with ID ${id} exists`);
        }

        return new Account(id, row["Username"]); // Create an Account object with ID and username and return it
    }

    /* create
    Description: Create a new account with a given username and password
    Params:
    - username: Username for the new account
    - password: Plaintext password for the new account
    */
    static async create(username, password) {
        var db = await DBHandler.getDO();

        // Check if the username is already in use
        var existingAccount = await db.get("SELECT ID FROM Accounts WHERE Username = ?", username); // Query account with the desired username

        if (existingAccount) { // A match was found
            // Throw a UsernameAlreadyTakenError
            throw new UsernameAlreadyTakenError(`Username "${username}" already taken`);
        }

        const hash = await bcrypt.hash(password, 10); // Hash the password using bcrypt

        await db.run("INSERT INTO Accounts (Username, Password) VALUES (?, ?)", username, hash); // Insert into table
    }

    /* Getter functions */

    /* getID
    Returns: ID of account
    */
    getID() { return this.id; }

    /* getUsername
    Returns: Username of account
    */
    getUsername() { return this.username; }

    /* Setter functions */

    /* setUsername
    Description: Set username of account
    Params:
    - username: New username
    */
    async setUsername(username) {
        var db = await DBHandler.getDO();

        // Check if username already in use by another account
        var existingAccount = await db.get("SELECT ID FROM Accounts WHERE Username = ?", username);

        if (existingAccount) {
            throw new UsernameAlreadyTakenError(`Username "${username}" already taken`);
        }

        // Update username to new
        await db.run("UPDATE Accounts SET Username = ? WHERE ID = ?", username, this.id);
        
        this.username = username; // Also set username property of object
    }
}

module.exports = Account;
