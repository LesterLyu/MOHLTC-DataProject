"use strict";

$(document).ready(function () {
  $.ajax({
    url: '/api/organization_details',
    type: 'GET'
  }).done(function (response) {
    if (response.success) {
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
  }).fail(function (xhr, status, error) {
    console.log('fail');
    showErrorAlert(xhr.responseJSON.message);
  });
});
$("#signupForm").submit(function (e) {
  e.preventDefault(); //  console.log($('#OrganizationDropDown').val());
  //   var dropdown = $('#OrganizationDropDown').val();

  $.ajax({
    url: '/api/signup',
    type: 'POST',
    data: $('#signupForm').serialize()
  }).done(function (response) {
    if (response.success) {
      console.log(response);
      window.location.href = response.redirect;
    }
  }).fail(function (xhr, status, error) {
    console.log('fail');
    showModalAlert('Sign up Error', xhr.responseJSON.message);
  });
});

function showModalAlert(title, msg) {
  $('#msg-modal').find('h5').html(title).end().find('p').html(msg).end().modal('show');
}
//# sourceMappingURL=signup.js.map
