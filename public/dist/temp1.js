"use strict";

var workbookData = {};

function showModalAlert(title, msg) {
  $('#msg-modal').find('h5').html(title).end().find('p').html(msg).end().modal('show');
}

$(document).ready(function () {
  workbookName = $('#filled-workbook').val(); // default url is for fill the workbook first time

  var url = '/api/filled-workbook/' + encodeURIComponent(workbookName);
  $.ajax({
    url: url,
    type: 'GET'
  }).done(function (response) {
    console.log(response);

    if (response.success) {
      var workBook = response.workbook.data;
      console.log(workBook); //applyJsonWithoutStyle(workBook);

      $('#loading').hide();
    }
  }).fail(function (xhr, status, error) {
    console.log('fail ' + xhr.responseJSON.message);
    $('#loading').hide(); //showErrorAlert(xhr.responseJSON.message);
  });
});
$('#save-workbook-btn').on('click', function () {
  var btn = $(this);
  var statusText = $('#status');
  statusText.html('<i class="fas fa-spinner fa-spin"></i> Saving');
  btn.prop('disabled', true);
  var workbook = {};

  for (var i = 0; i < sheets.length; i++) {
    workbook[sheetNames[i]] = sheets[i].getData();
  }

  $.ajax({
    url: '/api/filled-workbook',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      data: workbook,
      name: $('#filled-workbook').val()
    })
  }).done(function (response) {
    if (response.success) {
      console.log(response);
      statusText.html('<i class="fas fa-check"></i> Saved');
      btn.prop('disabled', false);
    }
  }).fail(function (xhr, status, error) {
    console.log('fail ' + xhr.responseJSON.message);
    statusText.html('<i class="fas fa-times"></i> Failed to save workbook: ' + xhr.responseJSON.message);
    btn.prop('disabled', false);
  });
});
$('#export-workbook-btn').on('click', function () {
  exportToExcel();
});
$('#import-workbook-btn').on('click', function () {
  $('#file-import').click();
});
$('#file-import').change(function (e) {
  var files = e.target.files,
      f = files[0];
  var formData = new FormData();
  formData.append('excel', f);
  $.ajax({
    url: '/api/upload/' + encodeURIComponent($('#filled-workbook').val() + '.xlsx'),
    type: 'POST',
    data: formData,
    cache: false,
    contentType: false,
    processData: false
  }).done(function (response) {
    if (response.success) {
      console.log(response);
      workbookData = response.data;
      applyJsonWithStyle(response.data);
    }
  }).fail(function (xhr, status, error) {
    console.log('fail ' + xhr.responseJSON.message);
  });
});
//# sourceMappingURL=temp1.js.map
