### Node.js

How to get variables in Express.js in GET Method?

    A.
    ```
    app.get('/', function(req, res){
      /* req have all the values **/
      res.send('id: ' + req.query.id);
    });
    ```
