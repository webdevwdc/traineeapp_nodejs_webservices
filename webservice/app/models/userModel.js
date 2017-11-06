var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var genders = ["male", "female"];
var verify = ["yes", "no"];
var deleted = ["yes", "no"];
var registration = ["normal","google","fb"];
// define the schema for our user model
var userSchema = mongoose.Schema({
     _id: Number,
    email: String,
    password: String,
    first_name: { type: String, default: '' },
    last_name: { type: String, default: '' },
    address: { type: String, default: '' },
    phone_number: { type: String, default: '' },
    gender : { type: String,enum:genders},    
    profile_image : String,
    about_me : { type: String,default: ''}, 
    dob: { type: String,default: ''},
    verify_token:String,
    twitter: { type: String, default: ''},
    skype: { type: String, default: ''},    
    reg_type: { type: String, default: 'normal',enum:registration},
    google_auth_key:String,
    facebook_auth_key:String,
    role: Number,
    is_verify: { type: String, default: 'no',enum:verify },
    is_deleted: { type: String, default: 'no',enum:deleted },
    deleted_by:Number,
    created_at: {
    type: Date,
    default: Date.now
    },
    updated_at: {
    type: Date,
    default: Date.now
    },
    
}, { _id: false });

// generating a hash
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};
userSchema.plugin(AutoIncrement);
// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);