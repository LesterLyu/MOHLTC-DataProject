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
            res.push([atts[i].id, atts[i].attribute, atts[i].description]);
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

}
