const chai = require('chai');
const expect = chai.expect;

const config = require('../config');

const requester = config.requester;
const User = require('../../models/user');
const app = require('../../app');

describe('Update a user\'s status. Used to disable or enable an account.', function () {

    const oneUsername = 'lester';
    const oneEmail = 'lester@mail.com';
    const onePassword = 'lester';

    const secondUsername = 'lester02';
    const secondEmail = 'lester02@mail.com';

    before((done) => {

        User.remove({}, () => {
        });
        // Sign up a new user
        requester.post('/api/signup/local')
            .send({
                username: oneUsername,
                email: oneEmail,
                password: onePassword,
                permissions : [
                    "CRUD-workbook-template",
                    "system-management",
                    "workbook-query",
                    "create-delete-attribute-category",
                    "user-management"
                ],
            })
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
            })
            .catch(function (err) {
                throw err;
            });
        // Sing up the second user
        requester.post('/api/signup/local')
            .send({
                username: secondUsername,
                email: secondEmail,
                password: onePassword,
                active: true,
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

    it('Update a user\'s status: active - true ', (done) => {
        this.timeout(10000);
        const activeValue = true;
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
                const urlStr = '/api/users/' + secondUsername +'/active/';
                return agent.put(urlStr)
                    .send({active: activeValue})
                    .then(function (res) {
                        expect(res).to.have.status(200);
                        expect(res.body.success).to.be.true;
                        expect(res.body.message).to.deep.include(secondUsername.toString());
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });
    });

    it('Update a user\'s status: active - false ', (done) => {
        this.timeout(10000);
        const activeValue = false;
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
                const urlStr = '/api/users/' + secondUsername +'/active/';
                return agent.put(urlStr)
                    .send({active: activeValue})
                    .then(function (res) {
                        expect(res).to.have.status(200);
                        expect(res.body.success).to.be.true;
                        expect(res.body.message).to.deep.include(secondUsername.toString());
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });
    });

    it('Update a user\'s status: active - other ', (done) => {
        this.timeout(10000);
        const activeValue = 'other';
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
                const urlStr = '/api/users/' + secondUsername +'/active/';
                return agent.put(urlStr)
                    .send({active: activeValue})
                    .then(function (res) {
                        expect(res).to.have.status(500);
                        expect(res.body.success).to.be.false;
                        expect(res.body.message.errors).not.to.be.null;
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            });
    });
});
