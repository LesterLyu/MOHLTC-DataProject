var userData = [];

//helpers
// runs into O(nLogn)
function compare(array1, array2) {
    array1.sort();
    array2.sort();
    for (var i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i]) return false;
    }
    return true;
}

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
            url: '/api/user/details',
            dataSrc: 'users'
        },
        columns: [
            {'data': 'username'},
            {'data': 'groupNumber'},
            {'data': 'validated'},
            {'data': 'email'},
            {'data': 'permissions'},
            {'data': 'active'},
        ],
        columnDefs: [
            {
            render: function (data, type, row) {
                var newPer = $('<select></select>').addClass('selectpicker')
                    .attr('multiple', 'multiple').attr('id', 'select-' + row.username)
                    .attr('data-style', 'btn-outline-primary')
                    .attr('data-live-search', 'true');
                for (var i = 0; i < permissions.length; i++) {
                    var option = $('<option>', {
                        value: permissions[i],
                        text: permissions[i],
                    });
                    if (data.includes(permissions[i])) {
                        option.attr('selected', 'selected')
                    }
                    newPer.append(option);
                }

                return newPer.prop('outerHTML');
            },
            targets: 4
            },
            {
                targets: 5,
                render: function (data, type, row) {
                    if (data) {
                        console.log(data);
                        var button = '<div class="btn-group btn-group-toggle" data-toggle="buttons">' +
                         //   '<label class="btn btn-secondary active">' +
                            '<input type="radio" name="options" id="option1" value="' + row.username + '" autocomplete="off" checked> Active' +
                         //   '</label>' +
                          //  '<label class="btn btn-secondary">' +
                            '<input type="radio" name="options" id="option2" value="' + row.username + '" autocomplete="off"> Radio' +
                         //   '</label>' +
                            '</div>';
                        return button;
                    }
                    if (!data) {
                        console.log("ss");
                        var button ='<div class="btn-group btn-group-toggle" data-toggle="buttons">' +
                        //    '<label class="btn btn-secondary">' +
                            '<input type="radio" name="options" id="option1" value="' + row.username + '" autocomplete="off"> Active' +
                         //   '</label>' +
                          //  '<label class="btn btn-secondary active">' +
                            '<input  type="radio" name="options" id="option2" value="' + row.username + '" autocomplete="off" checked> Radio' +
                        //    '</label>' +
                            '</div>';
                        return button;
                    }

                }
            }

        ],
        initComplete: function (settings, json) {
            // store locally
            userData = json.users;

        }
    }).on('draw', function () {
        // reload selectpicker
        $('select').selectpicker();
    });
}

$("#user-table").on("click","#option1,#option2",function(){
    alert('You clicked radio!');
    console.log($(this).attr("value"));
});



$('#save-btn').click(function () {
    var btn = $(this);
    var statusText = $('#status');
    statusText.html('<i class="fas fa-spinner fa-spin"></i> Saving');
    btn.prop('disabled', true);

    var data = [];
    for (var i = 0; i < userData.length; i++) {
        var selected = $('#select-' + userData[i].username).val();
        if (selected !== undefined && !compare(selected, userData[i].permissions))
            data.push({permissions: selected, username: userData[i].username})
    }
    console.log(data);

    // send to server
    $.ajax({
        url: '/api/user/permission',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({data: data}),
    }).done(function (response) {
        if (response.success) {
            statusText.html('<i class="fas fa-check"></i> Saved');
            btn.prop('disabled', false);
        }
    }).fail(function (xhr, status, error) {
        console.log(xhr.responseJSON.message);
        statusText.html('<i class="fas fa-check"></i> ' + xhr.responseJSON.message);
        btn.prop('disabled', false);
    });

});
