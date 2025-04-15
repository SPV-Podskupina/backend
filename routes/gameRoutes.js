var express = require('express');
var router = express.Router();
var gameController = require('../controllers/gameController.js');
var JWTCheck = require('../middleware/JWTCheck.js')

/*
 * GET
 */
router.get('/', gameController.list);

/*
 * GET
 */
// query parameters: sessionStart, sessionEnd  
router.get('/session', gameController.showBySession);

/*
 * GET
 */
// query parameters: min, max
router.get('/duration', gameController.showByDuration);

/*
 * GET
 */
// query parameters: type
router.get('/type/:type', gameController.showByType);

/*
 * GET
 */
// query parameters: min, max
router.get('/bet', gameController.showByBet);

/*
 * GET
 */
// query parameters: min, max
router.get('/winning', gameController.showByWinning);

/*
 * GET
 */
// query parameters: min, max
router.get('/rounds', gameController.showByRounds);

/*
 * GET
 */
router.get('/:id', gameController.show);

/*
 * POST
 */
router.post('/', JWTCheck.authenticateToken, gameController.create);

/*
 * PUT
 */
router.put('/:id', JWTCheck.authenticateToken, gameController.update);

/*
 * DELETE
 */
router.delete('/:id', JWTCheck.authenticateToken, gameController.remove);

module.exports = router;
