import axios from "axios";
import config from "../config/config";

const axiosConfig = {withCredentials: true};

/**
 * check if login needed
 * @param response
 * @returns {boolean}
 */
function check(response) {
  if (response.headers['content-type'].includes('html')) {
    window.location.hash = 'login';
    return false;
  }
  return true;
}

/**
 * Generate a _id
 * @param {number} [number=1]
 * @return {{}}
 */
export async function generateObjectId(number = 1) {
  try {
    const response = await axios.get(config.server + '/api/v2/generate/id/' + number, axiosConfig);
    if (check(response)) {
      return response.data.ids;
    }
  } catch (e) {
    console.error(e);
  }
}
