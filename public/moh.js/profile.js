
$(document).ready(function () {
    $.ajax({
        url: '/api/workbooks',
        type: 'GET',
    }).done(function (response) {
        if(response.success) {
            console.log(response);
            var workbooks = response.workbooks;
            var container = $('#workbooks');
            for (var i = 0; i < workbooks.length; i++) {
                var name = encodeURIComponent(workbooks[i].name);
                container.append('<a href="fill-workbook/' + name + '" class="btn btn-outline-secondary form-name-box mr-2">\n' +
                    '<span class="fas fa-table"></span> ' + workbooks[i].name + '</a>');
            }
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
            var filledWorkbooks = response.filledWorkbooks;
            var container = $('#filled-workbooks');
            for (var i = 0; i < filledWorkbooks.length; i++) {
                var name = encodeURIComponent(filledWorkbooks[i].name);
                container.append('<a href="edit-workbook/' + name + '" class="btn btn-outline-secondary form-name-box mr-2">\n' +
                    '<span class="fas fa-table"></span> ' + filledWorkbooks[i].name + '</a>');
            }
        }
    }).fail(function(xhr, status, error) {
        console.log('fail');
        showModalAlert('Error', xhr.responseJSON.message);
    });

});



function showModalAlert(title, msg) {
    $('#msg-modal').find('h5').html(title).end().find('p').html(msg).end().modal('show');
}