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
    return axios.get(config.server + '/api/v2/admin/workbooks', axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data.workbooks;
        }
      })
  }

  /**
   *
   * @param {string} fileName
   * @param {boolean} admin
   * @returns {Promise<any | never>}
   */
  deleteWorkbook(fileName, admin) {
    return admin ? this.deleteWorkbookForAdmin(fileName) : this.deleteWorkbookForUser(fileName);
  }

  deleteWorkbookForAdmin(fileName) {
    return axios.delete(config.server + '/api/v2/admin/workbooks/' + fileName, axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      })
      .catch(err => {
        this.props.showMessage(err.toString(), 'error');
      })
  }

  deleteWorkbookForUser(fileName) {
    return axios.delete(config.server + '/api/filled-workbook',
      {
        data: {
          name: fileName,
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
  }
}

export default WorkbookManager;
