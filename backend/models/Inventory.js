const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    barcode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    productName: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    expiryDate: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
