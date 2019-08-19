import axios from "axios";
import config from "./../config/config";
import {check, axiosConfig} from "./common";

/**
 * Singleton Pattern
 */
let instance = null;

export async function getAllWorkbooksForAdmin() {
  const response = await axios.get(config.server + '/api/v2/admin/workbooks', axiosConfig);
  if (check(response)) {
    return response.data.workbooks;
  }
}

class WorkbookManager {

  constructor(props) {
    if (!instance) {
      instance = this;
      // init
      this.props = props;
    }
    return instance;
  }

  getAllWorkbooksForUser() {
    const arr = [];
    arr.push(
      axios.get(config.server + '/api/filled-workbooks', axiosConfig),
      axios.get(config.server + '/api/workbooks', axiosConfig));
    return Promise.all(arr)
      .then(response => {
        if (check(response[0]) && this.check(response[1])) {
          // [filled workbook, unfilled workbook]
          return [response[0].data.filledWorkbooks, response[1].data.workbooks];
        }
      })
  }

  getAllWorkbooksForAdmin() {
    return axios.get(config.server + '/api/v2/admin/workbooks', axiosConfig)
      .then(response => {
        if (check(response)) {
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
        if (check(response)) {
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
        if (check(response)) {
          return response.data;
        }
      })
      .catch(err => {
        this.props.showMessage(err.toString(), 'error');
      })
  }
}

export default WorkbookManager;
