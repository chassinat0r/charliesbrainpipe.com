function getDateTimeInMinutes() {
    var datetime = new Date();

    return parseInt(datetime.getTime() / 60000);  
}

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const socket = io();

socket.emit('get time diff', getDateTimeInMinutes());

socket.on('return time diff', (data) => {
    let timeDiffStr = `You are ${Math.abs(data.hours)} hour${Math.abs(data.hours)!=1 ? "s" : ""} and ${Math.abs(data.minutes)} minute${Math.abs(data.minutes)!=1 ? "s" : ""} ${data.minutes < 0 || data.hours < 0 ? "behind" : "ahead of"} me`;
    $("#header_timediff").html(timeDiffStr);
});

socket.on('time changed', (datetime) => {
    var myDateTime = new Date(datetime*60*1000);
    let myWeekday = weekdays[myDateTime.getDay()];
    let myDate = myDateTime.getDate();
    let myMonth = months[myDateTime.getMonth()];
    let myYear = myDateTime.getFullYear();
    let myHour = myDateTime.getHours();
    let myMinute = myDateTime.getMinutes();

    let myDateStr = `${myWeekday}, ${myDate} ${myMonth} ${myYear}`;
    $("#header_date").html(myDateStr);
    let myTimeStr = `${myHour < 10 ? "0": ""}${(myHour > 12) ? myHour - 12 : myHour}:${myMinute < 10 ? "0": ""}${myMinute} ${(myHour > 12) ? "PM" : "AM"} BST`;
    $("#header_time").html(myTimeStr);
});

function getMyDatetime(data) {
    var myDateTime = new Date(data.datetime*60*1000);
    let myWeekday = weekdays[myDateTime.getDay()];
    let myDate = myDateTime.getDate();
    let myMonth = months[myDateTime.getMonth()];
    let myYear = myDateTime.getFullYear();
    let myHour = myDateTime.getHours();
    let myMinute = myDateTime.getMinutes();

    let myDateStr = `${myWeekday}, ${myDate} ${myMonth} ${myYear}`;
    $("#header_date").html(myDateStr);
    let myTimeStr = `${myHour < 10 ? "0": ""}${(myHour > 12) ? myHour - 12 : myHour}:${myMinute < 10 ? "0": ""}${myMinute} ${(myHour > 12) ? "PM" : "AM"} BST`;
    $("#header_time").html(myTimeStr);
    let timeDiffStr = `You are ${Math.abs(data.hourDiff)} hour${Math.abs(data.hourDiff)!=1 ? "s" : ""} and ${Math.abs(data.minuteDiff)} minute${Math.abs(data.minuteDiff)!=1 ? "s" : ""} ${data.minuteDiff < 0 || data.hourDiff < 0 ? "behind" : "ahead of"} me`;
    $("#header_timediff").html(timeDiffStr);
}

$.post('/api/check_signin', (data) => {
    if (data["signed_in"]) {
        $("#signin-form").remove();
        $(".main_sidebar").append(`<p>Signed in as <strong>${data["username"]}</strong></p>`);
    }
});
