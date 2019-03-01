var userData = [];

$(document).ready(function () {

    $.ajax({
        url: '/api/permissions',
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

function initDatatable(permissions) {
    $('#user-table').DataTable({
        ajax: {
            url: '/api/user/registerInfo',
            dataSrc:'registerrequests'
        },
        columns: [
            {'data': 'username'},
            {'data': 'firstName'},
            {'data': 'lastName'},
            {'data': 'organization'},
            {'data': 'role'},
            {'data': 'groupNumber'},
            {'data': 'email'},
            {'data': 'phoneNumber'}
        ],
        columnDefs: [
            {
                render: function (data, type, row) {
                    var div = $('<div></div>');
                    var button1 = $('<button></button>').addClass('btn btn-outline-primary')
                        .attr('type', 'button').attr('id', row.username).val('approve').attr('name', row.role).append('Approve');
                    var button2 = $('<button></button>').addClass('btn btn-outline-danger')
                        .attr('type', 'button').attr('id', row.username).val('disapprove').attr('name', row.role).append('Disapprove');

                    div.append(button1).append('&nbsp;').append(button2);

                    return div.prop('outerHTML');
                },

                targets: 8,
            }

        ],
    });
}

$(document).on('click', 'button', function() {
    var username = $(this).attr('id');
    var value = $(this).val();
    var role = $(this).attr('name');
    var data = {username, value, role};
    $.ajax({
        url: '/api/user/register_management',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({data: data}),
    }).done(function (response) {
        if (response.success) {
            location.reload();
        }
    }).fail(function (xhr, status, error) {
        console.log(xhr.responseJSON.message);
        statusText.html('<i class="fas fa-check"></i> ' + xhr.responseJSON.message);
        btn.prop('disabled', false);
    });


});

