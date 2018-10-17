var mode;
var state = {
    modalMode: 'none' // none, add, edit
}; // store state
var workbookData;

function showModalAlert(title, msg) {
    $('#msg-modal').find('h5').html(title).end().find('p').html(msg).end().modal('show');
}

function updateLoadingStatus(text) {
    console.log('Loading... (' + text + ')');
    $('#loadingText').html('Loading... (' + text + ')')
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
                    text: '#' + item.id + '  ' + item.attribute,
                    value: item.id + ',' + item.attribute,
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
                    text: '#' + item.id + '  ' + item.category,
                    value: item.id + ',' + item.category,
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
                workbookData = response.workbook.data;
                console.log(workbookData);
                // check if it has style
                if (workbookData[0] && workbookData[0].hasOwnProperty('style')) {
                    applyJsonWithStyle(workbookData, 'edit');
                }
                else {
                    applyJsonWithoutStyle(workbookData, 'edit');
                }
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
    // console.log(data);
    data[0].splice(data[0].indexOf(''), 1);
    var attrs = data[0];
    var cates = [];
    for (var i = 1; i < data.length; i++) {
        if (data[i][0] !== '') cates.push(data[i][0])
    }

    console.log(attrs, cates);
    selecte_categories.selectpicker('val', cates);
    selecte_attributes.selectpicker('val', attrs);
    $('#add-confirm-btn').html('Modify');
    $('#add-modal').modal({backdrop: 'static'});
}



// get the selected att and cat
function getSelected() {
    var selected_categories = $('#select-categories').val();
    var selected_attributes = $('#select-attributes').val();
    var data = [];
    var att_id = [], att = [], i;
    // add first two rows
    for (i = 0; i < selected_attributes.length; i++) {
        att_id.push(selected_attributes[i].substring(0, selected_attributes[i].indexOf(',')))
        att.push(selected_attributes[i].substring(1 + selected_attributes[i].indexOf(',')))
    }
    data.push(['', ''].concat(att_id));
    data.push(['', ''].concat(att));

    // add columns
    for (i = 0; i < selected_categories.length; i++) {
        var cat_id = selected_categories[i].substring(0, selected_categories[i].indexOf(','));
        var cat = selected_categories[i].substring(1 + selected_categories[i].indexOf(','))
        data.push([cat_id, cat].concat(
            Array(selected_attributes.length).join('.').split('.')));
    }
    return data;
}

$('#import-workbook-btn').on('click', function () {
    $('#file-import').click();
});

$('#file-import').change(function (e) {

    var files = e.target.files, f = files[0];
    var formData = new FormData();
    formData.append('excel', f);

    $.ajax({
        url: '/api/upload/style/' + encodeURIComponent($('#workbookNameInput').val()),
        type: 'POST',
        data: formData,
        cache: false,
        contentType: false,
        processData: false
    }).done(function (response) {
        if (response.success) {
            console.log(response);
            workbookData = response.data;
            applyJsonWithStyle(response.data, 'edit');
        }
    }).fail(function (xhr, status, error) {
        console.log('fail ' + xhr.responseJSON.message);

    });

});

$('#export-workbook-btn').on('click', function () {
    workbookName = $('#workbookNameInput').val();
    if (!workbookName)
        workbookName = 'workbook1';
    exportToExcel();
});

// add sheet modal
$('#show-modal-btn').click(function () {
    state.modalMode = 'add';
    $('#sheetNameInput').val('');
    $('#select-categories').selectpicker('deselectAll');
    $('#select-attributes').selectpicker('deselectAll');
    $('#add-confirm-btn').html('Add');
    $('#add-modal').modal({backdrop: 'static'});
});

// preview the sheet in the modal
$('#preview-btn').click(function () {
    $('#preview-grid').html('');
    var container = document.getElementById('preview-grid');
    var previewTable = newSimpleTable(container, 300, true);
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
        var gridId = addTab(sheetName, 'edit');

        // generate table
        var container = document.getElementById(gridId);
        var addedTable = newSimpleTable(container, $(window).height() - 500, false);
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
        workbook[i] = {
            name: sheetNames[i],
            data: sheets[i].getData()
        };
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

