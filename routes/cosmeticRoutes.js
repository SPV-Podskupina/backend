var express = require('express');
var router = express.Router();
var cosmeticController = require('../controllers/cosmeticController.js');
var JWTCheck = require('../middleware/JWTCheck.js')

/**
* @swagger
* tags:
*   name: Cosmetics
*   description: Cosmetic item management
*
* components:
*   schemas:
*     Cosmetic:
*       type: object
*       required:
*         - name
*         - type
*       properties:
*         _id:
*           type: string
*         name:
*           type: string
*         type:
*           type: string
*           enum: [frame, banner, emote]
*         resource_path:
*           type: string
*         value:
*           type: number
*/

/**
* @swagger
* /cosmetic:
*   get:
*     summary: Get all cosmetics
*     tags: [Cosmetics]
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: A list of all cosmetics
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/Cosmetic'
*/
router.get('/', JWTCheck.authenticateToken, cosmeticController.list);

/**
* @swagger
* /cosmetic/name/{name}:
*   get:
*     summary: Get a cosmetic by name
*     tags: [Cosmetics]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: name
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Cosmetic found
*       404:
*         description: Cosmetic not found
*/
router.get('/name/:name', JWTCheck.authenticateToken, cosmeticController.showByName);

/**
* @swagger
* /cosmetic/value:
*   get:
*     summary: Get cosmetics by value range
*     tags: [Cosmetics]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: query
*         name: min
*         schema:
*           type: number
*         description: Minimum value
*       - in: query
*         name: max
*         schema:
*           type: number
*         description: Maximum value
*     responses:
*       200:
*         description: Cosmetics in value range
*/
router.get('/value', JWTCheck.authenticateToken, cosmeticController.showByValue);

/**
* @swagger
* /cosmetic/type/{type}:
*   get:
*     summary: Get cosmetics by type
*     tags: [Cosmetics]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: type
*         required: true
*         schema:
*           type: string
*           enum: [frame, banner, emote]
*     responses:
*       200:
*         description: Cosmetics of given type
*       404:
*         description: Invalid cosmetic type
*/
router.get('/type/:type', JWTCheck.authenticateToken, cosmeticController.showByType)

/**
* @swagger
* /cosmetic/{id}:
*   get:
*     summary: Get a cosmetic by ID
*     tags: [Cosmetics]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Cosmetic found
*       404:
*         description: Cosmetic not found
*/
router.get('/:id', JWTCheck.authenticateToken, cosmeticController.show);

/**
* @swagger
* /cosmetic:
*   post:
*     summary: Create a new cosmetic
*     tags: [Cosmetics]
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/Cosmetic'
*     responses:
*       201:
*         description: Cosmetic created successfully
*       409:
*         description: Cosmetic with the same name already exists
*/
router.post('/', JWTCheck.authenticateToken, cosmeticController.create);

/**
* @swagger
* /cosmetic/{id}:
*   put:
*     summary: Update an existing cosmetic
*     tags: [Cosmetics]
*     security:
*       - bearerAuth: []
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
*             $ref: '#/components/schemas/Cosmetic'
*     responses:
*       200:
*         description: Cosmetic updated successfully
*       404:
*         description: Cosmetic not found
*/
router.put('/:id', JWTCheck.authenticateToken, cosmeticController.update);

/**
* @swagger
* /cosmetic/{id}:
*   delete:
*     summary: Delete a cosmetic
*     tags: [Cosmetics]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*     responses:
*       204:
*         description: Cosmetic deleted successfully
*       404:
*         description: Cosmetic not found
*/
router.delete('/:id', JWTCheck.authenticateToken, cosmeticController.remove);

module.exports = router;
