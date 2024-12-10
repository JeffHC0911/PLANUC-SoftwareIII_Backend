const express = require('express');
const StudyGroup = require('../models/StudyGroups');
const Schedule = require('../models/Schedules');

const getGroupStudy = async (req, res) => {
    try {
        const studyGroups = await StudyGroup.find()
                                        .populate('members', 'name')
        res.json({
            ok: true,
            studyGroups
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        });
    }
}

const createGroupStudy = async (req, res = express.response) => {
    const { members = [], schedule, ...body } = req.body;

    try {
        // Combina el usuario que crea el grupo con los miembros adicionales sin duplicados
        const uniqueMembers = Array.from(new Set([...members, req.uid])); // Aseguramos que el creador no se repita

        // Crea el grupo de estudio
        const studyGroup = new StudyGroup({
            ...body,
            members: uniqueMembers,
            schedule: schedule // Guardamos la información del horario en el grupo
        });

        // Guardamos el grupo de estudio en la base de datos
        const studyGroupDB = await studyGroup.save();

        // Primero, creamos el evento para el creador
        const scheduleEvent = new Schedule({
            title: `Grupo de estudio: ${studyGroup.name}`,
            type: "Estudio",
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            details: {
                professor: studyGroup.description, // O puedes cambiarlo por un campo que contenga el profesor
                classroom: "No especificado", // Si lo deseas, puedes agregar una propiedad classroom al grupo
                notes: `Grupo de estudio creado para el tema ${studyGroup.subject}`
            },
            user: req.uid, // Usamos el ID del creador del grupo
        });

        // Guardamos el evento en el calendario para el creador
        const scheduleEventDB = await scheduleEvent.save();

        // Añadimos el ID del evento en el grupo de estudio
        studyGroup.schedule.eventId = scheduleEventDB._id;
        await studyGroup.save();

        // Ahora asignamos el evento a los otros miembros (sin agregarlo de nuevo para el creador)
        for (const memberId of uniqueMembers) {
            // Solo agregamos el evento si el miembro no es el creador
            if (memberId !== req.uid) {
                const memberSchedule = new Schedule({
                    title: `Grupo de estudio: ${studyGroup.name}`,
                    type: "Estudio",
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    details: {
                        professor: studyGroup.description,
                        classroom: "No especificado",
                        notes: `Grupo de estudio creado para el tema ${studyGroup.subject}`
                    },
                    user: memberId, // Asociamos el evento con cada miembro
                });

                // Guardamos el evento en el calendario para cada miembro
                await memberSchedule.save();
            }
        }

        // Respondemos con los datos del grupo y el evento
        res.json({
            ok: true,
            studyGroup: studyGroupDB,
            scheduleEvent: scheduleEventDB,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado, contacte al administrador',
        });
    }
};

const updateGroupStudy = async (req, res = express.response) => {
    const studyGroupId = req.params.id;
    const uid = req.uid;
    try {
        const studyGroup = await StudyGroup.findById(studyGroupId);
        if (!studyGroup) {
            return res.status(404).json({
                ok: false,
                msg: 'Grupo de estudio no encontrado por id'
            });
        }
        if (studyGroup.user.toString() !== uid) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene privilegio de editar este grupo de estudio'
            });
        }
        const newStudyGroup = {
            ...req.body,
            user: uid
        }
        const studyGroupUpdated = await StudyGroup.findByIdAndUpdate (studyGroupId, newStudyGroup, {new: true});
        res.json({
            ok: true,
            studyGroup: studyGroupUpdated
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        });
    }
}

const deleteGroupStudy = async (req, res = express.response) => {
    const studyGroupId = req.params.id;
    const uid = req.uid;
    try {
        const studyGroup = await StudyGroup.findById(studyGroupId);
        if (!studyGroup) {
            return res.status(404).json({
                ok: false,
                msg: 'Grupo de estudio no encontrado por id'
            });
        }
        if (studyGroup.user.toString() !== uid) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene privilegio de eliminar este grupo de estudio'
            });
        }
        await StudyGroup.findByIdAndDelete(studyGroupId);
        res.json({
            ok: true,
            msg: 'Grupo de estudio eliminado'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        });
    }
}

module.exports = {
    getGroupStudy,
    createGroupStudy,
    updateGroupStudy,
    deleteGroupStudy
}