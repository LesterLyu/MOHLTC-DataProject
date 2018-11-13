// Workbook GUI functions...

const SCALE = 7; // scale up the column width and row height
let global = {workbookData: {}, dataValidation: {}};

class WorkbookGUI {
    constructor(mode, workbookName, workbookRawData, workbookRawExtra, height = $(window).height() - 360) {
        this.height = height;
        this.heightOffset = $(window).height() - height;
        this.mode = mode; // can be 'view' or 'edit'
        this.addSheetTab = $('<a id="add-sheet-btn" class="nav-link nav-item" href="#"><i class="fas fa-plus"></i> Add Sheet</a>');
        this.workbookName = workbookName;
        global.workbookRawData = workbookRawData;
        global.workbookRawExtra = workbookRawExtra;
        global.workbookData = {sheets: {}}; // pre-processed data and extra
        this.currSheet = '';
        this.sheetNames = [];
        this.sheetNamesWithoutHidden = [];
        this.tables = [];
        this.tabContents = [];
        this.tabs = [];
        this.tabCounter = 0;
        this.gridIds = [];
        this.definedNames = {};
        this.navPosition = 0;

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
     * @param views
     * @param cells
     */
    addTable(container, width, height, data, rowHeights, colWidths, merges, sheetNo, views, cells) {
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
        // check frozen view
        let fixedRowsTop = 0, fixedColumnsLeft = 0;
        // default using first view
        if (views && views[0].state === 'frozen') {
            fixedRowsTop = views[0].ySplit;
            fixedColumnsLeft = views[0].xSplit;
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
            fixedRowsTop: fixedRowsTop,
            fixedColumnsLeft: fixedColumnsLeft,
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
            newTab = $('<a id="' + tabId + '" class="nav-item nav-link active show" data-toggle="tab" href="#' + tabContentId + '">' + sheetName
                + '<i onclick="editSheet(' + this.tabCounter + ')" class="fas fa-pen ml-2"></i></a>');
        }
        else {
            newTab = $('<a class="nav-item nav-link active show" data-toggle="tab" href="#' + tabContentId + '">' + sheetName + '</a>');
        }
        if (tabColor && tabColor.argb) {
            newTab.css('border-bottom', '3px solid #' + argbToRgb(tabColor.argb));
        }
        newTab.on('click', (event) => {
            event.preventDefault();
            gui.showSheet(sheetName);
            event.stopImmediatePropagation();
        });
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

    updateJson(workbookRawData, workbookRawExtra) {
        global.workbookRawData = workbookRawData;
        global.workbookRawExtra = workbookRawExtra;
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

        this._preProcess();
        this.applyJsonWithStyle();
        this._enableHiddenRow();
        this._enableTabScroll();
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

        for (var sheetNo in sheets) {
            if (sheets.hasOwnProperty(sheetNo) && sheets[sheetNo].state !== 'hidden') {
                this.sheetNamesWithoutHidden.push(sheets[sheetNo].name);
                var ws = sheets[sheetNo];
                const gridId = this.addTab(ws.name, ws.tabColor);
                this.applyTabs();
                let container = $('#' + gridId)[0];
                let data = sheets[sheetNo].data;

                // transform mergeCells
                var merges = ws.merges;

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
                        let addressSplited = splitAddress(key);

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
                        23, 80, true, sheetNo, null, function (row, col) {
                            let cellProperties = {};
                            cellProperties.editor = FormulaEditor;
                            cellProperties.renderer = cellRenderer;
                            return cellProperties;
                        });
                }
                else {
                    const table = this.addTable(container, $('#nav-tabContent').width(), this.height, data,
                        ws.row.height, ws.col.width, merges, sheetNo, ws.views, function (row, col) {
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
                                cellProperties.editor = Handsontable.editors.DropdownEditor;
                                cellProperties.validator = Handsontable.validators.AutocompleteValidator;
                                cellProperties.allowInvalid = false;
                                return cellProperties;
                            }


                            // text or formula
                            var ws = global.workbookData.sheets[this.instance.sheetNo];

                            cellProperties.style = null;
                            if (ws.style[row] && ws.style[row][col] && Object.keys(ws.style[row][col]).length !== 0) {
                                cellProperties.style = ws.style[row][col];
                            }
                            // hyperlink
                            const hyperlinks = global.hyperlinks[this.instance.sheetNo];
                            const addressHyperlink = colCache.encode(row + 1, col + 1);
                            if (addressHyperlink in hyperlinks) {
                                cellProperties.hyperlink = hyperlinks[addressHyperlink];
                            }
                            cellProperties.renderer = cellRenderer;
                            cellProperties.editor = FormulaEditor;
                            return cellProperties;
                        });

                }

            }
        }

        this.currSheet = this.sheetNamesWithoutHidden[0];
        $('#nav-tab a:first-child').tab('show');

        hideLoadingStatus();
        const that = this;
        $('.nav-tabs a').on('show.bs.tab', function (event) {
            that.currSheet = $(event.target).text();         // active tab
        });
        // this callback will be called after every time the table rendered.

