var userModel = require('../models/userModel');
var Q = require('q');
var cryptoRandomString = require('crypto-random-string');
var location = require('location-href');
var gm = require('gm').subClass({imageMagick: true});

exports.getAllUser = function () {
    var deferred = Q.defer();
    userModel.find({ "role": 0 }, function (err, result) {
        if (err)
            deferred.reject({ "status": 500, data: [], "message": err.message });

        deferred.resolve({ "status": 200, data: result, "message": "Fetched Successfully" });
    });

    return deferred.promise;
};

exports.getUserById = function (id) {
    var deferred = Q.defer();
    userModel.findById(id, function (err, result) {
        if (err)
            deferred.reject({ "status": 500, data: [], "message": err.message });

        deferred.resolve({ "status": 200, data: result, "message": "Fetched Successfully" });
    });

    return deferred.promise;
};


exports.verifyBYToken = function (req, res) {
    var deferred = Q.defer();
    console.log(req.params.token);
    userModel.find({ "verify_token": req.params.token }, function (err, result) {
        if (err)
        deferred.reject({ "status": 500, data: [], "message": err.message });
        if(result.length > 0) {
            req.body.verify_token = "";
            req.body.is_verify = "yes";
            userModel.findByIdAndUpdate(result[0].id,req.body, function (err, result_oth) {
            if (err)
                deferred.reject({ "status": 500, data: [], "message": err.message });
                deferred.resolve({ "status": 200, data: result_oth, "message": "Data Removed Successfully" });
            });
        
        } else {
           deferred.reject({ "status": 500, data: [], "message":"no verify token found" });
        }
        
    });
    
   

    return deferred.promise;
};


exports.getDashboard = function (req, res) {
    var deferred = Q.defer();
    var arr = {};
    Promise.all([
    userModel.count({ "role": 1}).exec(),
    userModel.count({ "role": 1,"is_verify":"yes","is_deleted":"no"}).exec(),
    userModel.count({ "role": 2}).exec(),
    userModel.count({ "role": 2,"is_verify":"yes","is_deleted":"no"}).exec(),
    ]).then(function(counts) {
    arr.total_trainee =  counts[0]; 
    arr.active_trainee = counts[1]; 
    arr.total_member =  counts[2]; 
    arr.active_member =  counts[3]; 
    deferred.resolve({ "status": 200, data: arr, "message": "Data fetched Successfully" });
    });
    return deferred.promise;
}; 

exports.update = function (req, res) {
    var deferred = Q.defer();
    console.log(req.body);
    /*
    if (req.files.length > 0) {
        req.body.profile_image = req.files[0].filename;
    }*/
    req.body.first_name = (req.body.first_name)?req.body.first_name:"";
    req.body.last_name = (req.body.last_name)?req.body.last_name:"";
    req.body.phone_number = (req.body.phone_number)?req.body.phone_number:"";
    req.body.address = (req.body.address)?req.body.address:"";
    req.body.gender = (req.body.gender)?req.body.gender:"";
    req.body.twitter = (req.body.twitter)?req.body.twitter:"";
    req.body.skype = (req.body.skype)?req.body.skype:"";
    if(req.body.dob) {
        req.body.dob = req.body.dob;
    }
   
    userModel.findByIdAndUpdate(req.body._id, req.body,{ new: true },function (err, result) {
        if (err)
            deferred.reject({ "status": 500, data: [], "message": err.message });

        deferred.resolve({ "status": 200, data: result, "message": "Updated Successfully" });
    });

    return deferred.promise;
};

exports.image_upload = function (req, res) {
    var deferred = Q.defer();
    
   if (req.files.length > 0) {
        req.body.profile_image = req.files[0].filename;
        gm('public/uploads/profile/'+req.files[0].filename)
        .resize(108)
        .write('public/uploads/profile/thumbs/'+req.files[0].filename, function (err) {
        console.log(err)    
        if (!err) console.log('done');
        });
        gm('public/uploads/profile/'+req.files[0].filename)
        .resize(128)
        .write('public/uploads/profile/header/'+req.files[0].filename, function (err) {
        console.log(err)    
        if (!err) console.log('done');
        });
        userModel.findByIdAndUpdate(req.body.id, req.body,{ new: true },function (err, result) {
        if (err)
            deferred.reject({ "status": 500, data: [], "message": err.message });
            deferred.resolve({ "status": 200, data: result, "message": "Updated Successfully" });
        });
        
    } else {
         deferred.resolve({ "status": 200, data:[], "message": "Please upload any image" });
    }
    
   return deferred.promise;
};

exports.facebookSignup = function (req, res) {
    var deferred = Q.defer();
    console.log(req.body);
    if(req.body.id > 0 && req.body.provider=='FACEBOOK') {
    userModel.find({ "facebook_auth_key": req.body.id,"reg_type": "fb" }, function (err, result) {
        console.log(result.length);
        if(result.length > 0) {
            deferred.resolve({ "status": 200, data: result, "message": "","is_new":"no" });
        } else {
           
            var newUser = new userModel();
            newUser.first_name = (req.body.firstName)?req.body.firstName:"";
            newUser.last_name = (req.body.lastName)?req.body.lastName:"";
            newUser.email = (req.body.email)?req.body.email:"";
            newUser.role = 2;
            newUser.facebook_auth_key = req.body.id
            newUser.reg_type  = 'fb';
            newUser.is_verify  = 'yes';
            
            newUser.save(function (err) {
                if (err) {
                    deferred.reject({ "status": 500, data: [], "message": err.message });
                } else {
                     deferred.resolve({ "status": 200, data: [newUser], "message": "Inserted successfully","is_new":"yes" });
                }
             })
             
        }
    });
    } else {
        deferred.resolve({ "status": 200, data: [], "message": "Facebook id not found","is_new":"oth" });
    }
    return deferred.promise;
};


