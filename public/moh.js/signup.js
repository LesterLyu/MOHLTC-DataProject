var input = document.querySelector("#phone");
window.intlTelInput(input, {
    utilsScript: "../../node_modules/intl-tel-input/build/js/utils.js"
});


$(document).ready(function () {
    $.ajax({
        url: '/api/organization_details',
        type: 'GET',
    }).done(function (response) {
        if(response.success) {
            console.log(response);
            var organizations = response.organizations;
            var container = $('#OrganizationDropDown');
            for (var i = 0; i < organizations.length; i++) {
                var organization = organizations[i].name;
                container.append($('<option>', {
                    value: organization,
                    text: organization
                }));
            }
            container.selectpicker('refresh');
        }
    }).fail(function(xhr, status, error) {
        console.log('fail');
        showErrorAlert(xhr.responseJSON.message);
    });
});

document.querySelector('#signUpMethodSelect').onchange = (e) => {
    const elementsToHideInLocal = ['#organization', '#role'];
    const elementsToUnhideInLocal = [];
    if (e.target.value === 'local') {
        for (let i = 0; i < elementsToHideInLocal.length; i++) {
            document.querySelector(elementsToHideInLocal[i]).classList.add('hide')
        }
        for (let i = 0; i < elementsToUnhideInLocal.length; i++) {
            document.querySelector(elementsToUnhideInLocal[i]).classList.remove('hide')
        }
    }
    else if (e.target.value === 'ldap') {
        for (let i = 0; i < elementsToHideInLocal.length; i++) {
            document.querySelector(elementsToHideInLocal[i]).classList.remove('hide')
        }
        for (let i = 0; i < elementsToUnhideInLocal.length; i++) {
            document.querySelector(elementsToUnhideInLocal[i]).classList.add('hide')
        }
    }
};


$("#signupForm").submit(function(e) {
    e.preventDefault();
    const signUpMethod = document.querySelector('#signUpMethodSelect').value;
    $.ajax({
        url: '/api/signup' + (signUpMethod === 'local' ? '/local' : ''),
        type: 'POST',
        data: $('#signupForm').serialize()
    }).done(function (response) {
        if(response.success) {
            console.log(response);
            window.location.href = response.redirect;
        }
    }).fail(function(xhr, status, error) {
        console.log('fail');
        showModalAlert('Sign up Error', xhr.responseJSON.message);
    });
});

function showModalAlert(title, msg) {
    $('#msg-modal').find('h5').html(title).end().find('p').html(msg).end().modal('show');
}
