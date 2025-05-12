var express = require('express');
var router = express.Router();
var gameController = require('../controllers/gameController.js');
var JWTCheck = require('../middleware/JWTCheck.js')

/**
 * @swagger
 * tags:
 *   name: Games
 *   description: Game management and analytics
 *
 * components:
 *   schemas:
 *     Game:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         _id:
 *           type: string
 *         type:
 *           type: string
 *           enum: [plinko, roulette, blackjack]
 *         user_id:
 *           type: string
 *         session_start:
 *           type: string
 *           format: date-time
 *         session_end:
 *           type: string
 *           format: date-time
 *         total_bet:
 *           type: number
 *         balance_start:
 *           type: number
 *         balance_end:
 *           type: number
 *         rounds_played:
 *           type: number
 */

/**
 * @swagger
 * /game:
 *   get:
 *     summary: Get all games
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: A list of games
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 */
router.get('/', gameController.list);

/**
 * @swagger
 * /game/session:
 *   get:
 *     summary: Get games by session start/end time
 *     tags: [Games]
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date
 *     responses:
 *       200:
 *         description: Games filtered by session time
 */
router.get('/session', gameController.showBySession);

/**
 * @swagger
 * /game/duration:
 *   get:
 *     summary: Get games by session duration
 *     tags: [Games]
 *     parameters:
 *       - in: query
 *         name: min
 *         schema:
 *           type: number
 *         description: Minimum duration in minutes
 *       - in: query
 *         name: max
 *         schema:
 *           type: number
 *         description: Maximum duration in minutes
 *     responses:
 *       200:
 *         description: Games filtered by duration
 */
router.get('/duration', gameController.showByDuration);

/**
 * @swagger
 * /game/type/{type}:
 *   get:
 *     summary: Get games by type
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [plinko, roulette, blackjack]
 *     responses:
 *       200:
 *         description: Games of the given type
 */
router.get('/type/:type', gameController.showByType);

/**
 * @swagger
 * /game/bet:
 *   get:
 *     summary: Get games by total bet range
 *     tags: [Games]
 *     parameters:
 *       - in: query
 *         name: min
 *         schema:
 *           type: number
 *         description: Minimum bet
 *       - in: query
 *         name: max
 *         schema:
 *           type: number
 *         description: Maximum bet
 *     responses:
 *       200:
 *         description: Games filtered by total bet
 */
router.get('/bet', gameController.showByBet);

/**
 * @swagger
 * /game/winnings:
 *   get:
 *     summary: Get games by winnings range
 *     tags: [Games]
 *     parameters:
 *       - in: query
 *         name: min
 *         schema:
 *           type: number
 *         description: Minimum winnings
 *       - in: query
 *         name: max
 *         schema:
 *           type: number
 *         description: Maximum winnings
 *     responses:
 *       200:
 *         description: Games filtered by winnings
 */
router.get('/winning', gameController.showByWinning);

/**
 * @swagger
 * /game/rounds:
 *   get:
 *     summary: Get games by number of rounds played
 *     tags: [Games]
 *     parameters:
 *       - in: query
 *         name: min
 *         schema:
 *           type: number
 *         description: Minimum rounds
 *       - in: query
 *         name: max
 *         schema:
 *           type: number
 *         description: Maximum rounds
 *     responses:
 *       200:
 *         description: Games filtered by rounds played
 */
router.get('/rounds', gameController.showByRounds);

/**
 * @swagger
 * /game/{id}:
 *   get:
 *     summary: Get a specific game by ID
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Game data
 *       404:
 *         description: Game not found
 */
router.get('/:id', gameController.show);

/**
 * @swagger
 * /game:
 *   post:
 *     summary: Create a new game
 *     tags: [Games]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Game'
 *     responses:
 *       201:
 *         description: Game created successfully
 */
router.post('/', JWTCheck.authenticateToken, gameController.create);

/**
 * @swagger
 * /game/{id}:
 *   put:
 *     summary: Update an existing game
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Game'
 *     responses:
 *       200:
 *         description: Game updated successfully
 *       404:
 *         description: Game not found
 */
router.put('/:id', JWTCheck.authenticateToken, gameController.update);

/**
 * @swagger
 * /game/{id}:
 *   delete:
 *     summary: Delete a game
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Game deleted successfully
 *       404:
 *         description: Game not found
 */
router.delete('/:id', JWTCheck.authenticateToken, gameController.remove);

module.exports = router;
