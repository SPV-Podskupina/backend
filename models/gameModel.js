var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     Game:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         _id:
 *           type: string
 *         type:
 *           type: string
 *           enum: [plinko, roulette, blackjack]
 *         user_id:
 *           type: string
 *         session_start:
 *           type: string
 *           format: date-time
 *         session_end:
 *           type: string
 *           format: date-time
 *         total_bet:
 *           type: number
 *         balance_start:
 *           type: number
 *         balance_end:
 *           type: number
 *         rounds_played:
 *           type: number
 */
var gameSchema = new Schema({
	'type': {
		type: String,
		enum: ['plinko', 'roulette', 'blackjack'],
		required: true
	},
	'user_id': {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	'session_start': Date,
	'session_end': Date,
	'total_bet': Number,
	'balance_start': Number,
	'balance_end': Number,
	'rounds_played': Number
});

module.exports = mongoose.model('game', gameSchema);
