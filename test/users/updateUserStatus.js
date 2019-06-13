const chai = require('chai');
const expect = chai.expect;

const {agent} = require('../config');

const User = require('../../models/user');

describe('Update a user\'s status. Used to disable or enable an account.', function () {

    const oneUsername = 'lester';
    const oneEmail = 'lester@mail.com';
    const onePassword = 'lester';
    const oneActiveValue = true;

    const secondUsername = 'lester02';
    const secondEmail = 'lester02@mail.com';


    before((done) => {

        User.remove({}, () => {
        });
        // Sign up a new user
        agent
            .post('/api/signup/local')
            .send({
                username: oneUsername,
                email: oneEmail,
                password: onePassword,
                active: oneActiveValue,
                permissions: [
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
                // Login
                agent
                    .post('/api/login/local')
                    .send({
                        username: oneUsername,
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

            })
            .catch(function (err) {
                throw err;
            });
        // Sing up the second user
        agent
            .post('/api/signup/local')
            .send({
                username: secondUsername,
                email: secondEmail,
                password: onePassword,
                active: true,
            })
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
            })
            .catch(function (err) {
                throw err;
            });


    });

    it('Check a user\'s status: active - true ', (done) => {
        this.timeout(10000);
        const urlStr = '/api/users/' + secondUsername + '/check-active/';
        agent.get(urlStr)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.message).to.deep.include(oneActiveValue.toString());
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Update a user\'s status: active - true ', (done) => {
        this.timeout(10000);
        const activeValue = true;
        const urlStr = '/api/users/' + secondUsername + '/active/';
        agent.put(urlStr)
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

    it('Update a user\'s status: active - true ', (done) => {
        this.timeout(10000);
        const activeValue = true;
        const urlStr = '/api/users/' + secondUsername + '/active/';
        agent.put(urlStr)
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

    it('Update a user\'s status: active - false ', (done) => {
        this.timeout(10000);
        const activeValue = false;

        const urlStr = '/api/users/' + secondUsername + '/active/';
        agent.put(urlStr)
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

    it('Update a user\'s status: error - no user ', (done) => {
        this.timeout(10000);
        const activeValue = false;

        const urlStr = '/api/users/' + 'no user' + '/active/';
        agent.put(urlStr)
            .send({active: activeValue})
            .then(function (res) {
                expect(res).to.have.status(400);
                expect(res.body.success).to.be.false;
                expect(res.body.message.errors).not.to.be.null;
                done();
            })
            .catch(function (err) {
                throw err;
            });

    });

    it('Update a user\'s status: 400 Bad Request ', (done) => {
        this.timeout(10000);
        const activeValue = '400 Bad Request';
        // Login firstly

        const urlStr = '/api/users/' + secondUsername + '/active/';
        agent.put(urlStr)
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
