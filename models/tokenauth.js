var query = require('../models/query');
module.exports = {
checkToken: function(res, req)
{
  query.newQuery("SELECT * FROM token WHERE token.TokenContent = '" + req.query.tok + "';", function(err, tokenData)
  {
    //First, check if it exists
    if (tokenData.length != 1)
    {
      //The user's token does not exist or has expired
      console.log("TOKEN NOT FOUND!");
      res.render('validationFailure.ejs', {});
    }
    else
    {
      //Now, we check if this token is still valid...
      var currentDate = new Date();
      console.log("CURRENT TIME: ");
      console.log(currentDate);
      console.log("EXPIRY TIME: ");
      console.log(tokenData[0].Expiry);
      if (currentDate.getTime() > tokenData[0].Expiry)
      {
        console.log("TOKEN EXPIRED!");
        res.render('validationFailure.ejs', {});
      }
      else
      {
        //EVERYTHING IS VALIDATED!
        //First, let's update the valid column for this user
        query.newQuery("UPDATE user SET validated = 1 WHERE ID = " + tokenData[0].UserId + ";", function(err, data)
        {
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
                res.redirect('/login');
              }
            });

          }
        });
      }
    }
  });
}




}
