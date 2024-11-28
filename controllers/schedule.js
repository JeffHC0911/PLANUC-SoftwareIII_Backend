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
    const schedule = new Schedule(req.body);
    try {
        schedule.user = req.uid;
        const scheduleDB = await schedule.save();
        res.json({
            ok: true,
            schedule: scheduleDB
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado, contacte al administrador'
        });
    }
}

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