// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var cryptoRandomString = require('crypto-random-string');

// load up the user model
var User = require('../app/models/userModel');


// load the auth variables
var configAuth = require('./auth'); // use this one for testing

module.exports = function (passport) {
    
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });


    // LOCAL LOGIN =============================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
        function (req, email, password, done) {
           
            if (email)
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

            // asynchronous
            process.nextTick(function () {
                
                User.findOne({ 'email': email }, function (err, user) {

                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // if no user is found, return the message
                    if (!user)
                        return done(null, false, { message: 'Invalid email or password!',status:500 });
                    // if user deleted
                    if (user.is_deleted == 'yes')
                        return done(null, false, { message: 'Sorry no user found!',status:500 });
                     // if user not verified
                    if (user.is_verify == 'no')
                        return done(null, false, { message: 'You have not verified your account.Please check your email!',status:401 });
                     // if password not match
                    if (!user.validPassword(password))
                        return done(null, false, { message: 'Oops wrong password!',status:500 });

                    // all is well, return user
                    else {
                        //
                        var fetchedUser = new User();
                        fetchedUser = user;
                        return done(null, user);
                        
                    }
                });
            });

        }));


    // LOCAL SIGNUP ============================================================

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
        function (req, email, password, done) {
           if (email)
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

            // asynchronous
            process.nextTick(function () {
                
                // if the user is not already logged in:
                if (!req.user) {
                    
                   User.findOne({ 'email': email}, function (err, user) {
                        // if there are any errors, return the error
                        if (err)
                            return done(err);

                        // check to see if theres already a user with that email
                        if (user) {
                            return done(null, false, { message: 'That email is already taken!' });
                        } else {

                            // create the user
                            var newUser = new User();

                            newUser.email = req.body.email;
                            newUser.password = newUser.generateHash(req.body.password).trim();
                            newUser.role = req.body.role;
                            newUser.verify_token = cryptoRandomString(10);
                            
                            newUser.save(function (err) {
                                if (err) {
                                   return done(err); 
                                } else {
                                    var email_string = "Welcome,<br><br>";
                                    email_string += "You have registered as an app user. Go to the following url to confirm your account.<br><br>";
                                    email_string += "http://203.163.248.214:1900/user/verify/"+newUser.verify_token+"<br><br>";
                                    email_string += "Thanks <br> Admin Team";
                                    
                                    var mailOptions = {
                                    from: 'smith.williams0910@gmail.com',
                                    to: req.body.email,
                                    subject: 'Email Verification',
                                    html: email_string
                                    };

                                    transporter.sendMail(mailOptions, function(error, info){
                                    }); 
                                   return done(null, newUser); 
                                }
                                   
                                
                                

                                
                            });
                        }

                    });
                    // if the user is logged in but has no local account...
                } else if (!req.user.email) {
                    
                    // ...presumably they're trying to connect a local account
                    // BUT let's check if the email used to connect a local account is being used by another user
                    User.findOne({ 'email': email}, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {
                           return done(null, false, { message: 'That email is already taken!' });
                            // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                        } else {
                            var user = req.user;
                            user.email = req.body.email;
                            user.password = newUser.generateHash(req.body.password);
                            user.role = req.body.role;
                            user.verify_token = cryptoRandomString(10);
                            user.save(function (err) {
                                if (err)
                                    return done(err);

                                return done(null, user);
                            });
                        }
                    });
                } else {
                    // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                    return done(null, req.user);
                }

            });
            
        }));

};