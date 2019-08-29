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
### Procedure of First Time Generating `release-beta.zip` & Deployment
 1. Clone [Data-Project-Config](https://github.com/LesterLyu/Data-Project-Config)
    and put it in the parent directory of [MOHLTC-DataProject](https://github.com/LesterLyu/MOHLTC-DataProject)
    ```
    Some Folder
    ├── MOHLTC-DataProject
    │   ├── README.md
    │   ├── node_modules
    │   ├── ...
    └── Data-Project-Config
        ├── .ebextensions
        ├── config
        └── README.md
    ```
    You may want to change the database connection string or other 
    configurations in `Data-Project-Config/config/config.js`: 
    ```
    database: "your database connection string",
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
 1. Upload to Elastic Beanstalk: Navigate to Elastic Beanstalk console and
    upload `release-beta.zip`.
    
### Update code to the Amazon Cloud
 1. Run script to generate `release-beta.zip`.
    ```sh
    yarn run build:aws
    ```
 1. Upload to Elastic Beanstalk: Navigate to Elastic Beanstalk console and
    upload `release-beta.zip`
    
----
## Deploy to Pivotal Cloud
### Prerequisites:
 - Has the permission to [Data-Project-Config](https://github.com/LesterLyu/Data-Project-Config)
    > Ask Lester for the permission.
 - An Pivotal account.
    > Can be government issued account or personal account. Ask Tony for details.
 - Install [Cloud Foundry](https://console.run.pivotal.io/tools) (cf cli)
 - Login to cd: `cf login`
### Procedure of First Time Deployment
 1. Clone [Data-Project-Config](https://github.com/LesterLyu/Data-Project-Config)
    and put it in the parent directory of [MOHLTC-DataProject](https://github.com/LesterLyu/MOHLTC-DataProject)
    ```
    Some Folder
    ├── MOHLTC-DataProject
    │   ├── README.md
    │   ├── node_modules
    │   ├── ...
    └── Data-Project-Config
        ├── .ebextensions
        ├── config
        └── README.md
    ```
    You may want to change the database connection string or other 
    configurations in `Data-Project-Config/config/config.js`: 
    ```
    database: "your database connection string",
    ```
 1. Modify configuration in `MOHLTC-DataProject/config/cloud.js`
    ```js
    // config for amazon cloud
    const pivotal = {
        appName: 'mohltc', // your pivotal app name
        serverUrl: 'https://mohltc.cfapps.io', // the route for this app
        frontendUrl: 'https://mohltc.cfapps.io/react',
    };
    ```
    Change `serverUrl` to the *app route* and `frontendUrl` to the *app route* plus(concat) `/react`.
 1. Run scripts:
    ```sh
    yarn run build:pivotal
    ```
    This will take 1 to 3 minutes, depends on the performance of both 
    your computer and the server. The command includes both build and
    push code to the pivotal cloud.<br>
    Note: The separated scripts are
    ```sh
    # build 
    yarn run pivotal:build
    # push code to pivotal cloud
    yarn run pivotal:publish
    ```
    If the code build successfully but failed to publish, you can
    publish the code without build again by run `yarn run pivotal:publish`

### Update code to the Pivotal Cloud
 - Run script:
    ```sh
    yarn run build:pivotal
    ```
