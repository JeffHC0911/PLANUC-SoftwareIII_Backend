const express = require('express');
const Schedule = require('../models/Schedules');
const User = require('../models/User');


const getUserAvailability = async (req, res) => {
    const { email, startRange, endRange } = req.body;

    try {
        // Encontrar el usuario por correo electrónico
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no encontrado',
            });
        }

        // Buscar eventos del usuario dentro del rango especificado
        const schedules = await Schedule.find({
            user: user._id,
            $or: [
                { startTime: { $gte: new Date(startRange), $lt: new Date(endRange) } },
                { endTime: { $gt: new Date(startRange), $lte: new Date(endRange) } },
                { startTime: { $lt: new Date(startRange) }, endTime: { $gt: new Date(endRange) } },
            ],
        });

        // Si no hay eventos en conflicto, el usuario está disponible
        if (schedules.length === 0) {
            return res.json({
                ok: true,
                available: true,
                msg: 'El usuario está disponible en el rango especificado',
            });
        }

        // Si hay conflictos, mostrar detalles
        return res.json({
            ok: true,
            available: false,
            conflicts: schedules.map(schedule => ({
                title: schedule.title,
                type: schedule.type,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
            })),
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado, contacte al administrador',
        });
    }
};


module.exports = {

    getUserAvailability

}
