const DBHandler  = require('./DBHandler');
const Account = require('./Account');

const InvalidCredentialsError = require('../errors/InvalidCredentialsError');

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

class Authenticator {
    static sessions = {}; // Store the sessions and corresponding accounts here
    // TODO: Move to store in a database table

    /* login
    Description: Authenticate a username and password and generate a unique
    session.
    Params:
    - username: Username of the account
    - password: Password of the account
    Returns: Unique session for the client
    */
    static async login(username, password) {
        const db = DBHandler.getDO();
        
        // Query the account with the given username
        const account = await db.get("SELECT * FROM Accounts WHERE username = ?", username);

        if (account === undefined) { // No account found matching that username
            // Throw InvalidCredentialsError
            throw new InvalidCredentialsError("Incorrect username or password");
        }

        const hash = account["Password"]; // Get account password hash

        // Check if the given password is correct
        const passwordValid = await bcrypt.compare(password, hash);

        if (!passwordValid) { // If the password is invalid
            // Throw InvalidCredentialsError
            throw new InvalidCredentialsError("Incorrect username or password");
        }

        const id = account["ID"]; // Get the ID of the account

        const session = uuidv4(); // Generate a session using UUIDv4

        this.sessions[session] = await Account.load(id); // Store Account object in JSON with session as key

        return session;
    }

    /* Getter functions */

    /* getAccount 
    Params:
    - session: Session to find owner account of
    Returns: Account corresponding to session
    */
    static getAccount(session) { return this.sessions[session]; }
}

module.exports = Authenticator;
