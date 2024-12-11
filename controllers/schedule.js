const express = require('express');
const Schedule = require('../models/Schedules');

const getSchedule = async (req, res) => {
    try {
        const schedules = await Schedule.find()
                                        .populate('user', 'name')
        res.json({
            ok: true,
            schedules
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        });
    }
}

const createSchedule = async (req, res = express.response) => {
    const { title, type, startTime, endTime, days, semesterStart, semesterEnd, details } = req.body;

    // Validar datos requeridos
    if (!title || !startTime || !endTime) {
        return res.status(400).json({
            ok: false,
            msg: 'Todos los campos obligatorios deben estar completos',
        });
    }

    try {
        let schedules = [];

        if (semesterStart && semesterEnd && days && days.length > 0) {
            // Es una actividad recurrente
            const recurringDates = generateRecurringDates(days, semesterStart, semesterEnd);

            schedules = recurringDates.map((date) => ({
                title,
                type,
                startTime: new Date(date.setHours(new Date(startTime).getHours(), new Date(startTime).getMinutes())),
                endTime: new Date(date.setHours(new Date(endTime).getHours(), new Date(endTime).getMinutes())),
                days,
                semesterStart,
                semesterEnd,
                user: req.uid,
            }));
        } else {
            // Es una actividad única
            schedules = [{
                title,
                type,
                startTime,
                endTime,
                details,
                user: req.uid,
            }];
        }

        // Guardar en la base de datos
        const scheduleDB = await Schedule.insertMany(schedules);

        res.json({
            ok: true,
            schedules: scheduleDB,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado, contacte al administrador',
        });
    }
};

const generateRecurringDates = (days, startDate, endDate) => {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    while (start <= end) {
        const dayName = start.toLocaleDateString('en-US', { weekday: 'long' });
        if (days.includes(dayName)) {
            dates.push(new Date(start));
        }
        start.setDate(start.getDate() + 1); // Incrementar un día
    }

    return dates;
};


const updateSchedule = async (req, res = express.response) => {
    const scheduleId = req.params.id;
    const uid = req.uid;
    try {
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({
                ok: false,
                msg: 'Horario no encontrado por id'
            });
        }
        if (schedule.user.toString() !== uid) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene privilegio de editar este horario'
            });
        }
        const newSchedule = {
            ...req.body,
            user: uid
        }
        const scheduleUpdated = await Schedule.findByIdAndUpdate (scheduleId, newSchedule, {new: true});
        res.json({
            ok: true,
            schedule: scheduleUpdated
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado, hable con el administrador'
        });
    }
}

const deleteSchedule = async (req, res = express.response) => {
    const scheduleId = req.params.id;
    const uid = req.uid;
    try {
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({
                ok: false,
                msg: 'Horario no encontrado por id'
            });
        }
        if (schedule.user.toString() !== uid) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene privilegio de eliminar este horario'
            });
        }
        await Schedule.findByIdAndDelete(scheduleId);
        res.json({
            ok: true,
            msg: 'Horario eliminado'
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado, hable con el administrador'
        });
    }
}

module.exports = {
    getSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule
}