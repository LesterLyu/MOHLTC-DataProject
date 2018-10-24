"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Workbook GUI functions...
var SCALE = 8; // scale up the column width and row height

var global = {
  workbookData: {},
  dataValidation: {}
};

var WorkbookGUI =
/*#__PURE__*/
function () {
  function WorkbookGUI(mode, workbookName, workbookData) {
    var height = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : $(window).height() - 360;

    _classCallCheck(this, WorkbookGUI);

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


  _createClass(WorkbookGUI, [{
    key: "addTable",
    value: function addTable(container, width, height, data, rowHeights, colWidths, merges, sheetNo, cells) {
      var prop = {};

      if (typeof rowHeights === 'number') {
        prop.rowHeights = rowHeights;
        prop.colWidths = colWidths;
      } else {
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
        cells: cells
      };
      var that = this;
      var createdTable = new Handsontable(container, spec);
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

  }, {
    key: "addTab",
    value: function addTab(sheetName, tabColor) {
      var gridId = 'grid-' + this.tabCounter;
      this.gridIds.push(gridId);
      var tabContentId = 'tab-content-' + this.tabCounter;
      var tabId = 'tab-' + this.tabCounter; // add content

      var tabContent = $('<div id="' + tabContentId + '" class="tab-pane active show"> <div id="' + gridId + '"></div></div>');
      this.tabContents.push(tabContent); // add tab

      var newTab; // edit mode have edit button in tabs

      if (this.mode === 'edit') {
        newTab = $('<a id="' + tabId + '" class="nav-item nav-link active show" data-toggle="tab" href="#' + tabContentId + '"> ' + sheetName + '<i onclick="editSheet(' + this.tabCounter + ')" class="fas fa-pen ml-2"></i></a>');
      } else {
        newTab = $('<a class="nav-item nav-link active show" data-toggle="tab" href="#' + tabContentId + '">' + sheetName + '</a>');
      }

      if (tabColor && tabColor.argb) {
        newTab.css('border-bottom', '3px solid #' + argbToRgb(tabColor.argb));
      }

      this.tabs.push(newTab);
      this.tabCounter++;
      return gridId;
    }
  }, {
    key: "applyTabs",
    value: function applyTabs() {
      // deactivate previous tab and content
      $('div.active.show').removeClass('active show');
      $('a.active').removeClass('active show');
      var i;

      for (i = 0; i < this.tabContents.length; i++) {
        $('#nav-tabContent').append(this.tabContents[i]);

        if (this.mode === 'edit') {
          this.tabs[i].insertBefore('#nav-tab a:nth-last-child(1)');
        } else {
          $('#nav-tab').append(this.tabs[i]);
        }
      }

      this.tabs = [];
      this.tabContents = [];
    }
  }, {
    key: "_appendAddSheetTab",
    value: function _appendAddSheetTab() {
      $('#nav-tab').append(this.addSheetTab);
    }
  }, {
    key: "setAddSheetCallback",
    value: function setAddSheetCallback(cb) {
      $('#add-sheet-btn').on('click', cb);
    }
  }, {
    key: "updateJson",
    value: function updateJson(workbookData) {
      global.workbookData = workbookData;
      this.sheetNames = [];
      this.tables = [];
      this.tabContents = [];
      this.tabs = [];
      this.tabCounter = 0;
      this.gridIds = [];
    }
  }, {
    key: "load",
    value: function load() {
      this.tabCounter = 0; // clear tables and tabs

      $('#nav-tab').html('');
      $('#nav-tabContent').html('');
      if (this.mode === 'edit') this._appendAddSheetTab();
      this.applyJsonWithStyle();
    } // apply json to GUI tables

  }, {
    key: "applyJsonWithStyle",
    value: function applyJsonWithStyle() {
      var timerStart = Date.now(); // clear global variables

      this.tables = [];
      this.sheetNames = []; // load tabs

      var sheets = global.workbookData.sheets; // push sheet names first, since we need it now to call getSheet()

      for (var sheetNo in sheets) {
        this.sheetNames.push(sheets[sheetNo].name);
      }

      for (var sheetNo in sheets) {
        if (sheets.hasOwnProperty(sheetNo)) {
          var ws = sheets[sheetNo];
          var gridId = this.addTab(ws.name, ws.tabColor);
          this.applyTabs();
          var container = $('#' + gridId)[0];
          var data = ws.data; // transform mergeCells

          var merges = [];

          for (var position in ws.merges) {
            if (ws.merges.hasOwnProperty(position)) {
              var model = ws.merges[position].model;
              merges.push({
                row: model.top - 1,
                col: model.left - 1,
                rowspan: model.bottom - model.top + 1,
                colspan: model.right - model.left + 1
              });
            }
          } // process data validation


          global.dataValidation[sheetNo] = {
            dropDownAddresses: [],
            dropDownData: {}
          };

          for (var key in ws.dataValidations) {
            if (ws.dataValidations.hasOwnProperty(key)) {
              var dataValidation = ws.dataValidations[key];

              if (dataValidation.type !== 'list') {
                console.error('Unsupported data validation type: ' + dataValidation.type);
                continue;
              }

              var addresses = key.split(' ');

              for (var i = 0; i < addresses.length; i++) {
                // e.g. {address: "A1", col: 1, row: 1, $col$row: "$A$1"}
                var address = colCache.decode(addresses[i]);
                global.dataValidation[sheetNo].dropDownAddresses.push(addresses[i]); // get data
                // situation 1: e.g. formulae: [""1,2,3,4""]

                var formulae = dataValidation.formulae[0];

                if (formulae.indexOf(',') > 0) {
                  global.dataValidation[sheetNo].dropDownData[addresses[i]] = formulae.slice(1, formulae.length - 1).split(',');
                } // situation 2: e.g. formulae: ["$B$5:$K$5"]
                else if (formulae.indexOf(':') > 0) {
                    var parsed = parser.parse(formulae); // concat 2d array to 1d array

                    var newArr = [];

                    for (var _i = 0; _i < parsed.length; _i++) {
                      newArr = newArr.concat(parsed[_i]);
                    }

                    global.dataValidation[sheetNo].dropDownData[addresses[i]] = newArr;
                  } // situation 3: e.g. formulae: ["definedName"]
                  else if (formulae in global.workbookData.definedNames) {
                      global.dataValidation[sheetNo].dropDownData[addresses[i]] = this.getDefinedName(formulae);
                    } else {
                      console.error('Unknown dataValidation formulae situation: ' + formulae);
                    }
              }
            }
          } // generate table
          // worksheet has no style


          if (!ws.row) {
            this.addTable(container, $('#nav-tab').width(), this.height, data, 23, 80, true, sheetNo, function (row, col) {
              var cellProperties = {};
              cellProperties.editor = FormulaEditor;
              cellProperties.renderer = cellRenderer;
              return cellProperties;
            });
          } else {
            var table = this.addTable(container, $('#nav-tab').width(), this.height, data, ws.row.height, ws.col.width, merges, sheetNo, function (row, col) {
              var cellProperties = {};

              if (!('sheetNo' in this.instance)) {
                this.instance.sheetNo = sheetNo;
                console.log(sheetNo);
              } // dropdown
              // TO-DO move data validation to ws.style, this should improve the efficient


              var address = colCache.encode(row + 1, col + 1);
              var dataValidation = global.dataValidation[this.instance.sheetNo];

              if (dataValidation.dropDownAddresses.includes(address)) {
                cellProperties.selectOptions = dataValidation.dropDownData[address];
                cellProperties.renderer = Handsontable.renderers.DropdownRenderer;
                cellProperties.editor = Handsontable.editors.DropdownEditor;
                console.log('set DropdownEditor: ' + address);
                return cellProperties;
              } // text or formula


              var ws = global.workbookData.sheets[this.instance.sheetNo];
              cellProperties.style = null;

              if (ws.style.length > 0 && ws.style[row] && ws.style[row].length > col && ws.style[row][col] && Object.keys(ws.style[row][col]).length !== 0) {
                cellProperties.style = ws.style[row][col];
              }

              if (address === 'E3') console.log('????');
              cellProperties.renderer = cellRenderer;
              cellProperties.editor = FormulaEditor;
              return cellProperties;
            });
          }
        }
      }

      $('#nav-tab a:first-child').tab('show');
      this.currSheet = this.sheetNames[0];
      hideLoadingStatus();
      var that = this; // setTimeout(function () {
      //     that.tables[0].render();
      //     hideLoadingStatus();
      // }, 0);
      // add listener to tabs

      $('.nav-tabs a').on('show.bs.tab', function (event) {
        that.currSheet = $(event.target).text(); // active tab
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
  }, {
    key: "getData",
    value: function getData() {
      var cnt = 0;

      for (var sheetNo in global.workbookData.sheets) {
        if (global.workbookData.sheets.hasOwnProperty(sheetNo)) {
          var ws = global.workbookData.sheets[sheetNo];
          ws.name = this.sheetNames[cnt];
          ws.data = this.tables[cnt].getData();
        }

        cnt++;
      }

      return global.workbookData;
    }
  }, {
    key: "addSheet",
    value: function addSheet(sheetName, data) {
      var sheetNo = this.sheetNames.length;
      global.workbookData.sheets[sheetNo] = {
        name: sheetName,
        data: data
      };
      this.sheetNames.push(sheetName);
      var gridId = this.addTab(sheetName);
      this.applyTabs();
      var container = $('#' + gridId)[0];
      var table = this.addTable(container, $('#nav-tab').width(), this.height, data, 23, 80, true, sheetNo, function (row, col) {
        var cellProperties = {};
        cellProperties.editor = FormulaEditor;
        cellProperties.renderer = cellRenderer;
        return cellProperties;
      });
      this.tables.push(table);
      $('#nav-tab a:first-child').tab('show');
      this.currSheet = this.sheetNames[0]; // add listener to tabs

      $('.nav-tabs a').on('show.bs.tab', function (event) {
        this.currSheet = $(event.target).text(); // active tab
      });
    }
  }, {
    key: "getSheet",
    value: function getSheet(name) {
      return global.workbookData.sheets[this.sheetNames.indexOf(name)];
    }
  }, {
    key: "getTable",
    value: function getTable(name) {
      return this.tables[this.sheetNames.indexOf(name)];
    }
  }, {
    key: "getDefinedName",
    value: function getDefinedName(definedName) {
      var definedNames = global.workbookData.definedNames;

      if (!(definedName in definedNames)) {
        console.error('Cannot find defined name: ' + definedName);
        return;
      }

      var currName = global.workbookData.definedNames[definedName];
      var result = [];

      for (var i = 0; i < currName.length; i++) {
        var cell = this.getSheet(currName[i].sheetName).data[currName[i].row - 1][currName[i].col - 1];

        if (cell === null) {} else if (_typeof(cell) === 'object' && 'result' in cell) {
          result.push(cell.result);
        } else {
          result.push(cell);
        }
      }

      return result;
    }
  }]);

  return WorkbookGUI;
}();

function argbToRgb(argb) {
  return argb.substring(2);
}

function cellRenderer(instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, arguments);

  if ('style' in cellProperties && cellProperties.style) {
    var style = cellProperties.style; // alignment

    var cellMeta = instance.getCellMeta(row, col);
    var previousClass = cellMeta.className !== undefined ? cellMeta.className : '';

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
    } else {
      // default bottom
      instance.setCellMeta(row, col, 'className', previousClass + ' htBottom');
    } // font


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
    } // background


    if (style.hasOwnProperty('fill')) {
      if (style.fill.hasOwnProperty('fgColor') && style.fill.fgColor.hasOwnProperty('argb')) {
        td.style.background = '#' + argbToRgb(style.fill.fgColor.argb);
      }
    } // borders


    if (style.hasOwnProperty('border')) {
      for (var key in style.border) {
        if (style.border.hasOwnProperty(key)) {
          var upper = key.charAt(0).toUpperCase() + key.slice(1);
          var border = style.border[key];

          if (border.hasOwnProperty('color') && border.color.hasOwnProperty('argb')) {
            td.style['border' + upper] = '1px solid #' + argbToRgb(border.color.argb);
          } else {
            // black color
            td.style['border' + upper] = '1px solid #000';
          }
        }
      }
    }
  } // render formula


  if (value && _typeof(value) === 'object' && value.hasOwnProperty('formula')) {
    if (value.result && value.result.error) {
      td.innerHTML = value.result.error;
    } else {
      td.innerHTML = value.result !== undefined ? value.result : null;
    }
  } // render dropdown

}

function getWorkbook(sheets, sheetNames) {
  // create a workbook
  var workbook = XLSX.utils.book_new();

  for (var i = 0; i < sheets.length; i++) {
    var ws_data = sheets[i].getData();
    var worksheet = XLSX.utils.aoa_to_sheet(ws_data); // Add the worksheet to the workbook

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetNames[i]);
  }

  return workbook;
}

function exportToExcel(workbook, name) {
  var fileExtension = '.xlsx'; // empty params

  if (typeof workbook === 'undefined') {
    return XLSX.writeFile(getWorkbook(gui.tables, gui.sheetNames), gui.workbookName + fileExtension);
  } else {
    XLSX.writeFile(workbook, name + fileExtension);
  }
} // re-evaluate formula


function evaluateFormula(sheetName, row, col) {
  if (!sheetNames.includes(sheetName)) {
    console.log('Error: sheetName not found.');
    return;
  }

  var sheet = sheets[sheetNames.indexOf(sheetName)];
  var data = sheet.getDataAtCell(row, col);

  if (!data.hasOwnProperty('formula')) {
    console.log('Error: evaluateFormula(): cell provided is not a formula');
    return;
  }

  var calculated = parser.parse(data.formula);

  if (calculated.error) {
    data.result = calculated;
  } else {
    data.result = calculated.result;
  }

  sheet.setDataAtCell(row, col, data);
  return data;
}
//# sourceMappingURL=workbook-gui.js.map
