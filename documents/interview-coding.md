### Node.js

  1. How to get query parameters 'id' in Express.js?
i.e. http://localhost:3000/?id=123

       A.
       ```javascript
       app.get('/', function(req, res){
          // get query parameter id
          res.send('id: ' + req.params.id);
        });
       ```

      B.
      ```javascript
      app.get('/', function(req, res){
         // get query parameter id
         res.send('id: ' + req.query.id);
       });
      ```

  2. How to get route parameters 'id' in Express.js?
i.e. http://localhost:3000/123/

       A.
       ```javascript
       app.get('/:id', function(req, res){
          // get query parameter id
          res.send('id: ' + req.params.id);
        });
       ```

      B.
      ```javascript
      app.get('/:id', function(req, res){
         // get query parameter id
         res.send('id: ' + req.query.id);
       });
      ```

      C.
      ```javascript
      app.get('/', function(req, res){
         // get query parameter id
         res.send('id: ' + req.query.id);
      });
      ```

### RESTful API

  3. What will be the Express route for updating a specific user given an 'id'

     A. ```app.get('/users', (req, res) => { ... })```

     B. ```app.get('/users/id', (req, res) => { ... })```

     C. ```app.put('/users/:id', (req, res) => { ... })```

     D. ```app.get('/users/:id', (req, res) => { ... })```

  4. What will be the best possible RESTful endpoint for adding a NEW comment for a specific user given his 'id'

     A. ```app.get('/users/comments', handler)```

     B. ```app.put('/users/comments', handler)```

     C. ```app.post('/users/:id/comments', handler)```

     D. ```app.post('/users/:id/comments/:comment_id', handler)```

  5. What is the response header used to send cookies from server to user agent?

     A. Get-Cookie

     B. Set-Cookie

     C. Post-Cookie

     D. Put-Cookie
  6.  We would like to create a route called '/dashboard' that should check if the a user's cookie is present in the request headers. If the user's cookie is NOT present, the app should redirect the user to '/login' route else it should render the 'dashboard.html' page.

      NOTE: Let us assume we use res.redirect('route_path') to redirect to the specified 'route_path', res.render('somepage.html') to render the specified html page, and res.cookies object contains the cookies

      ```javascript
      app.get('/dashboard', (req, res) => {

          // checking if user's cookie is set
          if (req.cookies && req.cookies.user) {

              // if the user cookie is set, check if the user exists in the Database
              UserDB.findOne({email: req.cookies.user.email}, (err, user) => {

                  if (user) {
                      // user is present.

                      _______________ // BLANK 1
                  } else {

                      // else this user is different from the one set in the cookie
                      // we reset the cookie session info
                      res.cookies.reset();
                      res.redirect('/login')
                  }
              })
          } else {

              // the user's cookie is not set

              _______________ // BLANK 2
          }

      })
      ```
        A. BLANK 1. ```res.render('dashboard.html')```

        BLANK 2. ```res.redirect('/login')```

        B. BLANK 1. ```res.redirect('/login')```

        BLANK 2. ```res.render('dashboard.html')```

        C. BLANK 1. ```res.render('dashboard.html')```

        BLANK 2. ```res.render('dashboard.html')```

        D. BLANK 1. ```res.redirect('/login')```

        BLANK 2. ```res.redirect('/login')```