exports.googleSignup = function (req, res) {
    var deferred = Q.defer();
    console.log(req.body);
    if(req.body.id > 0 && req.body.provider=='GOOGLE') {
    userModel.find({ "google_auth_key": req.body.id,"reg_type": "google" }, function (err, result) {
        console.log(result.length);
        if(result.length > 0) {
            deferred.resolve({ "status": 200, data: result, "message": "","is_new":"no" });
        } else {
           
            var newUser = new userModel();
            if(req.body.name) {
                var displayNameArr = req.body.name.split(" ");
                var firstName = displayNameArr[0];
                var lastName = displayNameArr[1];
                newUser.first_name = firstName;
                newUser.last_name = lastName;
            } 
            newUser.email = (req.body.email)?req.body.email:"";
            newUser.google_auth_key = req.body.id
            newUser.reg_type  = 'google';
            newUser.is_verify  = 'yes';
            
            newUser.save(function (err) {
                if (err) {
                    deferred.reject({ "status": 500, data: [], "message": err.message });
                } else {
                     deferred.resolve({ "status": 200, data: [newUser], "message": "Inserted successfully","is_new":"yes" });
                }
             })
             
        }
    });
    } else {
        deferred.resolve({ "status": 200, data: [], "message": "Google id not found","is_new":"oth" });
    }
    return deferred.promise;
};

exports.updateAboutme = function (req, res) {
    var deferred = Q.defer();
    req.body.about_me = (req.body.about_me)?req.body.about_me:"";
    userModel.findByIdAndUpdate(req.body._id, req.body,{ new: true },function (err, result) {
        if (err)
            deferred.reject({ "status": 500, data: [], "message": err.message });

        deferred.resolve({ "status": 200, data: result, "message": "Updated Successfully" });
    });

    return deferred.promise;
};

exports.forgotPassword = function (req, res) {
    var deferred = Q.defer();
    userModel.find({ "email": req.body.email,"is_deleted": "no","is_verify": "yes" }, function (err, result) {
    if(result.length > 0) {
    var User = new userModel();    
    var new_password =  cryptoRandomString(8);    
    var email_string = "Welcome,<br><br>";
    email_string += "Please check your new login details.<br><br>";
    email_string += "<span>Email  : </span><span style='text-decoration:none;text-underline:none;'>"+result[0].email+"</span><br>";
    email_string += "<span>Password : </span><span>"+new_password+"</span><br><br>";
    email_string += "Thanks <br> Admin Team";

    var mailOptions = {
    from: 'smith.williams0910@gmail.com',
    to: result[0].email,
    subject: 'Forgot Password',
    html: email_string
    };

    transporter.sendMail(mailOptions, function(error, info){
     if (err)
        deferred.reject({ "status": 500, data: [], "message": err.message }); 
        req.body.password = User.generateHash(new_password).trim();
        console.log(result[0].id);
        userModel.findByIdAndUpdate(result[0].id, req.body,{ new: true },function (err, result) {
        if (err)
            deferred.reject({ "status": 500, data: [], "message": err.message });

            deferred.resolve({ "status": 200, data: [result], "message": "Please check your email address for new password!" });
        });

    });
        
    } else {
        deferred.reject({ "status": 200, data: [], "message":"sorry no user found" }); 
    }
        
    })
    
    return deferred.promise;
};

exports.delete = function (req) {
    var deferred = Q.defer();
    req.body.is_deleted = "yes";

    userModel.findByIdAndUpdate(req.body.id, req.body, function (err, result) {
        if (err)
            deferred.reject({ "status": 500, data: [], "message": err.message });

        deferred.resolve({ "status": 200, data: [], "message": "Data Removed Successfully" });
    });

    return deferred.promise;
};

exports.saveOAuthUserProfile = function(req, profile, done) {
    userModel.findOne({
            reg_type: profile.reg_type,
            facebook_auth_key: profile.facebook_auth_key
        },
        function(err, user) {
            if (err) {
            return done(err);
            }
            else {
                if (!user) {
                    user = new User(profile);

                    user.save(function(err) {
                        if (err) {
                            var message = err;
                        }

                        return done(err, user);
                    });
                }
                else {
                    return done(err, user);
                }
            }
        }
    );
};

exports.facebookupdate = function (req) {
    console.log('aaa');
    console.log(req);
    var deferred = Q.defer();
    var displayNameArr = req.user.displayName.split(" ");
    var firstName = displayNameArr[0];
    var lastName = displayNameArr[1];
    var newUser = new userModel();
    newUser.reg_type = 'fb';
    newUser.facebook_auth_key = req.user.id;
    newUser.first_name = firstName;
    newUser.last_name = lastName;
    newUser.is_verify = 'yes';
    newUser.save(function (err) {
        if (err) {
          deferred.reject({ "status": 500, data: [], "message": err.message });
        } else {
          deferred.resolve({"status": 200, data: newUser, "message": "User Created Successfully"});              
        }
    });
    return deferred.promise;
}


