// Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { Button, Typography, AppBar, Toolbar } from '@mui/material';
import Logout from './Logout';

function Header() {
    const { currentUser, userLoggedIn, isAdmin, logout } = useAuth();

    return (
        <AppBar
            position="static"
            sx={{
                backgroundColor: 'transparent',
                boxShadow: 'none',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
            }}
        >
            <Toolbar>
                {userLoggedIn && (
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'black', display: 'flex', alignItems: 'center' }}>
                        FlatFinder Welcome {currentUser.email} {isAdmin && <span style={{ color: 'red' }}>(Admin)</span>}
                    </Typography>
                )}

                <Button color="secondary" component={Link} to="/" sx={{ color: 'black' }}>
                    Home
                </Button>

                {userLoggedIn && (
                    <>
                        <Button color="primary" component={Link} to="/my-profile" sx={{ color: 'black' }}>
                            My Profile
                        </Button>

                        <Button color="primary" component={Link} to="/messages" sx={{ color: 'black' }}>
                            Messages
                        </Button>

                        {isAdmin && (
                            <Button color="primary" component={Link} to="/all-users" sx={{ color: 'black' }}>
                                All Users
                            </Button>
                        )}

                        <Logout logout={logout} />
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Header;
