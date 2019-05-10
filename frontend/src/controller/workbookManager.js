import axios, {AxiosRequestConfig} from "axios";
import config from "./../config/config";
import XlsxPopulate from "xlsx-populate";
import {readSheet, excelInstance} from "../views/Excel/helpers";

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

  getAllWorkbooksForUser() {
    const arr = [];
    arr.push(
      axios.get(config.server + '/api/filled-workbooks', axiosConfig),
      axios.get(config.server + '/api/workbooks', axiosConfig));
    return Promise.all(arr)
      .then(response => {
        if (this.check(response[0]) && this.check(response[1])) {
          // [filled workbook, unfilled workbook]
          return [response[0].data.filledWorkbooks, response[1].data.workbooks];
        }
      })
  }

  getAllWorkbooksForAdmin() {
    return axios.get(config.server + '/api/admin/workbooks', axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data.workbooks;
        }

      })
  }

  // David
  deleteWorkbookForAdmin(name) {
    return axios.delete(config.server + '/api/admin/workbook/',
      {
        data: {
          name: name,
        },
        withCredentials: axiosConfig.withCredentials,
      })
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      })
      .catch(err => {
        this.props.showMessage(err.toString(), 'error');
      })
    // this.props.showMessage(response.data.message, response.data.success ? 'success' : 'error');
  }

  getWorkbook(name) {
    return axios.get(config.server + '/api/workbook/' + name, axiosConfig)
      .then(response => {
        console.log(response);
        if (this.check(response)) {
          return response;
        }
      })
  }

  addCategory(category) {
    return axios.post(config.server + '/api/add-cat', {category}, axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      })
  }

  addAttribute(attribute) {
    return axios.post(config.server + '/api/add-att', {attribute}, axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      })
  }

  add(what, newValue) {
    if (what === 'att')
      return this.addAttribute(newValue);
    else if (what === 'cat')
      return this.addCategory(newValue);
    else {
      throw new Error('first parameter must be att or cat');
    }
  }

  getAttributes() {
    return axios.get(config.server + '/api/attributes', axiosConfig)
      .then(response => {
        if (this.check(response)) {
          const atts = response.data.attributes;
          const res = [];
          for (let i = 0; i < atts.length; i++) {
            res.push([atts[i].id, atts[i].attribute])
          }
          return res;

        }
      })
  }

  getCategories() {
    return axios.get(config.server + '/api/categories', axiosConfig)
      .then(response => {
        if (this.check(response)) {
          const cats = response.data.categories;
          const res = [];
          for (let i = 0; i < cats.length; i++) {
            res.push([cats[i].id, cats[i].category])
          }
          return res;
        }
      })
  }

  /**
   *
   * @param {'att'|'cat'} what
   * @return {*}
   */
  get(what) {
    if (what === 'att')
      return this.getAttributes();
    else if (what === 'cat')
      return this.getCategories();
    else {
      throw new Error('first parameter must be att or cat');
    }
  }

  delete(what, ids) {
    return axios.delete(config.server + '/api/' + what + 's/delete', {
      data: {ids: ids},
      withCredentials: axiosConfig.withCredentials
    })
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      })
  }

// methods for modifying workbook
  createWorkbookLocal() {
    return XlsxPopulate.fromBlankAsync()
  }

  readWorkbookFromDatabase(workbook) {
    return this.getWorkbook(workbook)
      .then(response => {
        const {data, name} = response.data.workbook;
        return XlsxPopulate.fromDataAsync(data, {base64: true})
          .then(workbook => this._readWorkbook(workbook, null, name));
      })
      .catch(err => {
        console.log(err);
        this.props.showMessage(err.toString(), 'error');
      })

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

    // load into {WorkbookStore}
    workbook.sheets().forEach(sheet => {
      const {data, styles, rowHeights, colWidths, mergeCells} = readSheet(sheet);
      sheets.push({
        tabColor: sheet.tabColor(),
        data,
        styles,
        name: sheet.name(),
        state: 'visible',
        views: [],
        mergeCells,
        rowHeights,
        colWidths,
      })
    });
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
            attMap, catMap, data: base64, name: fileName
          }, axiosConfig);
        } else {
          return axios.post(config.server + '/api/v2/user/workbook', {
            workbookData, name: fileName
          }, axiosConfig);
        }
      })
      .then(response => {
        this.props.showMessage(response.data.message, response.data.success ? 'success' : 'error');
      })
  }
}

export default WorkbookManager;
