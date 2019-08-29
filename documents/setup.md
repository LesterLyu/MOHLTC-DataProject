# How to setup on local machine for development

## Step 1 Install Environment
Install software.
 - [MongoDB](https://fastdl.mongodb.org/win32/mongodb-win32-x86_64-2008plus-ssl-4.0.3-signed.msi) or latest community version from [here](https://www.mongodb.com/download-center/community)
     - Choose 'Custom', uncheck 'Install Mongo DB Campass'
 - [MongoDB Compass](https://downloads.mongodb.com/compass/mongodb-compass-community-1.15.4-win32-x64.exe) or latest community version from [here](https://www.mongodb.com/download-center/compass) - Official GUI for MongoDB (this step can be skipped if developer prefers Robo 3T)
 - [Robo 3T](https://robomongo.org/) - Lightweight GUI for MongoDB (Better)
 - Your favorite IDE for Javascript, I prefer [Webstorm](https://www.jetbrains.com/webstorm/).
 - Node.js [latest version](https://nodejs.org/en/), this includes npm.
 - [Git for windows](https://git-scm.com/)

## Step 2 Setup Network (Skip this if you are not using government internet)
Set up proxy in MOHLTC network. Our internet has huge restrictions and not stable, but guest wifi works perfectly fine.
 - Setup npm proxy:
    ```
    npm config set proxy http://204.40.130.129:3128
    npm config set https-proxy http://204.40.130.129:3128
    ```
 - Setup git proxy:
    ```
    git config --global http.proxy http://204.40.130.129:3128
    ```
 - Setup Webstorm proxy (if uses Webstorm, also applicable for other application blocked by the firewall):
    ```server: http://204.40.130.129, port: 3128```

Note: Even though you have the proxy set up correctly, the internet may be still inaccessible.

## Step 3 Install Dependencies & Run Development build
Clone github repos and install dependencies
 - Setup [`yarn`](https://yarnpkg.com/en/), we are using `yarn` instead of `npm`, since it's faster and more friendly to government ethernet.
   ```bash
   npm install -g yarn
   ```
 - In your favorite location e.g. Desktop, downloaad this repository
   ```bash
   git clone https://github.com/LesterLyu/MOHLTC-DataProject.git
   ```
   Directory `./MOHLTC-DataProject/` is for backend project; Directory `./MOHLTC-DataProject/fronend` is for frontend project.
   - Install backend dependencies:
     ```bash
     # Go to the backend folder
     cd ./MOHLTC-DataProject
     # Install dependencies
     yarn install (ignore all the errors as long as the command returns 'Done in xx s')
     # Run
     yarn start
     ```
   - Install frontend dependencies:
     ```bash
     # Go to the frontend folder
     cd ./MOHLTC-DataProject/frontend
     # Install dependencies
     yarn install
     # Run, this takes at least 1 minute. It will open your default browser and navigate to http://localhost:3003
     yarn start
     ```

## Step 4 Registration
Go to [`http://localhost:3000`](http://localhost:3000), You will be redirect to a setup page. Note that this page only shows up when there are no user registered in this system.  (this url does not work in IE)
  
