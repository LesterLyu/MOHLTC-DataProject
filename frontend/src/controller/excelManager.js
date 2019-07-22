import axios from "axios";
import config from "./../config/config";
import {excelInstance, RichText, XlsxPopulate} from "../views/Excel/helpers";
import {generateObjectId} from './common';

const axiosConfig = {withCredentials: true};

/**
 * Singleton Pattern
 */
let instance = null;

class WorkbookManager {

  constructor(props) {
    if (!instance) {
      instance = this;
      // init
      this.props = props;
    }
    return instance;
  }

  /**
   * check if login needed
   * @param response
   * @returns {boolean}
   */
  check(response) {
    if (response.headers['content-type'].includes('html')) {
      this.props.history.push('/login');
      return false;
    }
    return true;
  };

  getWorkbook(name, admin) {
    const url = admin ? '/api/v2/workbook/' : '/api/v2/user/filled/';
    return axios.get(config.server + url + name, axiosConfig)
      .then(response => {
        console.log(response);
        if (this.check(response)) {
          return response;
        }
      })
  }

// methods for modifying workbook
  createWorkbookLocal() {
    return XlsxPopulate.fromBlankAsync()
  }

  async readWorkbookFromDatabase(fileName, admin = true) {
    try {
      const response = await this.getWorkbook(fileName, admin);
      const {populate, workbook} = response.data;
      const {file, name} = workbook;
      const wb = await XlsxPopulate.fromDataAsync(file, {base64: true});
      for (let i in populate) {
        const sheet = wb.sheets()[i];
        const rows = populate[i];
        for (let rowNum in rows) {
          rowNum = Number(rowNum);
          const cols = rows[rowNum];
          const row = sheet.row(rowNum + 1);
          for (let colNum in cols) {
            colNum = Number(colNum);
            const cell = row.cell(colNum + 1);
            // only populate the basic values (not formula nor rich text)
            if (!(cell instanceof RichText)) cell._value = cols[colNum];
          }
        }
      }
      return this._readWorkbook(wb, null, name);
    } catch (err) {
      console.err(err);
      this.props.showMessage(err.toString(), 'error');
    }
  }

  readWorkbookLocal(cb) {
    const input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => {
      const file = e.target.files[0];
      console.log(file.name);
      XlsxPopulate.fromDataAsync(file)
        .then(workbook => this._readWorkbook(workbook, cb, file.name));
    };

    input.click();
  }

  _readWorkbook(workbook, cb, fileName) {
    const sheets = [], sheetNames = [];

    // read sheet names first for building calculation chain
    workbook.sheets().forEach(sheet => {
      sheetNames.push(sheet.name());
    });
    excelInstance.global.sheetNames = sheetNames;
    excelInstance.currentSheetName = sheetNames[0];
    excelInstance.initialFileName = fileName;
    if (cb) {
      cb(sheets, sheetNames, workbook);
      excelInstance.setState({fileName});
    } else {
      return {sheets, sheetNames, workbook, fileName};
    }
  }

  downloadWorkbook(workbook, fileName = 'out.xlsx') {
    return workbook.outputAsync()
      .then(function (blob) {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          // If IE, you must uses a different method.
          window.navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          document.body.appendChild(a);
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      });
  }

  saveWorkbookUser(workbook) {
    this.saveWorkbookAdmin(workbook, false);
  }

  saveWorkbookAdmin(workbook, admin = true) {
    const fileName = excelInstance.state.fileName;
    workbook.outputAsync('base64')
      .then(base64 => {
        this.testSave(workbook, fileName, base64);
        const workbookData = {}, attMap = {}, catMap = {};
        workbook.sheets().forEach((sheet, sheetNo) => {
          workbookData[sheetNo] = {};
          attMap[sheetNo] = {};
          catMap[sheetNo] = {};
          sheet._rows.forEach((row, rowNumber) => {
            // check attribute
            if (admin && rowNumber === 1) {
              row._cells.forEach((cell, colNumber) => {
                if (/^[0-9]*$/.test(cell.value())) {
                  attMap[sheetNo][cell.value()] = colNumber - 1;
                }
              })
            }
            // process each row
            workbookData[sheetNo][rowNumber - 1] = {};
            row._cells.forEach((cell, colNumber) => {
              // check category
              if (admin && colNumber === 1) {
                if (/^[0-9]*$/.test(cell.value())) {
                  catMap[sheetNo][cell.value()] = rowNumber - 1;
                }
              }
              // skip empty cell, rich text,
              if (cell.value() === undefined || cell.value() === null || cell.value() instanceof XlsxPopulate.RichText) {
                return;
              }
              workbookData[sheetNo][rowNumber - 1][colNumber - 1] = cell.value();
            });
            // after each row
            if (Object.keys(workbookData[sheetNo][rowNumber - 1]).length === 0) {
              delete workbookData[sheetNo][rowNumber - 1];
            }
          });
        });

        console.log(workbookData, attMap, catMap, fileName);
        if (admin) {
          return axios.post(config.server + '/api/v2/admin/workbook', {
            attMap, catMap, base64, name: fileName
          }, axiosConfig);
        } else {
          return axios.post(config.server + '/api/v2/user/workbook', {
            data: workbookData, base64, name: fileName
          }, axiosConfig);
        }
      })
      .then(response => {
        this.props.showMessage(response.data.message, response.data.success ? 'success' : 'error');
      })
  }

  async testSave(workbook, fileName, base64) {
    const data = {};
    const sheets = workbook.sheets();
    const ids = await generateObjectId(sheets.length);
    data.workbook = {
      name: fileName,
      file: base64,
      sheetIds: ids,
    };
    data.sheets = [];
    data.values = {};
    sheets.forEach((sheet, sheetNo) => {
      const col2Att = {}, row2Cat = {};
      const sheetData = {
        col2Att, row2Cat, name: sheet.name(), _id: ids[sheetNo]
      };
      data.sheets.push(sheetData);
      sheet._rows.forEach((row, rowNumber) => {
        // first row, check attribute
        if (rowNumber === 1) {
          row._cells.forEach((cell, colNumber) => {
            const cellValue = cell.getValue();
            if (/^[0-9]*$/.test(cellValue)) {
              col2Att[colNumber - 1] = cellValue; // 0-based index
            }
          });
          return;
        }
        // process each row
        row._cells.forEach((cell, colNumber) => {
          // first column, check category
          if (colNumber === 1) {
            const cellValue = cell.getValue();
            if (/^[0-9]*$/.test(cellValue)) {
              row2Cat[rowNumber - 1] = cellValue;
            }
          }
          const catId = row2Cat[rowNumber - 1], attId = col2Att[colNumber - 1];
          // skip the cell that have no att or cat id.
          if (!catId || !attId) return;

          // skip empty cell, rich text,
          if (cell.value() === undefined || cell.value() === null || cell.value() instanceof XlsxPopulate.RichText) {
            return;
          }

          let atts = data.values[catId];
          if (!atts) atts = data.values[catId] = {};
          if (!atts[attId]) atts[attId] = cell.getValue();
        });
      });
      sheetData.attIds = Object.values(col2Att);
      sheetData.catIds = Object.values(row2Cat);
    });
    console.log(data);
    await axios.post(config.server + '/api/v2/test/admin/workbook', data, axiosConfig);
  }
}

export default WorkbookManager;
