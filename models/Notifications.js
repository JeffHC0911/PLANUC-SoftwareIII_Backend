const { Schema, model } = require('mongoose');

const notificationSchema = Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    type: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    status: {
        type: String,
        default: 'unread'
    },

});

module.exports = model('Notification', notificationSchema);