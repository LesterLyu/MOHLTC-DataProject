import axios from "axios";
import config from "./../config/config";

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
          return response.data.workbookse;
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

  getAttributes() {
    return axios.get(config.server + '/api/attributes', axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data.attributes;
        }
      })
  }

  getCategories() {
    return axios.get(config.server + '/api/categories', axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data.categories;
        }
      })
  }
}

export default WorkbookManager;
