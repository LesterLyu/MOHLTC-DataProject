const chai = require('chai');
const expect = chai.expect;

const {agent} = require('../config');

const User = require('../../models/user');
const Package = require('../../models/package/package');
const Workbook = require('../../models/workbook/workbook');

describe.skip('CRUD package', function () {
    let oneUserName, oneUserId;
    let secondUserName = 'second', secondUserId;
    let workbookIds = [];
    let initialPackageName = 'create it in before';
    let secondPackageName = 'create it by post';

    // create a new package
    before(async () => {
        await Package.deleteMany();
        try {
            // singup second user
            await agent.post('/api/signup/local')
                .send({
                    username: secondUserName,
                    email: 'second@mail.com',
                    groupNumber: 1, // can also be string
                    firstName: 'firstname',
                    lastName: 'lastName',
                    phoneNumber: '1212122',
                    password: secondUserName,
                })
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.success).to.be.true;
                })
                .catch(function (err) {
                    throw err;
                });

            // Login
            await agent
                .post('/api/login/local')
                .send({
                    username: 'test',
                    password: 'test'
                })
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body.success).to.be.true;
                });

            // Retrieve user
            await agent.get('/api/users/current').then(res => {
                if (res.body.user) {
                    oneUserId = res.body.user._id;
                    oneUserName = res.body.user.username;
                }
            });
            const secondUser = await User.findOne({username: secondUserName});
            if (secondUser) {
                secondUserId = secondUser._id;
            }

            const result = await agent.post('/api/v2/test/admin/workbook').send(require('../workbooks/workbook.json'));
            const result02 = await agent.post('/api/v2/test/admin/workbook').send(require('../workbooks/workbook02.json'));
            const result03 = await agent.post('/api/v2/test/admin/workbook').send(require('../workbooks/workbook03.json'));
            // Retrieve workbook
            const workbooks = await Workbook.find();
            for (let i = 0; i < 3 && i < workbooks.length; i++) {
                if (workbooks[i]) {
                    workbookIds.push(workbooks[i]._id);
                }
            }

            await agent.post('/api/admin/packages')
                .send({
                    name: initialPackageName,
                    published: false,
                    startDate: Date.now(),
                    endDate: Date.parse('2021/01/01'),
                    userIds: [oneUserId, secondUserId],
                    workbookIds: [workbookIds[0], workbookIds[1]]
                });

            await agent.post('/api/admin/packages')
                .send({
                    name: workbookIds[0],
                    published: false,
                    startDate: Date.now(),
                    endDate: Date.parse('2030/03/01'),
                    userIds: [oneUserId],
                    workbookIds: [workbookIds[0]]
                });

            await agent.post('/api/admin/packages')
                .send({
                    name: workbookIds[1],
                    published: false,
                    startDate: Date.now(),
                    endDate: Date.parse('2030/03/02'),
                    userIds: [secondUserId],
                    workbookIds: [workbookIds[1]]
                });

            await agent.post('/api/admin/packages')
                .send({
                    name: workbookIds[2],
                    published: false,
                    startDate: Date.now(),
                    endDate: Date.parse('2030/03/03'),
                    userIds: [secondUserId],
                    workbookIds: [workbookIds[2]]
                });


        } catch (e) {
            throw e;
        }
    });

    it('GET by user name and package name - success', done => {
        this.timeout(10000);
        const urlStr = '/api/admin/' + secondUserName + '/packages/' + initialPackageName;
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
    it('GET by  package name - success', done => {
        this.timeout(10000);
        const urlStr = '/api/admin/packages/' + workbookIds[2];
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
    it('GET by  query attributeId and categroyId - success', done => {
        this.timeout(10000);
        const queryString = '?categoryId=' + 100679515 + '&attributeId=' + 100045567;
        const urlStr = '/api/admin/packages/' + initialPackageName + queryString;
        agent
            .get(urlStr)
            .then(function (res) {
                console.log(res.body);
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });
    it('GET by  query attributeId and categroyId - failed', done => {
        this.timeout(10000);
        const queryString = '?categoryId=' + 100679515666 + '&attributeId=' + 100045567666;
        const urlStr = '/api/admin/packages/' + initialPackageName + queryString;
        agent
            .get(urlStr)
            .then(function (res) {
                console.log(res.body);
                expect(res).to.have.status(400);
                expect(res.body.success).to.be.false;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });
    it('GET all by current user - success', done => {
        this.timeout(10000);
        const urlStr = '/api/packages';
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
    it('GET by user name - success', done => {
        this.timeout(10000);
        const urlStr = '/api/admin/' + secondUserName + '/packages';
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
        const urlStr = '/api/admin/xxx/packages';
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
    it('GET by package name - Not Found', done => {
        this.timeout(10000);
        const urlStr = '/api/packages/1x1x1';
        agent
            .get(urlStr)
            .then(function (res) {
                console.table(res.body);
                expect(res).to.have.status(400);
                expect(res.body.success).to.be.false;
                expect(res.body.message).include('Not Found');
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });
    it('GET by package name - admin - Not Found', done => {
        this.timeout(10000);
        const urlStr = '/api/admin/packages/1x1x1';
        agent
            .get(urlStr)
            .then(function (res) {
                console.table(res.body);
                expect(res).to.have.status(400);
                expect(res.body.success).to.be.false;
                expect(res.body.message).include('Not Found');
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });
    it('Post - no end Date - failed', done => {
        this.timeout(10000);
        const urlStr = '/api/admin/packages';
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
    it('Post - start date less than end date - failed', done => {
        this.timeout(10000);
        const urlStr = '/api/admin/packages';
        agent
            .post(urlStr)
            .send({
                // name: 'name did not exist',
                name: 'package03',
                startDate: Date.now(),
                endDate: Date.parse('1988/01/01'),
            })
            .then(function (res) {
                console.log(res.body);
                expect(res).to.have.status(400);
                expect(res.body.success).to.be.false;
                expect(res.body.message).include('startDate must be less than endDate');
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });
    it('Post - package already exists - failed', done => {
        this.timeout(10000);
        const urlStr = '/api/admin/packages';
        agent
            .post(urlStr)
            .send({
                name: initialPackageName,
                startDate: Date.now(),
                endDate: Date.parse('2025/01/01'),
            })
            .then(function (res) {
                console.log(res.body);
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });
    it('Post create second Package - success', done => {
        // name did not exist
        this.timeout(10000);
        const urlStr = '/api/admin/packages';
        agent
            .post(urlStr)
            .send({
                // name: 'name did not exist',
                name: secondPackageName,
                published: true,
                startDate: Date.now(),
                endDate: Date.parse('2025/01/01'),
                userIds: [oneUserId],
                workbookIds: [workbookIds[1], workbookIds[2]]
            })
            .then(function (res) {
                console.table(res.body);
                expect(res.body.success).to.be.true;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Put - update the workbookIds - success', async () => {
        // name did not exist
        this.timeout(10000);
        let queryString, urlStr;
        // before
        try {
            queryString = '?categoryId=' + 100679515 + '&attributeId=' + 100045567;
            urlStr = '/api/admin/packages/' + initialPackageName + queryString;
            await agent
                .get(urlStr)
                .then(function (res) {
                    console.log('before ----- 01 -- ' + res.body.value);
                    expect(res).to.have.status(200);
                })
                .catch(function (err) {
                    throw err;
                });

            queryString = '?categoryId=' + 100722492 + '&attributeId=' + 100049447;
            urlStr = '/api/admin/packages/' + initialPackageName + queryString;
            await agent
                .get(urlStr)
                .then(function (res) {
                    console.log('before ----- 02 -- ' + res.body.message);
                    expect(res).to.have.status(400);
                })
                .catch(function (err) {
                    throw err;
                });
        } catch (e) {
            console.log(e);
        }

        // PUT
        urlStr = '/api/admin/packages/' + initialPackageName;
        await agent
            .put(urlStr)
            .send({
                published: true,
                endDate: Date.parse('2020/02/02'),
                // userIds: [oneUserId, secondUserId],
                workbookIds: [workbookIds[1], workbookIds[2]]
            })
            .then(function (res) {
                console.table(res.body);
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
            })
            .catch(function (err) {
                throw err;
            });

        // after
        try {
            queryString = '?categoryId=' + 100679515 + '&attributeId=' + 100045567;
            urlStr = '/api/admin/packages/' + initialPackageName + queryString;
            await agent
                .get(urlStr)
                .then(function (res) {
                    console.log('after ----- 01 -- ' + res.body.message);
                    expect(res).to.have.status(400);
                })
                .catch(function (err) {
                    throw err;
                });

            queryString = '?categoryId=' + 100722492 + '&attributeId=' + 100049447;
            urlStr = '/api/admin/packages/' + initialPackageName + queryString;
            await agent
                .get(urlStr)
                .then(function (res) {
                    console.log('after ----- 03 -- ' + res.body.value);
                    expect(res).to.have.status(200);
                })
                .catch(function (err) {
                    throw err;
                });
        } catch (e) {
            console.log(e);
        }
    });
    it('Put  - error end date - failed', done => {
        // name did not exist
        this.timeout(10000);
        const urlStr = '/api/admin/packages/' + initialPackageName;
        agent
            .put(urlStr)
            .send({
                // start:Date.parse('1980/03/01'),
                endDate: Date.parse('1980/02/01'),
                workbookIds: [workbookIds[1]],
            })
            .then(function (res) {
                console.table(res.body);
                expect(res).to.have.status(400);
                expect(res.body.success).to.be.false;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Put  - no attributeId - failed', done => {
        // name did not exist
        this.timeout(10000);
        const urlStr = '/api/admin/packagevalues';
        agent
            .put(urlStr)
            .send({
                categoryId: 100679515,
                attributeId: 100045567,
            })
            .then(function (res) {
                console.table(res.body);
                expect(res).to.have.status(400);
                expect(res.body.success).to.be.false;
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });

    it('Put  - /api/admin/packagevalues - success', async () => {
        // name did not exist
        this.timeout(10000);
        const packageName = '5d4dd3409d0df184815fe739';
        const catId = 100679515;
        const attId = 100045567;
        const queryString = '?categoryId=' + catId + '&attributeId=' + attId;
        let urlStr = '/api/admin/packages/' + packageName + queryString;
        await agent
            .get(urlStr)
            .then(function (res) {
                console.log('-- before -- ' + res.body.value);
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
            })
            .catch(function (err) {
                throw err;
            });

        urlStr = '/api/admin/packagevalues';
        const newValue = 'new 100045568';
        await agent
            .put(urlStr)
            .send({
                packageName: packageName,
                categoryId: catId,
                attributeId: attId,
                value: newValue,
            })
            .then(function (res) {
                console.table(res.body);
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
            })
            .catch(function (err) {
                throw err;
            });

        urlStr = '/api/admin/packages/' + packageName + queryString;
        await agent
            .get(urlStr)
            .then(function (res) {
                console.log('-- after -- ' + res.body.value);
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.value).equals(newValue);
            })
            .catch(function (err) {
                throw err;
            });


    });
    xit('Delete package... - success', done => {
        // name did not exist
        this.timeout(10000);
        const urlStr = '/api/admin/packages/' + initialPackageName;
        agent
            .delete(urlStr)
            .then(function (res) {
                console.table(res.body);
                done();
            })
            .catch(function (err) {
                throw err;
            });
    });
});
