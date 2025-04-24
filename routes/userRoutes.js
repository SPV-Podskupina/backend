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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.get('/', userController.list);


/**
 * @swagger
 * /balance:
 *   get:
 *     summary: Get logged in user balance
 *     tags: [User]
 *     security:
 *       - bearerAuth: [JWT]
 *     responses:
 *       200:
 *         description: User balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                   description: The balance of the logged-in user
 *                   example: 100.50
 *       401:
 *         $ref: '#/components/responses/UnauthorizedMissingToken'
 *       403:
 *         $ref: '#/components/responses/ForbiddenRevokedToken'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred"
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
 *         description: Top balance users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid count parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid count parameter"
 *       500:
 *         description: Error retrieving users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error getting users."
 *                 error:
 *                   type: string
 *                   example: "Error details here"
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
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User object retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No such user"
 *       500:
 *         description: Error retrieving user from the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error when getting user."
 *                 error:
 *                   type: string
 *                   example: "Error details here"
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
 *                 description: The unique username for the user
 *               password:
 *                 type: string
 *                 description: The password for the user
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *                 description: The profile picture of the user
 *               mail:
 *                 type: string
 *                 description: The email address of the user
 *               admin:
 *                 type: boolean
 *                 description: Flag indicating if the user is an admin (default is false)
 *               balance:
 *                 type: number
 *                 description: The initial balance of the user (default is 0)
 *               border:
 *                 type: string
 *                 description: URL to the user's border image
 *               banner:
 *                 type: string
 *                 description: URL to the user's banner image
 *               cosmetics:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of cosmetics associated with the user
 *               friends:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of user IDs representing the user's friends
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Created user successfully"
 *                 token:
 *                   type: string
 *                   description: JWT token for the authenticated user
 *       400:
 *         description: Bad request due to missing or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provide a username, password, and mail"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error when creating user"
 *                 error:
 *                   type: string
 *                   example: "Error details here"
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
 *                 description: The username of the user trying to log in
 *               password:
 *                 type: string
 *                 description: The password for the user
 *     responses:
 *       200:
 *         description: Login success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for the logged-in user
 *                 user:
 *                   type: object
 *                   description: The user object that contains user information
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The user's unique identifier
 *                     username:
 *                       type: string
 *                       description: The username of the user
 *                     mail:
 *                       type: string
 *                       description: The email address of the user
 *                     balance:
 *                       type: number
 *                       description: The current balance of the user
 *                     profile_picture:
 *                       type: string
 *                       description: The URL of the user's profile picture
 *       403:
 *         description: Invalid username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Wrong username or password"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error during login"
 *                 error:
 *                   type: string
 *                   example: "Error details here"
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message confirming the user has logged out
 *                   example: "Logged out user"
 *                 user_id:
 *                   type: string
 *                   description: The ID of the user who logged out
 *       401:
 *         $ref: '#/components/responses/UnauthorizedMissingToken'
 *       403:
 *         $ref: '#/components/responses/ForbiddenRevokedToken'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error during logout"
 *                 error:
 *                   type: string
 *                   example: "Error details"
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
 *         description: The ID of the user to be added as a friend
 *     responses:
 *       200:
 *         description: Friend added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Friend added successfully"
 *                 updatedUser:
 *                   type: object
 *                   description: The updated user object with the new friend added
 *       401:
 *         $ref: '#/components/responses/UnauthorizedMissingToken'
 *       403:
 *         $ref: '#/components/responses/ForbiddenRevokedToken'
 *       500:
 *         description: Internal server error while adding friend
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error adding friend"
 *                 details:
 *                   type: string
 *                   example: "Error details"
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
 *         description: The ID of the friend to be removed
 *     responses:
 *       200:
 *         description: Friend removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Friend removed successfully"
 *                 updatedUser:
 *                   type: object
 *                   description: The updated user object with the friend removed
 *       401:
 *         $ref: '#/components/responses/UnauthorizedMissingToken'
 *       403:
 *         $ref: '#/components/responses/ForbiddenRevokedToken'
 *       500:
 *         description: Internal server error while removing friend
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error removing friend"
 *                 details:
 *                   type: string
 *                   example: "Error details"
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
