const request = require('supertest');
const app = require('../app');

jest.mock('../middleware/JWTCheck.js', () => ({
    authenticateToken: (req, res, next) => next()
}));

const CosmeticModel = require('../models/cosmeticModel');
jest.mock('../models/cosmeticModel');

describe('Cosmetic API Endpoints', () => {
    const mockCosmetic = {
        name: 'Golden Frame',
        type: 'frame',
        resource_path: '/images/golden.png',
        value: 100
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /cosmetic', () => {
        it('should return all cosmetics', async () => {
            CosmeticModel.find.mockResolvedValue([mockCosmetic]);

            const res = await request(app).get('/cosmetic');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([mockCosmetic]);
        });
    });

    describe('GET /cosmetic/:id', () => {
        it('should return a cosmetic by ID', async () => {
            CosmeticModel.findById.mockResolvedValue(mockCosmetic);

            const res = await request(app).get(`/cosmetic/${mockCosmetic._id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockCosmetic);
        });

        it('should return 404 if not found', async () => {
            CosmeticModel.findById.mockResolvedValue(null);

            const res = await request(app).get(`/cosmetic/invalid-id`);
            expect(res.statusCode).toBe(404);
        });
    });

    describe('GET /cosmetic/name/:name', () => {
        it('should return a cosmetic by name', async () => {
            CosmeticModel.findOne.mockResolvedValue(mockCosmetic);

            const res = await request(app).get(`/cosmetic/name/${mockCosmetic.name}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockCosmetic);
        });

        it('should return 404 if not found', async () => {
            CosmeticModel.findOne.mockResolvedValue(null);

            const res = await request(app).get(`/cosmetic/name/Nonexistent`);
            expect(res.statusCode).toBe(404);
        });
    });

    describe('GET /cosmetic/type/:type', () => {
        it('should return cosmetics by type', async () => {
            CosmeticModel.find.mockResolvedValue([mockCosmetic]);

            const res = await request(app).get(`/cosmetic/type/frame`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([mockCosmetic]);
        });

        it('should return 404 for invalid type', async () => {
            const res = await request(app).get(`/cosmetic/type/hat`);
            expect(res.statusCode).toBe(404);
        });
    });

    describe('GET /cosmetic/value', () => {
        it('should return cosmetics in value range', async () => {
            CosmeticModel.find.mockResolvedValue([mockCosmetic]);

            const res = await request(app).get(`/cosmetic/value?min=50&max=150`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([mockCosmetic]);
        });
    });

    describe('POST /cosmetic', () => {
        it('should create a new cosmetic', async () => {
            CosmeticModel.findOne.mockResolvedValue(null);

            const mockSave = jest.fn().mockResolvedValue(mockCosmetic);
            CosmeticModel.mockImplementation(() => ({
                name: mockCosmetic.name,
                type: mockCosmetic.type,
                resource_path: mockCosmetic.resource_path,
                value: mockCosmetic.value,
                save: mockSave
            }));

            const res = await request(app).post('/cosmetic').send(mockCosmetic);
            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(mockCosmetic);
        });

        it('should return 409 if cosmetic already exists', async () => {
            CosmeticModel.findOne.mockResolvedValue(mockCosmetic);

            const res = await request(app).post('/cosmetic').send(mockCosmetic);
            expect(res.statusCode).toBe(409);
        });
    });

    describe('PUT /cosmetic/:id', () => {
        it('should update an existing cosmetic', async () => {
            const updated = { ...mockCosmetic, name: 'Platinum Frame' };
            const save = jest.fn().mockResolvedValue(updated);

            CosmeticModel.findById.mockResolvedValue({ ...mockCosmetic, save });

            const res = await request(app).put(`/cosmetic/${mockCosmetic._id}`).send({ name: 'Platinum Frame' });
            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe('Platinum Frame');
        });

        it('should return 404 if not found', async () => {
            CosmeticModel.findById.mockResolvedValue(null);

            const res = await request(app).put(`/cosmetic/invalid-id`).send({ name: 'Update' });
            expect(res.statusCode).toBe(404);
        });
    });

    describe('DELETE /cosmetic/:id', () => {
        it('should delete a cosmetic', async () => {
            CosmeticModel.findByIdAndDelete.mockResolvedValue({});

            const res = await request(app).delete(`/cosmetic/${mockCosmetic._id}`);
            expect(res.statusCode).toBe(204);
        });
    });
});
