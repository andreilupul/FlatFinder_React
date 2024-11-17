import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField
} from '@mui/material';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/authContext';
import { Delete, Edit } from '@mui/icons-material';



function MyFlats() {
    const { currentUser } = useAuth();//obține detaliile utilizatorului autentificat.
    const [flats, setFlats] = useState([]);// stochează lista de apartamente ale utilizatorului.
    const [editOpen, setEditOpen] = useState(false);//controlează dacă formularul de editare este deschis sau închis.
    const [selectedFlat, setSelectedFlat] = useState(null);//stochează apartamentul selectat pentru editare
    const [editedFlat, setEditedFlat] = useState({});// stochează datele apartamentului în timp ce acesta este editat.
    const [favoriteFlats, setFavoriteFlats] = useState(new Set());// stochează setul de ID-uri ale apartamentelor favorite ale
    // utilizatorului Folosește un Set pentru a evita duplicarea
    const [deleteOpen, setDeleteOpen] = useState(false);//controlează dacă formularul de confirmare a ștergerii este deschis sau închis
    const [flatToDelete, setFlatToDelete] = useState(null);//stochează ID-ul apartamentului care urmează să fie șters


    //obține date despre apartamente și favoritele utilizatorului din baza de date
    useEffect(() => { //obține apartamentele care aparțin utilizatorului curent.
        const fetchFlats = async () => {
            const flatsCollection = collection(db, 'flats');  // referinta la colecția flats din baza de date Firestore.
            const q = query(flatsCollection, where('ownerUid', '==', currentUser.uid));// Creează o interogare pentru a obține doar apartamentele
            // al căror câmp ownerUid este egal cu ID-ul utilizatorului curent (currentUser.uid).
            const flatsSnapshot = await getDocs(q);//Transformă fiecare document într-un obiect care include ID-ul documentului și datele acestuia.
            const flatsList = flatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));//transforma fiecare document obținut de la interogarea 
            // Firestore într-un obiect JavaScript care conține datele dorite
            setFlats(flatsList);//Actualizează starea flats cu lista de apartamente obținută
        };

        fetchFlats();//Actualizează starea flats cu lista de apartamente obținută
    }, [currentUser.uid]);// Efectul se va reactiva atunci când currentUser.uid se schimbă,
    // asigurându-se că apartamentele afișate sunt actualizate pentru utilizatorul curent.


    //Obținerea apartamentelor favorite ale utilizatorului
    useEffect(() => {//se execută de fiecare dată când currentUser.uid se schimbă.
        // Este folosit pentru a obține lista de apartamente favorite ale utilizatorului curent.
        const fetchFavorites = async () => {
            const userFavoritesRef = collection(db, 'users', currentUser.uid, 'favorites');// Se referă la colecția favorites a utilizatorului curent
            // localizată în subcolecția users/{currentUser.uid}/favorites.
            const favoritesSnapshot = await getDocs(userFavoritesRef);//Obține documentele din colecția favorites a utilizatorului
            const favoritesList = new Set(favoritesSnapshot.docs.map(doc => doc.id));//Transformă fiecare document într-un ID de apartament favorit.
            setFavoriteFlats(favoritesList);// Actualizează starea favoriteFlats cu setul de ID-uri ale apartamentelor favorite.
        };

        fetchFavorites();//Actualizează starea favorite 
    }, [currentUser.uid]);


    // handleDelete pentru a deschide dialogul de confirmare de stergere
    const handleDelete = (flatId) => {
        setFlatToDelete(flatId);
        setDeleteOpen(true);
    };

    // funcția care confirmă ștergerea
    const confirmDelete = async () => {
        try {
            await deleteDoc(doc(db, 'flats', flatToDelete));
            setFlats(flats.filter(flat => flat.id !== flatToDelete));
            console.log('Flat deleted successfully');
        } catch (error) {
            console.error('Error deleting flat:', error);
        } finally {
            setDeleteOpen(false);
            setFlatToDelete(null);
        }
    };

    // seteaza starea de favorit al unui apartament pentru utilazatorul curent,dar daca apart este in lista de fav a utilizatorului
    // va fi eliminat,daca nu este in lista  de favorite va fi adaugat
    const handleFavorite = async (flatId) => {
        try {
            const userFavoritesRef = doc(db, 'users', currentUser.uid, 'favorites', flatId);//reprezintă starea de favorit a apartamentului cu ID-ul flatId.
            const favoriteDoc = await getDoc(userFavoritesRef);//. Verificarea Dacă Apartamentul Este Deja Favorit

            // Gestionarea Cazului În Care Apartamentul Este Deja Favorit
            if (favoriteDoc.exists()) {// verifică dacă documentul există în baza de date.
                await deleteDoc(userFavoritesRef);//șterge documentul, eliminând apartamentul din lista de favorite a utilizatorului.
                setFavoriteFlats(prev => { //actualizează starea locală favoriteFlats. 
                    const updatedFavorites = new Set(prev);//creează un nou Set care conține elementele anterioare, dar fără apartamentul eliminat
                    updatedFavorites.delete(flatId);//elimină apartamentul din setul de favorite și se returnează noul set actualizat.
                    return updatedFavorites;
                });
                console.log('Removed from favorites');

            } else {  // Gestionarea Cazului În Care Apartamentul Nu Este Favorit
                await setDoc(userFavoritesRef, { flatId });// creează un nou document cu ID-ul apartamentului în colecția de favorite.
                setFavoriteFlats(prev => new Set(prev).add(flatId));//creează un nou Set care conține elementele anterioare și se adaugă ID-ul apartamentului ca favorit.
                console.log('Added to favorites');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };



    // deschide un formular de editare pentru un apartament
    const handleEditClick = (flat) => {
        selectat
        setSelectedFlat(flat);
        setEditedFlat(flat);
        setEditOpen(true);
    };

    //închide modulul de editare și resetarea stării asociate cu editarea unui apartament
    const handleEditClose = () => {
        setEditOpen(false);
        setSelectedFlat(null);
    };

    // gestiona modificările în formularele de editare a unui apartament. 
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditedFlat(prevState => ({ ...prevState, [name]: value }));
    };


    // salva modificările efectuate asupra unui apartament și a actualiza datele atât în baza de date Firebase, cât și în starea locală 
    const handleEditSave = async () => {
        try {
            const flatRef = doc(db, 'flats', editedFlat.id);
            await updateDoc(flatRef, editedFlat);
            setFlats(flats.map(flat => flat.id === editedFlat.id ? editedFlat : flat));
            handleEditClose();
            console.log('Flat updated successfully');
        } catch (error) {
            console.error('Error updating flat:', error);
        }
    };

    // culoarea butoanelor un functie daca este favorit sau nu
    const favoriteButtonStyle = (flatId) => ({
        backgroundColor: favoriteFlats.has(flatId) ? '#1976d2' : 'transparent',
        color: favoriteFlats.has(flatId) ? '#ffffff' : '#000000',
        border: '1px solid #1976d2',
        '&:hover': {
            backgroundColor: favoriteFlats.has(flatId) ? '#1565c0' : 'rgba(0, 0, 0, 0.1)',
            color: favoriteFlats.has(flatId) ? '#ffffff' : '#000000',
        }
    });

    return (
        <div>

            <TableContainer>
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
                            <TableCell>Has AC</TableCell>
                            <TableCell>Year Built</TableCell>
                            <TableCell>Rent Price</TableCell>
                            <TableCell>Date Available</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.5)', // Fundal alb semi-transparent
                        }}>
                        {flats.map(flat => (
                            <TableRow key={flat.id}>
                                <TableCell>{flat.city}</TableCell>
                                <TableCell>{flat.streetName}</TableCell>
                                <TableCell>{flat.streetNumber}</TableCell>
                                <TableCell>{flat.areaSize}</TableCell>
                                <TableCell>{flat.ac ? 'Yes' : 'No'}</TableCell>
                                <TableCell>{flat.yearBuilt}</TableCell>
                                <TableCell>{flat.rentPrice}</TableCell>
                                <TableCell>{flat.dateAvailable}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="text"
                                        onClick={() => handleFavorite(flat.id)}
                                        sx={{ ...favoriteButtonStyle(flat.id), fontSize: '0.6rem' }}
                                        size="small"

                                    >Favorite</Button>

                                    <IconButton onClick={() => handleDelete(flat.id)}>
                                        <Delete sx={{ color: 'red' }} />
                                    </IconButton>

                                    <IconButton onClick={() => handleEditClick(flat)}>
                                        <Edit />
                                    </IconButton>

                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal pentru editarea unui flat */}
            {
                selectedFlat && (
                    <Dialog open={editOpen} onClose={handleEditClose}>
                        <DialogTitle>Edit Flat</DialogTitle>
                        <DialogContent>
                            <TextField
                                margin="dense"
                                label="City"
                                name="city"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={editedFlat.city || ''}
                                onChange={handleEditChange}
                            />
                            <TextField
                                margin="dense"
                                label="Street Name"
                                name="streetName"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={editedFlat.streetName || ''}
                                onChange={handleEditChange}
                            />
                            <TextField
                                margin="dense"
                                label="Street Number"
                                name="streetNumber"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={editedFlat.streetNumber || ''}
                                onChange={handleEditChange}
                            />
                            <TextField
                                margin="dense"
                                label="Area Size"
                                name="areaSize"
                                type="number"
                                fullWidth
                                variant="outlined"
                                value={editedFlat.areaSize || ''}
                                onChange={handleEditChange}
                            />

                            <TextField
                                margin="dense"
                                label="Rent Price"
                                name="rentPrice"
                                type="number"
                                fullWidth
                                variant="outlined"
                                value={editedFlat.rentPrice || ''}
                                onChange={handleEditChange}
                            />
                            <TextField
                                margin="dense"
                                label="Date Available"
                                name="dateAvailable"
                                type="date"
                                fullWidth
                                variant="outlined"
                                value={editedFlat.dateAvailable || ''}
                                onChange={handleEditChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleEditClose} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleEditSave} color="success">
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>
                )
            }

            {/* Dialog de confirmare stergere */}
            <Dialog
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                aria-labelledby="confirm-delete-dialog-title"
                aria-describedby="confirm-delete-dialog-description"
            >
                <DialogTitle id="confirm-delete-dialog-title">
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-delete-dialog-description">
                        Are you sure you want to delete this flat? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div >
    );
}

export default MyFlats;

