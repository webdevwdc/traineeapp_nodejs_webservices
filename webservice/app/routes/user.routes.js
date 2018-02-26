var user_controller = require('../controllers/userController');
var multer = require('multer');
var requestParams = multer();


var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/uploads/profile");
    }
    ,filename: function (req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname.replace(/\s/g, '_'));
    }
});

var Storage_resume = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/uploads/resume");
    }
    ,filename: function (req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname.replace(/\s/g, '_'));
    }
});

var uploadFile = multer({ storage: Storage });

var upload = multer({ storage: Storage }).any();

var uploadFile_resume = multer();
//var fs = require('fs');



module.exports = function (app, passport) {
    // // LOGOUT ==============================
    app.get('/user/logout', function (req, res) {
        req.logout();
        res.redirect('/admin');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================
app.get('/render/facebook',
  function(req, res) {
    res.render('home', { user: req.user });
});

app.get('/user/login/facebook', passport.authenticate('facebook', {scope:['email']}));

app.get('/user/login/facebook/return', 
  passport.authenticate('facebook', { failureRedirect: '/user/login', scope:['email'] }));


app.post('/user/login', function(req, res, next ){
    passport.authenticate('local-login', function(err, user, info) {
      if (err) { return next(err) }
      if (!user) { return res.json({ "status": info.status, "message": info.message }) }
      res.json({ "status": 200, data: user, "message": "Fetched Successfully" });
    })(req, res, next);   
});    
    

app.post('/user/signup', function(req, res, next ){
    passport.authenticate('local-signup', function(err, user, info) {
      if (err) { return next(err) }
      if (!user) { return res.json({ "status": 500, "message": info.message }) }
      res.json({ "status": 200, data: user, "message": "You have successfully registered.Please check your email for verify your account!" });
    })(req, res, next);   
}); 


app.post('/user/updateSocial', function (req, res) {
       user_controller.facebookSignup(req).then(function (success) {
            res.status(success.status).send(success);
        }, function (failure) {
            res.status(failure.status).send(failure);
        });
});

app.post('/user/googleSignup', function (req, res) {
       user_controller.googleSignup(req).then(function (success) {
            res.status(success.status).send(success);
        }, function (failure) {
            res.status(failure.status).send(failure);
        });
});

app.get('/user/verify/:token', function (req, res) {
       user_controller.verifyBYToken(req).then(function (success) {
            res.redirect('http://angular-trainingapp.dedicatedresource.net/');
            res.end();
            //res.status(success.status).send(success);
        }, function (failure) {
             res.redirect('http://angular-trainingapp.dedicatedresource.net/');
             res.end();
            //res.status(failure.status).send(failure);
        });
    });

app.get('/user/dashboard', function (req, res) {
        user_controller.getDashboard().then(function (success) {
           res.status(success.status).send(success);
        }, function (failure) {
            res.status(failure.status).send(failure);
        });
 });
 //uploadFile.any()
 app.post('/user/update',function (req, res) {
        user_controller.update(req).then(function (success) {
            res.status(success.status).send(success);
        }, function (failure) {
            res.status(failure.status).send(failure);
        });
    });


app.post('/user/image',uploadFile.any(),function (req, res) {
       console.log(req.body);
        user_controller.image_upload(req).then(function (success) {
           res.status(success.status).send(success);
        }, function (failure) {
            res.status(failure.status).send(failure);
        });
    });

app.post('/user/aboutme',function (req, res) {
        user_controller.updateAboutme(req).then(function (success) {
          res.status(success.status).send(success);
        }, function (failure) {
            res.status(failure.status).send(failure);
        });
    });  
    
app.post('/user/forgotpassword',function (req, res) {
    user_controller.forgotPassword(req).then(function (success) {
      res.status(success.status).send(success);
    }, function (failure) {
        res.status(failure.status).send(failure);
    });
});     
app.post('/user/delete',function (req, res) {
        user_controller.delete(req).then(function (success) {
            res.status(success.status).send(success);
        }, function (failure) {
            res.status(failure.status).send(failure);
        });
    });
    
app.post('/user/contact',uploadFile_resume.any(),function (req, res) {
        console.log(req.body);
        user_controller.contact(req).then(function (success) {
            res.status(success.status).send(success);
        }, function (failure) {
            res.status(failure.status).send(failure);
        });
    });      
 
};





// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}