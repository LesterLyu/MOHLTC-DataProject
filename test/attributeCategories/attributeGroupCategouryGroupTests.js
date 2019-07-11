const chai = require('chai');
const expect = chai.expect;

const {agent} = require('../config');

describe('CRUD group', function () {

    // before(done => {
    //     AttributeGroup.deleteMany({}, () => {
    //     });
    //     CategoryGroup.deleteMany({}, () => {
    //     });
    //     done();
    // });

    it('get CategoryGroups - return many', done => {

        this.timeout(10000);
        const urlStr = '/debug/CategoryGroups/';
        agent
            .get(urlStr)
            .then(function (res) {
                console.table(res.body.documents);
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.documents).not.to.be.null;
                done();
            })
            .catch(function (err) {
                throw err;
            });

    });

    it('get a CategoryGroups by name - return one', done => {

        this.timeout(10000);
        const categoryGroupName = '0101';
        const urlStr = '/debug/CategoryGroups/' + '?categoryGroupName=' + categoryGroupName;
        agent
            .get(urlStr)
            .then(function (res) {
                console.table(res.body.documents);
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.documents).not.to.be.null;
                done();
            })
            .catch(function (err) {
                throw err;
            });

    });

    it('create a  new CategoryGroups by name - return _id', done => {

        this.timeout(10000);
        const categoryGroupName = '0101';
        const urlStr = '/debug/CategoryGroups/';
        agent
            .post(urlStr)
            .send({
                categoryGroupName
            })
            .then(function (res) {
                console.table(res.body.documents);
                // expect(res).to.have.status(200);
                // expect(res.body.success).to.be.true;
                done();
            })
            .catch(function (err) {
                expect(err).not.be.null;
                throw err;
            });

    });

    it('update a  new CategoryGroups by parent name - return _id', done => {

        this.timeout(10000);
        const urlStr = '/debug/CategoryGroups/' + '5d264f4d66dd4a288097d051';
        agent
            .put(urlStr)
            .send({
                parentName : '0101'
            })
            .then(function (res) {
                // expect(res).to.have.status(200);
                // expect(res.body.success).to.be.true;

                console.log(res.body.document);
                done();
            })
            .catch(function (err) {
                expect(err).not.be.null;
                throw err;
            });

    });
});
