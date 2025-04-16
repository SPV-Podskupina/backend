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

        CosmeticModel.findOne({ _id: id }, function (err, cosmetic) {
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
    create: async function (req, res) {
        const { name, type, resource_path, value } = req.body;

        try {
            const existingCosmetic = await CosmeticModel.findOne({ name });

            if (existingCosmetic) {
                return res.status(409).json({
                    message: `Cosmetic with name "${name}" already exists.`
                });
            }

            const cosmetic = new CosmeticModel({
                name,
                type,
                resource_path,
                value
            });

            await cosmetic.save();
            return res.status(201).json(cosmetic);

        } catch (error) {
            console.error('Error creating cosmetic:', error);
            return res.status(500).json({
                message: "Error creating cosmetic"
            });
        }
    },

    /**
     * cosmeticController.update()
     */
    update: async function (req, res) {
        var id = req.params.id;

        try {
            const cosmetic = await CosmeticModel.findById(id);
            if (!cosmetic) {
                return res.status(404).json({
                    message: "Cosmetic not found."
                })
            }

            cosmetic.name = req.body.name ? req.body.name : cosmetic.name;
            cosmetic.type = req.body.type ? req.body.type : cosmetic.type;
            cosmetic.resource_path = req.body.resource_path ? req.body.resource_path : cosmetic.resource_path;
            cosmetic.value = req.body.value ? req.body.value : cosmetic.value;

            const updatedCosmetic = await cosmetic.save();
            return res.status(200).json(updatedCosmetic)

        } catch {
            return res.status(500).json({
                message: "Error updating cosmetic"
            })
        }
    },

    /**
     * cosmeticController.remove()
     */
    remove: async function (req, res) {
        const id = req.params.id;

        try {
            await CosmeticModel.findByIdAndDelete(id);
            return res.status(204).json();
        } catch (err) {
            return res.status(500).json({
                message: 'Error when deleting the game.',
                error: err
            });
        }
    }
};
