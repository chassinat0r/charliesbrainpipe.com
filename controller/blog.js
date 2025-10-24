const { getUserFromSession } = require('./auth')
const { openDB } = require('./db')
const marked = require('marked');

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

async function showBlogPost(req, res) {
    const postID = req.params.id;

    const db = await openDB("mywebsite.db");

    const row = await db.get("SELECT * FROM Posts WHERE ID = ?", postID)

    if (row === undefined) {
        res.status(404).end("Blog post doesn't exist");
        return false;
    }

    const authorID = row["AuthorID"];
    const date = row["Date"];
    const title = row["Title"];
    const body = row["Body"];

    const row2 = await db.get("SELECT Username FROM Accounts WHERE ID = ?", authorID);
    await db.close();

    const username = (row2 === undefined) ? "[deleted]" : row2["Username"];

    const dateObj = new Date(date);

    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const hour = dateObj.getHours()
    const hourStr = (hour < 10) ? "0" + hour.toString() : hour.toString();
    const minute = dateObj.getMinutes()
    const minuteStr = (minute < 10) ? "0" + minute.toString() : minute.toString();
    const weekday = dateObj.getDay();
    const weekdayStr = weekdays[weekday];
    const day = dateObj.getDate();
    const dayStr = (day < 10) ? "0" + day.toString() : day.toString();
    const month = dateObj.getMonth();
    const monthStr = months[month];
    const yearStr = dateObj.getFullYear().toString();

    const dateFormat = `${weekdayStr}, ${dayStr} ${monthStr} ${yearStr} ${hourStr}:${minuteStr}`;

    res.end(`
        <!DOCTYPE html>
        <html>
            <head lang="en">
                <meta charset="utf-8">
                <title>Charlie's Brainpipe -- Blog</title>
                <link rel="stylesheet" href="/styles.css">
            </head>
            <body>
                <section>
                    <div class="header">
                        <h1 class="header_sitetitle">Charlie's Brainpipe</h1>
                        <div class="header_datetime"><span id="header_time">Time Here</span>      <span id="header_date">Date Here</span></div>
                        <div id="header_timediff">Time Difference Here</div>
                        <ul class="header_navbar">
                            <li class="header_navbar_item"><a href="/">Home</a></li>
                            <li class="header_navbar_item"><a href="/blog">Blog</a></li>
                            <li class="header_navbar_item"><a href="/projects">Projects</a></li>
                            <li class="header_navbar_item"><a href="/about">About</a></li>
                        </ul> 
                    </div>
                    <div class="main">
                        <div class="main_sidebar">
                            <a href="https://petition.parliament.uk/petitions/722903">
                                <img src="/assets/osa.png" style="height: 60px;">
                            </a>
                            <a href="https://nodejs.org">
                                <img src="/assets/powered by node.png" style="height: 60px;">
                            </a>
                            <form class="main_sidebar_form" id="signin-form" action="/api/signin", method="POST">
                                <h3>Sign In (Admins Only)</h3>
                                <label for="username" class="main_sidebar_label">Username</label>
                                <input type="text" class="main_sidebar_input_text" name="username" id="username" required>
                                <label for="password" class="main_sidebar_label">Password</label>
                                <input type="password" class="main_sidebar_input_text" name="password" id="password" required>
                                <input type="submit" class="main_sidebar_submit" id="signin-btn" value="Sign In">
                            </form>
                        </div>
                        <div class="main_content">
                            <div class="main_content_post">
                                <h1 class="page_title">${title}</h1>
                                <p>Published: <strong>${dateFormat}</strong></p>
                                <p>Author: <strong>${username}</strong></p>
                                <p>${marked.parse(body)}</p>
                            </div>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Website by Chassinat0r.</p>
                        <p><a href="https://github.com/chassinat0r/charliesbrainpipe.com">Source on GitHub</a></p>

                    </div>
                </section>
                <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
                <script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
                <script src="/index.js"></script>
            </body>
        </html>
    `);
}

module.exports = { submitPost, showBlogPost };
