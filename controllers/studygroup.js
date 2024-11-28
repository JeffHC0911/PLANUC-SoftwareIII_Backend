const express = require('express');
const StudyGroup = require('../models/StudyGroups');

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
    const { members = [], ...body } = req.body;

    try {
        // Combina el usuario que crea el grupo con los miembros adicionales sin duplicados
        const uniqueMembers = Array.from(new Set([...members, req.uid]));

        const studyGroup = new StudyGroup({
            ...body,
            members: uniqueMembers,
        });

        const studyGroupDB = await studyGroup.save();

        res.json({
            ok: true,
            studyGroup: studyGroupDB,
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