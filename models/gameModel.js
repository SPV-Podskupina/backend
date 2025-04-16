var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
