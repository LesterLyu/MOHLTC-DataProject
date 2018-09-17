const express = require('express');

const http = require('http');

const app = express();

const path = require('path');

const mongoose = require('mongoose');

const passport = require('passport'); //Passport for authentication

const LocalStrategy = require('passport-local').Strategy;

const cookieParser = require('cookie-parser');

const bodyParser = require('body-parser');

const logger = require('morgan'); //Note logger = morgan~!

const session = require('express-session');

const flash = require('connect-flash');

const config = require('./config/config');

const indexRouter = require('./routes/index');

const usersRouter = require('./routes/users');

const workbookRouter = require('./routes/workbook');

const User = require('./models/user');

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public/moh.css')));

// MongoDB
mongoose.connect(config.database, {
    useNewUrlParser: true
});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    console.log('MongoDB connected!')
});

app.use(logger('dev')); //log every request to the CONSOLE.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: config.superSecret,
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 3600 * 1000} //1 hour
}));

// passport authentication setup
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

// home page
app.use('/', indexRouter);
// user authentication related
app.use('/', usersRouter); // API or pages below this requires authentication
// api endpoints that need authentication
app.use('/', workbookRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
console.log("hello");
module.exports = app;
