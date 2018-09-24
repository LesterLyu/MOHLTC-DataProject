var tabCounter = 0;
var sheets = [], sheetNames = [];
var mode;
var state = {
    modalMode: 'none' // none, add, edit
}; // store state

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
    var tabId = 'tab-' + tabCounter;

    // deactivate previous tab and content
    $('div.active.show').removeClass('active show');
    $('a.active').removeClass('active show');

    // add content
    var tabContent = $('<div id="' + tabContentId + '" class="tab-pane fade active show"> <div id="' + gridId + '"></div></div>');
    $('#nav-tabContent').append(tabContent);

    // add tab
    var newTab = $('<a id="' + tabId + '" class="nav-item nav-link active show" data-toggle="tab" href="#' + tabContentId + '"> ' + sheetName
        + '<i onclick="editSheet(' + tabCounter + ')" class="fas fa-pen ml-2"></i></a>');
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

    // if this page is loaded for edit workbook
    workbookName = $('#workbookNameInput').val();
    mode = $('#mode').val();
    if (mode === 'edit') {

        // default url is for fill the workbook first time
        var url = '/api/workbook/' + encodeURIComponent(workbookName);

        $.ajax({
            url: url,
            type: 'GET',
        }).done(function (response) {
            console.log(response);
            if (response.success) {
                var workBook = response.workbook.data;
                console.log(workBook);
                applyJson(workBook);
                $('#loading').hide();
            }
        }).fail(function (xhr, status, error) {
            console.log('fail ' + xhr.responseJSON.message);
            //showErrorAlert(xhr.responseJSON.message);
            $('#loading').hide();
        });
    }

});

function editSheet(index) {
    state.modalMode = 'edit';
    state.modelDisplayIndex = index;
    var selecte_categories = $('#select-categories');
    var selecte_attributes = $('#select-attributes');
    selecte_categories.selectpicker('deselectAll');
    selecte_attributes.selectpicker('deselectAll');
    $('#sheetNameInput').val(sheetNames[index]);

    var data = sheets[index].getData().slice();
    console.log(data);
    data[0].splice(data[0].indexOf(''), 1)
    var cates = data[0];
    var attrs = [];
    for (var i = 1; i < data.length; i++) {
        if (data[i][0] !== '') attrs.push(data[i][0])
    }
    console.log(attrs);
    selecte_categories.selectpicker('val', cates);
    selecte_attributes.selectpicker('val', attrs);
    $('#add-confirm-btn').html('Modify');
    $('#add-modal').modal({backdrop: 'static'});
}


// apply json to GUI tables
function applyJson(workBookJson) {
    // load to front-end
    for (var sheetName in workBookJson) {
        if (workBookJson.hasOwnProperty(sheetName)) {
            sheetNames.push(sheetName);
            var data = workBookJson[sheetName];
            var gridId = addTab(sheetName);
            // generate table
            var container = document.getElementById(gridId);
            var addedTable = newTable(container, $(window).height() - 500, false);
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
    state.modalMode = 'add';
    $('#select-categories').selectpicker('deselectAll');
    $('#select-attributes').selectpicker('deselectAll');
    $('#add-confirm-btn').html('Add');
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
// TO-DO check inputs, i.e. duplicates, empty name/row/column...
$("#add-confirm-btn").click(function () {
    var sheetName = $('#sheetNameInput').val();
    if (state.modalMode === 'add') {
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
    }
    else if (state.modalMode === 'edit') {
        sheetNames[state.modelDisplayIndex] = sheetName;
        $('#tab-' + state.modelDisplayIndex).html(sheetName
            + '<i onclick="editSheet(' + state.modelDisplayIndex + ')" class="fas fa-pen ml-2"></i>');
        sheets[state.modelDisplayIndex].loadData(getSelected());
    }


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
        url: '/api/admin/workbook',
        type: (mode === 'edit' ? 'PUT' : 'POST'),
        contentType: 'application/json',
        data: JSON.stringify({data: workbook, oldName: $('#workbookOldName').val(),name: $('#workbookNameInput').val()}),
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

// edit

