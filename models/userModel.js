var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
const bcrypt = require('bcrypt');

var userSchema = new Schema({
	'username' : String,
	'password' : String,
	'picture_path' : String,
	'mail' : String,
	'joined' : Date,
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

userSchema.statics.authenticate = async function(username, password, callback) {
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