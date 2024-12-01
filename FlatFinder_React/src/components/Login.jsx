import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // You can use axios or fetch
import backgroundImage from '../assets/ny4.jpg';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // Error message
    const navigate = useNavigate();

    // Handle user login
    const handleLogin = async () => {
        try {
            setError(""); // Reset the error before attempting login

            // Making a POST request to your backend API for login
            const response = await axios.post('http://localhost:5000/api/users/login', {
                email,
                password
            });

            // Assuming your backend returns user data upon successful login
            const user = response.data;
            if (user) {
                navigate('/'); // Redirect to the home page if login is successful
            }
        } catch (error) {
            console.error("Login failed:", error);
            
            // Handle errors based on the response from the backend
            if (error.response) {
                if (error.response.status === 400) {
                    setError("Invalid credentials");
                } else {
                    setError("An error occurred. Please try again.");
                }
            } else {
                setError("Network error. Please check your connection.");
            }
        }
    };

    // Update email state and reset error when the email changes
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setError(""); // Reset error message when email changes
    };

    return (
        <div className='loginBackgroung'>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    zIndex: -1,
                }}
            >
                <Box sx={{
                    maxWidth: 300,
                    border: '2px solid black',
                    padding: 3,
                    backgroundColor: 'white',
                    position: 'relative',
                    zIndex: 10,
                }}>
                    <Typography variant="h4" component="h4" gutterBottom>
                        Login Form
                    </Typography>

                    <TextField
                        required
                        id="email"
                        label="Email"
                        value={email}
                        onChange={handleEmailChange} // Reset error on change
                        fullWidth
                        sx={{ marginBottom: 2 }}
                        error={!!error} // Mark field as having an error if there is an error message
                        helperText={error} // Display error message under the input field
                    />

                    <TextField
                        required
                        id="password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        sx={{ marginBottom: 2 }}
                    />

                    <Button
                        variant="contained"
                        onClick={handleLogin}
                        fullWidth
                        sx={{ marginBottom: 2, width: '200px', left: '20%' }}
                    >
                        Login
                    </Button>
                    <Typography variant="body2" sx={{
                        position: 'relative', zIndex: 10, display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }} >
                        Don't have an account? <Link to="/register">Register</Link>
                    </Typography>
                </Box>
            </Box>
        </div>
    );
}

export default Login;
