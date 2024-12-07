const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Ruta pentru înregistrare
router.post('/', async (req, res) => {
    const { firstName, lastName, birthdate, email, password } = req.body;

    // Validare simplă
    if (!firstName || !lastName || !birthdate || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Verifică dacă utilizatorul există deja
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists." });
        }

        // Creează un nou utilizator
        const newUser = new User({
            firstName,
            lastName,
            birthdate,
            email,
            password
        });

        // Salvează utilizatorul în baza de date
        await newUser.save();
        res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;
