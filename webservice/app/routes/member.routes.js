var memeber_controller = require('../controllers/memberController');
var multer = require('multer');
var requestParams = multer();


module.exports = function (app, passport) {

    
    app.get('/user/member', function (req, res) {
        memeber_controller.getAllMember().then(function (success) {
            res.status(success.status).send(success);
        }, function (failure) {
            res.status(failure.status).send(failure);
        });
    });
    
    app.get('/user/member/:id', function (req, res) {
        memeber_controller.getMemberById(req.params.id).then(function (success) {
            res.status(success.status).send(success);
        }, function (failure) {
            res.status(failure.status).send(failure);
        });
    });

    
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/admin');
}