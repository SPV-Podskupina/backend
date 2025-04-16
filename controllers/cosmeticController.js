const cosmeticModel = require('../models/cosmeticModel.js');
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
    list: async function (req, res) {
        try {
            const cosmetics = await CosmeticModel.find({});
            return res.status(200).json(cosmetics)
        } catch {
            return res.status(500).json({
                message: "Error fetching cosmetics."
            })
        }
    },

    /**
     * cosmeticController.show()
     */
    show: async function (req, res) {
        const id = req.params.id;

        try {
            const cosmetic = await cosmeticModel.findById(id)
            if (!cosmetic) {
                return res.status(404).json({
                    message: "Cosmetic not found."
                })
            }
            return res.status(200).json(cosmetic);
        } catch {
            return res.status(500).json({
                message: "Error fetching cosmetic."
            })
        }

    },

    showByName: async function (req, res) {
        const name = req.params.name;

        try {
            const cosmetic = await cosmeticModel.findOne({ name })
            if (!cosmetic) {
                return res.status(404).json({
                    message: "Cosmetic not found."
                })
            }
            return res.status(200).json(cosmetic);
        } catch {
            return res.status(500).json({
                message: "Error fetching cosmetic."
            })
        }

    },

    showByValue: async function (req, res) {
        const { min, max } = req.query
        const valueFilter = {};
        if (min !== undefined) valueFilter.$gte = parseFloat(min);
        if (max !== undefined) valueFilter.$lte = parseFloat(max);

        const match = Object.keys(valueFilter).length > 0 ? { value: valueFilter } : {};

        try {
            const cosmetics = await cosmeticModel.find(match);
            return res.status(200).json(cosmetics);
        } catch {
            return res.status(500).json({
                message: "Error fetching cosmetic."
            })
        }
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
        const id = req.params.id;

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
