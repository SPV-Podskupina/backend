var express = require('express');
var router = express.Router();
var cosmeticController = require('../controllers/cosmeticController.js');

/*
 * GET
 */
router.get('/', cosmeticController.list);

/*
 * GET
 */
router.get('/:id', cosmeticController.show);

/*
 * POST
 */
router.post('/', cosmeticController.create);

/*
 * PUT
 */
router.put('/:id', cosmeticController.update);

/*
 * DELETE
 */
router.delete('/:id', cosmeticController.remove);

module.exports = router;
