var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var userSchema = new Schema({
	'username' : String,
	'password' : String,
	'picture_path' : String,
	'mail' : String,
	'admin' : Boolean,
	'balance' : Number,
	'cosmetics' : [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'cosmetic'
	}],
	'friends' : [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	}]
});

module.exports = mongoose.model('user', userSchema);
