const { Schema, model } = require('mongoose');

const userSchema = Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    career: {
        type: String,
        required: true
    }

});

module.exports = model('User', userSchema);