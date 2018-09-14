$.ajax({
    url: '/api/workbooks',
    type: 'GET',
}).done(function (response) {
    if(response.success) {
        console.log(response);
        let html = ' <a href="fillForm" class="btn btn-outline-secondary form-name-box">\n' +
            '                        <span class="fas fa-table"></span> Title</a>';
        $('#workbooks').html();
    }
}).fail(function(xhr, status, error) {
    console.log('fail');
    showModalAlert('Error', xhr.responseJSON.message);
});

$.ajax({
    url: '/api/filled-workbooks',
    type: 'GET',
}).done(function (response) {
    if(response.success) {
        console.log(response);
        let html = ' <a href="fillForm" class="btn btn-outline-secondary form-name-box">\n' +
            '                        <span class="fas fa-table"></span> Title</a>';
        $('#filled-workbooks').html();
    }
}).fail(function(xhr, status, error) {
    console.log('fail');
    showModalAlert('Error', xhr.responseJSON.message);
});


function showModalAlert(title, msg) {
    $('#msg-modal').find('h5').html(title).end().find('p').html(msg).end().modal('show');
}