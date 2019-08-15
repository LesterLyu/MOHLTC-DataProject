import axios from "axios";
import config from "./../config/config";
import {check, axiosConfig} from "./common";

/**
 * @param name
 * @param userIds
 * @param workbookIds
 * @param startDate
 * @param endDate
 * @param adminNotes
 * @param published
 * @return {Promise}
 */
export async function createPackage({name, userIds, workbookIds, startDate, endDate, adminNotes, published}) {
  const response = await axios.post(config.server + '/api/v2/admin/packages', {
    name,
    userIds,
    workbookIds,
    startDate,
    endDate,
    adminNotes,
    published
  }, axiosConfig);
  if (check(response)) {
    return response.data;
  }
}

export async function adminGetPackages() {
  const response = await axios.get(config.server + '/api/v2/admin/packages', axiosConfig);
  if (check(response)) {
    return response.data.packages;
  }
}

export async function adminGetPackage(packageName) {
  const response = await axios.get(config.server + '/api/v2/admin/packages/' + packageName, axiosConfig);
  if (check(response)) {
    return response.data;
  }
}

export async function adminDeletePackage(packageName) {
  const response = await axios.delete(config.server + '/api/v2/admin/packages/' + packageName, axiosConfig);
  if (check(response)) {
    return response.data;
  }
}

export async function userGetPackages() {
  const response = await axios.get(config.server + '/api/v2/packages', axiosConfig);
  if (check(response)) {
    return response.data.packages;
  }
}

export async function userGetPackage(packageName) {
  const response = await axios.get(config.server + '/api/v2/packages/' + packageName, axiosConfig);
  if (check(response)) {
    return response.data;
  }
}
