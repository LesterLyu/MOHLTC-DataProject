"use strict";

var gui;

function showModalAlert(title, msg) {
  $('#msg-modal').find('h5').html(title).end().find('p').html(msg).end().modal('show');
}

function unzip(binary) {
  return JSON.parse(pako.inflate(binary, {
    to: 'string'
  }));
}

function zip(string) {
  return pako.deflate(string, {
    to: 'string'
  });
}

function updateLoadingStatus(text) {
  console.log('Loading... (' + text + ')');
  $('#loadingText').html('Loading... (' + text + ')');
}

function workbookToJson(workbook) {
  var result = {};
  workbook.SheetNames.forEach(function (sheetName) {
    var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      defval: ''
    });
    if (roa.length) result[sheetName] = roa;
  });
  console.log(result);
  return result;
}

$(document).ready(function () {
  var workbookName = $('#filled-workbook').val(); // default url is for fill the workbook first time

  var url = '/api/filled-workbook/' + encodeURIComponent(workbookName);
  $.ajax({
    url: url,
    type: 'GET'
  }).done(function (response) {
    console.log(response);

    if (response.success) {
      var start = new Date();
      var data = unzip(response.workbook.data);
      console.log('parse data takes: ' + (new Date() - start) + 'ms');
      console.log(data);
      gui = new WorkbookGUI('view', workbookName, data);
      gui.load();
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
  var workbook = zip(JSON.stringify(gui.getData()));
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
    url: '/api/upload/workbook/' + encodeURIComponent($('#filled-workbook').val()),
    type: 'POST',
    data: formData,
    cache: false,
    contentType: false,
    processData: false
  }).done(function (response) {
    if (response.success) {
      var data = unzip(response.workbook.data);
      console.log(data);
      gui.updateJson(data);
      gui.load();
    }
  }).fail(function (xhr, status, error) {
    console.log('fail ' + xhr.responseJSON.message);
  });
});
//# sourceMappingURL=fillWorkbook.js.map
