// Workbook GUI functions...

var tabCounter = 0;
var sheets = [], sheetNames = [];
var workbookName;
var workbookData;
var SCALE = 8;  // scale up the column width and row height

var currSheet;

/**
 * Initialize a simple table that has no styles
 * @param container
 * @param height
 * @param preview
 */
function newSimpleTable(container, height, preview) {
    var spec = {
        data: [],
        width: container.offsetWidth,
        height: height,
        colWidths: 80,
        rowHeights: 23,
        manualColumnResize: true,
        manualRowResize: true,
        manualColumnMove: true,
        manualRowMove: true,
        rowHeaders: true,
        colHeaders: true,
        contextMenu: ['remove_row', 'remove_col', '---------', 'copy'],
    };

    var createdTable = new Handsontable(container, spec);

    if (preview) {
        spec.manualColumnMove = false;
        spec.manualRowMove = false;
    }
    else {
        sheets.push(createdTable);
    }
    return createdTable;
}


/**
 * Initialize a styled table
 * @param container
 * @param height
 * @param data
 * @param rowHeights
 * @param colWidths
 * @param merges
 */
function newStyledTable(container, height, data, rowHeights, colWidths, merges) {

    var spec = {
        data: data,
        width: container.offsetWidth,
        height: height,
        colWidths: colWidths.map(function (x) {
            return Math.round(x * SCALE);
        }),
        rowHeights: rowHeights.map(function (x) {
            return Math.round(x * SCALE / 5.5385);
        }),
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

/**
 * Edit mode for create/edit workbook, View mode for user view the workbook
 *
 * @param sheetName
 * @param mode can be either 'edit' or 'view'
 * @param tabColor can be null
 * @return {string}
 */
function addTab(sheetName, mode, tabColor) {
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
    var newTab;
    // edit mode have edit button in tabs
    if (mode === 'edit') {
        newTab = $('<a id="' + tabId + '" class="nav-item nav-link active show" data-toggle="tab" href="#' + tabContentId + '"> ' + sheetName
            + '<i onclick="editSheet(' + tabCounter + ')" class="fas fa-pen ml-2"></i></a>');
    }
    else {
        newTab = $('<a class="nav-item nav-link active show" data-toggle="tab" href="#' + tabContentId + '">' + sheetName + '</a>');
    }
    if (tabColor && tabColor.argb) {
        newTab.css('border-bottom', '3px solid #' + argbToRgb(tabColor.argb));
    }
    if (mode === 'edit') {
        newTab.insertBefore('#nav-tab a:nth-last-child(1)');
    }
    else {
        $('#nav-tab').append(newTab);
    }

    tabCounter++;
    return gridId;
}


function argbToRgb(argb) {
    return argb.substring(2);
}

function cellRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    var style = cellProperties.style;

    // alignment
    var cellMeta = instance.getCellMeta(row, col);
    var previousClass = (cellMeta.className !== undefined) ? cellMeta.className : '';

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
                else {
                    // black color
                    td.style['border' + upper] = '1px solid #000';
                }
            }
        }
    }

    // render formula
    if (value && typeof value === 'object' && value.hasOwnProperty('formula')) {
        if (value.result && value.result.error) {
            td.innerHTML = value.result.error;
        }
        else {
            td.innerHTML = value.result !== undefined ? value.result : null;
        }

    }
    // render dropdown
}


// apply json to GUI tables
function applyJsonWithoutStyle(workBookJson, mode) {
    if (mode !== 'edit')
        $('#nav-tab').html('');
    $('#nav-tabContent').html('');
    // load to front-end
    for (var sheetNo in workBookJson) {
        if (workBookJson.hasOwnProperty(sheetNo)) {
            var ws = workBookJson[sheetNo];
            sheetNames.push(ws.name);
            var data = ws.data;
            var gridId = addTab(ws.name, 'edit');

            // generate table
            var container = document.getElementById(gridId);
            var addedTable = newSimpleTable(container, $(window).height() - 500, false);
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

// apply json to GUI tables
function applyJsonWithStyle(workBookJson, mode) {
    // clear tables and tabs
    if (mode !== 'edit')
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
            var gridId = addTab(ws.name, mode, ws.tabColor);

            // transform mergeCells
            var merges = [];
            for (var position in ws.merges) {
                if (ws.merges.hasOwnProperty(position)) {
                    var model = ws.merges[position].model;
                    merges.push({
                        row: model.top - 1,
                        col: model.left - 1,
                        rowspan: model.bottom - model.top + 1,
                        colspan: model.right - model.left + 1
                    })
                }
            }

            // generate table
            var container = document.getElementById(gridId);
            var table = newStyledTable(container, $(window).height() - 360, data, ws.row.height, ws.col.width, merges);
            table.sheetNo = sheetNo;

            table.updateSettings({
                cells: function (row, col) {
                    var ws = workbookData[this.instance.sheetNo];
                    var cellProperties = {};
                    cellProperties.style = null;
                    if (ws.style[row].length > col && ws.style[row][col] && Object.keys(ws.style[row][col]).length !== 0) {
                        cellProperties.style = ws.style[row][col];
                    }
                    cellProperties.renderer = cellRenderer;
                    cellProperties.editor = FormulaEditor;


                    return cellProperties;
                }
            });
        }
    }
    console.log(sheets);
    $('#nav-tab a:first-child').tab('show');
    currSheet = sheetNames[0];
    // add listener to tabs
    $('.nav-tabs a').on('show.bs.tab', function(event){
        currSheet = $(event.target).text();         // active tab
    });
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

// re-evaluate formula
function evaluateFormula(sheetName, row, col) {
    if (!sheetNames.includes(sheetName)) {
        console.log('Error: sheetName not found.');
        return
    }
    var sheet = sheets[sheetNames.indexOf(sheetName)];
    var data = sheet.getDataAtCell(row, col);
    if (!data.hasOwnProperty('formula')) {
        console.log('Error: evaluateFormula(): cell provided is not a formula');
        return
    }

    var calculated = parser.parse(data.formula);
    if (calculated.error) {
        data.result = calculated;
    }
    else {
        data.result = calculated.result;
    }

    sheet.setDataAtCell(row, col, data);
    return data;
}
