var express = require('express');
var router = express.Router();
var cosmeticController = require('../controllers/cosmeticController.js');
var JWTCheck = require('../middleware/JWTCheck.js')

/*
 * GET
 */
router.get('/', JWTCheck.authenticateToken, cosmeticController.list);


router.get('/name/:name', JWTCheck.authenticateToken, cosmeticController.showByName)

/*
 * GET
 */
router.get('/:id', JWTCheck.authenticateToken, cosmeticController.show);

/*
 * POST
 */
router.post('/', JWTCheck.authenticateToken, cosmeticController.create);

/*
 * PUT
 */
router.put('/:id', JWTCheck.authenticateToken, cosmeticController.update);

/*
 * DELETE
 */
router.delete('/:id', JWTCheck.authenticateToken, cosmeticController.remove);

module.exports = router;
