import React, { useState } from 'react';
import { Button, Modal } from '@mui/material';
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const [open, setOpen] = useState(false);  // Modal open state
    const navigate = useNavigate();  // For navigation between pages

    const handleOpen = () => setOpen(true);  // Open the confirmation modal
    const handleClose = () => setOpen(false);  // Close the confirmation modal

    // Function to log out the user by clearing the JWT token
    const handleLogout = () => {
        // Clear JWT token stored in localStorage
        localStorage.removeItem('authToken'); // Remove the token from localStorage

        // Optionally, you can clear cookies if your app uses them for JWT storage
        // document.cookie = 'token=; Max-Age=0; path=/;'; 

        // Redirect to the login page after logging out
        navigate('/login');

        handleClose();  // Close the modal after the user has confirmed logout
    };

    return (
        <div>
            <Button
                style={{
                    backgroundColor: 'red',
                    border: '1px solid black',
                    color: 'black',
                }}
                onClick={handleOpen}
                startIcon={<LogoutIcon />}
            >
                Logout
            </Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="logout-modal-title"
                aria-describedby="logout-modal-description"
            >
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    margin: 'auto',
                    marginTop: '20%',
                    width: '300px',
                    textAlign: 'center',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                }}>
                    <h2 id="logout-modal-title">Confirmation Logout</h2>
                    <p id="logout-modal-description"> Are you sure you want to logout?</p>
                    <Button
                        onClick={handleLogout}
                        style={{
                            marginRight: '10px',
                            backgroundColor: '#007BFF',
                            color: 'white',
                        }}
                    >
                        Yes
                    </Button>
                    <Button
                        onClick={handleClose}
                        style={{
                            backgroundColor: '#6c757d',
                            color: 'white',
                        }}
                    >
                        No
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default Logout;
