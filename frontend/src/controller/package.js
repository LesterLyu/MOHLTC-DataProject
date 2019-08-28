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
export async function createPackage({name, orgIds, workbookIds, startDate, endDate, adminNotes, published}) {
  const response = await axios.post(config.server + '/api/v2/admin/packages', {
    name,
    orgIds,
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

export async function adminGetPackage(packageName, organizationName) {
  const response = await axios.get(config.server + '/api/v2/admin/packages/' + packageName + '/' + organizationName, axiosConfig);
  if (check(response)) {
    return response.data.package;
  }
}

export async function adminGetPackageOrganizations(packageName) {
  const response = await axios.get(config.server + '/api/v2/admin/packages/' + packageName + '/organizations', axiosConfig);
  if (check(response)) {
    return response.data.organizations;
  }
}

export async function adminEditPackage(name, pack) {
  const response = await axios.put(config.server + '/api/v2/admin/packages/' + name, pack, axiosConfig);
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

export async function userGetPackages(org) {
  const response = await axios.get(config.server + '/api/v2/packages/' + org, axiosConfig);
  if (check(response)) {
    return response.data.packages;
  }
}

export async function userGetPackage(packageName, org) {
  const response = await axios.get(config.server + '/api/v2/packages/' + packageName + '/' + org, axiosConfig);
  if (check(response)) {
    return response.data.package;
  }
}

export async function userSaveWorkbook(packageName, organizationName, workbookName, data) {
  const response = await axios.put(config.server + `/api/v2/packages/${packageName}/${organizationName}/${workbookName}`, data, axiosConfig);
  if (check(response)) {
    return response;
  }
}

export async function userSubmitPackage(packageName, organization, {userNotes}) {
  const response = await axios.post(config.server + `/api/v2/packages/${packageName}/${organization}`, {userNotes}, axiosConfig);
  if (check(response)) {
    return response.data;
  }
}
