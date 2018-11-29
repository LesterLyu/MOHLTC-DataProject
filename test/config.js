const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);


class config {
    constructor() {
        if (!config.requester) {
            const app = require('../app');
            config.requester = chai.request(app).keepOpen();
        }
    }



}

module.exports = config;
