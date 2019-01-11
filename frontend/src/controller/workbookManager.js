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

  getAllWorkbooksForUser() {
    const arr = [];
    arr.push(
      axios.get(config.server + '/api/filled-workbooks', axiosConfig),
      axios.get(config.server + '/api/workbooks', axiosConfig));
    return Promise.all(arr)
      .then(response => {
        if (response[1].headers['content-type'].includes('html')
          || response[1].headers['content-type'].includes('html')) {
          this.props.history.push('/login');
          return null;
        }
        return [response[0].data.filledWorkbooks, response[1].data.workbooks]; // [filled workbook, unfilled workbook]
      })
  }

  getAllWorkbooksForAdmin() {
    return axios.get(config.server + '/api/admin/workbooks', axiosConfig)
      .then(response => {
        if (response.headers['content-type'].includes('html')) {
          this.props.history.push('/login');
          return null;
        }
        return response.data.workbooks;

      })
  }

  getWorkbook(name) {
    return axios.get(config.server + '/api/workbook/' + name, axiosConfig)
      .then(response => {
        console.log(response)
        if (!response.headers['content-type'].includes('json')) {
          this.props.history.push('/login');
          return null;
        }
        else
          return response;
      })
  }

}

export default WorkbookManager;
