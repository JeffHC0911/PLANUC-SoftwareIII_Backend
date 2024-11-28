const { Schema, model } = require('mongoose');

const studyGroupSchema = Schema({
    name: {
        type: String,
        required: true
    },
    subject: {
        type: String,
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    schedule: {
        day: {type: String},
        startTime: {type: Date},
        endTime: {type: Date}
    },
    status: {
        type: String,
        default: 'active'
    },
    description: {
        type: String,
    }

});

module.exports = model('StudyGroup', studyGroupSchema);