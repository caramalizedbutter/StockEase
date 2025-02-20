const { body, validationResult } = require('express-validator');

const validateInventory = [
    body('barcode')
        .notEmpty()
        .withMessage('Barcode is required')
        .trim(),
    body('productName')
        .notEmpty()
        .withMessage('Product name is required')
        .trim(),
    body('quantity')
        .isInt({ min: 0 })
        .withMessage('Quantity must be a positive integer'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('expiryDate')
        .isISO8601()
        .withMessage('Invalid expiry date format')
];

module.exports = {
    validateInventory
};
