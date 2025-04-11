var GameModel = require('../models/gameModel.js');

/**
 * gameController.js
 *
 * @description :: Server-side logic for managing games.
 */
module.exports = {

    /**
     * gameController.list()
     */
    list: function (req, res) {
        return res.status(200).json({
            message: "No games available"
        });


        GameModel.find(function (err, games) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting game.',
                    error: err
                });
            }

            return res.json(games);
        });
    },

    /**
     * gameController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        GameModel.findOne({ _id: id }, function (err, game) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting game.',
                    error: err
                });
            }

            if (!game) {
                return res.status(404).json({
                    message: 'No such game'
                });
            }

            return res.json(game);
        });
    },

    /**
     * gameController.showByDate()
     * 
     * query paramaters: start_date, end_date
     */
    showByDate: function (req, res) { },

    /**
     * gameController.showByDuration()
     * 
     * query paramaters: min, max  
     */
    showByDuration: function (req, res) { },

    /**
     * gameController.showByType()
     * 
     * query paramater: type
     */
    showByType: function (req, res) { },

    /**
     * gameController.showByBet()
     * 
     * query paramaters: min, max
     */
    showByBet: function (req, res) { },

    /**
     * gameController.showByWinning()
     * 
     * query paramaters: min, max
     */
    showByWinning: function (req, res) { },

    /**
     * gameController.showByRounds()
     * 
     * query paramaters: min, max
     */
    showByRounds: function (req, res) { },

    /**
     * gameController.create()
     */
    create: async function (req, res) {
        try {
            const game = new GameModel({
                type: req.body.type,
                user_id: req.body.user_id,
                session_start: req.body.session_start,
                session_end: req.body.session_end,
                total_bet: req.body.total_bet,
                balance_start: req.body.balance_start,
                balance_end: req.body.balance_end,
                rounds_played: req.body.rounds_played
            });

            const savedGame = await game.save();
            return res.status(201).json(savedGame);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when creating game',
                error: err
            });
        }
    },

    /**
     * gameController.update()
     */
    update: async function (req, res) {
        const id = req.params.id;

        try {
            const game = await GameModel.findById(id);
            if (!game) {
                return res.status(404).json({ message: 'No such game' });
            }

            // Only update fields that are provided
            game.type = req.body.type ?? game.type;
            game.user_id = req.body.user_id ?? game.user_id;
            game.session_start = req.body.session_start ?? game.session_start;
            game.session_end = req.body.session_end ?? game.session_end;
            game.total_bet = req.body.total_bet ?? game.total_bet;
            game.balance_start = req.body.balance_start ?? game.balance_start;
            game.balance_end = req.body.balance_end ?? game.balance_end;
            game.rounds_played = req.body.rounds_played ?? game.rounds_played;

            const updatedGame = await game.save();
            return res.json(updatedGame);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when updating game.',
                error: err
            });
        }
    },

    /**
     * gameController.remove()
     */
    remove: async function (req, res) {
        const id = req.params.id;

        try {
            await GameModel.findByIdAndDelete(id);
            return res.status(204).json(); // No content
        } catch (err) {
            return res.status(500).json({
                message: 'Error when deleting the game.',
                error: err
            });
        }
    }
};
