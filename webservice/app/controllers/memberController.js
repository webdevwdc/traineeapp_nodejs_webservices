var userModel = require('../models/userModel');
var Q = require('q');

exports.getAllMember = function () {
    var deferred = Q.defer();
    userModel.find({ "role": 2,"is_deleted":"no" }, function (err, result) {
        if (err)
            deferred.reject({ "status": 500, data: [], "message": err.message });

        deferred.resolve({ "status": 200, data: result, "message": "Fetched Successfully" });
    });

    return deferred.promise;
};

exports.getMemberById = function (id) {
    var deferred = Q.defer();
    userModel.findById(id, function (err, result) {
        if (err)
            deferred.reject({ "status": 500, data: [], "message": err.message });

        deferred.resolve({ "status": 200, data: result, "message": "Fetched Successfully" });
    });

    return deferred.promise;
};

