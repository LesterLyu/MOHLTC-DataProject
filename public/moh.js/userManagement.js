$(document).ready(function () {


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
        ],
    });


});