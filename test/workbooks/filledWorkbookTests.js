const chai = require('chai');
const expect = chai.expect;

const {agent} = require('../config');
const Attribute = require('../../models/attribute');
const User = require('../../models/user');

describe.skip('CRUD filled workbook', function () {
    const oneId = 300001;
    const oneAttribute = 'id-300001';
    const oneGroupNumber = 1;
    const oneDescription = 'description: id-300001';

    const secondId = 300003;
    const secondAttribute = 'id-300003';
    const secondDescription = 'description: id-300003';

    const oneFileName = 'HOSPQ_2018_Q3_HOSP_981_Chatham-KentHealthAlliance_LHIN1.xlsx';

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
                        done();
                    })
                    .catch(function (err) {
                        throw err;
                    });
            })
            .catch(function (err) {
                throw err;
            });


    });


    it('Get all filled workbook : success)', done => {
        this.timeout(10000);
        const urlStr = '/api/filled-workbooks' ;
        agent
            .get(urlStr)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.filledWorkbooks).not.to.be.null;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Get filled workbooks by filename - does not exists', done => {
        this.timeout(10000);
        const fileName = 'V1.xlsx';
        const urlStr = '/api/query/workbook?workbookName=' + fileName;
        agent
            .get(urlStr)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.filledWorkbooks == null).to.be.true;
                expect(res.body.message).include('does not exist');
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Get filled workbooks  - filename is empty', done => {
        this.timeout(10000);
        const fileName = '                            ';
        const urlStr = '/api/query/workbook?workbookName=' + fileName;
        agent
            .get(urlStr)
            .then(function (res) {
                expect(res).to.have.status(400);
                console.log(res.body);
                expect(res.body.success).to.be.true;
                expect(res.body.filledWorkbooks == null).to.be.true;
                expect(res.body.message).include('can not be empty');
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Get filled workbooks by filename - success', done => {
        this.timeout(10000);
        const urlStr = '/api/query/workbook?workbookName=' + oneFileName;
        agent
            .get(urlStr)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.filledWorkbooks.length >= 1).to.be.true;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Get special filled workbooks by filename and attribute id - success', done => {
        this.timeout(10000);
        const fileName = oneFileName;
        const conditionStr = '&attId=100049523&catId=100722810';
        const urlStr = '/api/query/workbook?workbookName=' + fileName + conditionStr;
        agent
            .get(urlStr)
            .then(function (res) {
                expect(res).to.have.status(200);
                console.log(res.body);
                expect(res.body.success).to.be.true;
                expect(res.body.filledWorkbooks.length >= 1).to.be.true;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Get special filled workbooks by attribute and category - success', done => {
        this.timeout(10000);
        const categoryStr = 'LHIN Global Allocation';
        const attributeStr = '2018-19 Annual Budget';
        const urlStr = '/api/query/workbooks?category=' + categoryStr +'&attribute=' + attributeStr;
        agent
            .get(urlStr)
            .then(function (res) {
                expect(res).to.have.status(200);
                console.log(res.body);
                expect(res.body.success).to.be.true;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Get special filled workbooks only by attribute string - success', done => {
        this.timeout(2000);
        console.log()
        const categoryStr = '';
        const attributeStr = '2018-19 Annual Budget';
        const urlStr = '/api/query/workbooks?category=' + categoryStr +'&attribute=' + attributeStr;
        console.log("search attribute:  " + attributeStr);
        agent
            .get(urlStr)
            .then(function (res) {
                expect(res).to.have.status(200);
                console.log(res.body);
                expect(res.body.success).to.be.true;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });






    //FIXME: delete one attribute that used in workbook
});

/*
use dataproject;
db.getCollection('attributes').remove({});
db.getCollection('categories').remove({})
db.getCollection('categories').find({}).forEach(function(d){ db.getSiblingDB('testdataproject')['categories'].insert(d); });
db.getCollection('attributes').find({}).forEach(function(d){ db.getSiblingDB('testdataproject')['attributes'].insert(d); });
db.getCollection('workbooks').find({}).forEach(function(d){ db.getSiblingDB('testdataproject')['workbooks'].insert(d); });
db.getCollection('fillerworkbooks').find({}).forEach(function(d){ db.getSiblingDB('testdataproject')['fillerworkbooks'].insert(d); });

 db.getCollection('attributes').find({"description" :  {$regex : ".*HOSPQ_2018_Q3_HOSP_981_Chatham-KentHealt.*"}})
* */
