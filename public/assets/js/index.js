$.get('/check_signin', (data) => {
    if (data["signed_in"]) {
        $("#signin-form").remove();
        $(".main_sidebar").append(`<p>Signed in as <strong>${data["username"]}</strong></p>`);
    } else {
        $(".main_content_adminbtns").remove();
    }
});
