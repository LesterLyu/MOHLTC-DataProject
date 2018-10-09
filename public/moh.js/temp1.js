var tabCounter = 0;
var sheets = [], sheetNames = [];
var workbookName;
var workbookData = {};
var scale = 8;

function showModalAlert(title, msg) {
    $('#msg-modal').find('h5').html(title).end().find('p').html(msg).end().modal('show');
}

/**
 * create a new Handsontable
 * @param container
 * @param height int
 * @return Handsontable
 */
function newTable(container, height, data, rowHeights, colWidths, merges) {

    var spec = {
        data: data,
        width: container.offsetWidth,
        height: height,
        colWidths: colWidths.map(function(x) { return x * scale; }),
        rowHeights: rowHeights.map(function(x) { return x * scale / 5.5385; }),
        mergeCells: merges,
        manualColumnResize: true,
        manualRowResize: true,
        manualColumnMove: false,
        manualRowMove: false,
        rowHeaders: true,
        colHeaders: true,
        autoWrapCol: false,
        autoWrapRow: false,
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
    $('a.active').removeClass('active show');

    // add content
    var tabContent = $('<div id="' + tabContentId + '" class="tab-pane fade active show"> <div id="' + gridId + '"></div></div>');
    $('#nav-tabContent').append(tabContent);

    // add tab
    var newTab = $('<a class="nav-item nav-link active show" data-toggle="tab" href="#' + tabContentId + '">' + sheetName + '</a>');
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

function argbToRgb(argb) {
    return argb.substring(2);
}

function cellRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    var style = cellProperties.style;

    // alignment
    var cellMeta = instance.getCellMeta(row, col);
    var previousClass = cellMeta.className ? (cellMeta.className !== undefined && cellMeta.className) : '';

    if (style && style.hasOwnProperty('alignment')) {
        if (style.alignment.hasOwnProperty('horizontal')) {
            td.style.textAlign = style.alignment.horizontal;
        }
        if (style.alignment.hasOwnProperty('vertical')) {

            switch (style.alignment.vertical) {
                case 'top':
                    instance.setCellMeta(row, col, 'className', previousClass + ' htTop');
                    break;
                case 'middle':
                    instance.setCellMeta(row, col, 'className', previousClass + ' htMiddle');
                    break;
            }
        }
    }
    else {
        // default bottom
        instance.setCellMeta(row, col, 'className', previousClass + ' htBottom');
    }

    // font
    if (style && style.hasOwnProperty('font')) {
        if (style.font.hasOwnProperty('color') && style.font.color.hasOwnProperty('argb')) {
            td.style.color = '#' + argbToRgb(style.font.color.argb);
        }
        if (style.font.hasOwnProperty('bold') && style.font.bold) {
            td.style.fontWeight = 'bold';
        }
        if (style.font.hasOwnProperty('italic') && style.font.italic) {
            td.style.fontStyle = 'italic';
        }
    }

    // background
    if (style && style.hasOwnProperty('fill')) {
        if (style.fill.hasOwnProperty('fgColor') && style.fill.fgColor.hasOwnProperty('argb')) {
            td.style.background = '#' + argbToRgb(style.fill.fgColor.argb);
        }
    }

    // borders
    if (style && style.hasOwnProperty('border')) {
        for (var key in style.border) {
            if (style.border.hasOwnProperty(key)) {
                var upper = key.charAt(0).toUpperCase() + key.slice(1);
                var border = style.border[key];
                if (border.hasOwnProperty('color') && border.color.hasOwnProperty('argb')) {
                    td.style['border' + upper] = '1px solid #' + argbToRgb(border.color.argb);
                }
            }
        }
    }
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
    for (var sheetNo in workBookJson) {
        if (workBookJson.hasOwnProperty(sheetNo)) {
            var ws = workBookJson[sheetNo];
            sheetNames.push(ws.name);
            var data = ws.data;
            var gridId = addTab(ws.name);

            // transform mergeCells
            var merges = [];
            for (var position in ws.merges) {
                if (ws.merges.hasOwnProperty(position)) {
                    var model = ws.merges[position].model;
                    merges.push({
                        row: model.top - 1,
                        col: model.left - 1,
                        rowspan: model.top - model.bottom + 1,
                        colspan: model.right - model.left + 1
                    })
                }
            }


            // generate table
            var container = document.getElementById(gridId);
            var table = newTable(container, $(window).height() - 350, data, ws.row.height, ws.col.width, merges);
            table.sheetNo = sheetNo;

            table.updateSettings({
                cells: function (row, col) {
                    var ws = workbookData[this.instance.sheetNo];

                    var cellProperties = {};
                    cellProperties.style = null;
                    if (ws.style[row].length > col && Object.keys(ws.style[row][col]).length !== 0) {
                        cellProperties.style = ws.style[row][col];
                    }
                    cellProperties.renderer = cellRenderer;
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
    // default url is for fill the workbook first time
    var url = '/api/filled-workbook/' + encodeURIComponent(workbookName);
    $.ajax({
        url: url,
        type: 'GET',
    }).done(function (response) {
        console.log(response);
        if (response.success) {
            var workBook = response.workbook.data;
            console.log(workBook);
            //applyJson(workBook);
            $('#loading').hide();
        }
    }).fail(function (xhr, status, error) {
        console.log('fail ' + xhr.responseJSON.message);
        $('#loading').hide();
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

    var files = e.target.files, f = files[0];
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
            applyJson(response.data);
        }
    }).fail(function (xhr, status, error) {
        console.log('fail ' + xhr.responseJSON.message);

    });

});

function test(workbook) {
    workbook.SheetNames.forEach(function (sheetName) {


        console.log(workbook.Sheets[sheetName])
    });
}