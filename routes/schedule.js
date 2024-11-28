
const { Router } = require('express');
const { check } = require('express-validator');

const { isDate } = require('../helpers/isDate');
const { fieldValidators } = require('../middlewares/field-validator');
const { validateJWT } = require('../middlewares/validate-jwt');
const { getSchedule, createSchedule, updateSchedule, deleteSchedule } = require('../controllers/schedule');

const router = Router();

// Todas tienes que pasar por la validación del JWT
router.use( validateJWT );


// Obtener eventos 
router.get('/', getSchedule );

// Crear un nuevo evento
router.post(
    '/',
    [
        check('title','El titulo es obligatorio').not().isEmpty(),
        //check('startTime','Fecha de inicio es obligatoria').custom( isDate ),
        //check('endTime','Fecha de finalización es obligatoria').custom( isDate ),
        fieldValidators
    ],
    createSchedule 
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
    updateSchedule 
);

// Borrar evento
router.delete('/:id', deleteSchedule );

module.exports = router;