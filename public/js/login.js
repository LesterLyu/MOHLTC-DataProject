/*  ======== User login =================  */
function login(){

    const data = {
        "username": $("#username").val(),
        "password": $("#password").val()
    };

    $.ajax({
        url: '/api/login',
        method: "POST",
        contentType:"application/json; charset=utf-8",
        data: JSON.stringify(data),
    }).done(function (response) {
        if(response.success) {
            console.log(response);
            window.location.href = response.redirect;
        }
    }).fail(function(xhr, status, error) {
        showModalAlert('Login Error', xhr.responseJSON.message.message);
    });
}

function showModalAlert(title, msg) {
    $('#msg-modal').find('h5').html(title).end().find('p').html(msg).end().modal('show');

}