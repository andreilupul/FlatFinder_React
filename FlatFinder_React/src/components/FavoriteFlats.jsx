import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import { db } from '../firebase';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/authContext';
import { Delete } from '@mui/icons-material';


//este o variabilă de stare care stochează lista de apartamente favorite ale utilizatorului. Inițial, este un array gol
function FavoriteFlats() {
    const [favoriteFlats, setFavoriteFlats] = useState([]);
    const { currentUser } = useAuth();  // obține detalii despre utilizatorul curent logat.

    //gestionează deschiderea și închiderea dialogului de 
    //confirmare pentru ștergerea unui apartament favorit.
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [flatToDelete, setFlatToDelete] = useState(null); // stochează ID-ul apartamentului care urmează să fie șters.


    useEffect(() => {
        // obțin referințele apartamentelor favorite ale utilizatorului 
        // din colecția favorites (care aparține fiecărui utilizator în parte).
        const fetchFavoriteFlats = async () => {
            try {
                const favoritesCollection = collection(db, 'users', currentUser.uid, 'favorites');
                const favoritesSnapshot = await getDocs(favoritesCollection);
                const flatIds = favoritesSnapshot.docs.map(doc => doc.data().flatId);// extrage ID-urile apartamentelor
                // favorite din documentele recuperate din colecția de favorites.

                // Se creează o interogare către colecția flats folosind ID-urile extrase pentru a recupera detaliile fiecărui apartament favorit. 
                if (flatIds.length > 0) {
                    const flatsQuery = query(collection(db, 'flats'), where('__name__', 'in', flatIds));
                    const flatsSnapshot = await getDocs(flatsQuery);
                    const flatsList = flatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setFavoriteFlats(flatsList);//actualizare a stării în React, care actualizează variabila de stare favoriteFlats cu o nouă valoare.
                }
            } catch (error) {
                console.error('Error fetching favorite flats:', error);
            }
        };

        fetchFavoriteFlats() //;aduce datele din baza de date Firestore cu apartamentele favorite ale utilizatorului curent
    }, [currentUser]);//reprezintă utilizatorul curent care este autentificat


    //Funcția este apelată când utilizatorul dorește să șteargă un apartament favorit.
    const handleOpenConfirmDelete = (flatId) => {
        setFlatToDelete(flatId); //setează ID-ul apartamentului care urmează să fie șters.
        setConfirmDeleteOpen(true);//deschide dialogul de confirmare pentru ștergerea apartamentului.
    };

    //Închide dialogul de confirmare și resetează flatToDelete la null, pentru a preveni orice ștergere accidentală.
    const handleCloseConfirmDelete = () => {
        setConfirmDeleteOpen(false);
        setFlatToDelete(null);
    };


    // Șterge apartamentul favorit al utilizatorului
    const handleDelete = async () => {
        try {
            if (flatToDelete) { //Verifică dacă există un apartament selectat pentru ștergere (prin intermediul variabilei flatToDelete).

                // Documentul reprezintă apartamentul pe care utilizatorul curent dorește să-l șteargă din lista sa de favorite
                const favoriteDocRef = doc(db, 'users', currentUser.uid, 'favorites', flatToDelete);

                await deleteDoc(favoriteDocRef);//șterge apartamentul favorit din subcolecția favorites a utilizatorului în Firestore.

                // Actualizează starea pentru a elimina apartamentul șters
                setFavoriteFlats(prevFlats => prevFlats.filter(flat => flat.id !== flatToDelete));
                console.log('Favorite deleted');
                handleCloseConfirmDelete();//Închide dialogul de confirmare.
            }
        } catch (error) {
            console.error('Error deleting favorite:', error);
        }
    };

    return (
        <>
            <TableContainer >
                <Table>
                    <TableHead
                        sx={{
                            backgroundColor: 'rgba( 255, 255, 255, 1)', // Fundal semi-transparent 
                        }}>
                        <TableRow>
                            <TableCell>City</TableCell>
                            <TableCell>Street Name</TableCell>
                            <TableCell>Street Number</TableCell>
                            <TableCell>Area Size</TableCell>
                            <TableCell>AC</TableCell>
                            <TableCell>Year Built</TableCell>
                            <TableCell>Rent Price $</TableCell>
                            <TableCell>Date Available</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.5)', // Fundal alb semi-transparent
                            boxShadow: 'none', // Opțional: elimină shadow-ul implicit al Paper
                        }}>
                        {favoriteFlats.map(flat => (
                            <TableRow key={flat.id}>
                                <TableCell>{flat.city}</TableCell>
                                <TableCell>{flat.streetName}</TableCell>
                                <TableCell>{flat.streetNumber}</TableCell>
                                <TableCell>{flat.areaSize}</TableCell>
                                <TableCell>{flat.ac}</TableCell>
                                <TableCell>{flat.yearBuilt}</TableCell>
                                <TableCell>{flat.rentPrice}</TableCell>
                                <TableCell>{flat.dateAvailable}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenConfirmDelete(flat.id)}>
                                        <Delete sx={{ color: 'red' }} />
                                    </IconButton>

                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={confirmDeleteOpen}
                onClose={handleCloseConfirmDelete}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to delete this flat from your favorites? This action cannot be undone.</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDelete} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="error">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default FavoriteFlats;
