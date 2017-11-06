var trainee_controller = require('../controllers/traineeController');
var multer = require('multer');
var requestParams = multer();



module.exports = function (app, passport) {

    
    app.get('/user/trainee', function (req, res) {
        trainee_controller.getAllTrainee().then(function (success) {
            res.status(success.status).send(success);
        }, function (failure) {
            res.status(failure.status).send(failure);
        });
    });
    
    app.get('/user/trainee/:id', function (req, res) {
        trainee_controller.getTraineeById(req.params.id).then(function (success) {
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