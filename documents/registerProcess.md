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
  passport.authenticate(){}                                    // authenticate in local server
  
  let redirectUrl = '/profile';
  return res.json({redirect: redirectUrl});                    // redirect to profile page
  ...
  }
 ```
 - LDAP Server
 ```
  router.post('/api/login/ldap', registration_ldap_controller.user_auth_login);
  
  user_auth_login: (req, res, next) => {
  ...
  passport.authenticate() {}                                  // authenticate in LDAP server
  user_controller.user_log_in()                               // call user_log_in
  ...
  }
  
  user_log_in: (req, res, next) => {
  ...
  passport.authenticate(){}                                   // authenticate in local server
  
  let redirectUrl = '/profile';
  return res.json({redirect: redirectUrl});                   // redirect to profile page
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
 
## Set Up the manager account

 - Registration needs the approve of manager account. Please copy the following code into mongoDB to create the manager account.
 ```
 {"_id":"5c05ae97dcb800a53ce7e9c2",
 "active":true,
 "permissions":["system-management","user-management","CRUD-workbook-template","create-delete-attribute-category","workbook-query"],
 "username":"will",
 "firstName":"will",
 "lastName":"will",
 "groupNumber":1,
 "phoneNumber":"1111111",
 "validated":true,
 "email":"767089351@qq.com",
 "createDate":"2018-12-03T22:30:47.164Z",
 "salt":"802b625022571c1f2d77692ea16a3460690372d896ddd38c4dbdf0a698b8b5c1",
 "hash":"da7a6a397ced0c6929707163191be1a4d217c6e864f47f17a5fa0086d3c09bf3eaf27361509de1b146389c64388e71015af510a395e14f0fb6ab4b8d815fcce6224e2f583a303e7a4bcb40680c64e2a1208f61e90b955cef7c27b4582c2150c5c43ff3566e21350864557832940ae041de306cce743d35fbbfc3682673b358b2e5b0ffc7d9cb22bd83e89f753b399f87df47beead96e9a1c54074b5ce44fbd9e2b717b064cf8ab7393acde906aa3a454ccc3aa0fef82441b98f09022d4974e7736d0665e3dc1c172c0808f9e81b274795b7e158af39036ae9a6c999d9bba66381e6a46c847c94a7cef6daece6456d62ce1ca56849a61d78c83d2b30eb450fb86a6a3dd6ea207a993faa15698d3294dd8d525ec5c63c3e0adce359ef623c0b51830cb8594b1ba727ab3c22a9568d948d9bf670a2405fb33c2d43202fa101ba5c78403c333d38bf40d41dfbd01664cb54bfb63e1061186c2939e648308a6e084ae6b5842301eff288a5d390388726ed8e201e00c2b750e192827384d5d5bab371a693bdabf9d6a559198b5fe161b17e043134ca5ed3a23a16bc8d479a6911dbc4672a4922065f292d4e96b11fde5cb646bccc3d87c3a3d148040ef5bde24bfe4aee95ee2db543357c47f20ba40aab454836009502ed37fef412abbeeae84bd9739781b55e66f6f08b99419bfde9bb2dd4117b2b48d8eafbac8b88911ecca772d06",
 "__v":0}
 ```
 The username is "will" and password is "wkw1234567"
 
## Installation
```
npm install ldapjs
```
```
npm install passport-ldapauth
```
## Important Function
 
 - Local Server
 ```
 router.post('/api/signup/local', registration_local_controller.user_sign_up_local);
 
 user_sign_up_local: (req, res, next) => {
 ...
 User.findOne()=> {                       
 ...                                                             // authenticate and register new user
  return res.json({redirect: '/profile'});                       // redirect to profile page
 ...
 }
 }
 ```
 - LDAP Server
 ```
 router.post('/api/signup', registration_ldap_controller.user_ldap_signup);
 
 user_ldap_signup: (req, res, next) => {
  passport.authenticate(){
  ...                                                           // authenticate in LDAP server
  user_controller.user_sign_up(req, res, next);                 // call user_sign_up function
  ... 
  }                              
  }
  
  user_sign_up: (req, res, next) => {
 ...
 User.findOne()=> {                       
 ...                                                            // authenticate and submit new register request
  return res.json({redirect: '/register-success-submit'});      // redirect to register-success-submit page
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
  ...                                                           // register user in local server
  registration_ldap_controller.user_ldap_register(req, res, user, next);       // call user_ldap_register function
  
  }
  }
  
  user_ldap_register: (req, res, user, next) => {
 ...                                                            // register user in LDAp server
 }
 ```
 
 
 
 
 
 
