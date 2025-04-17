var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: uuid
 *           description: Automatically generated unique ID of the user.
 *         username:
 *           type: string
 *           description: Unique username used for logging in and identifying the user.
 *           example: johndoe
 *         password:
 *           type: string
 *           description: Hashed password for user authentication.
 *           example: $2b$10$...
 *         picture_path:
 *           type: string
 *           description: Path or URL to the user's profile picture.
 *           example: default
 *           default: default
 *         mail:
 *           type: string
 *           format: email
 *           description: User’s email address used for verification and notifications.
 *           example: user@example.com
 *         joined:
 *           type: string
 *           format: date-time
 *           description: Timestamp indicating when the user joined.
 *         admin:
 *           type: boolean
 *           description: Whether the user has administrative privileges.
 *           default: false
 *         balance:
 *           type: number
 *           format: float
 *           description: User's virtual currency balance.
 *           default: 0
 *         border:
 *           type: string
 *           format: uuid
 *           description: ObjectID of the currently equipped border cosmetic.
 *           nullable: true
 *           default: null
 *         banner:
 *           type: string
 *           format: uuid
 *           description: ObjectID of the currently equipped banner cosmetic.
 *           nullable: true
 *           default: null
 *         cosmetics:
 *           type: array
 *           description: Array of ObjectIDs for cosmetics owned by the user.
 *           items:
 *             type: string
 *             format: uuid
 *           default: []
 *         friends:
 *           type: array
 *           description: Array of ObjectIDs referencing other users who are friends.
 *           items:
 *             type: string
 *             format: uuid
 *           default: []
 *       required:
 *         - username
 *         - password
 *         - mail
 */


var userSchema = new Schema({
	'username': String,
	'password': String,
	'picture_path': String,
	'mail': String,
	'joined': Date,
	'admin': Boolean,
	'balance': Number,
	'border': {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'cosmetic'
	},
	'banner': {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'cosmetic'
	},
	'cosmetics': [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'cosmetic'
	}],
	'friends': [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	}]
});

userSchema.statics.authenticate = async function (username, password, callback) {
	try {
		const user = await this.findOne({ username: username });
		if (!user) {
			return callback('User not found', null);
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return callback('Incorrect password', null);
		}
		return callback(null, user);
	} catch (error) {
		return callback(error, null);
	}
};


var User = mongoose.model('user', userSchema);
module.exports = User;