const request = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt');

// Mock JWT middleware
jest.mock('../middleware/JWTCheck.js', () => ({
    authenticateToken: (req, res, next) => {
        req.user = { user_id: 'test-user-id' };
        next();
    },
    tokenBlacklist: {
        add: jest.fn()
    }
}));

// Mock uniqueUsernameCheck middleware
jest.mock('../middleware/uniqueUsernameCheck.js', () => (req, res, next) => next());

// Mock UserModel
const UserModel = require('../models/userModel.js');
jest.mock('../models/userModel.js');

// Mock GameModel for tests that use it
const GameModel = require('../models/gameModel.js');
jest.mock('../models/gameModel.js');

// Mock CosmeticModel
const CosmeticModel = require('../models/cosmeticModel.js');
jest.mock('../models/cosmeticModel.js');

// Mock multer middleware
jest.mock('multer', () => {
    const multer = () => ({
        single: () => (req, res, next) => {
            req.file = {
                filename: 'test-profile-picture.jpg'
            };
            next();
        }
    });
    multer.diskStorage = jest.fn();
    return multer;
});

describe('User API Endpoints', () => {
    const mockUser = {
        _id: 'test-user-id',
        username: 'testuser',
        password: 'hashedpassword123',
        picture_path: 'default',
        mail: 'test@example.com',
        joined: new Date(),
        admin: false,
        balance: 1000,
        border: null,
        banner: null,
        cosmetics: [],
        friends: [],
        toObject: function() { return this; },
        save: jest.fn().mockResolvedValue(this)
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /user', () => {
        it('should return all users', async () => {
            UserModel.find.mockImplementation(() => ({
                populate: jest.fn().mockImplementation(() => ({
                    populate: jest.fn().mockImplementation(() => ({
                        populate: jest.fn().mockImplementation(() => ({
                            populate: jest.fn().mockResolvedValue([mockUser])
                        }))
                    }))
                }))
            }));

            const res = await request(app).get('/user');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0].username).toBe(mockUser.username);
        });

        it('should handle errors', async () => {
            UserModel.find.mockImplementation(() => {
                throw new Error('Database error');
            });

            const res = await request(app).get('/user');
            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Error getting users');
        });
    });

    describe('GET /user/me', () => {
        it('should return the authenticated user', async () => {
            UserModel.findById.mockImplementation(() => ({
                populate: jest.fn().mockImplementation(() => ({
                    populate: jest.fn().mockImplementation(() => ({
                        populate: jest.fn().mockImplementation(() => ({
                            populate: jest.fn().mockResolvedValue(mockUser)
                        }))
                    }))
                }))
            }));

            const res = await request(app).get('/user/me');
            expect(res.statusCode).toBe(200);
            expect(res.body.username).toBe(mockUser.username);
        });

        it('should return 404 if user not found', async () => {
            UserModel.findById.mockImplementation(() => ({
                populate: jest.fn().mockImplementation(() => ({
                    populate: jest.fn().mockImplementation(() => ({
                        populate: jest.fn().mockImplementation(() => ({
                            populate: jest.fn().mockResolvedValue(null)
                        }))
                    }))
                }))
            }));

            const res = await request(app).get('/user/me');
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('No such user');
        });
    });

    describe('GET /user/stats', () => {
        it('should return user statistics', async () => {
            // These mock games match the gameModel schema with proper fields
            const mockGames = [
                { 
                    type: 'roulette',
                    user_id: 'test-user-id',
                    session_start: new Date(),
                    session_end: new Date(),
                    total_bet: 50,
                    balance_start: 100, 
                    balance_end: 150,
                    rounds_played: 5
                },
                { 
                    type: 'blackjack',
                    user_id: 'test-user-id',
                    session_start: new Date(),
                    session_end: new Date(),
                    total_bet: 20,
                    balance_start: 150, 
                    balance_end: 140,
                    rounds_played: 3
                }
            ];
            
            GameModel.find.mockResolvedValue(mockGames);

            const res = await request(app).get('/user/stats');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('gamesPlayed', 2);
            expect(res.body).toHaveProperty('wins', 1);
            expect(res.body).toHaveProperty('totalEarnings', 40); // +50 - 10 = 40
            expect(res.body).toHaveProperty('winRate', 0.5);
        });

        it('should handle no games played', async () => {
            GameModel.find.mockResolvedValue([]);

            const res = await request(app).get('/user/stats');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('gamesPlayed', 0);
            expect(res.body).toHaveProperty('wins', 0);
            expect(res.body).toHaveProperty('totalEarnings', 0);
            expect(res.body).toHaveProperty('winRate', 0);
        });
    });

    describe('GET /user/games/:count', () => {
        it('should return user games with specified count', async () => {
            const mockGames = [
                { 
                    _id: 'game1', 
                    type: 'roulette',
                    user_id: { _id: 'user1', username: 'testuser' },
                    session_start: new Date(),
                    session_end: new Date(),
                    total_bet: 100,
                    balance_start: 500,
                    balance_end: 600,
                    rounds_played: 10
                },
                { 
                    _id: 'game2', 
                    type: 'blackjack',
                    user_id: { _id: 'user1', username: 'testuser' },
                    session_start: new Date(),
                    session_end: new Date(),
                    total_bet: 50,
                    balance_start: 600,
                    balance_end: 550,
                    rounds_played: 5
                }
            ];
            
            GameModel.find.mockImplementation(() => ({
                sort: jest.fn().mockImplementation(() => ({
                    limit: jest.fn().mockImplementation(() => ({
                        populate: jest.fn().mockResolvedValue(mockGames)
                    }))
                }))
            }));

            const res = await request(app).get('/user/games/2');
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0]._id).toBe('game1');
            expect(res.body[0].type).toBe('roulette');
        });

        it('should handle invalid count parameter', async () => {
            const res = await request(app).get('/user/games/invalid');
            expect(res.statusCode).toBe(400);
            // Assuming your controller validates the count parameter
        });
    });

    describe('GET /user/get_top_balance/:count', () => {
        it('should return users sorted by balance', async () => {
            const mockUsers = [
                { _id: 'user1', username: 'rich', balance: 2000 },
                { _id: 'user2', username: 'wealthy', balance: 1500 }
            ];
            
            UserModel.find.mockImplementation(() => ({
                sort: jest.fn().mockImplementation(() => ({
                    limit: jest.fn().mockImplementation(() => ({
                        populate: jest.fn().mockImplementation(() => ({
                            populate: jest.fn().mockImplementation(() => ({
                                populate: jest.fn().mockImplementation(() => ({
                                    populate: jest.fn().mockResolvedValue(mockUsers)
                                }))
                            }))
                        }))
                    }))
                }))
            }));

            const res = await request(app).get('/user/get_top_balance/2');
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].username).toBe('rich');
        });
    });

    describe('GET /user/get_top_games/:count', () => {
        it('should return users with most games played', async () => {
            const mockStats = [
                { _id: 'user1', gamesPlayed: 50 },
                { _id: 'user2', gamesPlayed: 30 }
            ];
            
            // Mock the aggregate pipeline for counting games played
            GameModel.aggregate.mockResolvedValue(mockStats);
            
            UserModel.find.mockImplementation(() => ({
                populate: jest.fn().mockImplementation(() => ({
                    populate: jest.fn().mockImplementation(() => ({
                        populate: jest.fn().mockImplementation(() => ({
                            populate: jest.fn().mockResolvedValue([
                                { 
                                    _id: 'user1', 
                                    username: 'gamer1', 
                                    toObject: () => ({ _id: 'user1', username: 'gamer1' }) 
                                },
                                { 
                                    _id: 'user2', 
                                    username: 'gamer2', 
                                    toObject: () => ({ _id: 'user2', username: 'gamer2' }) 
                                }
                            ])
                        }))
                    }))
                }))
            }));

            const res = await request(app).get('/user/get_top_games/2');
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0]).toHaveProperty('gamesPlayed');
            expect(res.body[0].gamesPlayed).toBe(50);
            
            // Verify the aggregate function was called correctly
            expect(GameModel.aggregate).toHaveBeenCalledWith([
                { $group: { 
                    _id: "$user_id", 
                    gamesPlayed: { $sum: 1 }
                }},
                { $sort: { gamesPlayed: -1 }},
                { $limit: 2 }
            ]);
        });

        it('should return 400 for invalid count', async () => {
            const res = await request(app).get('/user/get_top_games/invalid');
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid count parameter');
        });
    });

    describe('GET /user/get_top_wins/:count', () => {
        it('should return users with most wins', async () => {
            // This better matches the structure in userController.getTopWins
            const mockWinStats = [
                { _id: 'user1', winsCount: 20 },
                { _id: 'user2', winsCount: 15 }
            ];
            
            // Mock the aggregate pipeline that counts wins based on balance_end > balance_start
            GameModel.aggregate.mockResolvedValue(mockWinStats);
            
            UserModel.find.mockImplementation(() => ({
                populate: jest.fn().mockImplementation(() => ({
                    populate: jest.fn().mockImplementation(() => ({
                        populate: jest.fn().mockImplementation(() => ({
                            populate: jest.fn().mockResolvedValue([
                                { 
                                    _id: 'user1', 
                                    username: 'winner1', 
                                    toObject: () => ({ _id: 'user1', username: 'winner1' }) 
                                },
                                { 
                                    _id: 'user2', 
                                    username: 'winner2', 
                                    toObject: () => ({ _id: 'user2', username: 'winner2' }) 
                                }
                            ])
                        }))
                    }))
                }))
            }));

            const res = await request(app).get('/user/get_top_wins/2');
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0]).toHaveProperty('winsCount');
            
            // Verify the aggregate function was called with the right parameters
            expect(GameModel.aggregate).toHaveBeenCalledWith([
                { $match: { $expr: { $gt: ["$balance_end", "$balance_start"] } } },
                { $group: { 
                    _id: "$user_id", 
                    winsCount: { $sum: 1 }
                }},
                { $sort: { winsCount: -1 }},
                { $limit: 2 }
            ]);
        });

        it('should return 400 for invalid count', async () => {
            const res = await request(app).get('/user/get_top_wins/invalid');
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid count parameter');
        });
    });

    describe('GET /user/get_top_winrate/:count', () => {
        it('should return users with best win rates', async () => {
            const mockWinrateStats = [
                { _id: 'user1', totalGames: 40, wins: 30, winRate: 0.75 },
                { _id: 'user2', totalGames: 20, wins: 10, winRate: 0.5 }
            ];
            
            // Mock the aggregate pipeline for calculating win rates
            GameModel.aggregate.mockResolvedValue(mockWinrateStats);
            
            UserModel.find.mockImplementation(() => ({
                populate: jest.fn().mockImplementation(() => ({
                    populate: jest.fn().mockImplementation(() => ({
                        populate: jest.fn().mockImplementation(() => ({
                            populate: jest.fn().mockResolvedValue([
                                { 
                                    _id: 'user1', 
                                    username: 'pro1', 
                                    toObject: () => ({ _id: 'user1', username: 'pro1' }) 
                                },
                                { 
                                    _id: 'user2', 
                                    username: 'pro2', 
                                    toObject: () => ({ _id: 'user2', username: 'pro2' }) 
                                }
                            ])
                        }))
                    }))
                }))
            }));

            const res = await request(app).get('/user/get_top_winrate/2?minGames=5');
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0]).toHaveProperty('winRate', 0.75);
            expect(res.body[1]).toHaveProperty('winRate', 0.5);
            
            // Verify aggregate pipeline parameters
            expect(GameModel.aggregate).toHaveBeenCalledWith(expect.arrayContaining([
                { $group: expect.any(Object) },
                { $addFields: expect.any(Object) },
                { $match: { totalGames: { $gte: 5 } } },
                { $sort: { winRate: -1 } },
                { $limit: 2 }
            ]));
        });

        it('should return 400 for invalid count or minimum games', async () => {
            const res = await request(app).get('/user/get_top_winrate/invalid');
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid count parameter');
        });
    });

    describe('GET /user/:id', () => {
        it('should return a user by ID', async () => {
            UserModel.findOne.mockImplementation(() => ({
                populate: jest.fn().mockImplementation(() => ({
                    populate: jest.fn().mockImplementation(() => ({
                        populate: jest.fn().mockImplementation(() => ({
                            populate: jest.fn().mockResolvedValue(mockUser)
                        }))
                    }))
                }))
            }));

            const res = await request(app).get('/user/test-user-id');
            expect(res.statusCode).toBe(200);
            expect(res.body.username).toBe(mockUser.username);
        });

        it('should return 404 if user not found', async () => {
            UserModel.findOne.mockImplementation(() => ({
                populate: jest.fn().mockImplementation(() => ({
                    populate: jest.fn().mockImplementation(() => ({
                        populate: jest.fn().mockImplementation(() => ({
                            populate: jest.fn().mockResolvedValue(null)
                        }))
                    }))
                }))
            }));

            const res = await request(app).get('/user/nonexistent-id');
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('No such user');
        });
    });

    describe('POST /user/register', () => {
        const newUser = {
            username: 'newuser',
            password: 'password123',
            mail: 'new@example.com'
        };

        beforeEach(() => {
            // Mock bcrypt.hash for password hashing
            bcrypt.hash = jest.fn().mockResolvedValue('hashed_password');
            
            // Mock the JWT sign function
            process.env.JWT_KEY = 'test_jwt_key';
            require('jsonwebtoken').sign = jest.fn().mockReturnValue('test_token');
            
            // Mock UserModel constructor and save
            UserModel.mockImplementation(() => ({
                _id: 'new-user-id',
                ...newUser,
                password: 'hashed_password',
                save: jest.fn().mockResolvedValue(true)
            }));
        });

        it('should create a new user and return token', async () => {
            const res = await request(app)
                .post('/user/register')
                .send(newUser);
            
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('message', 'Created user successfuly');
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/user/register')
                .send({ username: 'incomplete' });
            
            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /user/login', () => {
        beforeEach(() => {
            UserModel.authenticate = jest.fn();
            require('jsonwebtoken').sign = jest.fn().mockReturnValue('test_token');
        });

        it('should log in a user and return token', async () => {
            UserModel.authenticate.mockImplementation((username, password, callback) => {
                callback(null, { _id: 'auth-user-id', username: 'authuser' });
            });

            const res = await request(app)
                .post('/user/login')
                .send({ username: 'authuser', password: 'password123' });
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token', 'test_token');
            expect(res.body).toHaveProperty('user');
        });

        it('should return 403 for invalid credentials', async () => {
            UserModel.authenticate.mockImplementation((username, password, callback) => {
                callback('Wrong username or password', null);
            });

            const res = await request(app)
                .post('/user/login')
                .send({ username: 'wrong', password: 'invalid' });
            
            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe('Wrong username or password');
        });
    });

    describe('POST /user/logout', () => {
        it('should log out a user and blacklist token', async () => {
            const res = await request(app)
                .post('/user/logout')
                .set('Authorization', 'Bearer test-token');
            
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Logged out user');
            expect(require('../middleware/JWTCheck.js').tokenBlacklist.add).toHaveBeenCalledWith('test-token');
        });
    });

    describe('POST /user/add_balance', () => {
        it('should add balance to user account', async () => {
            UserModel.findByIdAndUpdate.mockResolvedValue({
                balance: 1200
            });

            const res = await request(app)
                .post('/user/add_balance')
                .send({ amount: 200 });
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('balance', 1200);
        });

        it('should return 400 for invalid amount', async () => {
            const res = await request(app)
                .post('/user/add_balance')
                .send({ amount: -50 });
            
            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /user/remove_balance', () => {
        it('should remove balance from user account', async () => {
            UserModel.findById.mockResolvedValue({
                balance: 1000,
                save: jest.fn().mockResolvedValue({ balance: 800 })
            });

            const res = await request(app)
                .post('/user/remove_balance')
                .send({ amount: 200 });
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('balance', 800);
        });

        it('should prevent negative balance', async () => {
            UserModel.findById.mockResolvedValue({
                balance: 100,
                save: jest.fn()
            });

            const res = await request(app)
                .post('/user/remove_balance')
                .send({ amount: 200 });
            
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('New balance must be positive');
        });
    });

    describe('POST /user/buy_item', () => {
        it('should allow user to buy an item', async () => {
            // Setup mocks
            UserModel.findById.mockResolvedValue({
                _id: 'test-user-id',
                balance: 500,
                cosmetics: [],
                save: jest.fn().mockResolvedValue({
                    balance: 300,
                    cosmetics: ['item-123']
                })
            });
            
            CosmeticModel.findById.mockResolvedValue({
                _id: 'item-123',
                name: 'Golden Frame',
                value: 200
            });

            const res = await request(app)
                .post('/user/buy_item')
                .send({ item_id: 'item-123' });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Success buying item');
            expect(res.body.balance).toBe(300);
        });

        it('should prevent purchase if insufficient balance', async () => {
            UserModel.findById.mockResolvedValue({
                balance: 100,
                cosmetics: []
            });
            
            CosmeticModel.findById.mockResolvedValue({
                _id: 'expensive-item',
                value: 500
            });

            const res = await request(app)
                .post('/user/buy_item')
                .send({ item_id: 'expensive-item' });
            
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Not enough balance');
        });
    });

    describe('PUT /user/reset_password', () => {
        beforeEach(() => {
            bcrypt.compare = jest.fn();
            bcrypt.hash = jest.fn();
        });

        it('should reset password when old password matches', async () => {
            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('new_hashed_password');
            
            UserModel.findById.mockResolvedValue({
                password: 'old_hashed_password',
                save: jest.fn().mockResolvedValue(true)
            });

            const res = await request(app)
                .put('/user/reset_password')
                .send({
                    old_password: 'old_password',
                    new_password: 'new_password'
                });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Success updating password');
        });

        it('should reject password reset when old password does not match', async () => {
            bcrypt.compare.mockResolvedValue(false);
            
            UserModel.findById.mockResolvedValue({
                password: 'old_hashed_password'
            });

            const res = await request(app)
                .put('/user/reset_password')
                .send({
                    old_password: 'wrong_password',
                    new_password: 'new_password'
                });
            
            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe('Mismatched passwords.');
        });
    });

    describe('DELETE /user/:id', () => {
        it('should delete a user', async () => {
            UserModel.findByIdAndDelete.mockResolvedValue({});

            const res = await request(app)
                .delete('/user/test-user-id');
            
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Success deleting user');
        });
    });
});