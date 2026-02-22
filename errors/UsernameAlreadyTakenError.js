class UsernameAlreadyTakenError extends Error {
    constructor(message) {
        super(message);
        this.name = "UsernameAlreadyTakenError";
    }
}

module.exports = UsernameAlreadyTakenError;