        console.log("Time consumed: ", Date.now() - timerStart + 'ms');
    }

    _enableTabScroll() {
        const navWrapper = $('#nav-wrapper');
        const navTab = $('#nav-tab');
        const scrollerRight = $('.scroller-right');
        const scrollerLeft = $('.scroller-left');
        scrollerRight.css('display', 'flex');
        scrollerLeft.css('display', 'flex');

        const maxWidth = navTab[0].scrollWidth - navTab[0].clientWidth;

        scrollerRight.click(function () {
            gui.navPosition += navWrapper.outerWidth() * 3 / 4;
            if (gui.navPosition > maxWidth) {
                gui.navPosition = maxWidth
            }
            $('#nav-tab').animate({
                scrollLeft: gui.navPosition
            }, 200);
        });

        scrollerLeft.click(function () {
            gui.navPosition -= navWrapper.outerWidth() * 3 / 4;
            if (gui.navPosition < 0) {
                gui.navPosition = 0
            }
            $('#nav-tab').animate({
                scrollLeft: gui.navPosition
            }, 200);
        });
    }

    getData() {
        const data = {};
        let cnt = 0;
        for (let sheetNo in global.workbookData.sheets) {
            if (global.workbookData.sheets.hasOwnProperty(sheetNo)) {
                const wsData = global.workbookData.sheets[sheetNo].data;
                data[sheetNo] = {
                    name: this.sheetNames[cnt],
                    dimension: [wsData.length, wsData[0].length]
                };
                for (let rowNumber = 0; rowNumber < wsData.length; rowNumber++) {
                    data[sheetNo][rowNumber] = {};
                    for (let colNumber = 0; colNumber < wsData[0].length; colNumber++) {
                        if (wsData[rowNumber][colNumber] !== null) {
                            data[sheetNo][rowNumber][colNumber] = wsData[rowNumber][colNumber];
                        }
                    }
                    if (Object.keys(data[sheetNo][rowNumber]).length === 0) {
                        delete data[sheetNo][rowNumber];
                    }
                }
            }
            cnt++;
        }
        return data;
    }

    addSheet(sheetName, data) {
        const sheetNo = this.sheetNames.length;
        global.workbookData.sheets[sheetNo] = {name: sheetName, data: data};
        this.sheetNames.push(sheetName);
        const gridId = this.addTab(sheetName);
        this.applyTabs();
        let container = $('#' + gridId)[0];
        let table = this.addTable(container, $('#nav-tab').width(), this.height, data,
            23, 80, true, sheetNo, null, function (row, col) {
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
        this._enableTabScroll();
    }

    getSheet(name) {
        return global.workbookData.sheets[this.sheetNames.indexOf(name)];
    }

    getDataAtSheetAndCell(sheet, row, col) {
        return global.workbookData.sheets[this.sheetNames.indexOf(sheet)].data[row][col];
    }

    getTable(name) {
        return this.tables[this.sheetNamesWithoutHidden.indexOf(name)];
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

    showSheet(sheetName) {
        if (gui.currSheet !== sheetName) {
            if (this.sheetNamesWithoutHidden.includes(sheetName)) {
                $('#nav-tab a:nth-child(' + (1 + this.sheetNamesWithoutHidden.indexOf(sheetName)) + ')').tab('show');
            }
            else {
                console.error('cannot find sheet with name: ' + sheetName);
            }
        }
    }

    _preProcess() {
        if (global.workbookRawExtra) {
            global.workbookData.definedNames = global.workbookRawExtra.definedNames;
        }
        global.workbookData.sheets = {};
        global.hyperlinks = {};
        for (let orderNo in global.workbookRawData) {
            const wsData = global.workbookData.sheets[orderNo] = {};
            const data = global.workbookRawData[orderNo];
            wsData.data = [];
            wsData.name = data.name;

            // cell data
            for (let rowNumber = 0; rowNumber < data.dimension[0]; rowNumber++) {
                wsData.data.push([]);
                for (let colNumber = 0; colNumber < data.dimension[1]; colNumber++) {
                    if (data && data[rowNumber] && data[rowNumber][colNumber]) {
                        wsData.data[rowNumber].push(data[rowNumber][colNumber]);
                        delete data[rowNumber][colNumber];
                    }
                    else {
                        wsData.data[rowNumber].push('');
                    }
                }
               delete data[rowNumber];
            }

            // if has extra
            if (global.workbookRawExtra) {
                const extra = global.workbookRawExtra.sheets[orderNo];
                wsData.col = {};
                wsData.col.width = dictToList(extra.col.width, data.dimension[1], 23, extra.col.hidden);
                wsData.row = {};
                wsData.row.height = dictToList(extra.row.height, data.dimension[0], extra.defaultRowHeight, extra.row.hidden);
                wsData.dataValidations = extra.dataValidations;
                wsData.state = extra.state;
                wsData.tabColor = extra.tabColor;
                wsData.style = extra.style;
                wsData.hyperlinks = extra.hyperlinks;
                wsData.views = extra.views;

                // transform mergeCells
                const merges = wsData.merges = [];
                for (let position in extra.merges) {
                    if (extra.merges.hasOwnProperty(position)) {
                        const model = extra.merges[position].model;
                        merges.push({
                            row: model.top - 1,
                            col: model.left - 1,
                            rowspan: model.bottom - model.top + 1,
                            colspan: model.right - model.left + 1
                        })
                    }
                }

                // pre-process hyperlinks
                let hyperlinks = global.hyperlinks[orderNo] = {};
                for (let key in extra.hyperlinks) {
                    if (extra.hyperlinks.hasOwnProperty(key)) {
                        const hyperlink = extra.hyperlinks[key];
                        let addressSplited = splitAddress(key);
                        // address possible bug: e.g. when there exists 'A1' and 'A1:C1' as targets,
                        // the hyperlink in 'A1:C1' should override the hyperlink in 'A1'.
                        if (addressSplited.length === 1 && addressSplited[0] in hyperlinks) {
                            continue;
                        }

                        // process first one
                        const position = colCache.decode(addressSplited[0]);
                        let data = {mode: hyperlink.mode, target: hyperlink.target};
                        const cell = wsData.data[position.row - 1][position.col - 1];
                        let res;
                        if (cell !== null && cell !== undefined) {
                            if (cell.result !== undefined) {
                                res = cell.result;
                            }
                            else {
                                res = cell;
                            }
                        }
                        const encoded = encodeURIComponent(hyperlink.target);
                        if (hyperlink.mode === 'internal') {
                            data.html = '<a href="#' + encoded + '">' + res + '</a>';
                            let targetNoQuote = hyperlink.target.replace(/['"]+/g, '');
                            const index = targetNoQuote.indexOf('!');
                            if (index !== -1) {
                                data.sheetName = targetNoQuote.slice(0, index);
                                data.cell = targetNoQuote.slice(index + 1);
                            }
                        }
                        else if (hyperlink.mode === 'external') {
                            data.html = '<a target="_blank" href="' + hyperlink.target + '">' + res + '</a>';
                        }
                        hyperlinks[addressSplited[0]] = data;

                        // link other hyperlinks to the first one
                        for (let i = 1; i < addressSplited.length; i++) {
                            hyperlinks[addressSplited[i]] = hyperlinks[addressSplited[0]];
                        }
                    }
                }
            }
        }
    }

    resize(width, height) {

        const currSheet = this.currSheet;
        for (let i = 0; i < this.tables.length; i++) {
            this.tables[i].updateSettings({
                width: width,
                height: height,
            });
            this.showSheet(this.sheetNamesWithoutHidden[i]);
            this.tables[i].render();
        }
        this.showSheet(currSheet);
    }

    _enableHiddenRow() {
        // enable hidden row that does not have frozen view.
        for (let sheetNo in global.workbookRawExtra.sheets) {
            const extra = global.workbookRawExtra.sheets[sheetNo];
            const gridId = this.gridIds[this.sheetNamesWithoutHidden.indexOf(this.sheetNames[sheetNo])];
            if (gridId) {
                // row
                const trs = document.querySelector('#' + gridId + ' .ht_clone_left .htCore tbody').children;
                for (let row = 0; row < extra.row.hidden.length; row++) {
                    if (trs) {
                        trs[row].style.display = 'none';
                    }
                }
            }
        }
    }
}

function splitAddress(address) {
    const addresses = address.split(' ');
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
    return addressSplited;
}

function dictToList(dict, length, defVal = null, hidden = []) {
    let ret = [];
    // set hidden row/col height/width to 0.1
    for (let i = 0; i < length; i++) {
        if (hidden.includes(i)) {
            ret.push(0.1);
        }
        else if (dict[i] !== undefined) {
            ret.push(dict[i]);
        }
        else {
            ret.push(defVal);
        }
    }
    return ret;
}


function argbToRgb(argb) {
    return argb.substring(2);
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

let resize;
window.onresize = function () {
    if (resize) {
        clearTimeout(resize);
    }
    const statusText = $('#status');
    statusText.html('<i class="fas fa-spinner fa-spin"></i> Rendering...');
    resize = setTimeout(() => {
        gui.resize($('#nav-tabContent').width(), $(window).height() - gui.heightOffset);
        statusText.html('');
    }, 300);

};

// listener for hash changes
window.onhashchange = function () {
    //console.log('hash changed')
    // if (location.hash.length > 1) {
    //     let hash = decodeURIComponent(location.hash.replace(/['"]+/g, ''));
    //     const sheetName = hash.slice(1, hash.indexOf('!'));
    //     if (gui.sheetNamesWithoutHidden.includes(sheetName)) {
    //         console.log(document.readyState);
    //         gui.showSheet(sheetName);
    //     }
    // }
};


