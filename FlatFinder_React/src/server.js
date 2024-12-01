const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Define MongoDB schemas for Flats and Users
const flatSchema = new mongoose.Schema({
    city: String,
    streetName: String,
    streetNumber: Number,
    areaSize: Number,
    ac: String,
    yearBuilt: Number,
    rentPrice: Number,
    dateAvailable: Date,
    ownerEmail: String,
    ownerUid: String,
});

const Flat = mongoose.model('Flat', flatSchema);

const userSchema = new mongoose.Schema({
    email: String,
    password: String, // Remember to hash passwords in production
    name: String,
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Flat' }], // Array of flat IDs for favorites
});

const User = mongoose.model('User', userSchema);

const app = express();
const port = 5000;

// Middleware for parsing JSON and enabling CORS
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/flatfinder', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

// --------------------- Flat Routes ---------------------

// POST: Add a new flat
app.post('/api/flats', async (req, res) => {
    try {
        const newFlat = new Flat(req.body);
        await newFlat.save();
        res.status(201).json(newFlat);
    } catch (error) {
        res.status(500).json({ message: 'Error saving flat', error });
    }
});

// GET: Fetch all flats
app.get('/api/flats', async (req, res) => {
    try {
        const flats = await Flat.find();
        res.status(200).json(flats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching flats', error });
    }
});

// GET: Fetch a specific flat by ID
app.get('/api/flats/:id', async (req, res) => {
    try {
        const flat = await Flat.findById(req.params.id);
        if (!flat) {
            return res.status(404).json({ message: 'Flat not found' });
        }
        res.status(200).json(flat);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching flat', error });
    }
});

// PUT: Update a flat by ID
app.put('/api/flats/:id', async (req, res) => {
    try {
        const updatedFlat = await Flat.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedFlat) {
            return res.status(404).json({ message: 'Flat not found' });
        }
        res.status(200).json(updatedFlat);
    } catch (error) {
        res.status(500).json({ message: 'Error updating flat', error });
    }
});

// DELETE: Delete a flat by ID
app.delete('/api/flats/:id', async (req, res) => {
    try {
        const deletedFlat = await Flat.findByIdAndDelete(req.params.id);
        if (!deletedFlat) {
            return res.status(404).json({ message: 'Flat not found' });
        }
        res.status(200).json({ message: 'Flat deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting flat', error });
    }
});

// --------------------- User Routes ---------------------

// POST: Register a new user
app.post('/api/users/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const newUser = new User({ email, password, name, favorites: [] });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// POST: Authenticate a user (simple login)
app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password }); // Note: Passwords should be hashed
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error logging in user', error });
    }
});

// POST: Add a flat to user's favorites
app.post('/api/users/:userId/favorites', async (req, res) => {
    try {
        const { userId } = req.params;
        const { flatId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.favorites.includes(flatId)) {
            return res.status(400).json({ message: 'Flat already added to favorites' });
        }

        user.favorites.push(flatId);
        await user.save();
        res.status(201).json({ message: 'Flat added to favorites' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding to favorites', error });
    }
});

// DELETE: Remove a flat from user's favorites
app.delete('/api/users/:userId/favorites/:flatId', async (req, res) => {
    try {
        const { userId, flatId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.favorites = user.favorites.filter(id => id.toString() !== flatId);
        await user.save();
        res.status(200).json({ message: 'Flat removed from favorites' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing from favorites', error });
    }
});

// --------------------- Start Server ---------------------

// Start the server on a specified port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
