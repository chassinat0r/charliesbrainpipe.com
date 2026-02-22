class AccountNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "AccountNotFoundError";
    }
}

module.exports = AccountNotFoundError;
