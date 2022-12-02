const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName: {type: String, required: true, unique: true},
    password: {type: String, required: true, unique: true},
    userType: {type: String, required: true},
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});

const model = new mongoose.model('user', UserSchema);
module.exports = model
