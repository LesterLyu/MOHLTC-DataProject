// Workbook GUI functions...

const SCALE = 8; // scale up the column width and row height
let global = {workbookData: {}, dataValidation: {}};

class WorkbookGUI {
    constructor(mode, workbookName, workbookData, height = $(window).height() - 360) {
        this.height = height;
        this.mode = mode; // can be 'view' or 'edit'
        this.addSheetTab = $('<a id="add-sheet-btn" class="nav-link nav-item" href="#"><i class="fas fa-plus"></i> Add Sheet</a>');
        this.workbookName = workbookName;
        global.workbookData = workbookData;
        this.currSheet = '';
        this.sheetNames = [];
        this.tables = [];
        this.tabContents = [];
        this.tabs = [];
        this.tabCounter = 0;
        this.gridIds = [];
        this.definedNames = {};

        this._appendAddSheetTab();
    }

    /**
     * Initialize a styled table
     * @param container
     * @param width
     * @param height
     * @param data
     * @param rowHeights
     * @param colWidths
     * @param merges
     * @param sheetNo
     * @param cells
     */
    addTable(container, width, height, data, rowHeights, colWidths, merges, sheetNo, cells) {
        let prop = {};
        if (typeof rowHeights === 'number') {
            prop.rowHeights = rowHeights;
            prop.colWidths = colWidths;
        }
        else {
            prop.rowHeights = rowHeights.map(function (x) {
                return Math.round(x * SCALE / 5.5385);
            });
            prop.colWidths = colWidths.map(function (x) {
                return Math.round(x * SCALE);
            });
        }
        var spec = {
            data: data,
            width: width,
            height: height,
            colWidths: prop.colWidths,
            rowHeights: prop.rowHeights,
            mergeCells: merges,
            manualColumnResize: true,
            manualRowResize: true,
            manualColumnMove: false,
            manualRowMove: false,
            rowHeaders: true,
            colHeaders: true,
            autoWrapCol: false,
            autoWrapRow: false,
            autoRowSize: false,
            autoColumnSize: false,
            contextMenu: ['copy'],
            renderAllRows: false,
            cells: cells,
        };
        const that = this;
        let createdTable = new Handsontable(container, spec);
        createdTable.sheetNo = sheetNo;
        that.tables.push(createdTable);
        return createdTable;
    }

    /**
     * Edit mode for create/edit workbook, View mode for user view the workbook
     *
     * @param sheetName
     * @param mode can be either 'edit' or 'view'
     * @param tabColor can be null
     * @return string
     */
    addTab(sheetName, tabColor) {
        var gridId = 'grid-' + this.tabCounter;
        this.gridIds.push(gridId);
        var tabContentId = 'tab-content-' + this.tabCounter;
        var tabId = 'tab-' + this.tabCounter;

        // add content
        var tabContent = $('<div id="' + tabContentId + '" class="tab-pane active show"> <div id="' + gridId + '"></div></div>');
        this.tabContents.push(tabContent);

        // add tab
        var newTab;
        // edit mode have edit button in tabs
        if (this.mode === 'edit') {
            newTab = $('<a id="' + tabId + '" class="nav-item nav-link active show" data-toggle="tab" href="#' + tabContentId + '"> ' + sheetName
                + '<i onclick="editSheet(' + this.tabCounter + ')" class="fas fa-pen ml-2"></i></a>');
        }
        else {
            newTab = $('<a class="nav-item nav-link active show" data-toggle="tab" href="#' + tabContentId + '">' + sheetName + '</a>');
        }
        if (tabColor && tabColor.argb) {
            newTab.css('border-bottom', '3px solid #' + argbToRgb(tabColor.argb));
        }
        this.tabs.push(newTab);

        this.tabCounter++;
        return gridId;
    }

    applyTabs() {
        // deactivate previous tab and content
        $('div.active.show').removeClass('active show');
        $('a.active').removeClass('active show');
        let i;
        for (i = 0; i < this.tabContents.length; i++) {
            $('#nav-tabContent').append(this.tabContents[i]);

            if (this.mode === 'edit') {
                this.tabs[i].insertBefore('#nav-tab a:nth-last-child(1)');
            }
            else {
                $('#nav-tab').append(this.tabs[i]);
            }
        }
        this.tabs = [];
        this.tabContents = [];
    }

    _appendAddSheetTab() {
        $('#nav-tab').append(this.addSheetTab);
    }

    setAddSheetCallback(cb) {
        $('#add-sheet-btn').on('click', cb);
    }

    updateJson(workbookData) {
        global.workbookData = workbookData;
        this.sheetNames = [];
        this.tables = [];
        this.tabContents = [];
        this.tabs = [];
        this.tabCounter = 0;
        this.gridIds = [];
    }

