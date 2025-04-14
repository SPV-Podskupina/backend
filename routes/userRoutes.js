var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');
var JWTCheck = require('../middleware/JWTCheck.js')
var uniqueUsernameCheck = require('../middleware/uniqueUsernameCheck.js')
var checkAge = require('../middleware/ageCheck.js')
var multer = require('multer');
const upload = multer({dest: './resources/profile_pictures'});
/*
 * GET
 */
router.get('/', userController.list);                                           // get
router.get('/balance', JWTCheck.authenticateToken, userController.getBalance);
router.get('/get_top_balance/:count', userController.getTopBalance);            // get_top_balance
router.get('/:id', userController.show);                                        // get_all


/*
 * POST
 */
router.post('/register', uniqueUsernameCheck, upload.single('profile_puicture'), userController.create);           // register
router.post('/login', userController.login);                                    // login
router.post('/logout', JWTCheck.authenticateToken, userController.logout);      // logout
router.post('/add_friend', JWTCheck.authenticateToken, userController.addFriend);
router.post('/remove_friend', JWTCheck.authenticateToken, userController.removeFriend);
router.post('/add_balance', JWTCheck.authenticateToken, userController.addBalance);
router.post('/remove_balance', JWTCheck.authenticateToken, userController.removeBalance);
router.post('/buy_item', JWTCheck.authenticateToken, userController.buyItem);

/*
 * PUT
 */
router.put('/:id', userController.update);                                      // update
router.put('/reset_password', userController.resetPassword);                    // reset_password

/*
 * DELETE
 */
router.delete('/:id', userController.remove);                                   // delete

module.exports = router;
