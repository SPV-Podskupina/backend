var express = require('express');
var router = express.Router();
var gameController = require('../controllers/gameController.js');

/*
 * GET
 */
router.get('/', gameController.list);

/*
 * GET
 */
router.get('/:id', gameController.show);

/*
 * POST
 */
router.post('/', gameController.create);

/*
 * PUT
 */
router.put('/:id', gameController.update);

/*
 * DELETE
 */
router.delete('/:id', gameController.remove);

module.exports = router;
