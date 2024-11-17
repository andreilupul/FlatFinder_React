import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { Button, Typography, AppBar, Toolbar } from '@mui/material';
import Logout from './Logout';
import HomeIcon from "@mui/icons-material/Home";


// autentificare, informații cheie despre utilizatorul curent:
// obiectul currentUser, starea de autentificare userLoggedIn, și dacă acesta este administrator isAdmin. 
//Aceste informații sunt folosite ulterior în componentă pentru a personaliza interfața 
function Header() {
    const { currentUser, userLoggedIn, isAdmin } = useAuth();

    return (
        <AppBar position="static"

            sx={{
                backgroundColor: 'transparent', // Navbar transparent
                boxShadow: 'none'
            }}
        >

            <Toolbar>
                {userLoggedIn && (

                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'black', display: 'flex', alignItems: 'center' }}>
                        FlatFinder Welcome
                        <HomeIcon sx={{ marginLeft: 1 }} /> {/* Add the Home icon with some left margin */}
                        , {currentUser.email}  {isAdmin && <span style={{ color: 'red' }}>(Admin)</span>}
                    </Typography>

                )}


                <Button color="secondary" component={Link} to="/" sx={{ color: 'black' }}>
                    Home
                </Button>
                {userLoggedIn && (
                    <>
                        <Button color="primary" component={Link} to="/my-profiles" sx={{ color: 'black' }}>
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

                        <Logout />
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Header;
