const chai = require('chai');
const expect = chai.expect;

const config = require('../config');

const requester = config.requester;

const User = require('../../models/user');

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

        requester.post('/api/login/local')
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
