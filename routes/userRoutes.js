var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');
var JWTCheck = require('../middleware/JWTCheck.js')
/*
 * GET
 */
router.get('/', userController.list);

/*
 * GET
 */
router.get('/:id', userController.show);

/*
 * POST
 */
router.post('/', userController.create);
router.post('/register', userController.create);
router.post('/login', userController.login);
router.post('/logout', JWTCheck.authenticateToken, userController.logout);
/*
 * PUT
 */
router.put('/:id', userController.update);

/*
 * DELETE
 */
router.delete('/:id', userController.remove);

module.exports = router;
