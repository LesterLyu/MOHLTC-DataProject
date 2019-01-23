import axios from "axios";
import config from "./../config/config";
import XlsxPopulate from "xlsx-populate";

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

  getWorkbook(name) {
    return axios.get(config.server + '/api/workbook/' + name, axiosConfig)
      .then(response => {
        console.log(response)
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

  get(what, newValue) {
    if (what === 'att')
      return this.getAttributes(newValue);
    else if (what === 'cat')
      return this.getCategories(newValue);
    else {
      throw new Error('first parameter must be att or cat');
    }
  }

  delete(what, ids) {
    return axios.delete(config.server + '/api/' + what + 's/delete', {data: {ids: ids}, withCredentials: axiosConfig.withCredentials})
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

  downloadWorkbook(workbook) {
    return workbook.outputAsync()
      .then(function (blob) {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          // If IE, you must uses a different method.
          window.navigator.msSaveOrOpenBlob(blob, "out.xlsx");
        } else {
          var url = window.URL.createObjectURL(blob);
          var a = document.createElement("a");
          document.body.appendChild(a);
          a.href = url;
          a.download = "out.xlsx";
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      });
  }
}

export default WorkbookManager;
