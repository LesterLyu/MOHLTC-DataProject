# How to setup on local machine

## Step 1
Install software.
 - [MongoDB](https://fastdl.mongodb.org/win32/mongodb-win32-x86_64-2008plus-ssl-4.0.3-signed.msi) or latest community version from [here](https://www.mongodb.com/download-center/community)
 - [MongoDB Compass](https://downloads.mongodb.com/compass/mongodb-compass-community-1.15.4-win32-x64.exe) or latest community version from [here](https://www.mongodb.com/download-center/compass)
 - Your favorite IDE for Javascript, I prefer [Webstorm](https://www.jetbrains.com/webstorm/).
 - Node.js [latest version](https://nodejs.org/en/), this includes npm.
 - [Git for windows](https://git-scm.com/)

## Step 2 (Skip this if you are not using government internet)
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

## Step 3
Clone github repos and install dependencies
 - In your favorite location e.g. Desktop, enter
    ```
    git clone https://github.com/LesterLyu/MOHLTC-DataProject.git
    cd ./MOHLTC-DataProject
    npm install
    ```
 - Build it then run!
    ```
    npm start
    ```
    This command will build front-end ```.js``` files and start the server
    in ```http://localhost:3000```

## Step 4
Registration.
  1. sign up an account, **DO NOT FORGET TO INPUT AN GROUP NUMBER!**
  1. open MongoDB Compass and navigate to ```dataproject.users```
  1. Add document:
      ```
        {
           "_id":"5bc5fb9d72107429b4975ad4",
           "active":true,
           "permissions":[
              "CRUD-workbook-template",
              "create-delete-attribute-category",
              "system-management",
              "user-management"
           ],
           "username":"lester",
           "firstName":"lester",
           "lastName":"lester",
           "groupNumber":1,
           "phoneNumber":"21212341233",
           "validated":true,
           "type":2,
           "email":"lester.lyu@ontatio.ca",
           "createDate":"2018-10-16T14:54:21.045Z",
           "salt":"6fd0804b536f2eb1f1a389e2fe05095ec88eed862d56e1143cbb34d8ff19488b",
           "hash":"8168ea2d19bd1d7befc994fb32c4591bcc73dc6f3a77f580a882072a6f7ee280b9c39511247336f3da300b325e101ecbb4a43256f9810286a23aa9186d1b47e666f1afec3ec2f84083f502e5a01ca0aa8209378f09df1d19b1010ba89c3343d31e909b8891ddefc8e8d5977fe04c835797af04c19fa778f3d327af78ab5b1b8801a073928a9c503e21c44f4f14615726f2929c7a362a74c5ccaa08048d74bbac9979260996145a2f35d3b57538642ae4a7bcd12eac25190d87716bf5f64a90b6574e476ab5f5dbc2d8109f34ad75e4bf2ee418595675e6320f0eab70010f99cdf5d958636506abea2042ab50fd2f1a282193c2c515dbbad315d40d22a32ec0ae0bbfd4e5a248717a8be79ccaa1a48cb820ca04344a15f7c01c9df489bcce3b074bc49a4ef125c26883a839e435fc05288a76e1220c787c1dab833419159786a1f5a332c951177f0efac7c7c3f11feb2f30073d390257aeae6c8ae5d6c9f7f14d4f9e68b530d6f2e71b6e041be37aa57c6316fdce6ef554361dc5ca842e0d05466ff17d527fc177a939bf4e5c765be915ec424a96f99212c484bc3480548b11ba12f40fb29bfc7d166a0392769480c754737163a382659344ffcc66aeb2aae3bc0efc9626bbc92c0ddc3df83854d7fc92bc0141d2460b28679df683598f31deda01aed5a1fd6060ef9d8cf0401a011a1728a3942417104e23c77dd560308b7f7c",
           "__v":0
        }
      ```
