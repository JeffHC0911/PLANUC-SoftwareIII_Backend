const { Schema, model } = require('mongoose');

const ScheduleSchema = Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    days: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
    semesterStart: { type: Date},
    semesterEnd: { type: Date},
    details: {
        professor: { type: String },
        classroom: { type: String },
        notes: { type: String },
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = model('Schedule', ScheduleSchema);
