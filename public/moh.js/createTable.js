var hot;

$(document).ready(function () {
    var container = document.getElementById('grid');
    hot = new Handsontable(container, {
        data: [],
        width: container.offsetWidth,
        height: window.innerHeight - 550,
        colWidths: 100,
        rowHeights: 23,
        manualColumnResize: true,
        manualRowResize: true,
        manualColumnMove: true,
        manualRowMove: true,
        rowHeaders: true,
        colHeaders: true,
        contextMenu: true,
    });

    //$('#grid').hide();

    // get attributes and categories.
    var selectAttributes = $('#select-attributes');
    var selectCategories = $('#select-categories');
    $.ajax({
        url: '/api/attributes',
        type: 'GET',
    }).done(function (response) {
        if (response.success) {
            $.each(response.attributes, function (i, item) {
                console.log('add' + item.attribute);
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
                console.log('add' + item.category);
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

$("#createTableForm").submit(function(e) {
    e.preventDefault();
    var selected_categories = $('#select-categories').val();
    var selected_attributes = $('#select-attributes').val();
    var data = [];
    data.push([''].concat(selected_categories));
    for (var i = 0; i < selected_attributes.length; i++) {
        data.push([selected_attributes[i]].concat(
            Array(selected_categories.length).join('.').split('.')));
    }
    hot.loadData(data);
    //$('#grid').show();
    console.log(data);
});




