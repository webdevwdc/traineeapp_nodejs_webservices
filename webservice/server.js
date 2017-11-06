// server.js
process.env.FB_CLIENT_ID = '154805878458089';
process.env.FB_CLIENT_SECRET = 'c4350f6103636e247f62b601975049d4';

process.env.G_CLIENT_ID = '154805878458089';
process.env.G_CLIENT_SECRET = 'c4350f6103636e247f62b601975049d4';

// +++++++++++++++ set up ++++++++++++++++
// get all the tools we need
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var path = require('path');
var logger = require('express-logger');
var session = require('express-session');

var app = express();
var port = process.env.PORT || 1900;
var mongoose = require('mongoose');
var passport = require('passport');
var FBStrategy = require('passport-facebook').Strategy;
var GStrategy = require('passport-google-oauth').Strategy;
var flash = require('connect-flash');
AutoIncrement = require('mongoose-sequence')(mongoose);

var configDB = require('./config/database');

var userCtrl = require('./app/controllers/userController');

// +++++++++++++++++++ configuration +++++++++++++++++++++
mongoose.connect(configDB.url, { useMongoClient: true }); // connect to our database
mongoose.Promise = global.Promise

require('./config/passport')(passport); // pass passport for configuration

passport.use(new FBStrategy({
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
    callbackURL: 'http://trainingapp.dedicatedresource.net/user/login/facebook/return',
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    
    console.log(profile);
    
    var displayNameArr = profile.displayName.split(" ");
    var providerUserProfile = {
        first_name: displayNameArr[0],
        last_name: displayNameArr[1],
        reg_type: 'fb',
        facebook_auth_key: profile.id
    };
    
    userCtrl.saveOAuthUserProfile(req, providerUserProfile, cb);
}));



passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.use(express.static('./public'));
// set up our express application
app.use(logger({ path: "./logfile.txt" })); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({ extended: true })); // get information from html forms
app.use(bodyParser.json());

// set all css & js



// required for passport
app.use(session({
    secret: 'ridio@ws00161',
    resave: true,
    saveUninitialized: true
})); // session secret


// required for mail section
var nodemailer = require('nodemailer'); 
// For mail access //
transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'smith.williams0910@gmail.com',
    pass: 'Option123@'
  }
});

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,X-File-Type,X-File-Name,X-File-Size');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// +++++++++++++++ routes ++++++++++++++++

// load our routes and pass in our app and fully configured passport
require('./app/routes/user.routes.js')(app, passport);
require('./app/routes/member.routes.js')(app, passport);
require('./app/routes/trainee.routes.js')(app, passport);

// +++++++++++++++ launch ++++++++++++++++
app.listen(port);
console.log('trainningApp is running on port ' + port);