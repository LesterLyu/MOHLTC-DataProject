const chai = require('chai');
const expect = chai.expect;

const {agent} = require('../config');

const User = require('../../models/user');
const Package = require('../../models/package/package');

describe('CRUD package', function () {

    before(done => {
        Package.remove({name: 'name did not exist'}, () => {
        });

        // Login
        agent
            .post('/api/login/local')
            .send({
                username: 'lester',
                password: 'lester'
            })
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('GET by user name and package name - success', done => {
        this.timeout(10000);
        const urlStr = '/lester/packages/already exists';
        agent
            .get(urlStr)
            .then(function (res) {
                console.table(res.body.packages);
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('GET by all based current user - success', done => {
        this.timeout(10000);
        const urlStr = '/packages';
        agent
            .get(urlStr)
            .then(function (res) {
                console.table(res.body.packages);
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('GET by lester - success', done => {
        this.timeout(10000);
        const urlStr = '/lester/packages';
        agent
            .get(urlStr)
            .then(function (res) {
                console.table(res.body.packages);
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('GET by user name - does not exist', done => {
        this.timeout(10000);
        const urlStr = '/xxx/packages';
        agent
            .get(urlStr)
            .then(function (res) {
                console.log(res.body.message);
                expect(res).to.have.status(400);
                expect(res.body.success).to.be.false;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('GET by package name - does not exist', done => {
        this.timeout(10000);
        const urlStr = '/packages/111';
        agent
            .get(urlStr)
            .then(function (res) {
                console.table(res.body);
                expect(res).to.have.status(400);
                expect(res.body.success).to.be.false;
                expect(res.body.message).include('not exist');
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    xit('Post - no end Date', done => {
        this.timeout(10000);
        const urlStr = '/packages';
        agent
            .post(urlStr)
            .then(function (res) {
                console.log(res.body);
                expect(res).to.have.status(400);
                expect(res.body.success).to.be.false;
                expect(res.body.message).include('endDate can not be empty.');
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });


    xit('Post - package already exists', done => {
        this.timeout(10000);
        const urlStr = '/packages';
        agent
            .post(urlStr)
            .send({
                name: 'already exists',
                userIds: ['5d4ae3e5bf54622ca035fd62', '5d4ae3e5bf54622ca035fd61'],
                workbookIds: ['5d499447d8586ddfbf06a031', '5d0cec736a9cb34624beaa5b'],
                startDate: Date.now(),
                endDate: Date.parse('2025/01/01'),
            })
            .then(function (res) {
                console.log(res.body);
                expect(res).to.have.status(400);
                expect(res.body.success).to.be.false;
                expect(res.body.message).include('already exists');
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Post - success', done => {
        // name did not exist
        this.timeout(10000);
        const urlStr = '/packages';
        agent
            .post(urlStr)
            .send({
                name: 'name did not exist',
                startDate: Date.now(),
                endDate: Date.parse('2025/01/01'),
                userIds: ['5d4ae3e5bf54622ca035fd62', '5d4ae3e5bf54622ca035fd61'],
                workbookIds: ['5d499447d8586ddfbf06a031', '5d499447d8586ddfbf06a032'],
            })
            .then(function (res) {
                console.table(res.body);
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });
});
