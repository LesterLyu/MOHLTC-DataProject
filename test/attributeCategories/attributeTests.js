const chai = require('chai');
const expect = chai.expect;

const {agent} = require('../config');
const Attribute = require('../../models/attribute');
const User = require('../../models/user');

describe('CRUD attribute', function () {
    const oneId = 300001;
    const oneAttribute = 'id-300001';
    const oneGroupNumber = 1;
    const oneDescription = 'description: id-300001';

    const secondId = 300003;
    const secondAttribute = 'id-300003';
    const secondDescription = 'description: id-300003';

    before(done => {
        User.remove({}, () => {
        });

        // Sign up a new user
        agent
            .post('/api/signup/local')
            .send({
                username: 'lester',
                email: 'lester@le.com',
                password: 'lester',
                active: true,
                groupNumber: oneGroupNumber,
                permissions: [
                    'CRUD-workbook-template',
                    'system-management',
                    'workbook-query',
                    'create-delete-attribute-category',
                    'user-management'
                ]
            })
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
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
                        // add one attribute
                        agent
                            .post('/api/add-att')
                            .send({
                                id: oneId,
                                attribute: oneAttribute,
                                groupNumber: oneGroupNumber,
                                description: oneDescription
                            })
                            .then(res => {
                                console.log(res.body.message);
                                expect(res).to.have.status(200);
                                expect(res.body.success).to.be.true;
                                console.log(res.body.message);
                                done();
                            })
                            .catch(function (err) {
                                throw err;
                            });
                    })
                    .catch(function (err) {
                        throw err;
                    });
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Get attributes - success', done => {
        this.timeout(10000);
        const urlStr = '/api/categories';
        agent
            .get(urlStr)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.attributes).not.to.be.null;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Get similar attributes - success', done => {
        this.timeout(10000);
        const queryPartialAttribute = 'Expenses';
        const urlStr = '/api/attributes/similar/' + queryPartialAttribute;
        agent
            .get(urlStr)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                res.body.attributes.forEach( i => {
                    console.log(i.attribute + ' from ' + i.description);
                });
                console.log('found ' + res.body.count + ' attributes');
                expect(res.body.attributes).not.to.be.null;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });


    it('Get one attribute - success', done => {
        this.timeout(10000);
        const urlStr = '/api/attributes/' + oneId;
        agent
            .get(urlStr)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.attributes).not.to.be.null;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });
    it('Get one attribute - id does not exist', done => {
        this.timeout(10000);
        const urlStr = '/api/attributes/' + '9999';
        agent
            .get(urlStr)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.message).include('does not exists');
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });
    it('Get one attribute - id is empty', done => {
        this.timeout(10000);
        const urlStr = '/api/attributes/' + '   ';
        agent
            .get(urlStr)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.attributes).not.to.be.null;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    xit('Add a attribute - success', done => {
        this.timeout(10000);
        const urlStr = '/api/add-att';
        agent
            .post(urlStr)
            .send({
                id: secondId,
                attribute: secondAttribute,
                groupNumber: oneGroupNumber,
                description: secondDescription
            })
            .then(function (res) {
                console.log(res.body.message);
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });
    xit('Add Many attributes - success', done => {
        this.timeout(10000);

        const attributes = [
            {
                id: secondId + 3000,
                attribute: secondAttribute,
                groupNumber: oneGroupNumber,
                description: secondDescription
            },
            {
                id: secondId + 3001,
                attribute: secondAttribute,
                groupNumber: oneGroupNumber,
                description: secondDescription
            }
        ];

        const urlStr = '/api/attributes';
        agent
            .post(urlStr)
            .send({
                attributes: attributes
            })
            .then(function (res) {
                console.log(res.body.message);
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Add a attribute - id exists', done => {
        this.timeout(10000);
        const urlStr = '/api/add-att';
        agent
            .post(urlStr)
            .send({
                id: oneId,
                attribute: oneAttribute,
                groupNumber: oneGroupNumber,
                description: oneDescription + ' repeat.'
            })
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
    it('Add a attribute - Attribute cannot be empty.', done => {
        this.timeout(10000);
        const urlStr = '/api/add-att';
        agent
            .post(urlStr)
            .send({
                id: oneId,
                attribute: '',
                groupNumber: oneGroupNumber,
                description: oneDescription
            })
            .then(function (res) {
                console.log(res.body.message);
                expect(res).to.have.status(400);
                expect(res.body.success).to.be.false;
                expect(res.body.message).include('Attribute cannot be empty');
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Edit a attribute - success', done => {
        this.timeout(10000);
        const urlStr = '/api/edit-att';
        agent
            .put(urlStr)
            .send({
                id: oneId,
                attribute: oneAttribute,
                groupNumber: oneGroupNumber,
                description: secondDescription + 'edited'
            })
            .then(function (res) {
                console.log(res.body.message);
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });
    it('Edit a attribute - Attribute cannot be empty.', done => {
        this.timeout(10000);
        const urlStr = '/api/edit-att';
        agent
            .put(urlStr)
            .send({
                id: oneId,
                attribute: '',
                groupNumber: oneGroupNumber,
                description: secondDescription + 'edited'
            })
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
    it('Edit a attribute - Attribute does not exist', done => {
        this.timeout(10000);
        const urlStr = '/api/edit-att';
        agent
            .put(urlStr)
            .send({
                id: oneId,
                attribute: 'Attribute does not exist',
                groupNumber: oneGroupNumber,
                description: secondDescription + 'edited'
            })
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

    it('Delete one attribute - success', done => {
        this.timeout(10000);
        const urlStr = '/api/att/' + oneId;
        agent
            .delete(urlStr)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.category).not.to.be.null;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Delete one attribute - id does not exist', done => {
        this.timeout(10000);
        const urlStr = '/api/att/' + '9988';
        agent
            .delete(urlStr)
            .then(function (res) {
                expect(res).to.have.status(400);
                expect(res.body.success).to.be.false;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    //FIXME: delete one attribute that used in workbook
});
