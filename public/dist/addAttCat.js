"use strict";

$("#categoryForm").submit(function (e) {
  e.preventDefault();
  hideAlert();
  hideErrorAlert();
  $.ajax({
    url: '/api/add-cat',
    type: 'POST',
    data: $('#categoryForm').serialize()
  }).done(function (response) {
    if (response.success) {
      console.log(response);
      showAlert(response.message);
    }
  }).fail(function (xhr, status, error) {
    console.log('fail');
    showErrorAlert(xhr.responseJSON.message);
  });
});
$("#attributeForm").submit(function (e) {
  e.preventDefault();
  hideAlert();
  hideErrorAlert();
  $.ajax({
    url: '/api/add-att',
    type: 'POST',
    data: $('#attributeForm').serialize()
  }).done(function (response) {
    if (response.success) {
      console.log(response);
      showAlert(response.message);
    }
  }).fail(function (xhr, status, error) {
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
//# sourceMappingURL=addAttCat.js.map
