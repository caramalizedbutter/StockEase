const express = require('express');
const auth = require('../middleware/auth');
const Inventory = require('../models/Inventory');
const { validateInventory } = require('../middleware/inventoryValidation');

const router = express.Router();

// Get all inventory items
router.get('/', auth, async (req, res) => {
    try {
        const inventory = await Inventory.find({});
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inventory' });
    }
});

// Get single inventory item
router.get('/:barcode', auth, async (req, res) => {
    try {
        const item = await Inventory.findOne({ barcode: req.params.barcode });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching item' });
    }
});

// Increase inventory quantity
router.put('/:barcode/increase', auth, async (req, res) => {
    try {
        const item = await Inventory.findOneAndUpdate(
            { barcode: req.params.barcode },
            { $inc: { quantity: req.body.amount || 1 } },
            { new: true }
        );
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error increasing quantity' });
    }
});

// Decrease inventory quantity
router.put('/:barcode/decrease', auth, async (req, res) => {
    try {
        const item = await Inventory.findOne({ barcode: req.params.barcode });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.quantity < (req.body.amount || 1)) {
            return res.status(400).json({ message: 'Insufficient quantity' });
        }

        const updatedItem = await Inventory.findOneAndUpdate(
            { barcode: req.params.barcode },
            { $inc: { quantity: -(req.body.amount || 1) } },
            { new: true }
        );

        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Error decreasing quantity' });
    }
});

module.exports = router;
