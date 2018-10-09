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
                render: function (data, type, row) {
                    var div = $('<div></div>').addClass('btn-group btn-group-toggle').attr('data-toggle', 'buttons')
                        .attr('id', 'radios-' + row.username);
                    var label1 = $('<label></label>').addClass('btn btn-secondary');
                    var label2 = label1.clone();
                    var opt1 = $('<input>').attr('type', 'radio').val('true').attr('autocomplete', 'off');
                    var opt2 = opt1.clone().val('false');
                    if (data) {
                        label1.addClass('active');
                        opt1.attr('checked', true);
                    }
                    else {
                        label2.addClass('active');
                        opt2.attr('checked', true);
                    }
                    div.append(label1.append(opt1).append('on')).append(label2.append(opt2).append('off'));

                    return div.prop('outerHTML');
                },

                targets: 5,
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


$('#save-btn').click(function () {
    var btn = $(this);
    var statusText = $('#status');
    statusText.html('<i class="fas fa-spinner fa-spin"></i> Saving');
    btn.prop('disabled', true);

    // get modified permissions and permissions
    var data = [], actives = [];
    for (var i = 0; i < userData.length; i++) {
        var selected = $('#select-' + userData[i].username).val();
        if (selected !== undefined && !compare(selected, userData[i].permissions))
            data.push({permissions: selected, username: userData[i].username});

        var active = $('input' ,$('label.active', '#radios-' + userData[i].username)).val();
        if (active !== undefined && active !== userData[i].active + '')
            actives.push({active: active, username: userData[i].username});
    }

    console.log(actives);


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
