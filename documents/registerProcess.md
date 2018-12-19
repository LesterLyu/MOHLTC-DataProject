# User Login Process

## Login Process

 - Choose "Login to Local/LDAP Server"
 - Type in Username and Password
 - Click "Login"
 - Username and Password are checked in local/LDAP server, then login to profile page
 
## Important Function
- Local Server
 ```
  router.post('/api/login/local', user_controller.user_log_in);
  user_log_in: (req, res, next) => {
  ...
  passport.authenticate(){}   // authenticate in local server
  
  let redirectUrl = '/profile';
  return res.json({redirect: redirectUrl});   // redirect to profile page
  ...
  }
 ```
 - LDAP Server
 ```
  router.post('/api/login/ldap', registration_ldap_controller.user_auth_login);
  
  user_auth_login: (req, res, next) => {
  ...
  passport.authenticate() {}   // authenticate in LDAP server
  user_controller.user_log_in()   // call user_log_in
  ...
  }
  
  user_log_in: (req, res, next) => {
  ...
  passport.authenticate(){}   // authenticate in local server
  
  let redirectUrl = '/profile';
  return res.json({redirect: redirectUrl});   // redirect to profile page
  ...
  }
 ```


# User Register Process

## Register in Local Server

 - Choose "sign up to Local Server"
 - Type in User Information
 - Click "Next"
 - User is registered in local database and login to user profile page
 
## Register in LDAP Server

 - Choose "sign up to LDAP Server"
 - Type in User Information
 - Click "Next"
 - Username is checked in LDAP server
      - Username exists in LDAP server, then LDAP will check the correctness of Password, then Register Request is registered in local server
      - Username does not exist in LDAP server, then Register Request is registered in local server
 - User receives an email reminding that Register Request has been submitted
 - Manager login to manager account and approve Register Request in register-request-management page
 - User is registered in local server and LDAP server (if User has existed in LDAP server, user information will be updated into LDAP server instead of registering)
 - User receive an email reminding that his Register Request has been approved
 
## User Information

 - Username cannot be repetitive in database
 - Password has password validator, you can check controller/registration/user.js for datails
 - Organization is the organization of User. In back ground, mapping function maps each organization with one distinct integer as Group Number.
 - Role is the role of User. Different role has diffrernt permissions. User only can access pages with permissions.
 
## Important Function
 
 - Local Server
 ```
 router.post('/api/signup/local', registration_local_controller.user_sign_up_local);
 
 user_sign_up_local: (req, res, next) => {
 ...
 User.findOne()=> {                       
 ...                                                      // authenticate and register new user
  return res.json({redirect: '/profile'});                // redirect to profile page
 ...
 }
 }
 ```
 - LDAP Server
 ```
 router.post('/api/signup', registration_ldap_controller.user_ldap_signup);
 
 user_ldap_signup: (req, res, next) => {
  passport.authenticate(){
  ...                                                    // authenticate in LDAP server
  user_controller.user_sign_up(req, res, next);          // call user_sign_up function
  ... 
  }                              
  }
  
  user_sign_up: (req, res, next) => {
 ...
 User.findOne()=> {                       
 ...                                                      // authenticate and submit new register request
  return res.json({redirect: '/register-success-submit'});             // redirect to register-success-submit page
 ...
 }
 }
  ```
 - Request Management
 ```
 router.post('/api/user/register_management', user_management_controller.register_management);
 
  register_management: (req, res, next) => {
  ...                                                    
   User.register() => {
  ...                                                       // register user in local server
  registration_ldap_controller.user_ldap_register(req, res, user, next);        // call user_ldap_register function
  
  }
  }
  
  user_ldap_register: (req, res, user, next) => {
 ...                                                         // register user in LDAp server
 }
 ```
 
 
 
 
 
 
