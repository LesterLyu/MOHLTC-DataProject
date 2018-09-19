var tabCounter = 0;
var sheets = [], sheetNames = [];

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

$(document).ready(function () {
    var workbookName = $('#filled-workbook').val();
    $.ajax({
        url: '/api/workbook/' + workbookName,
        type: 'GET',
    }).done(function (response) {
        if (response.success) {
            var workBook = response.workbook.data;
            console.log(workBook);
            for (var sheetName in workBook) {
                if (workBook.hasOwnProperty(sheetName)) {
                    sheetNames.push(sheetName);
                    var data = workBook[sheetName];
                    var gridId = addTab(sheetName);
                    // generate table
                    var container = document.getElementById(gridId);
                    var addedTable = newTable(container, $(window).height() - 500, true);
                    sheets.push(addedTable);
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
            $('#nav-tab a:first-child').tab('show');
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
            statusText.html('<i class="fas fa-check"></i> Saved');
            btn.prop('disabled', false);
        }
    }).fail(function (xhr, status, error) {
        console.log('fail ' + xhr.responseJSON.message);
        statusText.html('<i class="fas fa-times"></i> Failed to save workbook: ' + xhr.responseJSON.message);
        btn.prop('disabled', false);
    });
});

