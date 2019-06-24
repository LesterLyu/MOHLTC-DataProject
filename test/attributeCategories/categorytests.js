const chai = require('chai');
const expect = chai.expect;

const {agent} = require('../config');
const Category = require('../../models/category');
const User = require('../../models/user');

describe('CRUD category', function () {
    const oneId = 600001;
    const oneCategory = 'id-600001';
    const oneGroupNumber = 1;
    const oneDescription = 'description: id-600001';

    const secondId = 600003;
    const secondCategory = 'id-600003';
    const secondDescription = 'description: id-600003';

    before(done => {
        User.remove({}, () => {
        });
        Category.remove({id: [oneId, secondId,  secondId + 3000,  secondId + 3001]}, (err)=>{
            if (!err) {
                console.log('removed success: ')
            }
            else {
                console.log(err)
            }
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
                        // add one category
                        agent
                            .post('/api/category')
                            .send({
                                id: oneId,
                                category: oneCategory,
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

    it('Get categories - success', done => {
        this.timeout(10000);
        const urlStr = '/api/categories';
        agent
            .get(urlStr)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.categories).not.to.be.null;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Get similar categories - success', done => {
        this.timeout(10000);
        const queryPartialCategory = 'id';
        const urlStr = '/api/categories/similar/' + queryPartialCategory;
        agent
            .get(urlStr)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                res.body.categories.forEach( i => {
                    console.log(i.category + ' from ' + i.description);
                });
                console.log('found ' + res.body.count + ' categories');
                expect(res.body.categories).not.to.be.null;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });


    it('Get one category - success', done => {
        this.timeout(10000);
        const urlStr = '/api/categories/' + oneId;
        agent
            .get(urlStr)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.categories).not.to.be.null;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });
    it('Get one category - id does not exist', done => {
        this.timeout(10000);
        const urlStr = '/api/categories/' + '9999';
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
    it('Get one category - id is empty', done => {
        this.timeout(10000);
        const urlStr = '/api/categories/' + '   ';
        agent
            .get(urlStr)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.categories).not.to.be.null;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Add a category - success', done => {
        this.timeout(10000);
        const urlStr = '/api/category';
        agent
            .post(urlStr)
            .send({
                id: secondId,
                category: secondCategory,
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
    it('Add Many categories - success', done => {
        this.timeout(10000);

        const categories = [
            {
                id: secondId + 3000,
                category: secondCategory,
                groupNumber: oneGroupNumber,
                description: secondDescription
            },
            {
                id: secondId + 3001,
                category: secondCategory,
                groupNumber: oneGroupNumber,
                description: secondDescription
            }
        ];

        const urlStr = '/api/categories';
        agent
            .post(urlStr)
            .send({
                categories: categories
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

    it('Add a category - id exists', done => {
        this.timeout(10000);
        const urlStr = '/api/category';
        agent
            .post(urlStr)
            .send({
                id: oneId,
                category: oneCategory,
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
    it('Add a category - Category cannot be empty.', done => {
        this.timeout(10000);
        const urlStr = '/api/category';
        agent
            .post(urlStr)
            .send({
                id: oneId,
                category: '',
                groupNumber: oneGroupNumber,
                description: oneDescription
            })
            .then(function (res) {
                console.log(res.body.message);
                expect(res).to.have.status(400);
                expect(res.body.success).to.be.false;
                expect(res.body.message).include('Category cannot be empty');
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Edit a category - success', done => {
        this.timeout(10000);
        const urlStr = '/api/category';
        agent
            .put(urlStr)
            .send({
                id: oneId,
                category: oneCategory,
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
    it('Edit a category - Category cannot be empty.', done => {
        this.timeout(10000);
        const urlStr = '/api/category';
        agent
            .put(urlStr)
            .send({
                id: oneId,
                category: '',
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
    it('Edit a category - Category does not exist', done => {
        this.timeout(10000);
        const urlStr = '/api/category';
        agent
            .put(urlStr)
            .send({
                id: oneId,
                category: 'Category does not exist',
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

    it('Delete one category - success', done => {
        this.timeout(10000);
        const urlStr = '/api/category/' + oneId;
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

    it('Delete one category - id does not exist', done => {
        this.timeout(10000);
        const urlStr = '/api/category/' + '9988';
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

    //FIXME: delete one category that used in workbook
});
