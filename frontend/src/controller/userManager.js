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

    }
    return instance;
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
  }


  /**
   * This will also sign in the created user
   * @param username
   * @param email
   * @param password
   * @param disabled
   * @returns {Promise<firebase.User | never>}
   */
  signUpLocal(username, email, password, disabled = true) {

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
   * @param permissions {Array} permissions to be assigned
   * @return {Promise}
   */
  updatePermission(permissions) {


  }
  getAllPermissions() {
    return axios.get(config.server + '/api/permissions', {withCredentials: true})
      .then((response => {
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


}

export default UserManager;
