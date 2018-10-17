"use strict";

function showModalAlert(title, msg) {
  $('#msg-modal').find('h5').html(title).end().find('p').html(msg).end().modal('show');
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
  workbookName = $('#filled-workbook').val(); // default url is for fill the workbook first time

  var url = '/api/filled-workbook/' + encodeURIComponent(workbookName);
  $.ajax({
    url: url,
    type: 'GET'
  }).done(function (response) {
    console.log(response);

    if (response.success) {
      workbookData = response.workbook.data; // check if it has style

      if (workbookData[0] && workbookData[0].hasOwnProperty('style')) {
        applyJsonWithStyle(workbookData, 'view');
      } else {
        applyJsonWithoutStyle(workbookData, 'view');
      }

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
  var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer

  var files = e.target.files,
      f = files[0];
  var reader = new FileReader();

  reader.onload = function (e) {
    var data = e.target.result;
    if (!rABS) data = new Uint8Array(data);
    var workbook = XLSX.read(data, {
      type: rABS ? 'binary' : 'array',
      cellStyles: true,
      cellNF: true
    }); // To-DO validate the import

    console.log(workbook); //workbookData

    applyJson(workbookToJson(workbook));
  };

  if (rABS) reader.readAsBinaryString(f);else reader.readAsArrayBuffer(f);
});
//# sourceMappingURL=fillWorkbook.js.map
