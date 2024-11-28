
const { Router } = require('express');
const { check } = require('express-validator');

const { isDate } = require('../helpers/isDate');
const { fieldValidators } = require('../middlewares/field-validator');
const { validateJWT } = require('../middlewares/validate-jwt');
const {getGroupStudy, createGroupStudy, updateGroupStudy, deleteGroupStudy  } = require('../controllers/studygroup');

const router = Router();

// Todas tienes que pasar por la validación del JWT
router.use( validateJWT );


// Obtener eventos 
router.get('/', getGroupStudy );

// Crear un nuevo evento
router.post(
    '/',
    [
        check('name','El nombre es obligatorio').not().isEmpty(),
        //check('startTime','Fecha de inicio es obligatoria').custom( isDate ),
        //check('endTime','Fecha de finalización es obligatoria').custom( isDate ),
        fieldValidators
    ],
    createGroupStudy 
);

// Actualizar Evento
router.put(
    '/:id', 
    [
        check('title','El titulo es obligatorio').not().isEmpty(),
        check('startTime','Fecha de inicio es obligatoria').custom( isDate ),
        check('endTime','Fecha de finalización es obligatoria').custom( isDate ),
        fieldValidators
    ],
    updateGroupStudy 
);

// Borrar evento
router.delete('/:id', deleteGroupStudy );

module.exports = router;