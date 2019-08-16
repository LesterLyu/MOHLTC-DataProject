const chai = require('chai');
const expect = chai.expect;

const {agent} = require('../config');

const User = require('../../models/user');

describe("Update a user's status. Used to disable or enable an account.", function () {
    const oneUsername = 'test';
    const oneEmail = 'lester@mail.com';
    const onePassword = 'test';
    const oneActiveValue = true;

    const secondUsername = 'lester02';
    const secondEmail = 'lester02@mail.com';

    before(async () => {
        await User.remove({name: secondUsername}, () => {
        });
        await agent
            .post('/api/login/local')
            .send({
                username: oneUsername,
                password: onePassword
            })
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
            })
            .catch(function (err) {
                throw err;
            });
        // Sing up the second user
        await agent
            .post('/api/signup/local')
            .send({
                username: secondUsername,
                email: secondEmail,
                password: onePassword,
                active: false,
                validated: false,
                permissions: [
                    'CRUD-workbook-template',
                    'system-management',
                    'workbook-query',
                    'create-delete-attribute-category',
                    'user-management',
                    'package-management'],
            })
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
            })
            .catch(function (err) {
                throw err;
            });
    });

    it("Check a user's status: active - true ", done => {
        this.timeout(10000);
        const urlStr = '/api/users/' + secondUsername + '/active/';
        agent
            .get(urlStr)
            .then(function (res) {
                console.log(res);
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.message).to.deep.include(
                    oneActiveValue.toString()
                );
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Put - set validated as true', async () => {
        this.timeout(10000);
        const res = await agent.put('/api/users/validated/' + secondUsername);
        expect(res).to.have.status(200);
        expect(res.body.success).to.be.true;
        console.log(res.body);
    });

    it("Update a user's status: active - true ", done => {
        this.timeout(10000);
        const activeValue = true;
        const urlStr = '/api/users/' + secondUsername + '/active/';
        agent
            .put(urlStr)
            .send({active: activeValue})
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.message).to.deep.include(
                    activeValue.toString()
                );
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it("Update a user's status: active - false ", done => {
        this.timeout(10000);
        const activeValue = false;
        const urlStr = '/api/users/' + secondUsername + '/active/';
        agent
            .put(urlStr)
            .send({active: activeValue})
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.message).to.deep.include(
                    activeValue.toString()
                );
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it("Update a user's status: active - false ", done => {
        this.timeout(10000);
        const activeValue = false;

        const urlStr = '/api/users/' + secondUsername + '/active/';
        agent
            .put(urlStr)
            .send({active: activeValue})
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.message).to.deep.include(
                    secondUsername.toString()
                );
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it("Update a user's status: error - no user ", done => {
        this.timeout(10000);
        const activeValue = false;

        const urlStr = '/api/users/' + 'no user' + '/active/';
        agent
            .put(urlStr)
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

    it("Update a user's status: 400 Bad Request ", done => {
        this.timeout(10000);
        const activeValue = '400 Bad Request';
        // Login firstly

        const urlStr = '/api/users/' + secondUsername + '/active/';
        agent
            .put(urlStr)
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
})
;
