var CosmeticModel = require('../models/cosmeticModel.js');

/**
 * cosmeticController.js
 *
 * @description :: Server-side logic for managing cosmetics.
 */
module.exports = {

    /**
     * cosmeticController.list()
     */
    list: function (req, res) {
        CosmeticModel.find(function (err, cosmetics) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting cosmetic.',
                    error: err
                });
            }

            return res.json(cosmetics);
        });
    },

    /**
     * cosmeticController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        CosmeticModel.findOne({_id: id}, function (err, cosmetic) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting cosmetic.',
                    error: err
                });
            }

            if (!cosmetic) {
                return res.status(404).json({
                    message: 'No such cosmetic'
                });
            }

            return res.json(cosmetic);
        });
    },

    /**
     * cosmeticController.create()
     */
    create: function (req, res) {
        var cosmetic = new CosmeticModel({
			type : req.body.type,
			resource_path : req.body.resource_path,
			value : req.body.value
        });

        cosmetic.save(function (err, cosmetic) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating cosmetic',
                    error: err
                });
            }

            return res.status(201).json(cosmetic);
        });
    },

    /**
     * cosmeticController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        CosmeticModel.findOne({_id: id}, function (err, cosmetic) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting cosmetic',
                    error: err
                });
            }

            if (!cosmetic) {
                return res.status(404).json({
                    message: 'No such cosmetic'
                });
            }

            cosmetic.type = req.body.type ? req.body.type : cosmetic.type;
			cosmetic.resource_path = req.body.resource_path ? req.body.resource_path : cosmetic.resource_path;
			cosmetic.value = req.body.value ? req.body.value : cosmetic.value;
			
            cosmetic.save(function (err, cosmetic) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating cosmetic.',
                        error: err
                    });
                }

                return res.json(cosmetic);
            });
        });
    },

    /**
     * cosmeticController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        CosmeticModel.findByIdAndRemove(id, function (err, cosmetic) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the cosmetic.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
