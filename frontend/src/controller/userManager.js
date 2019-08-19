import axios from "axios";
import {axiosConfig, check, config} from "./common";

export let lastUrl = null;

export function setLastUrl(url) {
  lastUrl = url;
}

/**
 * Check if the username is used.
 */
export async function checkUsername(username) {
  const urlStr = config.server + '/api/check/username/' + username;
  return await axios.get(urlStr, axiosConfig);
}

/**
 * Check if the user is registered by email.
 */
export async function checkEmail(email) {
  const urlStr = config.server + '/api/check/email/' + email;
  return await axios.get(urlStr, axiosConfig);
}

/**
 * Get all groups from database.
 */
export async function getAllGroups() {
  const urlStr = config.server + '/api/v2/groups';
  try {
    const result = await axios.get(urlStr);
    return result.data.groups;
  } catch (e) {
    return {groupNumber: -1, name: 'wrong', err: e};
  }
}

export async function getAllRequestUsers() {
  let results = [];
  try {
    const users = await getAllUsers();
    results = users.filter((u) => u.validated === false);
  } catch (e) {
    throw e;
  }
  return results;
}


export async function switchUserActive(username, activeValue) {
  try {
    return await axios.put(config.server + '/api/users/active/' + username, {active: activeValue}, axiosConfig);
  } catch (e) {
    throw e;
  }
}

export async function switchUserValidate(user, validatedValue) {
  await axios.post(config.server + '/api/v2/organization/' + user.organization + '/' + user._id, {}, axiosConfig);
  await axios.put(config.server + '/api/users/validated/' + user.username, {validated: validatedValue}, axiosConfig);
}

/**
 * Check if the user is logged in, result will go to call back function.
 * Available to use right after the web page refreshes, to check if there is a user logged in.
 */
export async function isLoggedIn() {
  return (await axios.get(config.server + '/api/isloggedin', axiosConfig)).data.isLoggedIn;
}

export async function logout() {
  await axios.get(config.server + '/api/logout', axiosConfig);
  window.location.hash = 'login';
}

/**
 *
 * @param username
 * @param password
 * @return {AxiosPromise<any>}
 */
export async function loginLocal(username, password) {
  return await axios.post(config.server + '/api/login/local', {
    username: username,
    password: password
  }, axiosConfig);
}

/**
 * This will also sign in the created user
 * @param setup - is this called for system setup
 * @param username
 * @param firstName
 * @param lastName
 * @param organization
 * @param email
 * @param password
 * @param phoneNumber
 * @param groupNumber
 * @returns {Promise}
 */
export async function signUpLocal(setup, username, password, firstName, lastName, organization, email, phoneNumber, groupNumber) {
  return await axios.post(config.server + (setup ? '/api/setup' : '/api/signup/local'), {
    username: username,
    password: password,
    firstName: firstName,
    lastName: lastName,
    organization: organization,
    email: email,
    phoneNumber: phoneNumber,
    groupNumber: groupNumber
  }, axiosConfig);
}

/**
 *
 * @param email
 * @return {Promise<void>}
 */
export async function sendPasswordResetEmail(email) {

}

/**
 * Update permissions to other users. **Only for admin.**
 * @return {Promise}
 * @param username
 * @param permissions
 * @param active
 */
export async function updatePermission(username, permissions, active) {
  // console.log(username, permissions, active);
  const response = await axios.post(config.server + '/api/user/permission', {
    permissions: [{
      username,
      permissions,
      active
    }]
  }, axiosConfig);
  if (check(response)) return response;
}

export async function getAllPermissions() {
  const response = await axios.get(config.server + '/api/permissions', axiosConfig);
  if (check(response)) return response.data.permissions;
}

export async function getAllUsers() {
  const response = await axios.get(config.server + '/api/user/details', axiosConfig);
  if (check(response)) return response.data.users;
}

export async function getProfile() {
  const response = await axios.get(config.server + '/api/profile', axiosConfig);
  if (check(response)) return response.data.profile;
}
