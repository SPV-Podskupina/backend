const request = require('supertest');
const app = require('../app'); // replace with your actual app file

jest.mock('../middleware/JWTCheck.js', () => ({
    authenticateToken: (req, res, next) => next()
}));

// Mock GameModel
const GameModel = require('../models/gameModel');
jest.mock('../models/gameModel');

function normalizeGame(game) {
    return {
        ...game,
        _id: game._id.toString?.() ?? game._id,
        user_id: game.user_id.toString?.() ?? game.user_id,
        session_start: new Date(game.session_start).toISOString(),
        session_end: new Date(game.session_end).toISOString(),
    };
}


describe('Game API Endpoints', () => {
    const mockGame = {
        _id: '6800d64175637dcc7ead1fd2',
        type: 'roulette',
        user_id: '6800d64175637dcc7ead1fd3',
        session_start: new Date(),
        session_end: new Date(),
        total_bet: 100,
        balance_start: 1000,
        balance_end: 1050,
        rounds_played: 5
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await require('mongoose').connection.close();
    });


    describe('GET /game', () => {
        it('should list all games', async () => {
            GameModel.find.mockResolvedValue([mockGame]);

            const res = await request(app).get('/game');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([normalizeGame(mockGame)]);
        });
    });

    describe('GET /game/:id', () => {
        it('should fetch a game by ID', async () => {
            GameModel.findById.mockResolvedValue(mockGame);

            const res = await request(app).get(`/game/${mockGame._id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body._id).toBe(mockGame._id.toString());
        });
    });

    describe('GET /game/session', () => {
        it('should filter games by session start', async () => {
            GameModel.find.mockResolvedValue([mockGame]);

            const res = await request(app).get('/game/session?start=2023-01-01');
            expect(res.statusCode).toBe(200);
        });
    });

    describe('GET /game/duration', () => {
        it('should filter games by session duration', async () => {
            GameModel.aggregate.mockResolvedValue([mockGame]);

            const res = await request(app).get('/game/duration?min=1&max=60');
            expect(res.statusCode).toBe(200);
        });
    });

    describe('GET /game/type/:type', () => {
        it('should return games by type', async () => {
            GameModel.find.mockResolvedValue([mockGame]);

            const res = await request(app).get('/game/type/roulette');
            expect(res.statusCode).toBe(200);
        });

        it('should return 404 for invalid type', async () => {
            const res = await request(app).get('/game/type/chess');
            expect(res.statusCode).toBe(404);
        });
    });

    describe('GET /game/bet', () => {
        it('should return games by bet range', async () => {
            GameModel.find.mockResolvedValue([mockGame]);

            const res = await request(app).get('/game/bet?min=50&max=200');
            expect(res.statusCode).toBe(200);
        });
    });

    describe('GET /game/winning', () => {
        it('should return games by winnings range', async () => {
            GameModel.aggregate.mockResolvedValue([mockGame]);

            const res = await request(app).get('/game/winning?min=10&max=100');
            expect(res.statusCode).toBe(200);
        });
    });

    describe('GET /game/rounds', () => {
        it('should return games by rounds played', async () => {
            GameModel.find.mockResolvedValue([mockGame]);

            const res = await request(app).get('/game/rounds?min=1&max=10');
            expect(res.statusCode).toBe(200);
        });
    });

    describe('POST /game', () => {
        it('should create a game', async () => {
            GameModel.prototype.save = jest.fn().mockResolvedValue(mockGame);

            const res = await request(app)
                .post('/game')
                .send(mockGame);

            expect(res.statusCode).toBe(201);
            expect(res.body.type).toBe('roulette');
        });
    });

    describe('PUT /game/:id', () => {
        it('should update a game', async () => {
            GameModel.findById.mockResolvedValue({
                ...mockGame,
                save: jest.fn().mockResolvedValue({ ...mockGame, type: 'blackjack' })
            });

            const res = await request(app)
                .put(`/game/${mockGame._id}`)
                .send({ type: 'blackjack' });

            expect(res.statusCode).toBe(200);
            expect(res.body.type).toBe('blackjack');
        });
    });

    describe('DELETE /game/:id', () => {
        it('should delete a game', async () => {
            GameModel.findByIdAndDelete.mockResolvedValue({});

            const res = await request(app).delete(`/game/${mockGame._id}`);
            expect(res.statusCode).toBe(204);
        });
    });
});
