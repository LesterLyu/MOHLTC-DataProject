import axios from "axios";
import config from "../config/config";

export const axiosConfig = {withCredentials: true};
export {config};

export function buildErrorParams(e) {
  if (e.response && e.response.data &&  e.response.data.message)
    return [e.toString() + '\nDetails: ' + e.response.data.message, 'error'];
  else
    return [e.stack, 'error'];
}

/**
 * check if login needed
 * @param response
 * @returns {boolean}
 */
export function check(response) {
  if (response.data.loginRequired) {
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
