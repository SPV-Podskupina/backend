var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cosmeticSchema = new Schema({
	'name': String,
	'type': {
		type: String,
		enum: ['frame', 'banner', 'emote'],
		require: true
	},
	'resource_path': String,
	'value': Number
});

module.exports = mongoose.model('cosmetic', cosmeticSchema);
