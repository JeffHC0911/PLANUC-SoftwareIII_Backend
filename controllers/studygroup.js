const express = require('express');
const StudyGroup = require('../models/StudyGroups');
const Schedule = require('../models/Schedules');
const User = require('../models/User');

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
        // Busca los IDs de los correos proporcionados
        const userRecords = await User.find({ email: { $in: members } }).select('_id email');
        const foundEmails = userRecords.map((user) => user.email);

        // Verifica si hay correos no encontrados
        const notFoundEmails = members.filter((email) => !foundEmails.includes(email));
        if (notFoundEmails.length > 0) {
            return res.status(400).json({
                ok: false,
                msg: `Algunos correos no se encontraron en el sistema: ${notFoundEmails.join(', ')}`,
            });
        }

        // Extrae los IDs de los usuarios encontrados
        const memberIds = userRecords.map((user) => user._id.toString());

        // Agrega el creador del grupo a los miembros (req.uid viene del middleware de autenticación)
        const creatorId = req.uid;
        const uniqueMembers = Array.from(new Set([...memberIds, creatorId]));

        // Crea el grupo de estudio
        const studyGroup = new StudyGroup({
            ...body,
            members: uniqueMembers, // Guardamos IDs de los miembros
            schedule: schedule, // Guardamos la información del horario
        });

        const studyGroupDB = await studyGroup.save();

        // Crea el evento para el creador del grupo
        const scheduleEvent = new Schedule({
            title: `Grupo de estudio: ${studyGroup.name}`,
            type: "Estudio",
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            details: {
                professor: studyGroup.description,
                classroom: "No especificado",
                notes: `Grupo de estudio creado para el tema ${studyGroup.subject}`,
            },
            user: creatorId,
        });

        const scheduleEventDB = await scheduleEvent.save();

        // Añade el ID del evento en el grupo de estudio
        studyGroup.schedule.eventId = scheduleEventDB._id;
        await studyGroup.save();

        // Crea el evento para los otros miembros
        for (const memberId of uniqueMembers) {
            // No crea el evento de nuevo para el creador
            if (memberId !== creatorId) {
                const memberSchedule = new Schedule({
                    title: `Grupo de estudio: ${studyGroup.name}`,
                    type: "Estudio",
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    details: {
                        professor: studyGroup.description,
                        classroom: "No especificado",
                        notes: `Grupo de estudio creado para el tema ${studyGroup.subject}`,
                    },
                    user: memberId,
                });

                await memberSchedule.save();
            }
        }

        // Responde con los datos del grupo y el evento
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