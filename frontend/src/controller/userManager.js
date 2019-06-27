import axios from "axios";
import config from "./../config/config";

/**
 * Singleton Pattern
 */
let instance = null;

class UserManager {

  constructor(props, showMessage) {
    if (!instance) {
      instance = this;
      this.props = props;
      this.showMessage = showMessage;
      // init
      this.lastUrl = null;
    }
    return instance;
  }

  /**
   * Check if the user is registered by username
   */
  checkUsername(username) {
    const urlStr = config.server + '/api/check/username/' + username;
    return axios.get(urlStr, {withCredentials: true})
      .then((response => {
        return response;
      }))
  }

  /**
   * Check if the user is registered by email.
   */
  checkEmail(email) {
    const urlStr = config.server + '/api/check/email/' + email;
    return axios.get(urlStr, {withCredentials: true})
      .then((response => {
        return response;
      }))
  }
  /**
   * Check if the user is logged in, result will go to call back function.
   * Available to use right after the web page refreshes, to check if there is a user logged in.
   */
  isLoggedIn() {
    return axios.get(config.server + '/api/isloggedin', {withCredentials: true})
      .then((response => {
        return response.data.isLoggedIn;
      }))

  }

  logout() {
    axios.get(config.server + '/api/logout', {withCredentials: true})
      .then(() => {
        this.props.history.push('/login');
      });
  }

  /**
   *
   * @param username
   * @param password
   * @return {AxiosPromise<any>}
   */
  loginLocal(username, password) {
    return axios.post(config.server + '/api/login/local', {
      username: username,
      password: password
    }, {withCredentials: true})
      .then((response => {
        return response;
      }));
  }


  /**
   * This will also sign in the created user
   * @param username
   * @param firstName
   * @param lastName
   * @param organization
   * @param email
   * @param password
   * @param phoneNumber
   * @param groupNumber
   * @returns {Promise<firebase.User | never>}
   */
  signUpLocal(username, password, firstName, lastName, organization, email, phoneNumber, groupNumber) {
    //log(username,email,password);
    return axios.post(config.server + '/api/signup/local', {
      username: username,
      password: password,
      firstName: firstName,
      lastName: lastName,
      organization: organization,
      email: email,
      phoneNumber: phoneNumber,
      groupNumber: groupNumber
    }, {withCredentials: true})
      .then((response => {
        return response;
      }));
  }

  /**
   *
   * @param email
   * @return {Promise<void>}
   */
  sendPasswordResetEmail(email) {

  }

  /**
   * Update permissions to other users. **Only for admin.**
   * @return {Promise}
   * @param username
   * @param permissions
   * @param active
   */

  updatePermission(username, permissions, active) {
    console.log(username, permissions, active);
    return axios.post(config.server + '/api/user/permission', {
      permissions: [{
        username,
        permissions,
        active
      }]
    }, {
      withCredentials: true
    })
  }

  getAllPermissions() {
    return axios.get(config.server + '/api/permissions', {withCredentials: true})
      .then((response => {
        //log(response);
        return response.data.permissions;
      }))
  }

  getAllUsers() {
    return axios.get(config.server + '/api/user/details', {withCredentials: true})
      .then((response => {
        return response.data.users;
      }))
  }

  getAllUsersWithCache() {

  }

  getProfile() {
    return axios.get(config.server + '/api/profile', {withCredentials: true})
      .then((response => {
        return response.data.profile;
      }))
      .catch(err => {
        this.showMessage(err.toString(), 'error');
      })
  }

}

export default UserManager;
