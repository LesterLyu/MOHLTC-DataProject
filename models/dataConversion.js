var query = require('./query');
var async = require('async');
var syncloop = require('./syncloop.js');
var attributeId = [];
var categoryId = [];

module.exports =
{
  attributeId, categoryId,
  // allows admin to create new forms
  makeCategory: function(reqBody, reqUser,res, req)
  {
    query.newQuery("SELECT * FROM categories WHERE Description = '" + reqBody.newCategory + "'", function (err,data)
    {
      if(data.length > 0)
      {
        req.flash('duplicate category', 'duplicate category!');
        res.render("createRows.ejs",
        {
            attriMessage: "",
            catMessage: req.flash('duplicate category'),
            successMessage: ""
        });
      }
      else
      {
        query.newQuery("INSERT INTO categories (Description) VALUES ('" + reqBody.newCategory + "')", function(err, data)
        {
          res.render("createRows.ejs",
          {
              attriMessage: "",
              catMessage: "",
              successMessage: "Successfully added category!"
          });
        });
      }
    });
  },
  makeAttribute: function(reqBody, reqUser,res, req)
  {
    query.newQuery("SELECT * FROM attributes WHERE Description = '" + reqBody.newAttribute + "'", function (err,data)
    {
      if(data.length > 0)
      {
        req.flash('duplicate attribute', 'duplicate attribute!');
        res.render("createRows.ejs",
        {
            attriMessage: req.flash('duplicate attribute'),
            catMessage: "",
            successMessage: ""
        });
      }
      else
      {
        query.newQuery("INSERT INTO attributes (Description) VALUES ('" + reqBody.newAttribute + "')", function(err, data)
        {
          res.render("createRows.ejs",
          {
              attriMessage: "",
              catMessage: "",
              successMessage: "Successfully added attribute!"
          });
        });
      }
    });
  },
  makeForm: function(reqBody, reqUser, categoryArray, attributeArray, callback)
  {
    //work on this dynamic naming is fnished...just need to update the queries
    var categoryNum = 1;
    var attributeNum = 1;
    var currentAttribute = "attribute" + String(attributeNum);
    var currentCategory = "category" + String(categoryNum);
      query.newQuery("INSERT INTO form (Title, GroupNumber) VALUES('" + reqBody.groupTitle + "', " + reqBody.groupNumber + ")", function(err, data)
      {
        async.whilst(
        function() {return (reqBody[currentAttribute] != null) },
        function(cb)
        {
          query.newQuery("SELECT ID FROM attributes WHERE Description = '" + reqBody[currentAttribute] + "';", function(err, data1)
          {
            console.log("REEEEEEEEEEEE");
            console.log(reqBody[currentAttribute]);
            query.newQuery("INSERT INTO formattribute (attributeID, formID) VALUES ('" + data1[0].ID + "'," + data.insertId + ");", function(err, data2)
            {
            attributeNum ++;
            currentAttribute = "attribute" + String(attributeNum);
            cb(null, reqBody[currentAttribute]);
            });

           });
        },
      function(err)
      {
        async.whilst(
          function() {return (reqBody[currentCategory] != null) },
          function(cb)
          {
            query.newQuery("SELECT ID FROM categories WHERE Description = '" + reqBody[currentCategory] + "';", function(err, data3)
            {
              query.newQuery("INSERT INTO formcategory (categoryID, formID) VALUES ('" + data3[0].ID + "'," + data.insertId + ");", function(err, data4)
              {
                categoryNum ++;
                currentCategory = "category" + String(categoryNum);
                cb(null, reqBody[currentCategory]);
                if(reqBody[currentCategory] == null)
                {
                  callback();
                }
              });
            });
          }
        );
      });
      })
  },
  //processes data in the form that user fills out and sends info to database
  //takes in 2 array parameters
  //used in the app.post(/fillForm) page in program.js
  processData: function(reqBody, reqUser, reqQuery, categoryArray, attributeArray, callback)
  {

    syncloop.synchIt(attributeArray.length, function(loop)
    {
      syncloop.synchIt1(categoryArray.length, function(loop1)
      {
        var index = String(loop.iteration()+1) + String(loop1.iteration()+1);
        console.log(index);
        query.newQuery("SELECT * FROM datavalues WHERE CategoryID = " + categoryArray[loop1.iteration()][0].ID + " AND AttributeID = " + attributeArray[loop.iteration()][0].ID + " AND userID =" + reqUser.ID + " AND formID = " + reqQuery.formId, function(err, array)
        {
          if(array.length >0)
          {
            //update datavaues because user already submitted the form
            query.newQuery("UPDATE datavalues SET Value ='" + reqBody[index] + "' WHERE CategoryID =" + categoryArray[loop1.iteration()][0].ID + " AND AttributeID =" + attributeArray[loop.iteration()][0].ID + " AND userID = " + reqUser.ID + " AND formID = " + reqQuery.formId, function(err, data)
            {
              loop1.next();
              if(index == String(attributeArray.length) + String(categoryArray.length))
              {
                console.log(loop.iteration()+1);
                console.log(loop1.iteration()+1);
                callback();
              }
            })
          }
          //this else statement will be accessed if this is the first time the user submits the form
          else
          {
            query.newQuery("INSERT INTO datavalues (Value, CategoryID, AttributeID, userID, formID) VALUES('" + reqBody[index] + "'," + categoryArray[loop1.iteration()][0].ID + "," + attributeArray[loop.iteration()][0].ID + "," + reqUser.ID + "," + reqQuery.formId + ");",
            function(err,data)
            {
                loop1.next();
                if(index == String(attributeArray.length) + String(categoryArray.length))
                {
                  console.log(loop.iteration()+1);
                  console.log(loop1.iteration()+1);
                  callback();
                }
            });
          }
        });
      },function()
        {
            loop.next();

        })

    });
  }
}
