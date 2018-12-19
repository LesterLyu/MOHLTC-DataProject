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
 

