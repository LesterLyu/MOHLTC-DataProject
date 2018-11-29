process.env.NODE_ENV = 'test';

const User = require('../models/user');

const app = require('../app');

const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;
chai.use(chaiHttp);

const requester = chai.request(app).keepOpen();

describe('Authentication', function () {
    after(() => {
        requester.close();
    });

    describe('Local Authentication', function () {
        before((done) => {
            // remove all users
            User.remove({}, () => {
                done();
            })
        });
        it('register an account to local server', (done) => {
            requester.post('/api/signup/local')
                .send({
                    username: 'test',
                    email: 'email@mail.com',
                    groupNumber: 1, // can also be string
                    firstName: 'firstname',
                    lastName: 'lastName',
                    phoneNumber: '1212122',
                    password: 'test'
                })
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.success).to.be.true;
                    done();
                })
                .catch(function (err) {
                    throw err;
                });
        });

        it('Log in to the registered account', (done) => {
            requester.post('/api/login')
                .send({
                    username: 'test',
                    password: 'test'
                })
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.success).to.be.true;
                    done();
                })
                .catch(function (err) {
                    throw err;
                });
        });

    });

});

