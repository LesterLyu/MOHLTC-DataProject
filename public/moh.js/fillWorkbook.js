var tabCounter = 0;
var sheets = [], sheetNames = [];
var workbookName, mode;

function showModalAlert(title, msg) {
    $('#msg-modal').find('h5').html(title).end().find('p').html(msg).end().modal('show');
}

/**
 * create a new Handsontable
 * @param container
 * @param height int
 * @return a Handsontable
 */
function newTable(container, height) {
    var spec = {
        data: [],
        width: container.offsetWidth,
        height: height,
        colWidths: 100,
        rowHeights: 23,
        manualColumnResize: true,
        manualRowResize: true,
        manualColumnMove: false,
        manualRowMove: false,
        rowHeaders: true,
        colHeaders: true,
        contextMenu: ['copy'],
    };
    var createdTable = new Handsontable(container, spec);
    sheets.push(createdTable);
    return createdTable;
}

function addTab(sheetName) {
    var gridId = 'grid-' + tabCounter;
    var tabContentId = 'tab-content-' + tabCounter;

    // deactivate previous tab and content
    $('div.active.show').removeClass('active show');
    $('a.active').removeClass('active');

    // add content
    var tabContent = $('<div id="' + tabContentId + '" class="tab-pane fade active show"> <div id="' + gridId + '"></div></div>');
    $('#nav-tabContent').append(tabContent);

    // add tab
    var newTab = $('<a class="nav-item nav-link active" data-toggle="tab" href="#' + tabContentId + '">' + sheetName + '</a>');
    $('#nav-tab').append(newTab);

    tabCounter++;
    return gridId;
}

function getWorkbook(sheets, sheetNames) {
    // create a workbook
    var workbook = XLSX.utils.book_new();
    for (var i = 0; i < sheets.length; i++) {
        var ws_data = sheets[i].getData();
        var worksheet = XLSX.utils.aoa_to_sheet(ws_data);
        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetNames[i]);
    }
    return workbook;
}

function exportToExcel(workbook, name) {
    var fileExtension = '.xlsx';
    // empty params
    if (typeof workbook === 'undefined') {
        return XLSX.writeFile(getWorkbook(sheets, sheetNames), workbookName + fileExtension);
    }
    else {
        XLSX.writeFile(workbook, name + fileExtension);
    }
}

function workbookToJson(workbook) {
    var result = {};
    workbook.SheetNames.forEach(function (sheetName) {
        var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1, defval: ''});
        if (roa.length) result[sheetName] = roa;
    });
    console.log(result);
    return result;
}

// apply json to GUI tables
function applyJson(workBookJson) {
    // clear tables and tabs
    $('#nav-tab').html('');
    $('#nav-tabContent').html('');

    // clear global variables
    sheets = [];
    sheetNames = [];

    // load to front-end
    for (var sheetName in workBookJson) {
        if (workBookJson.hasOwnProperty(sheetName)) {
            sheetNames.push(sheetName);
            var data = workBookJson[sheetName];
            var gridId = addTab(sheetName);
            // generate table
            var container = document.getElementById(gridId);
            var addedTable = newTable(container, $(window).height() - 350, true);
            addedTable.loadData(data);
            // lock cells
            addedTable.updateSettings({
                cells: function (row, col) {
                    var cellProperties = {};
                    if (row === 0 || col === 0) {
                        cellProperties.readOnly = true;
                    }
                    return cellProperties;
                }
            });
        }
    }
    console.log(sheets);
    $('#nav-tab a:first-child').tab('show');
}

$(document).ready(function () {
    workbookName = $('#filled-workbook').val();
    mode = $('#mode').val();
    // default url is for fill the workbook first time
    var url = '/api/workbook/' + encodeURIComponent(workbookName);
    // if this page is loaded for edit filled workbook
    if (mode === 'edit') {
        url = '/api/filled-workbook/' + encodeURIComponent(workbookName)
    }
    $.ajax({
        url: url,
        type: 'GET',
    }).done(function (response) {
        console.log(response);
        if (response.success) {
            var workBook = response.workbook.data;
            console.log(workBook);
            applyJson(workBook)
        }
    }).fail(function (xhr, status, error) {
        console.log('fail ' + xhr.responseJSON.message);
        //showErrorAlert(xhr.responseJSON.message);
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
        data: JSON.stringify({data: workbook, name: $('#filled-workbook').val()}),
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
    var files = e.target.files, f = files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        var data = e.target.result;
        if (!rABS) data = new Uint8Array(data);
        var workbook = XLSX.read(data, {type: rABS ? 'binary' : 'array'});

        /* DO SOMETHING WITH workbook HERE */
        // To-DO validate the import
        applyJson(workbookToJson(workbook))
    };
    if (rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
});
