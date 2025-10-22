const { getUserFromSession } = require('./auth')
const { openDB } = require('./db')

async function submitPost(req, res) {
    const userID = await getUserFromSession(req.cookies["session"]);

    if (userID == -1) {
        res.jsonp({
            code: 401,
            msg: "You are not authorised to publish to this site."
        });
        res.end();
        return;
    }

    const { title, body } = req.body;

    const db = await openDB("mywebsite.db");

    await db.run("INSERT INTO Posts (AuthorID, Date, Title, Body) VALUES (?, ?, ?, ?)", userID, (new Date()).getTime(), title, body);

    await db.close();

    res.jsonp({
        code: 200
    });

    res.end();
}

module.exports = { submitPost };
