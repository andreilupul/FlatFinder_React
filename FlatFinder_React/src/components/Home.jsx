import React, { useState, useEffect } from "react";
import { Button, Toolbar, AppBar } from "@mui/material";
import { useAuth } from "../contexts/authContext";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import Header from "./Header";
import axios from 'axios';
import AllFlats from "./AllFlats";
import backgroundImage from '../assets/ny1.jpg';

function Home() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const location = useLocation();

    const [isAdmin, setIsAdmin] = useState(false);
    const [showAllFlats, setShowAllFlats] = useState(true);
    const [activeButton, setActiveButton] = useState(location.pathname);
    const [users, setUsers] = useState([]);  // Variabila pentru lista de utilizatori

    // UseEffect pentru a verifica utilizatorul și pentru a încărca utilizatorii din MongoDB
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        } else {
            checkAdminStatus();
            fetchUsers();  // Preluăm utilizatorii din MongoDB
        }
    }, []);

    useEffect(() => {
        if (location.pathname === '/') {
            setShowAllFlats(true);
        } else {
            setShowAllFlats(false);
        }

        setActiveButton(location.pathname);
    }, [location]);

    // Funcție pentru a obține utilizatorii din MongoDB
    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/users');
            setUsers(response.data);  // Salvează utilizatorii în state
        } catch (error) {
            console.error('Eroare la obținerea utilizatorilor:', error);
        }
    };

    // Verifică dacă utilizatorul curent este administrator
    const checkAdminStatus = async () => {
        if (currentUser) {
            try {
                const response = await axios.get(`http://localhost:5000/api/users/${currentUser.uid}`);
                setIsAdmin(response.data.isAdmin);
            } catch (error) {
                console.error('Eroare la verificarea statutului administratorului:', error);
            }
        }
    };

    // Funcție pentru stilizarea butoanelor
    const buttonStyle = (path) => ({
        backgroundColor: activeButton === path ? '#1976d2' : 'transparent',
        color: activeButton === path ? '#ffffff' : '#000000',
        border: '1px solid #1976d2',
        '&:hover': {
            backgroundColor: activeButton === path ? '#1565c0' : 'rgba(0, 0, 0, 0.1)',
            color: activeButton === path ? '#ffffff' : '#000000',
        }
    });

    return (
        <div>
            <img
                src={backgroundImage}
                alt="background"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1,
                    opacity: 0.95,
                }}
            />

            <Header />

            <AppBar
                position="static"
                sx={{
                    backgroundColor: 'transparent',
                    boxShadow: 'none'
                }}
            >
                <Toolbar>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/all-flats"
                        sx={{
                            ...buttonStyle('/all-flats'),
                            border: 'none',
                            padding: 0,
                            textTransform: 'none',
                        }}
                        onClick={() => setActiveButton('/all-flats')}
                    >
                        All Flats
                    </Button>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/my-flats"
                        sx={{
                            ...buttonStyle('/my-flats'),
                            border: 'none',
                            padding: 0,
                            textTransform: 'none',
                        }}
                        onClick={() => setActiveButton('/my-flats')}
                    >
                        My Flats
                    </Button>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/favorite-flats"
                        sx={{
                            ...buttonStyle('/favorite-flats'),
                            border: 'none',
                            padding: 0,
                            textTransform: 'none',
                        }}
                        onClick={() => setActiveButton('/favorite-flats')}
                    >
                        Favorite Flats
                    </Button>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/add-flat"
                        sx={{
                            ...buttonStyle('/add-flat'),
                            border: 'none',
                            textTransform: 'none',
                        }}
                        onClick={() => setActiveButton('/add-flat')}
                    >
                        Add Flat
                    </Button>
                </Toolbar>
            </AppBar>
            <div style={{ padding: '20px' }}>
                <Outlet />
            </div>
            {showAllFlats && <AllFlats />}
        </div>
    );
}

export default Home;
