var userModel = require('../models/userModel');
var Q = require('q');

exports.getAllTrainee = function () {
    var deferred = Q.defer();
    userModel.find({ "role": 1,"is_deleted":"no"}, function (err, result) {
        if (err)
            deferred.reject({ "status": 500, data: [], "message": err.message });

        deferred.resolve({ "status": 200, data: result, "message": "Fetched Successfully" });
    });

    return deferred.promise;
};

exports.getTraineeById = function (id) {
    var deferred = Q.defer();
    userModel.findById(id, function (err, result) {
        if (err)
            deferred.reject({ "status": 500, data: [], "message": err.message });

        deferred.resolve({ "status": 200, data: result, "message": "Fetched Successfully" });
    });

    return deferred.promise;
};

