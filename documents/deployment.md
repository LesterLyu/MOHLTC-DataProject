# Deploy to the clouds
> This document covers the procedure of deploying to Amazon cloud
> and Pivotal Cloud

## Deploy to Amazon Cloud
### Prerequisites:
 - Has the permission to [Data-Project-Config](https://github.com/LesterLyu/Data-Project-Config)
    > Ask Lester for the permission.
 - An amazon cloud account.
    > We will use **Elastic Beanstalk**.
 - An Node.js web server environment in **Elastic Beanstalk**
   - Environment tier: **Web server environment**
   - Domain: anything you like, this domain is blocked by the government.
            you will need the *ec2 url* to access this server.
   - Application code: *Upload your code* - a zip file `release-beta.zip` 
            in the project directory. It is generated in the next few steps.
   - Node command: `npm run aws`
### Procedure of Generating `release-beta.zip`
 1. Clone [Data-Project-Config](https://github.com/LesterLyu/Data-Project-Config)
    and put it in the same directory as [MOHLTC-DataProject](https://github.com/LesterLyu/MOHLTC-DataProject)
    ```
    Some Folder
    ├── MOHLTC-DataProject
    │   ├── README.md
    │   ├── node_modules
    │   ├── ...
    └──  Data-Project-Config
        ├── .ebextensions
        ├── config
        └── README.md
    ```
 1. Modify configuration in `MOHLTC-DataProject/config/cloud.js`
    > You will need your *ec2 url*, get it from EC2 Dashboard -> 
    > Running instances -> *Choose one* -> Description -> Public DNS (IPv4)
    ```js
    // config for amazon cloud
    const aws = {
        serverUrl: 'http://ec2-3-13-195-83.us-east-2.compute.amazonaws.com',
        frontendUrl: 'http://ec2-3-13-195-83.us-east-2.compute.amazonaws.com/react',
    };
    ```
    Change `serverUrl` to the *ec2 url* and `frontendUrl` to the *ec2 url* plus(concat) `/react`.
 1. Run scripts:
    ```sh
    yarn run build:aws
    ```
    This will take 1 to 3 minutes, depends on the computer performance.
    `release-beta.zip` will be generated on the project folder once it finished.
    
