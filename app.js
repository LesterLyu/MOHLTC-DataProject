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

const cookieSession = require('cookie-session');

const cors = require('cors');

const config = require('./config/config');

const error = require('./config/error');

const indexRouter = require('./routes/index');

const usersRouter = require('./routes/users');

const packageRouter = require('./routes/package');

const LdapStrategy = require('passport-ldapauth');

const userManagementRouter = require('./routes/userManagement');

const RouterV2 = require('./routes/v2');

const User = require('./models/user');

const setup = require('./controller/setup');


app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public/moh.css')));

// MongoDB
mongoose.connect(process.env.NODE_ENV === 'test' ? config.testDatabase : config.database, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log('MongoDB connected!')
});

const whitelist = [
    'http://localhost',
    'http://localhost:3003',
    'http://localhost:3000',
    'http://ec2-3-16-106-158.us-east-2.compute.amazonaws.com',
    'http://ec2-3-16-106-158.us-east-2.compute.amazonaws.com/react',
    'http://dataproject-env.u2t3prjsea.us-east-2.elasticbeanstalk.com',
    'http://dataproject-env.u2t3prjsea.us-east-2.elasticbeanstalk.com/react'];
const corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
        return callback(null, true);
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
};
app.use(cors(corsOptions));

app.use(logger('dev')); //log every request to the CONSOLE.
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/documents', express.static(path.join(__dirname, 'documents')));
app.use('/test', express.static(path.join(__dirname, 'mochawesome-report')));

app.use(cookieSession({
    name: 'session',
    secret: config.superSecret,
    cookie: {maxAge: 24 * 3600 * 1000} // 24 hours
}));

// passport authentication setup
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(passport.initialize());
app.use(passport.session());

setup.setup();

// home page
app.use('/', indexRouter);
// user authentication related
app.use('/', usersRouter); // API or pages below this requires authentication
// api endpoints that need authentication

app.use('/', packageRouter);
app.use('/', userManagementRouter);
app.use('/', ...RouterV2);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler (four parameters)
app.use(function (err, req, res, next) {
    if (err === error.api.NO_PERMISSION) {
        res.status(403).json({success: false, message: error.api.NO_PERMISSION});
    } else {
        console.error(err);
        res.status(err.status || 500).json({
            success: false,
            message: err.message,
            stack: req.app.get('env') === 'development' ? err.stack : {},
        })
    }
});
const server = http.createServer(app);

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.log('Address in use, exited...');
        process.exit(1);
    }
});
if (process.env.NODE_ENV !== 'test') {
    server.listen(app.get('port'), function () {
        console.log("Express server listening on port " + app.get('port'));
    });
}
console.log('in ' + process.env.NODE_ENV + ' mode');
module.exports = app;
