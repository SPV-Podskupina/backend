var UserModel = require('../models/userModel.js');

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {

    /**
     * userController.list()
     */
    list: function (req, res) {
        UserModel.find()
            .populate('cosmetics')
            .populate('friends')
            .exec(function (err, users) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting users.',
                        error: err
                    });
                }

                return res.json(users);
            });
    },

    /**
     * userController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({ _id: id })
            .populate('cosmetics')
            .populate('friends')
            .exec(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting user.',
                        error: err
                    });
                }

                if (!user) {
                    return res.status(404).json({
                        message: 'No such user'
                    });
                }

                return res.json(user);
            });
    },

    /**
     * userController.create()
     */
    create: function (req, res) {
        var user = new UserModel({
            username: req.body.username,
            password: req.body.password,
            picture_path: req.body.picture_path,
            mail: req.body.mail,
            admin: req.body.admin || false,
            balance: req.body.balance || 0,
            cosmetics: req.body.cosmetics || [],
            friends: req.body.friends || []
        });

        user.save(function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating user',
                    error: err
                });
            }

            return res.status(201).json(user);
        });
    },

    /**
     * userController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({ _id: id }, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            user.username = req.body.username ?? user.username;
            user.password = req.body.password ?? user.password;
            user.picture_path = req.body.picture_path ?? user.picture_path;
            user.mail = req.body.mail ?? user.mail;
            user.admin = req.body.admin ?? user.admin;
            user.balance = req.body.balance ?? user.balance;
            user.cosmetics = req.body.cosmetics ?? user.cosmetics;
            user.friends = req.body.friends ?? user.friends;

            user.save(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating user.',
                        error: err
                    });
                }

                return res.json(user);
            });
        });
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
