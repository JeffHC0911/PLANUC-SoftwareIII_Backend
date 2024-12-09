const { Router } = require('express');
const { check } = require('express-validator');

const { isDate } = require('../helpers/isDate');
const { fieldValidators } = require('../middlewares/field-validator');
const { validateJWT } = require('../middlewares/validate-jwt');
const { getUserAvailability } = require('../controllers/availability');

const router = Router();

// Todas tienes que pasar por la validación del JWT
router.use( validateJWT );

router.get('/', getUserAvailability );

module.exports = router;