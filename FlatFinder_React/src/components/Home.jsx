import React, { useState, useEffect } from "react";
import { Button, Toolbar, AppBar } from "@mui/material";
import { useAuth } from "../contexts/authContext";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import Header from "./Header";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import AllFlats from "./AllFlats";
import backgroundImage from '../assets/ny1.jpg';




function Home() {
    const navigate = useNavigate();//navigarea programatică între rute
    const { currentUser } = useAuth();//returnează informații despre utilizatorul curent
    const location = useLocation(); // Obține locația curentă a paginii

    const [isAdmin, setIsAdmin] = useState(false);// indică dacă utilizatorul curent este administrator
    const [showAllFlats, setShowAllFlats] = useState(true); // Controlează vizibilitatea componentei AllFlats
    const [activeButton, setActiveButton] = useState(location.pathname); // Starea pentru butonul activ


    //Se execută doar o dată (când componenta se montează) datorită dependenței goale [].
    useEffect(() => {
        if (!currentUser) {//Dacă utilizatorul nu este autentificat, se redirecționează la pagina de autentificare.
            navigate('/login');
        } else {
            checkAdminStatus();// Funcții care se apelează dacă utilizatorul este autentificat.
            fetchUsers();// Funcții care se apelează dacă utilizatorul este autentificat.
        }
    }, []);


    //: Se execută de fiecare dată când location se schimbă.
    useEffect(() => {

        if (location.pathname === '/') {  // Actualizare vizibilitate AllFlats: Dacă ruta curentă este /, atunci AllFlats este vizibilă, altfel nu.
            setShowAllFlats(true);
        } else {
            setShowAllFlats(false);
        }

        // Actualizează butonul activ în funcție de locație
        setActiveButton(location.pathname);
    }, [location]);


    // Preia lista utilizatorilor din colecția users din baza de date și o stochează într-o variabilă.
    const fetchUsers = async () => {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };


    //Verifică dacă utilizatorul curent este administrator și actualizează starea isAdmin în funcție de aceasta.
    const checkAdminStatus = async () => {
        if (currentUser) {
            const userDoc = doc(db, "users", currentUser.uid);
            const userSnapshot = await getDoc(userDoc);
            const userData = userSnapshot.data();
            if (userData) {
                setIsAdmin(userData.isAdmin);
            }
        }
    };


    // Funcție care returnează stilurile pentru butoane, bazate pe ruta curentă (path)
    const buttonStyle = (path) => ({
        backgroundColor: activeButton === path ? '#1976d2' : 'transparent', // Fundalul butonului activ
        color: activeButton === path ? '#ffffff' : '#000000', // Textul butonului activ (alb) sau negru
        border: '1px solid #1976d2', // Conturul butonului
        '&:hover': {
            backgroundColor: activeButton === path ? '#1565c0' : 'rgba(0, 0, 0, 0.1)', // Fundal la hover
            color: activeButton === path ? '#ffffff' : '#000000', // Textul la hover
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
                    // filter: 'blur(0px)', // Efectul de blur
                    zIndex: -1, // Asigură că imaginea este în spate
                    opacity: 0.95, // Aplica un nivel de transparență
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
                    < Button
                        color="inherit"
                        component={Link}
                        to="/all-flats"
                        sx={{
                            ...buttonStyle('/all-flats'),
                            border: 'none', // Elimină border-ul
                            padding: 0,     // Opțional: elimină padding-ul pentru a face butonul să fie doar text
                            textTransform: 'none', // Opțional: menține textul în forma originală (fără uppercase)
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
                            border: 0,
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
            {showAllFlats && <AllFlats />} {/* Afișează AllFlats doar dacă showAllFlats este true */}
        </div >
    );
}

export default Home;




