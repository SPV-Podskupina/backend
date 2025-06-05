var UserModel = require('../models/userModel.js');
var CosmeticModel = require('../models/cosmeticModel.js');
const GameModel = require('../models/gameModel.js');
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
            var users = await UserModel.find().populate('cosmetics').populate('friends').populate('banner').populate('border');
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

        if(!id){
            return res.status(400).json({
                message: 'Please provide a user id'
            });
        }

        try{
            var user = await UserModel.findOne({ _id: id }).populate('cosmetics').populate('friends').populate('banner').populate('border');

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

    me: async function (req, res) {

        if (!req.user) {
            return res.status(401).json({
                message: 'Not logged in'
            });
        }

        try {
            var user = await UserModel.findById(req.user.user_id).populate('cosmetics').populate('friends').populate('banner').populate('border');

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }
            return res.json(user);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting user.',
                error: err
            });
        }
    },

    stats: async function (req, res) {
        if (!req.user) {
            return res.status(401).json({
                message: 'Not logged in'
            });
        }

        try {
            const userId = req.user.user_id;
            
            const games = await GameModel.find({ user_id: userId });
            
            const gamesPlayed = games.length;
            
            let totalEarnings = 0;
            let wins = 0;
            
            games.forEach(game => {
                const profit = game.balance_end - game.balance_start;
                totalEarnings += profit;
                
                if (game.balance_end > game.balance_start) {
                    wins++;
                }
            });
            
            const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) : 0;
            
            return res.status(200).json({
                gamesPlayed,
                wins,
                totalEarnings,
                winRate
            });
        } catch (err) {
            return res.status(500).json({
                message: 'Error getting user statistics',
                error: err
            });
        }
    },

    getGames: async function (req, res) {
        if (!req.user) {
            return res.status(401).json({
                message: 'Not logged in'
            });
        }

        var count = req.params.count || 3;

        try {
            var games = await GameModel.find({user_id: req.user.user_id}).sort({session_start: -1}).limit(count).populate('user_id');

            if (!games) {
                return res.status(404).json({
                    message: 'No such game'
                });
            }

            return res.json(games);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting games.',
                error: err
            });
        }
    },

    getTopBalance: async function (req, res) {
        var count = req.params.count || 10;

        console.log(count);

        try {
            var users = await UserModel.find().sort({balance: -1}).limit(count).populate('cosmetics').populate('friends').populate('banner').populate('border');

            return res.status(200).json(users);

        } catch (err) {
            return res.status(500).json({
                message: 'Error getting users.',
                error: err
            });
        }
    },

    
    getTopGames: async function (req, res) {
        var count = parseInt(req.params.count) || 10;
        
        try {
            if (isNaN(count) || count <= 0) {
                return res.status(400).json({
                    message: 'Invalid count parameter'
                });
            }
            
            const gameStats = await GameModel.aggregate([
                { $group: { 
                    _id: "$user_id", 
                    gamesPlayed: { $sum: 1 }
                }},
                { $sort: { gamesPlayed: -1 }},
                { $limit: count }
            ]);

            console.log(gameStats);
            const filteredGameStats = gameStats.filter(stat =>
                stat._id && typeof stat._id.equals === 'function' && !stat._id.equals(null)
            );

            
            const userIds = gameStats.map(stat => stat._id);
            const users = await UserModel.find({
                _id: { $in: userIds }
            }).populate('cosmetics').populate('friends').populate('banner').populate('border');
            
            const result = users.map(user => {
                const stats = gameStats.find(stat => stat._id.equals(user._id));
                return {
                    ...user.toObject(),
                    gamesPlayed: stats ? stats.gamesPlayed : 0
                };
            });
            
            result.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
            
            return res.status(200).json(result);
        } catch (err) {
            return res.status(500).json({
                message: 'Error getting top games users',
                error: err
            });
        }
    },

    getTopWins: async function (req, res) {
        var count = parseInt(req.params.count) || 10;
        
        try {
            if (isNaN(count) || count <= 0) {
                return res.status(400).json({
                    message: 'Invalid count parameter'
                });
            }
            
            const winStats = await GameModel.aggregate([
                { $match: { $expr: { $gt: ["$balance_end", "$balance_start"] } } },
                { $group: { 
                    _id: "$user_id", 
                    winsCount: { $sum: 1 }
                }},
                { $sort: { winsCount: -1 }},
                { $limit: count }
            ]);

            const filteredWinStats = winStats.filter(stat => 
                stat._id && typeof stat._id.equals === 'function' && !stat._id.equals(null)
            );
            
            const userIds = filteredWinStats.map(stat => stat._id);
            const users = await UserModel.find({
                _id: { $in: userIds }
            }).populate('cosmetics').populate('friends').populate('banner').populate('border');
            
            const result = users.map(user => {
                const stats = filteredWinStats.find(stat => stat._id.equals(user._id));
                return {
                    ...user.toObject(),
                    winsCount: stats ? stats.winsCount : 0
                };
            });
            
            result.sort((a, b) => b.winsCount - a.winsCount);
            
            return res.status(200).json(result);
        } catch (err) {
            return res.status(500).json({
                message: 'Error getting top winners',
                error: err
            });
        }
    },

    getTopWinrate: async function (req, res) {
        var count = parseInt(req.params.count) || 10;
        var minGames = parseInt(req.query.minGames) || 1; 
        
        try {
            if (isNaN(count) || count <= 0) {
                return res.status(400).json({
                    message: 'Invalid count parameter'
                });
            }
            
            if (isNaN(minGames) || minGames < 0) {
                return res.status(400).json({
                    message: 'Invalid minimum games parameter'
                });
            }
            
            const winRateStats = await GameModel.aggregate([
                { $group: { 
                    _id: "$user_id",
                    totalGames: { $sum: 1 },
                    wins: { 
                        $sum: { 
                            $cond: [
                                { $gt: ["$balance_end", "$balance_start"] },
                                1,
                                0
                            ]
                        } 
                    }
                }},
                { $addFields: {
                    winRate: { 
                        $cond: [
                            { $eq: ["$totalGames", 0] },
                            0,
                            { $divide: ["$wins", "$totalGames"] }
                        ]
                    }
                }},
                { $match: { totalGames: { $gte: minGames } } },
                { $sort: { winRate: -1 }},
                { $limit: count }
            ]);

            const filteredWinRateStats = winRateStats.filter(stat => 
                stat._id && typeof stat._id.equals === 'function' && !stat._id.equals(null)
            );
            
            const userIds = filteredWinRateStats.map(stat => stat._id);
            const users = await UserModel.find({
                _id: { $in: userIds }
            }).populate('cosmetics').populate('friends').populate('banner').populate('border');

            const result = users.map(user => {
                const stats = filteredWinRateStats.find(stat => stat._id.equals(user._id));
                return {
                    ...user.toObject(),
                    totalGames: stats ? stats.totalGames : 0,
                    wins: stats ? stats.wins : 0,
                    winRate: stats ? stats.winRate : 0
                };
            });

            
            result.sort((a, b) => b.winRate - a.winRate);
            
            return res.status(200).json(result);
        } catch (err) {
            return res.status(500).json({
                message: 'Error getting users with top win rates',
                error: err
            });
        }
    },

    /**
     * userController.create()
     */
    create: async function (req, res) {
        try {
            if (!req.body.password || !req.body.username || !req.body.mail) {
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
                picture_path: req.body.picture_path || "default", 
                mail: req.body.mail,
                joined: Date.now(),
                admin: req.body.admin || false,
                balance: req.body.balance || 0,
                border: req.body.border || null,
                banner: req.body.banner || null,
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

        if (!req.body.username || !req.body.password) {
            return res.status(400).json({
                message: 'Please provide a username and password'
            });
        }

        try{
            UserModel.authenticate(req.body.username, req.body.password, function (err, user) {
                if (err || !user) {
                    return res.status(403).json({
                        message: 'Wrong username or password'
                    });
                }
                const jwt_token = jwt.sign({ user_id: user._id }, process.env.JWT_KEY, { expiresIn: '1h' });

                res.json({ token: jwt_token, user: user });
            });
        } catch (err) {
            return res.status(500).json({
                message: 'Error when logging in',
                error: err
            });
        };

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
        const user_id = req.user.user_id;             
        const friend_id = req.params.id;

        if(!friend_id){
            return res.status(400).json({
                message: 'Please provide a friend id'
            });
        }

        if(user_id == friend_id){
            return res.status(400).json({
                message: 'You cannot add yourself as a friend'
            });
        }

        try {
            UserModel.findByIdAndUpdate(
            user_id,
            { $addToSet: { friends: friend_id } },       
            { new: true }                          
            ).then(updatedUser => {
            res.json(updatedUser);
            }).catch(err => {
            res.status(500).json({ error: 'Error adding friend', details: err });
            });
        }catch (err) {
            return res.status(500).json({
                message: 'Error adding friend',
                error: err
            });
        }
    },

    removeFriend: async function (req, res) {
        const user_id = req.user.user_id;             
        const friend_id = req.params.id;      
        
        if(!friend_id){
            return res.status(400).json({
                message: 'Please provide a friend id'
            });
        }

        if(user_id == friend_id){
            return res.status(400).json({
                message: 'You cannot remove yourself as a friend'
            });
        }
        
        try {
            UserModel.findByIdAndUpdate(
            user_id,
            { $pull: { friends: friend_id } },       
            { new: true }                          
            ).then(updatedUser => {
            res.json(updatedUser);
            }).catch(err => {
            res.status(500).json({ error: 'Error adding friend', details: err });
            });
        }
        catch (err) {
            return res.status(500).json({
                message: 'Error removing friend',
                error: err
            });
        }
    },

    addBalance: async function (req, res) {

        if(!req.body.amount){
            return res.status(400).json({
                message: 'Please provide an amount'
            });
        }


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
        } catch(err){
            return res.status(500).json({
                message: 'Error adding balance',
                err: err
            });
        }
    },
     
    removeBalance: async function (req, res) {

        if(!req.body.amount){
            return res.status(400).json({
                message: 'Please provide an amount'
            });
        }

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
        } catch(err){
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

        } catch (err) {
            return res.status(500).json({
                message: 'Error getting balance',
                err: err
            })
        }
    },

    buyItem: async function (req, res) {
        if(!req.body.item_id){
            return res.status(400).json({
                message: 'Please provide an item id'
            });
        }

        try {
            var user = await UserModel.findById(req.user.user_id);

            var item = await CosmeticModel.findById(req.body.item_id);

            if(!user){
                return res.status(404).json({
                    message: 'User not found'
                })
            }

            if(!item){
                return res.status(404).json({
                    message: 'Item not found'
                })
            }

            if(user.cosmetics.includes(req.body.item_id)){
                return res.status(400).json({
                    message: 'User already owns this item'
                })
            }

            if(user.balance < item.value){
                return res.status(400).json({
                    message: 'Not enough balance'
                })
            } else {
                user.balance -= item.value;
                user.cosmetics.push(req.body.item_id);
                await user.save();

                return res.status(200).json({
                    message: 'Success buying item',
                    balance: user.balance
                });
            }
        } catch (err) {
            return res.status(500).json({
                message: 'Error buying item',
                err: err
            })
        }
    },

    equipBorder: async function (req, res) {
        if(!req.body.item_id){
            return res.status(400).json({
                message: 'Please provide a border id'
            });
        }

        try {
            var user = await UserModel.findById(req.user.user_id);

            var item = await CosmeticModel.findById(req.body.item_id);

            if(!item){
                return res.status(404).json({
                    message: 'Item not found'
                })
            }

            if(item.type != 'frame'){
                return res.status(400).json({
                    message: 'Item is not a border'
                })
            }

            if(!user){
                return res.status(404).json({
                    message: 'User not found'
                })
            } else {
                if(!user.cosmetics.includes(req.body.item_id)){
                    return res.status(400).json({
                        message: 'User does not own this border'
                    })
                }

                user.border = req.body.item_id;
                await user.save();

                return res.status(200).json({
                    message: 'Success equipping border',
                    border: user.border
                });
            }
        } catch (err) {
            return res.status(500).json({
                message: 'Error equipping border',
                err: err
            })
        }

    },

    equipBanner: async function (req, res) {
        if(!req.body.item_id){
            return res.status(400).json({
                message: 'Please provide a banner id'
            });
        }

        try {
            var user = await UserModel.findById(req.user.user_id);

            var item = await CosmeticModel.findById(req.body.item_id);

            if(!item){
                return res.status(404).json({
                    message: 'Item not found'
                })
            }
            if(item.type != 'banner'){
                return res.status(400).json({
                    message: 'Item is not a banner'
                })
            }

            if(!user){
                return res.status(404).json({
                    message: 'User not found'
                })
            } else {
                if(!user.cosmetics.includes(req.body.item_id)){
                    return res.status(400).json({
                        message: 'User does not own this banner'
                    })
                }

                user.banner = req.body.item_id;
                await user.save();

                return res.status(200).json({
                    message: 'Success equipping banner',
                    banner: user.banner
                });
            }
        } catch (err) {
            return res.status(500).json({
                message: 'Error equipping banner',
                err: err
            })
        }

    },

    /**
     * userController.update()
     */
    update: async function (req, res) {
        var id = req.params.id;

        if (!id) {
            return res.status(400).json({
                message: 'Please provide a user id'
            });
        }

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
            user.picture_path = req.file.filename ?? user.picture_path;
            user.mail = req.body.mail ?? user.mail;
            user.date = req.body.date ?? user.date;
            user.admin = req.body.admin ?? user.admin;
            user.balance = req.body.balance ?? user.balance;
            user.banner = req.body.banner ?? user.banner;
            user.border = req.body.border ?? user.border;
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

        if (!req.body.old_password || !req.body.new_password) {
            return res.status(400).json({
                message: 'Please provide a old and new password'
            });
        }

        try {
            var user = await UserModel.findById(req.user.user_id);

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            const isMatch = await bcrypt.compare(req.body.old_password, user.password);

            if(!isMatch){
                return res.status(403).json({
                    message: "Mismatched passwords."
                });
            } else {
                user.password = await bcrypt.hash(req.body.new_password, 10);

                await user.save()

                return res.status(200).json({
                    message: 'Success updating password'
                })
            }

        } catch (err) {
            return res.status(500).json({
                message: 'Error when changing password'
            })
        }
    },
    

    /**
     * userController.remove()
     */
    remove: async function (req, res) {

        if (!req.params.id) {
            return res.status(400).json({
                message: 'Please provide a user id'
            });
        }
    

        try{
            var id = req.params.id;

            await UserModel.findByIdAndDelete(id);

            return res.status(200).json({
                message: 'Success deleting user'
            });
        } catch (err){
            return res.status(500).json({
                message: 'Error deleting user'
            })
        }

    }
};
