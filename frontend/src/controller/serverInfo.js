import axios from "axios";
import config from "./../config/config";
import {check, axiosConfig} from "./common";

/**
 * Singleton Pattern
 */
let instance = null;

export default class ServerInfoManager {

  constructor(props) {
    if (!instance) {
      instance = this;
      // init
      this.props = props;
    }
    return instance;
  }

  systemInfo() {
    return axios.get(config.server + '/api/v2/system', axiosConfig)
      .then(response => {
        if (check(response)) {
          return response.data;
        }
      })
  }

  staticSystemInfo() {
    return axios.get(config.server + '/api/v2/system/static', axiosConfig)
      .then(response => {
        if (check(response)) {
          return response.data;
        }
      })
  }
}