    load() {
        this.tabCounter = 0;
        // clear tables and tabs
        $('#nav-tab').html('');
        $('#nav-tabContent').html('');

        if (this.mode === 'edit')
            this._appendAddSheetTab();

        this.applyJsonWithStyle();
    }

    // apply json to GUI tables
    applyJsonWithStyle() {
        var timerStart = Date.now();
        // clear global variables
        this.tables = [];
        this.sheetNames = [];

        // load tabs
        const sheets = global.workbookData.sheets;
        // push sheet names first, since we need it now to call getSheet()
        for (var sheetNo in sheets) {
            this.sheetNames.push(sheets[sheetNo].name);
        }
        this.currSheet = this.sheetNames[0];

        for (var sheetNo in sheets) {
            if (sheets.hasOwnProperty(sheetNo)) {
                var ws = sheets[sheetNo];
                const gridId = this.addTab(ws.name, ws.tabColor);
                this.applyTabs();
                let container = $('#' + gridId)[0];
                let data = ws.data;

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

                // process data validation
                global.dataValidation[sheetNo] = {
                    dropDownAddresses: [],
                    dropDownData: {}
                };
                for (let key in ws.dataValidations) {
                    if (ws.dataValidations.hasOwnProperty(key)) {
                        const dataValidation = ws.dataValidations[key];
                        if (dataValidation.type !== 'list') {
                            console.error('Unsupported data validation type: ' + dataValidation.type);
                            continue;
                        }
                        const addresses = key.split(' ');
                        let addressSplited = [];
                        for (let i = 0; i < addresses.length; i++) {
                            //  {top: 1, left: 1, bottom: 5, right: 1, tl: "A1", …}
                            const decoded = colCache.decode(addresses[i]);
                            if ('top' in decoded) {
                                for (let row = decoded.top; row < decoded.bottom + 1; row++) {
                                    for (let col = decoded.left; col < decoded.right + 1; col++) {
                                        addressSplited.push(colCache.encode(row, col));
                                    }
                                }
                            }
                            // {address: "A1", col: 1, row: 1, $col$row: "$A$1"}
                            else if ('row' in decoded) {
                                addressSplited.push(addresses[i]);
                            }
                        }

                        for (let i = 0; i < addressSplited.length; i++) {
                            global.dataValidation[sheetNo].dropDownAddresses.push(addressSplited[i]);

                            // get data
                            // situation 1: e.g. formulae: [""1,2,3,4""]
                            const formulae = dataValidation.formulae[0];
                            if (formulae.indexOf(',') > 0) {
                                let data = formulae.slice(1, formulae.length - 1).split(',');
                                const dataTrimmed = data.map(x => x.trim());
                                global.dataValidation[sheetNo].dropDownData[addressSplited[i]] = dataTrimmed;
                            }
                            // situation 2: e.g. formulae: ["$B$5:$K$5"]
                            else if (formulae.indexOf(':') > 0) {
                                const parsed = parser.parse(formulae).result;
                                // concat 2d array to 1d array
                                let newArr = [];
                                for (let i = 0; i < parsed.length; i++) {
                                    newArr = newArr.concat(parsed[i]);
                                }
                                global.dataValidation[sheetNo].dropDownData[addressSplited[i]] = newArr;
                            }
                            // situation 3: e.g. formulae: ["definedName"]
                            else if (formulae in global.workbookData.definedNames) {
                                global.dataValidation[sheetNo].dropDownData[addressSplited[i]] = this.getDefinedName(formulae);
                            }
                            else {
                                console.error('Unknown dataValidation formulae situation: ' + formulae);
                            }
                        }
                    }
                }

                // generate table
                // worksheet has no style
                if (!ws.row) {
                    this.addTable(container, $('#nav-tab').width(), this.height, data,
                        23, 80, true, sheetNo, function (row, col) {
                            let cellProperties = {};
                            cellProperties.editor = FormulaEditor;
                            cellProperties.renderer = cellRenderer;
                            return cellProperties;
                        });
                }
                else {
                    const table = this.addTable(container, $('#nav-tab').width(), this.height, data,
                        ws.row.height, ws.col.width, merges, sheetNo, function (row, col) {
                            let cellProperties = {};
                            if (!('sheetNo' in this.instance)) {
                                this.instance.sheetNo = sheetNo;
                                console.log(sheetNo)
                            }

                            // dropdown
                            // TO-DO move data validation to ws.style, this should improve the efficient
                            const address = colCache.encode(row + 1, col + 1);
                            const dataValidation = global.dataValidation[this.instance.sheetNo];
                            if (dataValidation.dropDownAddresses.includes(address)) {
                                cellProperties.source = dataValidation.dropDownData[address];
                                cellProperties.renderer = Handsontable.renderers.AutocompleteRenderer;
                                cellProperties.editor =  Handsontable.editors.DropdownEditor;
                                cellProperties.validator = Handsontable.validators.AutocompleteValidator;
                                cellProperties.allowInvalid = false;
                                return cellProperties;
                            }

                            // text or formula
                            var ws = global.workbookData.sheets[this.instance.sheetNo];

                            cellProperties.style = null;
                            if (ws.style.length > 0 && ws.style[row] && ws.style[row].length > col && ws.style[row][col] && Object.keys(ws.style[row][col]).length !== 0) {
                                cellProperties.style = ws.style[row][col];
                            }
                            cellProperties.renderer = cellRenderer;
                            cellProperties.editor = FormulaEditor;
                            return cellProperties;
                        });

                }

            }
        }

        $('#nav-tab a:first-child').tab('show');

        hideLoadingStatus();
        const that = this;
        // setTimeout(function () {
        //     that.tables[0].render();
        //     hideLoadingStatus();
        // }, 0);
        // add listener to tabs
        $('.nav-tabs a').on('show.bs.tab', function (event) {
            that.currSheet = $(event.target).text();         // active tab
            // if (!that.rendered[that.currSheet]) {
            //     updateStatus('Rendering...');
            //     setTimeout(function () {
            //         const table = that.tables[that.sheetNames.indexOf(that.currSheet)];
            //         table.render();
            //         clearStatus();
            //     }, 10);
            //     that.rendered[that.currSheet] = true;
            // }
        });
        console.log("Time consumed: ", Date.now() - timerStart + 'ms');
    }

