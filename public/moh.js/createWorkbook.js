var tabCounter = 0;
var sheets = [], sheetNames = [];

function showModalAlert(title, msg) {
    $('#msg-modal').find('h5').html(title).end().find('p').html(msg).end().modal('show');
}

/**
 * create a new Handsontable
 * @param container
 * @param height int
 * @param preview boolean
 * @return a Handsontable
 */
function newTable(container, height, preview) {
    var spec = {
        data: [],
        width: container.offsetWidth,
        height: height,
        colWidths: 100,
        rowHeights: 23,
        manualColumnResize: true,
        manualRowResize: true,
        manualColumnMove: true,
        manualRowMove: true,
        rowHeaders: true,
        colHeaders: true,
        contextMenu: ['remove_row', 'remove_col', '---------', 'copy'],
    };
    if (preview) {
        spec.manualColumnMove = false;
        spec.manualRowMove = false;
    }
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
    newTab.insertBefore('#nav-tab a:nth-last-child(1)');

    tabCounter++;
    return gridId;
}

$(document).ready(function () {

    // get attributes and categories.
    var selectAttributes = $('#select-attributes');
    var selectCategories = $('#select-categories');
    $.ajax({
        url: '/api/attributes',
        type: 'GET',
    }).done(function (response) {
        if (response.success) {
            $.each(response.attributes, function (i, item) {
                selectAttributes.append($('<option>', {
                    value: item.attribute,
                    text: item.attribute
                }));
            });

            selectAttributes.selectpicker('refresh');
        }
    }).fail(function (xhr, status, error) {
        console.log('fail ' + xhr.responseJSON.message);
    });

    $.ajax({
        url: '/api/categories',
        type: 'GET',
    }).done(function (response) {
        if (response.success) {
            $.each(response.categories, function (i, item) {
                selectCategories.append($('<option>', {
                    value: item.category,
                    text: item.category
                }));
            });

            selectCategories.selectpicker('refresh');
        }
    }).fail(function (xhr, status, error) {
        console.log('fail ' + xhr.responseJSON.message);
        //showErrorAlert(xhr.responseJSON.message);
    });

});

// get the selected att and cat
function getSelected() {
    var selected_categories = $('#select-categories').val();
    var selected_attributes = $('#select-attributes').val();
    var data = [];
    data.push([''].concat(selected_categories));
    for (var i = 0; i < selected_attributes.length; i++) {
        data.push([selected_attributes[i]].concat(
            Array(selected_categories.length).join('.').split('.')));
    }
    return data;
}

// add sheet modal
$('#show-modal-btn').click(function () {
    $('#add-modal').modal({backdrop: 'static'});
});

// preview the sheet in the modal
$('#preview-btn').click(function () {
    var container = document.getElementById('preview-grid');
    var previewTable = newTable(container, 300, true);
    previewTable.loadData(getSelected());
    // lock all cells
    previewTable.updateSettings({
        cells: function (row, col) {
            var cellProperties = {};
            cellProperties.readOnly = true;
            return cellProperties;
        }
    });
});

// confirm to add sheet to the workbook
// TO-DO check inputs, i.e. duplicates...
$("#add-confirm-btn").click(function () {
    var sheetName = $('#sheetNameInput').val();
    sheetNames.push(sheetName);
    var gridId = addTab(sheetName);

    // generate table
    var container = document.getElementById(gridId);
    var addedTable = newTable(container, $(window).height() - 500, false);
    addedTable.loadData(getSelected());
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
    $('#' + sheetName + '-tab').tab('show');

    $('#add-modal').modal('hide');
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
        url: '/api/workbook',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({data: workbook, name: $('#workbookNameInput').val()}),
    }).done(function (response) {
        if (response.success) {
            statusText.html('<i class="fas fa-check"></i> Saved');
            btn.prop('disabled', false);
        }
    }).fail(function (xhr, status, error) {
        console.log('fail ' + xhr.responseJSON.message);
        statusText.html('<i class="fas fa-times"></i> Failed to create workbook: ' + xhr.responseJSON.message);
        btn.prop('disabled', false);
    });
});

