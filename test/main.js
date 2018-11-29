process.env.NODE_ENV = 'test';
const config = require('./config');
// init config, i.e. start the server if not started
new config();

