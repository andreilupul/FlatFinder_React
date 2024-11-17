import React, { useState } from 'react';
import { Button, Modal } from '@mui/material';
import { doSignOut } from '../auth';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from "@mui/icons-material/Logout";


//Definirea Funcției Logout
const Logout = () => {
    const [open, setOpen] = useState(false);//Creează o stare locală open pentru a controla 
    //dacă modalul de confirmare este deschis sau închis. Inițial, valoarea este false (modalul este închis).
    const navigate = useNavigate();//navigarea intre rute

    const handleOpen = () => setOpen(true);// Funcție care setează starea open la true, deschizând astfel modalul de confirmare.

    const handleClose = () => setOpen(false);//Funcție care setează starea open la false, închizând astfel modalul de confirmare.

    const handleLogout = () => {
        doSignOut().then(() => {//gestionează deconectarea utilizatorului.
            navigate('/login');  // Navighează către pagina de login după deconectare
        });
        handleClose();  // Închide modalul după ce utilizatorul a confirmat
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
                    backgroundColor: 'white',  // Fundal alb pentru modal
                    padding: '20px',  // Padding pentru spațiere interioară
                    margin: 'auto',  // Centrare automată a modalului
                    marginTop: '20%',  // Distanta de sus pentru plasare verticală
                    width: '300px',  // Lățimea modalului
                    textAlign: 'center',  // Centrarea textului
                    borderRadius: '8px',  // Colțuri rotunjite pentru aspect modern
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'  // Umbră pentru a adăuga efect de profunzime
                }}>
                    <h2 id="logout-modal-title">Confirmation Logout</h2>
                    <p id="logout-modal-description"> Are you sure you want to Logout?</p>
                    <Button
                        onClick={handleLogout}
                        style={{
                            marginRight: '10px',  // Spațiere între butoane
                            backgroundColor: '#007BFF',  // Culoare albastră pentru butonul "Da"
                            color: 'white'  // Text alb pentru contrast
                        }}
                    >
                        Yes
                    </Button>
                    <Button
                        onClick={handleClose}
                        style={{
                            backgroundColor: '#6c757d',  // Culoare gri pentru butonul "Nu"
                            color: 'white'  // Text alb pentru contrast
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