    getData() {
        let cnt = 0;

        for (let sheetNo in global.workbookData.sheets) {
            if (global.workbookData.sheets.hasOwnProperty(sheetNo)) {
                let ws = global.workbookData.sheets[sheetNo];
                ws.name = this.sheetNames[cnt];
                ws.data = this.tables[cnt].getData();
            }
            cnt++;
        }
        return global.workbookData;
    }

    addSheet(sheetName, data) {
        const sheetNo = this.sheetNames.length;
        global.workbookData.sheets[sheetNo] = {name: sheetName, data: data};
        this.sheetNames.push(sheetName);
        const gridId = this.addTab(sheetName);
        this.applyTabs();
        let container = $('#' + gridId)[0];
        let table = this.addTable(container, $('#nav-tab').width(), this.height, data,
            23, 80, true, sheetNo, function (row, col) {
                let cellProperties = {};
                cellProperties.editor = FormulaEditor;
                cellProperties.renderer = cellRenderer;
                return cellProperties;
            });
        this.tables.push(table);

        $('#nav-tab a:first-child').tab('show');
        this.currSheet = this.sheetNames[0];
        // add listener to tabs
        $('.nav-tabs a').on('show.bs.tab', function (event) {
            this.currSheet = $(event.target).text();         // active tab
        });
    }

    getSheet(name) {
        return global.workbookData.sheets[this.sheetNames.indexOf(name)];
    }

    getDataAtSheetAndCell(sheet, row, col) {
        return global.workbookData.sheets[this.sheetNames.indexOf(sheet)].data[row][col];
    }

    getTable(name) {
        return this.tables[this.sheetNames.indexOf(name)];
    }

    getDefinedName(definedName) {
        const definedNames = global.workbookData.definedNames;
        if (!(definedName in definedNames)) {
            console.error('Cannot find defined name: ' + definedName);
            return;
        }
        const currName = global.workbookData.definedNames[definedName];
        let result = [];
        for (let i = 0; i < currName.length; i++) {
            const cell = this.getSheet(currName[i].sheetName).data[currName[i].row - 1][currName[i].col - 1];
            if (cell === null) {
            }
            else if (typeof cell === 'object' && 'result' in cell) {
                result.push(cell.result);
            }
            else {
                result.push(cell);
            }
        }
        return result;
    }

}

function argbToRgb(argb) {
    return argb.substring(2);
}

function cellRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
    if (('style' in cellProperties) && cellProperties.style) {
        var style = cellProperties.style;
        // alignment
        var cellMeta = instance.getCellMeta(row, col);
        var previousClass = (cellMeta.className !== undefined) ? cellMeta.className : '';

        if (style.hasOwnProperty('alignment')) {
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
        if (style.hasOwnProperty('font')) {
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
        if (style.hasOwnProperty('fill')) {
            if (style.fill.hasOwnProperty('fgColor') && style.fill.fgColor.hasOwnProperty('argb')) {
                td.style.background = '#' + argbToRgb(style.fill.fgColor.argb);
            }
        }

        // borders
        if (style.hasOwnProperty('border')) {
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
        return XLSX.writeFile(getWorkbook(gui.tables, gui.sheetNames), gui.workbookName + fileExtension);
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
