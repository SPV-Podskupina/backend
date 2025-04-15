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
    list: async function (req, res) {
        try {
            const games = await GameModel.find({});
            return res.status(200).json(games);
        } catch (err) {
            return res.status(500).json({
                message: "Error fetching games."
            })
        }
    },

    /**
     * gameController.show()
     */
    show: async function (req, res) {
        var id = req.params.id;

        try {
            const game = await GameModel.findById(id)
            return res.status(200).json(game)
        } catch (error) {
            return res.status(500).json({
                message: "Error fetching game."
            })
        }
    },

    /**
     * gameController.showByDate()
     * 
     * query paramaters: sessionStart, sessionEnd
     */
    showBySession: async function (req, res) {
        const { sessionStart, sessionEnd } = req.query
        const filter = {}
        if (sessionStart || sessionEnd) {
            const sessionFilter = {};

            if (sessionStart) sessionFilter.$gte = new Date(sessionStart)
            if (sessionEnd) sessionFilter.$lte = new Date(sessionEnd)

            if (sessionStart && !sessionEnd) sessionFilter.$lte = new Date();

            filter.session_start = sessionFilter;
        }

        try {
            const games = await GameModel.find(filter);
            return res.status(200).json(games)
        } catch (err) {
            return res.status(500).json({
                message: "Error fetching games by date."
            })
        }
    },

    /**
     * gameController.showByDuration()
     * 
     * query paramaters: minDuration, maxDuration  
     */
    showByDuration: async function (req, res) {
        const { minDuration, maxDuration } = req.query

        const minDurationMs = minDuration ? parseInt(minDuration) * 60 * 1000 : null;
        const maxDurationMs = maxDuration ? parseInt(maxDuration) * 60 * 1000 : null;

        const durationFilter = {};
        if (minDurationMs !== null) durationFilter.$gte = minDurationMs;
        if (maxDurationMs !== null) durationFilter.$lte = maxDurationMs;

        try {
            const games = await GameModel.aggregate([
                {
                    $addFields: {
                        duration: {
                            $subtract: ["$session_end", "$session_start"]
                        }
                    }
                },
                ...(Object.keys(durationFilter).length > 0
                    ? [{ $match: { duration: durationFilter } }]
                    : [])
            ]);
            return res.status(200).json(games)
        } catch (err) {
            return res.status(500).json({
                message: "Error fetching games by duration."
            })
        }
    },
    /**
     * gameController.showByType()
     * 
     * query paramater: type
     */
    showByType: async function (req, res) {
        const validType = ['plinko', 'blackjack', 'roulette']
        const type = req.params.type;

        if (!validType.includes(type)) {
            return res.status(404).json({
                message: "Game type does not exist."
            });
        }

        try {
            const games = await GameModel.find({ type: type })
            return res.status(200).json(games)
        } catch (err) {
            return res.status(500).json({
                message: "Error fetching games by type"
            });
        }

    },

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
