const express = require('express');

const http = require('http');

const app = express();

const path = require('path');

const index = require('./Routes/program.js');

const mysql = require('mysql');

const mongoose = require('mongoose');

const passport = require('passport'); //Passport for authentication

const LocalStrategy = require('passport-local').Strategy;

const cookieParser = require('cookie-parser');

const bodyParser = require('body-parser');

const logger = require('morgan'); //Note logger = morgan~!

const session = require('express-session');

const flash = require('connect-flash');

const config = require('./config/config');

const usersRouter = require('./routes/users');

require('./config/passport')(passport); // pass passport for configuration
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public/stylesheets')));

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

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'dataproject'
});

pool.getConnection(function (err, connection) {
    if (err) {
        console.log("connection error.");
        throw err;

    }
    //Nothing goes here yet
});
http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
index(app, passport);

app.use('/users', usersRouter);

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
