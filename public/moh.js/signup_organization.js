$(document).ready(function () {

    $.ajax({
        url: '/api/organizations',
        type: 'GET',
    }).done(function (response) {
        if (response.success) {
            // init datatable
            initDatatable(response.permissions);

        }
    }).fail(function (xhr, status, error) {
        console.log(xhr.responseJSON.message);
    });
});