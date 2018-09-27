function getAllUsers() {

    $.ajax({
        url: '/api/user/details',
        type: 'GET',
    }).done(function (response) {
        if(response.success) {
            console.log(response);
            return response;
        }
    }).fail(function(xhr, status, error) {
        console.log('fail');
    });
}





$(document).ready(function() {
    $.ajax({
        url: '/api/user/details',
        type: 'GET',
    }).done(function (response) {
        if(response.success) {
            console.log(response);
            var allUser = [];
            for (var i = 0; i < response.users.length; i++ ) {
                var user = [];
                user.push(response.users[i].username);
                user.push(response.users[i].firstName);
                user.push(response.users[i].lastName);
                user.push(response.users[i].createDate);
                user.push(response.users[i].phoneNumber);
                user.push(response.users[i].email);
                user.push(response.users[i].groupNumber);
                allUser.push(user);
            }
            console.log(allUser);
            $('#users').DataTable( {
                data: allUser,
                columns: [
                    { title: "username" },
                    { title: "firstName" },
                    { title: "lastName" },
                    { title: "createDate" },
                    { title: "phoneNumber" },
                    { title: "email" },
                    { title: "groupNumber" }
                ]
            } );
        }
    }).fail(function(xhr, status, error) {
        console.log('fail');
    });

} );