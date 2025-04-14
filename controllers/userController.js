var UserModel = require('../models/userModel.js');
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWTCheck = require('../middleware/JWTCheck.js');
const { trusted } = require('mongoose');

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {

    /**
     * userController.list()
     */
    list: async function (req, res) {
        try{
            var users = await UserModel.find().populate('cosmetics').populate('friends');
            return res.status(200).json(users);
        } catch (err){
            return res.status(500).json({
                message: "Error getting users",
                error: err
            })
        }
    },

    /**
     * userController.show()
     */
    show: async function (req, res) {
        var id = req.params.id;

        try{
            var user = await UserModel.findOne({ _id: id }).populate('cosmetics').populate('friends')

            if (!user) {
                return res.status(404).json({
                        message: 'No such user'
                });
            }

            return res.json(user);
        } catch (err){
            return res.status(500).json({
                message: 'Error when getting user.',
                error: err
            });
        } 
    }, 

    getTopBalance: async function (req, res) {
        var count = req.params.count;
        
        console.log(count);

        try {
            var users = await UserModel.find().sort({balance: -1}).limit(count);

            return res.status(200).json(users);

        } catch (err) {
            return res.status(500).json({
                message: 'Error getting users.',
                error: err
            });
        }
    },

    /**
     * userController.create()
     */
    create: async function (req, res) {
        try {
            if (!req.body.password) {
                return res.status(400).json({
                    message: 'Please provide a username, password and mail',
                });
            }

            // Hash the password
            var password_hash = await bcrypt.hash(req.body.password, 10);

            // Create the user
            var user = new UserModel({
                username: req.body.username,
                password: password_hash,
                picture_path: req.body.picture_path || "../resources/profile_pictures/default.png",
                mail: req.body.mail,
                joined: Date.now(),
                admin: req.body.admin || false,
                balance: req.body.balance || 0,
                cosmetics: req.body.cosmetics || [],
                friends: req.body.friends || []
            });

            // Create JWT token

            const jwt_token = jwt.sign({ user_id: user._id }, process.env.JWT_KEY, { expiresIn: '1h' });

            // Save the user
            await user.save();  // Use await instead of a callback

            // Send success response with the token
            return res.status(201).json({
                message: "Created user successfuly",
                token: jwt_token
            });

        } catch (err) {
            // Handle any errors
            return res.status(500).json({
                message: 'Error when creating user',
                error: err
            });
        }
    },


    login: function (req, res) {
        UserModel.authenticate(req.body.username, req.body.password, function (err, user) {
            if (err || !user) {
                var err = new Error('Wrong username or password');
                err.status = 401;
                return next(err);
            }
            const jwt_token = jwt.sign({ user_id: user._id }, process.env.JWT_KEY, { expiresIn: '1h' });

            res.json({ token: jwt_token, user: user });
        });
    },

    logout: async function (req, res) {
        if (!req.user) {
            return res.status(401).json({
                message: 'Not logged in',
                error: err
            });
        }

        const token = req.headers['authorization'].split(' ')[1];
        JWTCheck.tokenBlacklist.add(token);

        return res.status(200).json({
            message: 'Logged out user',
            user_id: req.user
        });
    },

    addFriend: async function (req, res) {

    },

    removeFriend: async function (req, res) {

    },

    addBalance: async function (req, res) {
        try {
            if(isNaN(req.body.amount) || req.body.amount <= 0){
                return res.status(400).json({
                    message: 'Added balance must be positive'
                })
            }

            var user = await UserModel.findByIdAndUpdate(req.user.user_id, {$inc: {balance: req.body.amount}}, {new: true})

            return res.status(200).json({
                message: 'Success adding balance',
                balance: user.balance
            });
        } 
        catch(err){
            return res.status(500).json({
                message: 'Error adding balance',
                err: err
            });
        }
    },
     
    removeBalance: async function (req, res) {
        try {

            var user = await UserModel.findById(req.user.user_id);

            if(!user){
                return res.status(404).json({
                    message: 'User not found'
                })
            }

            if(isNaN(req.body.amount) || req.body.amount <= 0){
                return res.status(400).json({
                    message: 'Removed balance must be positive'
                })
            }

            user.balance -= req.body.amount;

            if(user.balance < 0){
                return res.status(400).json({
                    message: 'New balance must be positive',
                });
            } else {
                await user.save();
                
                return res.status(200).json({
                    message: 'Success removing balance',
                    balance: user.balance
                });
            }


            return res.status(200).json({
                message: 'Success removing balance',
                balance: user.balance
            });
        } 
        catch(err){
            return res.status(500).json({
                message: 'Error removing balance',
                err: err
            });
        }
    },

    getBalance: async function (req, res) {
        try {
            var user = await UserModel.findById(req.user.user_id);


            if(!user){
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            return res.status(200).json({
                balance: user.balance
            })

        }
        catch (err) {
            return res.status(500).json({
                message: 'Error getting balance',
                err: err
            })
        }
    },

    buyItem: async function (req, res) {

    },


    /**
     * userController.update()
     */
    update: async function (req, res) {
        var id = req.params.id;

        try {
            // Find the user by ID
            const user = await UserModel.findOne({ _id: id });

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            // Update user fields with new data, if provided
            user.username = req.body.username ?? user.username;
            user.password = req.body.password ?? user.password;
            user.picture_path = req.body.picture_path ?? user.picture_path;
            user.mail = req.body.mail ?? user.mail;
            user.date = req.body.date ?? user.date;
            user.admin = req.body.admin ?? user.admin;
            user.balance = req.body.balance ?? user.balance;
            user.cosmetics = req.body.cosmetics ?? user.cosmetics;
            user.friends = req.body.friends ?? user.friends;

            // Save the updated user
            await user.save();

            // Respond with the updated user
            return res.json(user);

        } catch (err) {
            return res.status(500).json({
                message: 'Error when updating user.',
                error: err
            });
        }
    },

    resetPassword: async function (req, res){

    },
    

    /**
     * userController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        UserModel.findByIdAndRemove(id, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the user.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
