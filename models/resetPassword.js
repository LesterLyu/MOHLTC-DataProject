var query = require('../models/query'); //needed exports
var loginquery = require('../models/loginquery.js'); //needed exports
module.exports =
{
  resetThePassword: function(req, res)
{
  var userInfo = req.body;
  console.log(userInfo.password1);
  console.log(userInfo.password2);
  console.log(req.query.token);
  if(userInfo.password1 == userInfo.password2)
  {

    query.newQuery("SELECT * FROM token WHERE token.TokenContent = '" + req.query.token + "';", function(err, tokenData)
    { console.log("yoooo!");
      loginquery.generateResetHash(userInfo.password1, function (hashedPassword)
      {
        console.log("hello?");
        query.newQuery("UPDATE user SET password = '" + hashedPassword + "' WHERE ID = " + tokenData[0].UserId + ";", function(err, data)  //query the database to change the password
        {
            console.log("password changed?");
            if(err)
            {
              console.log(err);
            }
            else
            {
              //Second, let's get rid of the useless token
                query.newQuery("DELETE FROM token WHERE TokenContent = '" + tokenData[0].TokenContent + "';", function(err, data)
                {
                  if (err)
                  {
                    console.log(err);
                  }
                  else
                  {
                    console.log("JUST CHECKING TO SEE IF TOKEN LINK REDIRECTS TO LOGIN");
                  }
               });
            }
        }       );
      } );   //encrpt the password...for security reasons...and then pass the return result into a callback


      //successfully changed the password so you are redirected to another page
      res.render("passwordchanged.ejs");
    })

  }
  else
  {
    console.log("passwords didn't match")
  }
}
}
