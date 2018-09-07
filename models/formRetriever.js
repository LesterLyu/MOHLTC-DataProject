var query = require('./query');
var syncloop = require('./syncloop.js');
module.exports =
    {
        //function might be useless for this project but I literally spent 1 hour figuring this out so I will keep it in here for Now
        //returns two "array of arrays" one for categories and one for attributes.
        //each index of the outer array represents eithers all of the attributes or all of the categories for one form
        getForm: function (reqUser, callback) {
            var attributeItems = [];
            var categoryItems = [];
            query.newQuery("SELECT * FROM datatable WHERE GroupNumber =" + reqUser.GroupNumber + ";", function (err, data) {
                console.log('Info is: ')
                console.log(data);
                if (data.length == 0) {
                    console.log("You don't have any forms available to fill out!");
                }
                else {
                    syncloop.synchIt(data.length, function (loop) {
                        console.log(loop.iteration());
                        query.newQuery("SELECT * FROM attributes WHERE datatableid =" + data[loop.iteration()].Id + ";", function (err, data1) {
                            attributeItems.push(data1);
                            loop.next();
                        });
                    })
                    syncloop.synchIt(data.length, function (loop) {
                        query.newQuery("SELECT * FROM categories WHERE datatableid =" + data[loop.iteration()].Id + ";", function (err, data2) {
                            categoryItems.push(data2);
                            if (loop.iteration() == data.length - 1) {
                                callback(attributeItems, categoryItems);
                            }
                            loop.next();
                        });
                    })
                }
            });
        },
        //displays the form menu for the profile page
        getFormIndex: function (reqUser, callback) {
            query.newQuery("SELECT * FROM form WHERE GroupNumber =" + reqUser.GroupNumber + ";", function (err, data) {
                callback(data);
            });
        },
        displayForm: function (reqUser, reqQuery, callback) {
            var catArray = [];
            var attriArray = [];
            if (reqUser.GroupNumber == reqQuery.formGroupNumber) {
                query.newQuery("SELECT * FROM formcategory WHERE formID =" + reqQuery.formId + " ORDER BY ID ;", function (err, data) {
                    if (data.length > 0) {
                        syncloop.synchIt(data.length, function (loop) {
                            query.newQuery("SELECT * FROM categories WHERE ID=" + data[loop.iteration()].categoryID, function (err, data1) {
                                catArray.push(data1);
                                if (loop.iteration() == data.length - 1) {
                                    query.newQuery("SELECT * FROM formattribute WHERE formID =" + reqQuery.formId + " ORDER BY ID;", function (err, data2) {
                                        syncloop.synchIt1(data2.length, function (loop1) {
                                            query.newQuery("SELECT * FROM attributes WHERE ID =" + data2[loop1.iteration()].attributeID, function (err, data3) {

                                                attriArray.push(data3);

                                                if (loop1.iteration() == data2.length - 1) {
                                                    console.log("hi");
                                                    callback(catArray, attriArray)
                                                }
                                                loop1.next();
                                            })
                                        });
                                    })
                                }
                                loop.next();
                            })
                        });
                    }
                    else {
                        callback(catArray, attriArray);
                    }
                });
            }
            else {

                var catArray = [];
                var data1 = [];
                callback(data, data1);
            }
        },
        //returns a callback containing an array that has the titles of the forms that have been filled out
        getFilledForms: function (reqUser, callback) {
            var filledForms = [];
            query.newQuery("SELECT * FROM form WHERE GroupNumber =" + reqUser.GroupNumber + " ORDER BY Id ;", function (err, data) {
                if (data.length > 0) {
                    //syncloop allows for a synchronous for loop...yay!
                    syncloop.synchIt(data.length, function (loop) {
                        console.log(data);
                        query.newQuery("SELECT * FROM datavalues WHERE formID =" + data[loop.iteration()].Id + " AND userID = " + reqUser.ID, function (err, data1) {
                            if (data1.length > 0) {
                                console.log(data1);
                                filledForms.push(data[loop.iteration()])
                                if (loop.iteration() == data.length - 1) {
                                    callback(filledForms)
                                }
                                loop.next();
                            }
                            else {
                                if (loop.iteration() == data.length - 1) {
                                    callback(filledForms)
                                }
                                loop.next();
                            }
                        });
                    });
                }
                else {
                    callback(filledForms);
                }
            });
        },
        viewForm: function (reqUser, reqQuery, callback) {
            query.newQuery("SELECT ID FROM form WHERE Title ='" + reqQuery.Title + "'", function (err, data) {
                query.newQuery("SELECT d.ID AS dataID, d.Value, d.AttributeID , d.CategoryID, d.formID, a.Description AS attributeDesc, c.Description AS categoryDesc FROM datavalues d JOIN attributes a ON d.AttributeID = a.ID JOIN categories c ON d.CategoryID = c.ID WHERE d.formID = " + data[0].ID + " AND d.userID =" + reqUser.ID + " ORDER BY dataID", function (err, data1) {
                    callback(data1);
                });
            })
        },
        submitFormEdit: function (reqBody, reqUser, formData, reqQuery, callback) {
            console.log("@#@#@#");
            query.newQuery("SELECT d.ID AS dataID, d.Value, d.AttributeID , d.CategoryID, d.formID, a.Description AS attributeDesc, c.Description AS categoryDesc FROM datavalues d JOIN attributes a ON d.AttributeID = a.ID JOIN categories c ON d.CategoryID = c.ID WHERE d.formID = " + reqQuery.formID + " AND d.userID =" + reqUser.ID + " ORDER BY dataID", function (err, data1) {
                console.log(data1[0]);
                syncloop.synchIt(formData.length, function (loop) {
                    query.newQuery("UPDATE datavalues SET Value ='" + reqBody[loop.iteration()] + "' WHERE CategoryID =" + data1[loop.iteration()].CategoryID + " AND AttributeID =" + data1[loop.iteration()].AttributeID + " AND userID = " + reqUser.ID + " AND formID =" + reqQuery.formID, function (err, data) {

                        if (loop.iteration() == formData.length - 1) {
                            callback();
                        }
                        loop.next();
                    });
                });
            });
        }
    }
