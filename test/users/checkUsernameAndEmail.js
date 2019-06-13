const chai = require('chai');
const expect = chai.expect;

const {agent} = require('../config');


describe('To check if the user is registered', function () {

    const oneUsername = 'lester';
    const oneEmail = 'lester@mail.com';

    before((done) => {
        agent.post('/api/signup/local')
            .send({
                username: oneUsername,
                email: oneEmail,
                password: 'lester'
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


    it('check the registered username', (done) => {
        this.timeout(10000);
        agent.get('/api/check/username/' + oneUsername)
            .then((res) => {
                expect(res.body.message).to.equal(oneUsername + ' already in use.');
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('check the unregistered username', (done) => {
        this.timeout(10000);
        agent.get('/api/check/username/' + oneUsername + 'abc')
            .then((res) => {
                expect(res.body).have.lengthOf(0);
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });


    it('check the registered email', (done) => {
        this.timeout(10000);
        agent.get('/api/check/email/' + oneEmail)
            .then((res) => {
                expect(res.body.message).to.equal(oneEmail + ' already in use.');
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('check the unregistered user email', (done) => {
        this.timeout(10000);
        agent.get('/api/check/email/' + oneEmail + '.abc.com')
            .then((res) => {
                expect(res.body).have.lengthOf(0);
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

});
