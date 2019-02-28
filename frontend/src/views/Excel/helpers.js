import pako from 'pako';
import colCache from './col-cache';
import Parser from './formulaParser';
import CalculationChain from './calculation-chain';
import tinycolor from 'tinycolor2';
import RichTexts from "xlsx-populate/lib/RichTexts";

export {Parser, CalculationChain, colCache};

export let excelInstance;

export function init(instance) {
  excelInstance = instance;
}

export function unzip(binary) {
  return JSON.parse(pako.inflate(binary, {to: 'string'}));
}

/**
 * @return {WorkbookStore}
 */
export function prePorcess2() {

}

export function preProcess(workbookRawData, workbookRawExtra) {
  const global = {
    workbookData: {
      sheets: {}
    },
    dataValidations: {},
    definedNames: workbookRawExtra ? workbookRawExtra.definedNames : {},
    hyperlinks: {},
    sheetNames: [],
  };
  excelInstance.currentSheetName = workbookRawData[0].name;

  for (let orderNo in workbookRawData) {
    global.sheetNames.push(workbookRawData[orderNo].name);
  }
  excelInstance.setState({completed: 70, global: Object.assign(excelInstance.state.global, global)}, () => {
    excelInstance.calculationChain.initParser();

    for (let orderNo in workbookRawData) {
      excelInstance.setState((prevState) => {
        return {completed: prevState.completed + 2}
      });
      const wsData = global.workbookData.sheets[orderNo] = {};
      const data = workbookRawData[orderNo];
      wsData.data = [];
      wsData.name = data.name;


      // cell data
      for (let rowNumber = 0; rowNumber < data.dimension[0]; rowNumber++) {
        wsData.data.push([]);
        for (let colNumber = 0; colNumber < data.dimension[1]; colNumber++) {
          if (data && data[rowNumber] && data[rowNumber][colNumber] !== undefined) {
            const cellData = data[rowNumber][colNumber];
            wsData.data[rowNumber].push(cellData);
            if (cellData && typeof cellData === 'object' && 'formula' in cellData) {
              setTimeout(() => {
                /*eslint no-loop-func: "off"*/
                excelInstance.calculationChain.addCell(orderNo, rowNumber, colNumber, cellData.formula)
              }, 0);
            }
            // delete data[rowNumber][colNumber];
          } else {
            wsData.data[rowNumber].push('');
          }
        }
        // delete data[rowNumber];
      }

      // if has extra
      if (workbookRawExtra) {
        const extra = workbookRawExtra.sheets[orderNo];
        wsData.col = {};
        wsData.col.hidden = extra.col.hidden;
        wsData.col.style = extra.col.style;
        wsData.col.width = dictToList(extra.col.width, data.dimension[1], 23, extra.col.hidden);
        wsData.row = {};
        wsData.row.hidden = extra.row.hidden;
        wsData.row.style = extra.row.style;
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

            let data = {mode: hyperlink.mode, target: hyperlink.target};

            if (hyperlink.mode === 'internal') {
              // find sheet name and cell position
              let targetNoQuote = hyperlink.target.replace(/['"]+/g, '');
              const index = targetNoQuote.indexOf('!');
              if (index !== -1) {
                data.sheetName = targetNoQuote.slice(0, index);
                data.cell = targetNoQuote.slice(index + 1);
              }
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
  });


  // store to excelInstance for further steps
  excelInstance.setState({
    global: Object.assign(excelInstance.state.global, global),
    loadingMessage: 'Loading data validations...'
  });

  for (let i = 0; i < Object.keys(workbookRawExtra.sheets).length; i++) {
    const orderNo = Object.keys(workbookRawExtra.sheets)[i];
    const dataValidations = workbookRawExtra.sheets[orderNo].dataValidations;
    // pre-process data validation
    global.dataValidations[orderNo] = {
      dropDownAddresses: [],
      dropDownData: {}
    };
    // console.log(dataValidations)
    for (let key in dataValidations) {
      if (dataValidations.hasOwnProperty(key)) {
        // set index temporarily for evaluating formulas
        excelInstance.state.global.currentSheetIdx = orderNo;

        const dataValidation = dataValidations[key];
        if (dataValidation.type !== 'list') {
          console.error('Unsupported data validation type: ' + dataValidation.type);
          continue;
        }
        let addressSplited = splitAddress(key);

        for (let i = 0; i < addressSplited.length; i++) {
          global.dataValidations[orderNo].dropDownAddresses.push(addressSplited[i]);

          // get data
          // situation 1: e.g. formulae: [""1,2,3,4""]
          const formulae = dataValidation.formulae[0];
          if (formulae[0] === '"' && formulae[formulae.length - 1] === '"') {
            let data = formulae.slice(1, formulae.length - 1).split(',');
            const dataTrimmed = data.map(x => x.trim());
            global.dataValidations[orderNo].dropDownData[addressSplited[i]] = dataTrimmed;
          }
          // situation 2: e.g. formulae: ["$B$5:$K$5"]
          else if (formulae.indexOf(':') > 0) {
            const parsed = excelInstance.parser.parse(formulae).result;
            // concat 2d array to 1d array
            let newArr = [];
            for (let i = 0; i < parsed.length; i++) {
              newArr = newArr.concat(parsed[i]);
            }
            global.dataValidations[orderNo].dropDownData[addressSplited[i]] = newArr;
          }
          // situation 3: e.g. formulae: ["definedName"]
          else if (formulae in global.definedNames) {
            global.dataValidations[orderNo].dropDownData[addressSplited[i]] = excelInstance.getDefinedName(formulae);
          } else {
            console.error('Unknown dataValidation formulae situation: ' + formulae);
          }
        }
      }
    }

  }
  // rest index back
  excelInstance.state.global.currentSheetIdx = 0;
  return global;
}


/**
 * Internal functions
 */

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
    } else if (dict[i] !== undefined) {
      ret.push(dict[i]);
    } else {
      ret.push(defVal);
    }
  }
  return ret;
}


export function argbToRgb(color) {
  if (typeof color === 'string') {
    return color;
  }
  if (color && color.rgb) {
    return color.rgb.length === 6 ? color.rgb : color.rgb.substring(2);
  }

  if (color === undefined || color.argb === undefined)
    return undefined;
  return color.argb.substring(2);
}

export function generateTableData(rowNum, colNum) {
  const res = [];
  for (let i = 0; i < rowNum; i++) {
    if (i === 0) {
      const firstRow = [];
      for (let j = 0; j < colNum; j++) {
        firstRow.push(null);
      }
      res.push(firstRow)
    } else {
      res.push([])
    }
  }
  return res;
}

export function generateTableStyle(rowNum, colNum) {
  const res = {};
  for (let i = 0; i < rowNum; i++) {
    res[i] = {};
    for (let j = 0; j < colNum; j++) {
      res[i][j] = {};
    }
  }
  return res;
}

export function createArray(value, length) {
  const res = [];
  for (let i = 0; i < length; i++) {
    res.push(value);
  }
  return res;
}

export function colorToRgb(color) {
  if (!color)
    return undefined;
  if (color.rgb) {
    if (color.rgb === 'System Foreground') {
      // TO-DO
      return '000000';
    } else if (color.rgb === 'System Background') {
      return 'ffffff'
    }
    return color.rgb.length === 6 ? color.rgb : color.rgb.substring(2);
  }

  if (color.theme !== undefined) {
    return excelInstance.workbook.theme().themeColor(color.theme, color.tint)
  }
}

/**
 * Get cell current data type
 * @param cell
 * @return {'formula', 'richtext', 'date', 'text', 'number'}
 */
export function getCellType(cell) {
  if (typeof cell.formula() === 'string') {
    return 'formula';
  } else if (cell.value() instanceof RichTexts) {
    return 'richtext';
  } else if (cell.value() instanceof Date) {
    return 'date';
  } else if (cell.value() === undefined || cell.value() === null || typeof cell.value() === 'string') {
    return 'text';
  } else {
    return typeof cell.value(); // number, date ...
  }
}

/**
 * Update a cell with value and render it
 * @param {Cell} cell
 * @param {*} rawValue
 * @param {Excel} [excel]
 */
export function updateCell(cell, rawValue, excel) {
  if (!excel) excel = excelInstance;
  // I don't want you update rich text
  if (getCellType(cell) === 'richtext') {
    return;
  }
  // check if it is formula now
  if (rawValue !== undefined && rawValue.length > 0 && rawValue.charAt(0) === '=') {
    console.log('formula');
    const res = excel.parser.parseNewFormula(rawValue, true);
    console.log(res);
    cell.formula(res.formula)
      ._value = res.result;
  } else {
    cell.value(rawValue);
  }
  excel.renderer.cellNeedUpdate(excel.currentSheetIdx, cell.rowNumber() - 1 , cell.columnNumber() - 1);
  excel.renderCurrentSheet();
}


/**
 * Read sheet
 * @param {Sheet} sheet
 * @return {Object}
 */
export function readSheet(sheet) {
  const data = [], styles = {};
  const rowHeights = [];
  const colWidths = [];
  const mergeCells = [];

  const usedRange = sheet.usedRange();
  // default number of empty sheet
  let numRows = 50, numCols = 13;
  if (usedRange) {
    numRows = usedRange.endCell().rowNumber() - usedRange.startCell().rowNumber() + 1 + 5;
    numCols = usedRange.endCell().columnNumber() - usedRange.startCell().columnNumber() + 1 + 5;
  }

  // data and style
  sheet._rows.forEach((row, rowNumber) => {
    const rowData = data[rowNumber - 1] = [];
    // const rowStyle = styles[rowNumber - 1] = {};
    row._cells.forEach((cell, colNumber) => {
      // process cell data
      if (typeof cell.formula() === 'string') {
        excelInstance.calculationChain.addCell(excelInstance.currentSheetIdx, rowNumber - 1, colNumber - 1 , cell.formula());
      }
      rowData[colNumber - 1] = undefined;
    });
  });

  // add extra rows and columns
  data[numRows - 1] = [];
  if (!data[0]) {
    data[0] = [];
  }
  if (data[0].length < numCols) {
    data[0][numCols - 1] = undefined;
  }

  // rowHeights and colWidths
  for (let row = 1; row <= numRows; row++) {
    const height = sheet.row(row).height();
    rowHeights.push(height === undefined ? 24 : height / 0.6);
  }
  for (let col = 1; col <= numCols; col++) {
    const width = sheet.column(col).width();
    colWidths.push(width === undefined ? 80 : width / 0.11);
  }

  // mergeCells
  const mergeCellNames = Object.keys(sheet._mergeCells);
  mergeCellNames.forEach(range => {
    const decode = colCache.decode(range);
    mergeCells.push({
      row: decode.top - 1,
      col: decode.left - 1,
      rowspan: decode.bottom - decode.top + 1,
      colspan: decode.right - decode.left + 1
    })
  });


  return {data, styles, rowHeights, colWidths, mergeCells};
}
