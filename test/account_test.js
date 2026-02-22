const Account = require('../controller/Account');
const DBHandler = require('../controller/DBHandler');

(async () => {
    await DBHandler.initDB("mywebsite.db");
    try {
        await Account.create("johndoe", "password123");
    } catch (error) {
        console.log("Account already exists");
    }
    const myAccount = await Account.load(2);
    console.log(myAccount.getID());
    console.log(myAccount.getUsername());
    await myAccount.setUsername("chas2");
    console.log(myAccount.getID());
    console.log(myAccount.getUsername()); 
})();


