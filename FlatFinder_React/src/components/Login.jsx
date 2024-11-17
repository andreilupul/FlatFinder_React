import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { doSignInWithEmailAndPassword } from '../auth';
import backgroundImage from '../assets/ny4.jpg';


function Login() {

    // definim trei stări (email, password, error) folosind useState pentru a
    //  gestiona valorile emailului, parolei și mesajele de eroare.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // Mesajul de eroare
    // useNavigate este un hook din react-router-dom care permite redirecționarea între pagini.
    const navigate = useNavigate();

    // funcția principală care  autentifica utilizatorul.
    const handleLogin = async () => {

        try {
            setError(""); // Resetează mesajul de eroare înainte de a încerca autentificarea
            // doSignInWithEmailAndPassword (legată de Firebase) este apelată pentru a face autentificarea.
            await doSignInWithEmailAndPassword(email, password);
            navigate('/'); // Redirecționează la pagina principală,daca autentificarea are succes

            //Dacă autentificarea eșuează ,codul analizează tipul erorii și actualizează starea error cu mesajul corespunzător.
        } catch (error) {
            console.error("Login failed:", error);

            // Gestionarea erorilor de autentificare
            if (error.code === "auth/user-not-found") {
                setError("Emailul introdus nu există.");
            } else if (error.code === "auth/invalid-email") {
                setError("Emailul introdus este invalid.");
            } else if (error.code === "auth/wrong-password") {
                setError("Parola introdusă este incorectă.");
            } else {
                setError("A apărut o eroare. Te rugăm să încerci din nou.");
            }
        }
    };
    // Functia handleEmailChange: Când utilizatorul modifica emailul, valoarea emailului
    // este actualizată, iar mesajul de eroare este resetat
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setError(""); // Resetează mesajul de eroare la modificarea emailului
    };

    return (
        <div className='test'>

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
                        onChange={handleEmailChange} // Folosește funcția modificată pentru a reseta eroarea
                        fullWidth
                        sx={{ marginBottom: 2 }}
                        error={!!error} // Marchează câmpul ca având o eroare dacă există un mesaj de eroare
                        helperText={error} // Afișează mesajul de eroare sub câmpul de input
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
                        Not have an acount , <Link to="/register">Register</Link>
                    </Typography>
                </Box>
            </Box>



        </div>
    );
}


export default Login;
