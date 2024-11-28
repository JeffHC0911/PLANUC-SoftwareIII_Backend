const { Schema, model } = require('mongoose');

const scheduleSchema = Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        //required: true
    },
    endTime: {
        type: Date,
        //required: true
    },
    details: {
        professor: {type: String},
        classroom: {type: String},
        notes: {type: String},
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
});

module.exports = model('Schedule', scheduleSchema);
