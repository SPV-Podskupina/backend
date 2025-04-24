var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');
var JWTCheck = require('../middleware/JWTCheck.js');
var uniqueUsernameCheck = require('../middleware/uniqueUsernameCheck.js');
var multer = require('multer');
const upload = multer({ dest: './resources/profile_pictures' });

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get list of all users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', userController.list);

/**
 * @swagger
 * /balance:
 *   get:
 *     summary: Get user balance
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User balance
 */
router.get('/balance', JWTCheck.authenticateToken, userController.getBalance);

/**
 * @swagger
 * /get_top_balance/{count}:
 *   get:
 *     summary: Get users with top balances
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: count
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of users to return
 *     responses:
 *       200:
 *         description: Top balance users
 */
router.get('/get_top_balance/:count', userController.getTopBalance);

/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User object
 */
router.get('/:id', userController.show);

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/register', uniqueUsernameCheck, upload.single('profile_picture'), userController.create);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login success
 */
router.post('/login', userController.login);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Log out user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout success
 */
router.post('/logout', JWTCheck.authenticateToken, userController.logout);

/**
 * @swagger
 * /add_friend/{id}:
 *   post:
 *     summary: Add a friend by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend added
 */
router.post('/add_friend/:id', JWTCheck.authenticateToken, userController.addFriend);

/**
 * @swagger
 * /remove_friend/{id}:
 *   post:
 *     summary: Remove a friend by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend removed
 */
router.post('/remove_friend/:id', JWTCheck.authenticateToken, userController.removeFriend);

/**
 * @swagger
 * /add_balance:
 *   post:
 *     summary: Add balance to the user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance added
 */
router.post('/add_balance', JWTCheck.authenticateToken, userController.addBalance);

/**
 * @swagger
 * /remove_balance:
 *   post:
 *     summary: Remove balance from the user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance removed
 */
router.post('/remove_balance', JWTCheck.authenticateToken, userController.removeBalance);

/**
 * @swagger
 * /buy_item:
 *   post:
 *     summary: Buy an item
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Item purchased
 */
router.post('/buy_item', JWTCheck.authenticateToken, userController.buyItem);

/**
 * @swagger
 * /reset_password:
 *   put:
 *     summary: Reset user password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password reset
 */
router.put('/reset_password', JWTCheck.authenticateToken, userController.resetPassword);

/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Update user info
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated
 */
router.put('/:id', upload.single('profile_picture'), userController.update);

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/:id', userController.remove);

module.exports = router;
