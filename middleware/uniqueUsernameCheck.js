var UserModel = require('../models/userModel');

async function checkUsername(req, res, next){
    var existingUser = await UserModel.findOne({username: req.body.username});

    if(existingUser) {
    return res.status(409).json({
        message: 'Username already taken',
        username: existingUser.username
        });
    }

    next();
}

module.exports = checkUsername;