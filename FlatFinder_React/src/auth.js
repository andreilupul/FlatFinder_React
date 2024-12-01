import axios from 'axios';

// URL-ul serverului tău Node.js (backend)
const API_URL = 'http://localhost:5000/api/users'; // Actualizează cu adresa corectă a serverului tău

// Creare utilizator
export const doCreateUserWithEmailAndPassword = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/register`, { email, password });
        return response.data; // Răspunsul conține detalii despre utilizator
    } catch (error) {
        throw new Error('Eroare la crearea utilizatorului: ' + error.message);
    }
}

// Autentificare utilizator
export const doSignInWithEmailAndPassword = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        return response.data; // Răspunsul conține detalii despre utilizator și token-ul de autentificare
    } catch (error) {
        throw new Error('Eroare la autentificare: ' + error.message);
    }
}

// Deconectare utilizator
export const doSignOut = () => {
    // În cazul în care folosești sesiuni cu token JWT, ar trebui să elimini token-ul salvat în localStorage sau sessionStorage
    localStorage.removeItem('authToken');
}
