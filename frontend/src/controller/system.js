import axios from "axios";
import config from "./../config/config";

const axiosConfig = {withCredentials: true};

/**
 * Singleton Pattern
 */
let instance = null;

export default class AttCatManager {

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

  systemInfo() {
    return axios.get(config.server + '/api/v2/system', axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      })
  }

  staticSystemInfo() {
    return axios.get(config.server + '/api/v2/system/static', axiosConfig)
      .then(response => {
        if (this.check(response)) {
          return response.data;
        }
      })
  }
}
