import axios from "axios";
import config from "./../config/config";

/**
 * Singleton Pattern
 */
let instance = null;

class UserManager {

  constructor(props) {
    if (!instance) {
      instance = this;
      this.props = props;
      // init

    }
    return instance;
  }

  /**
   * Check if the user is logged in, result will go to call back function.
   * Available to use right after the web page refreshes, to check if there is a user logged in.
   * @param cb cb({Boolean})
   */
  isLoggedIn(cb) {
    // TO-DO
    cb(true);
  }

  logout() {
    this.props.history.push('/login');
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
   * @param uid {String} uid for the user
   * @param permissions {Array} permissions to be assigned
   * @return {Promise}
   */
  updatePermission(uid, permissions) {


  }

  getAllAdminPanelUsers() {

  }

  getAllAdminPanelUsersUseCache() {

  }


}

export default UserManager;
