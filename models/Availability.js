const { Schema, model } = require('mongoose');

const availabilitySchema = Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    weekDay: {
        type: Number,
        required: true
    },
    timeSlots: [{
        startTime: {type: Date,},
        endTime: {type: Date},
      }]
});

module.exports = model('Availability', availabilitySchema);