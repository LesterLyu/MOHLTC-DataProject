import axios from "axios";
import config from "./../config/config";

/**
 * Singleton Pattern
 */
let instance = null;

class WorkbookManager {

  constructor() {
    if (!instance) {
      instance = this;
      // init

    }
    return instance;
  }

  getAllWorkbooks() {
    const arr = [];
    arr.push(
      axios.get(config.server + '/api/filled-workbooks', {withCredentials: true}),
      axios.get(config.server + '/api/workbooks', {withCredentials: true}));
    return Promise.all(arr)
      .then(values => {
        return [values[0].data, values[1].data]
      })

  }

}

export default new WorkbookManager();
