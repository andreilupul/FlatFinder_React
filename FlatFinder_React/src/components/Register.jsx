import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // Error Messages
    const [isReg, setIsReg] = useState(false);
    const [errorFirstName, setErrorFirstName] = useState("");
    const [errorLastName, setErrorLastName] = useState("");
    const [errorBirthdate, setErrorBirthdate] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [errorPassword, setErrorPassword] = useState("");
    const navigate = useNavigate();

    async function handleClick() {
        setErrorMessage(""); // Reset error message
        setErrorFirstName(""); // Reset error for first name
        setErrorLastName(""); // Reset error for last name
        setErrorBirthdate(""); // Reset error for birthdate
        setErrorPassword(""); // Reset error for password

        let hasError = false; // Flag to check for errors

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // First Name validation
        if (!firstName.trim()) {
            setErrorFirstName("First Name is required");
            hasError = true;
        }

        // Last Name validation
        if (!lastName.trim()) {
            setErrorLastName("Last Name is required");
            hasError = true;
        }

        // Birthdate validation
        if (!birthdate.trim()) {
            setErrorBirthdate("Birthdate is required");
            hasError = true;
        }

        // Email validation
        if (!email.trim()) {
            setErrorMessage("Email is required");
            hasError = true;
        } else if (!emailRegex.test(email)) {
            setErrorMessage("Invalid email format");
            hasError = true;
        }

        // Password validation
        if (!password.trim()) {
            setErrorPassword("Password is required");
            hasError = true;
        } else if (password.length < 6) {
            setErrorPassword("Password should be at least 6 characters");
            hasError = true;
        }

        // Stop if errors exist
        if (hasError) {
            setIsReg(false);
            return;
        }

        // Proceed with registration if no errors
        setIsReg(true);
        try {
            const response = await axios.post('http://localhost:5000/register', {
                firstName,
                lastName,
                birthdate,
                email,
                password
            });

            // Reset form fields and navigate to login page
            setFirstName("");
            setLastName("");
            setBirthdate("");
            setEmail("");
            setPassword("");
            setIsReg(false);
            navigate('/login');
        } catch (error) {
            console.error(error);
            setErrorMessage(error.response?.data?.message || "Registration failed");
            setIsReg(false);
        }
    }

    return (
        <div className="registerBackgroung">
            <Box sx={{ position: 'absolute', maxWidth: 300, margin: 'auto', padding: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', left: '35%', top: '10%', gap: '5px' }}>
                <Typography variant="h5" component="h4" gutterBottom>
                    Registration Form
                </Typography>
                <TextField required id="firstName" label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} sx={{ marginBottom: '5px', width: '300px' }} error={Boolean(errorFirstName)} helperText={errorFirstName} />
                <TextField required id="lastName" label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} sx={{ marginBottom: '5px', width: '300px' }} error={Boolean(errorLastName)} helperText={errorLastName} />
                <TextField required id="birthdate" label="Birthdate" type="date" InputLabelProps={{ shrink: true }} value={birthdate} onChange={(e) => setBirthdate(e.target.value)} sx={{ marginBottom: '5px', width: '300px' }} error={Boolean(errorBirthdate)} helperText={errorBirthdate} />
                <TextField required id="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ marginBottom: '5px', width: '300px' }} error={Boolean(errorMessage)} helperText={errorMessage} />
                <TextField required id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ marginBottom: '5px', width: '300px' }} error={Boolean(errorPassword)} helperText={errorPassword} />
                <Button variant="contained" onClick={handleClick} sx={{ marginBottom: '5px', width: '200px' }} disabled={isReg}>Register</Button>
                <Typography variant="body2">Have an account? <Link to="/login">Login</Link></Typography>
            </Box>
        </div>
    );
}

export default Register;
