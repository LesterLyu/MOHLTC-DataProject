const chai = require('chai');
const expect = chai.expect;

AttributeGroup = require('../../models/attributeGroup');
CategoryGroup = require('../../models/categoryGroup');
const {agent} = require('../config');

describe.skip('CRUD group', function () {

    before(done => {
        AttributeGroup.deleteMany({}, () => {
        });
        CategoryGroup.deleteMany({}, () => {
        });
        done();
    });

    it('Add a attributeGroups - success', done => {
        this.timeout(10000);
        const urlStr = '/api/attributeGroups';
        agent
            .get(urlStr)
            .send({
                id: 1
            })
            .then(function (res) {
                console.log(res.body.message);
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                done();
            })
            .catch(function (err) {
                console.log(err);
                expect(false).to.be.true;
            });
    });
});
