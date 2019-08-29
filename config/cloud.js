// config for pivotal
const pivotal = {
    appName: 'mohltc', // your pivotal app name
    serverUrl: 'https://mohltc.cfapps.io', // the route for this app
    frontendUrl: 'https://mohltc.cfapps.io/react',
};

// config for amazon cloud
const aws = {
    serverUrl: 'http://ec2-3-13-195-83.us-east-2.compute.amazonaws.com',
    frontendUrl: 'http://ec2-3-13-195-83.us-east-2.compute.amazonaws.com/react',
};

module.exports = {aws, pivotal};
