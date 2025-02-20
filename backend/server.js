// Backend for StockEase - Smart Inventory Management

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const qr = require('qrcode');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected')).catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: { type: String, default: 'user' },
});
const User = mongoose.model('User', UserSchema);

// Inventory Schema
const InventorySchema = new mongoose.Schema({
    name: String,
    quantity: Number,
    qrCode: String,
});
const Inventory = mongoose.model('Inventory', InventorySchema);

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(500).json({ error: 'Failed to authenticate token' });
        req.userId = decoded.id;
        next();
    });
};

// Signup API
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.json({ message: 'User registered successfully' });
});

// Login API
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
});

// Create Inventory Item with QR Code
app.post('/inventory', verifyToken, async (req, res) => {
    const { name, quantity } = req.body;
    const qrCode = await qr.toDataURL(name);
    const newItem = new Inventory({ name, quantity, qrCode });
    await newItem.save();
    res.json({ message: 'Item added successfully', qrCode });
});

// Get Inventory Items
app.get('/inventory', verifyToken, async (req, res) => {
    const items = await Inventory.find();
    res.json(items);
});

// Update Inventory Item
app.put('/inventory/:id', verifyToken, async (req, res) => {
    const { name, quantity } = req.body;
    const updatedItem = await Inventory.findByIdAndUpdate(req.params.id, { name, quantity }, { new: true });
    res.json({ message: 'Item updated successfully', updatedItem });
});

// Delete Inventory Item
app.delete('/inventory/:id', verifyToken, async (req, res) => {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
