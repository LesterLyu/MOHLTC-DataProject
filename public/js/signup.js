$("#signupForm").submit(function(e) {
    e.preventDefault();
    $.ajax({
        url: '/api/signup',
        type: 'POST',
        data: $('#signupForm').serialize(),
    }).done(function (response) {
        if(response.success) {
            console.log(response);
            window.location.href = response.redirect;
        }
    }).fail(function(xhr, status, error) {
        console.log('fail');
        showModalAlert('Login Error', xhr.responseJSON.message);
    });
});

function showModalAlert(title, msg) {
    $('#msg-modal').find('h5').html(title).end().find('p').html(msg).end().modal('show');
}