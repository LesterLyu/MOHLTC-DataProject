

$(document).ready(function () {
    $.ajax({
        url: '/api/categories',
        type: 'GET',
    }).done(function (response) {
        if(response.success) {
            console.log(response);
            var categories = response.categories;
            var container = $('#CatDropDown');
            for (var i = 0; i < categories.length; i++) {
                var category = encodeURIComponent(categories[i].category);
                console.log(category);
                container.append('<option value="' + category + '">' + category + '</option>');
            }
        }
    }).fail(function(xhr, status, error) {
        console.log('fail');
        showModalAlert('Error', xhr.responseJSON.message);
    });

});


$(document).ready(function () {
    $.ajax({
        url: '/api/attributes',
        type: 'GET',
    }).done(function (response) {
        if(response.success) {
            console.log(response);
            var attributes = response.attributes;
            var container = $('#AttDropDown');
            for (var i = 0; i < attributes.length; i++) {
                var attribute = encodeURIComponent(attributes[i].attribute);
                container.append('<option value="' + attribute + '">' + attribute + '</option>');
            }
        }
    }).fail(function(xhr, status, error) {
        console.log('fail');
        showModalAlert('Error', xhr.responseJSON.message);
    });

});




$("#categoryForm").submit(function(e) {
    var category = $('#CatDropDown').val();
    e.preventDefault();
    hideAlert();
    hideErrorAlert();
    $.ajax({
        url: '/api/delete-cat',
        type: 'DELETE',
        contentType: 'application/json',
        data: JSON.stringify({data: $('#CatDropDown').val()}),
    }).done(function (response) {
        if(response.success) {
            console.log(response);
            showAlert(response.message);

            $('#CatDropDown').html('');
            $.ajax({
                url: '/api/categories',
                type: 'GET',
            }).done(function (response) {
                if(response.success) {
                    console.log(response);
                    var categories = response.categories;
                    var container = $('#CatDropDown');
                    for (var i = 0; i < categories.length; i++) {
                        var category = encodeURIComponent(categories[i].category);
                        container.append('<option value="' + category + '">' + category + '</option>');
                    }
                }
            }).fail(function(xhr, status, error) {
                console.log('fail');
                showModalAlert('Error', xhr.responseJSON.message);
            })

        }
    }).fail(function(xhr, status, error) {
        console.log('fail');
        showErrorAlert(xhr.responseJSON.message);
    });
});

$("#attributeForm").submit(function(e) {
    var attribute = $('#AttDropDown').val();
    e.preventDefault();
    hideAlert();
    hideErrorAlert();
    $.ajax({
        url: '/api/delete-att',
        type: 'DELETE',
        contentType: 'application/json',
        data: JSON.stringify({data: $('#AttDropDown').val()}),
    }).done(function (response) {
        if(response.success) {
            console.log(response);
            showAlert(response.message);

            $('#AttDropDown').html('');
            $.ajax({
                url: '/api/attributes',
                type: 'GET',
            }).done(function (response) {
                if(response.success) {
                    console.log(response);
                    var attributes = response.attributes;
                    var container = $('#AttDropDown');
                    for (var i = 0; i < attributes.length; i++) {
                        var attribute = encodeURIComponent(attributes[i].attribute);
                        container.append('<option value="' + attribute + '">' + attribute + '</option>');
                    }
                }
            }).fail(function(xhr, status, error) {
                console.log('fail');
                showModalAlert('Error', xhr.responseJSON.message);
            })

        }
    }).fail(function(xhr, status, error) {
        console.log('fail');
        showErrorAlert(xhr.responseJSON.message);
    });
});

function showErrorAlert(msg) {
    $('#alert-error-text').html(msg);
    $('#alert-error').fadeIn();
}

function showAlert(msg) {
    $('#alert-text').html(msg);
    $('#alert').fadeIn();
}

function hideErrorAlert() {
    $('#alert-error').fadeOut();
}

function hideAlert() {
    $('#alert').fadeOut();
}