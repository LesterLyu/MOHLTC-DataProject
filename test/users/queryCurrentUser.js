const chai = require('chai');
const expect = chai.expect;

const config = require('../config');

const requester = config.requester;
const User = require('../../models/user');
const app = require('../../app');

describe('To check if the user is registered', function () {

    const oneUsername = 'lester';
    const oneEmail = 'lester@mail.com';
    const onePassword = 'lester';

    before((done) => {

        User.remove({}, () => {
        });
        // Sign up a new user
        requester.post('/api/signup/local')
            .send({
                username: oneUsername,
                email: oneEmail,
                password: onePassword
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


    it('when not logged in', (done) => {
        this.timeout(10000);
        requester.get('/api/users/current/')
            .then((res) => {
                expect(res.body.success).to.be.true;
                expect(res.body.user).to.equal(null);
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('when a user logged in', (done) => {
        this.timeout(10000);
        // Login firstly
        const agent = chai.request.agent(app);
        agent
            .post('/api/login/local')
            .send({
                username: oneUsername,
                password: onePassword
            })
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                return agent.get('/api/users/current/')
                    .then(function (res) {
                        expect(res).to.have.status(200);
                        expect(res.body.success).to.be.true;
                        expect(res.body.user).to.deep.include({username: oneUsername});
                        console.log(res.body.user);
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });
    });
});
