import React, { useState, useEffect } from 'react';
import {
    Box, TextField, IconButton, Dialog, DialogActions,
    DialogContent, DialogTitle, Button, Checkbox, TableContainer, Paper
} from '@mui/material';
import { Favorite, FavoriteBorder, Send, Edit, Delete } from '@mui/icons-material';
import { db } from '../firebase';
import { collection, getDocs, doc, addDoc, setDoc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/authContext';
import { DataGrid } from '@mui/x-data-grid';

function AllFlats() {
    // flats și filteredFlats stochează lista de apartamente și versiunea filtrată
    const [flats, setFlats] = useState([]);
    const [filteredFlats, setFilteredFlats] = useState([]);
    // favoriteFlats stochează apartamentele adăugate la favorite
    const [favoriteFlats, setFavoriteFlats] = useState([]);
    // currentUser și isAdmin sunt obținute din useAuth() pentru a 
    // gestiona utilizatorul curent și drepturile de admin
    const { currentUser, isAdmin } = useAuth();
    // open, message, recipientUid, editOpen, selectedFlat, confirmDeleteOpen,
    //  și flatToDelete controlează comportamentul diferitelor modale 
    //  și procese (ex. trimiterea de mesaje, editarea, ștergerea)
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [recipientUid, setRecipientUid] = useState('');
    const [editOpen, setEditOpen] = useState(false);
    const [selectedFlat, setSelectedFlat] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [flatToDelete, setFlatToDelete] = useState(null);



    useEffect(() => {
        // fetchFlats: aduce apartamentele din baza de date și le stochează în state-ul flats  
        const fetchFlats = async () => {
            const flatsCollection = collection(db, 'flats');
            const flatsSnapshot = await getDocs(flatsCollection);
            const flatsList = flatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFlats(flatsList);
            setFilteredFlats(flatsList);
        };

        // fetchFavorites: aduce apartamentele favorite ale utilizatorului curent 
        // din baza de date și le stochează în favoriteFlats
        const fetchFavorites = async () => {
            const favoritesCollection = collection(db, 'users', currentUser.uid, 'favorites');
            const favoritesSnapshot = await getDocs(favoritesCollection);
            const favoritesList = favoritesSnapshot.docs.map(doc => doc.id);
            setFavoriteFlats(favoritesList);
        };

        fetchFlats();
        fetchFavorites();
    }, [currentUser]);

    //    functia handleFavorite Verifică dacă apartamentul este deja favorit
    const handleFavorite = async (flatId) => {
        try {
            const userFavoritesRef = doc(db, 'users', currentUser.uid, 'favorites', flatId);
            const favoriteDoc = await getDoc(userFavoritesRef);

            // Dacă este favorit, îl șterge din colecția favorites
            if (favoriteDoc.exists()) {
                await deleteDoc(userFavoritesRef);
                setFavoriteFlats(prev => prev.filter(id => id !== flatId));
                console.log('Removed from favorites');
            } else {
                // Dacă nu este favorit, îl adaugă.
                await setDoc(userFavoritesRef, { flatId });
                setFavoriteFlats(prev => [...prev, flatId]);
                console.log('Added to favorites');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };


    // Închide modalul pentru trimiterea unui mesaj și resetează variabilele aferente
    const handleClose = () => {
        setOpen(false);
        setMessage('');
    };


    // Trimite un mesaj către proprietarul apartamentului selectat. Verifică dacă
    //  recipientUid este definit și adaugă un document în colecția messages din baza de date.
    const handleSend = async () => {
        if (!recipientUid) {
            console.error('Recipient UID is undefined. Cannot send message.');
            return;
        }

        try {
            await addDoc(collection(db, 'messages'), {
                ownerEmail: currentUser.email,
                senderUid: currentUser.uid,
                recipientUid: recipientUid,
                message: message,
                timestamp: new Date(),
                flatsList: {
                    city: selectedFlat.city || 'Unknown',
                    streetName: selectedFlat.streetName || 'Unknown',
                    streetNumber: selectedFlat.streetNumber || 'Unknown',
                    flatsId: selectedFlat.id || 'Unknown'
                }
            });
            console.log('Message sent successfully');
            handleClose();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Deschide un dialog de confirmare pentru ștergerea unui apartament specific
    const handleOpenConfirmDelete = (flatId) => {
        setFlatToDelete(flatId);
        setConfirmDeleteOpen(true);
    };

    // Închide dialogul de confirmare și resetează variabilele aferente ștergerii
    const handleCloseConfirmDelete = () => {
        setConfirmDeleteOpen(false);
        setFlatToDelete(null);
    };

    // Șterge apartamentul selectat din baza de date, actualizând și
    //  state-urile aferente pentru a reflecta modificările în UI.
    const handleDeleteFlat = async () => {
        if (flatToDelete) {
            try {
                await deleteDoc(doc(db, 'flats', flatToDelete));
                setFlats(flats.filter(flat => flat.id !== flatToDelete));
                setFilteredFlats(filteredFlats.filter(flat => flat.id !== flatToDelete));
                console.log('Flat deleted successfully');
                handleCloseConfirmDelete();
            } catch (error) {
                console.error('Error deleting flat:', error);
            }
        }
    };

    // Setează apartamentul selectat pentru a fi editat și deschide modalul de editare.
    const handleEditFlat = (flat) => {
        if (!flat) {
            console.error('Flat data is not available');
            return;
        }
        setSelectedFlat(flat);
        setEditOpen(true);
    };

    // Închide modalul de editare și resetează variabilele aferente.
    const handleEditClose = () => {
        setEditOpen(false);
        setSelectedFlat(null);
    };

    // Actualizează apartamentul în baza de date și în
    //  lista de apartamente, reflectând modificările în UI.
    const handleUpdateFlat = async () => {
        try {
            const flatRef = doc(db, 'flats', selectedFlat.id);
            await updateDoc(flatRef, selectedFlat);
            setFlats(flats.map(flat => (flat.id === selectedFlat.id ? selectedFlat : flat)));
            setFilteredFlats(filteredFlats.map(flat => (flat.id === selectedFlat.id ? selectedFlat : flat)));
            handleEditClose();
            console.log('Flat updated successfully');
        } catch (error) {
            console.error('Error updating flat:', error);
        }
    };

    // Definirea coloanelor pentru tabelul de apartamente
    // Codul include validarea operațiunilor de gestionare a apartamentelor și
    //  a acțiunilor utilizatorilor în funcție de rolul lor (isAdmin).
    const columns = [
        { field: 'city', headerName: 'City', width: 190 },
        { field: 'streetName', headerName: 'Street Name', width: 190 },
        { field: 'streetNumber', headerName: 'Street Number', width: 135 },
        { field: 'areaSize', headerName: 'Area Size', width: 130 },
        { field: 'ac', headerName: 'AC', width: 90 },
        { field: 'yearBuilt', headerName: 'Year Built', width: 150 },
        { field: 'rentPrice', headerName: 'Rent Price $', width: 120 },
        { field: 'dateAvailable', headerName: 'Date Available', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => handleFavorite(params.row.id)}>
                        {favoriteFlats.includes(params.row.id) ? <Favorite sx={{ color: 'red' }} /> : <FavoriteBorder />}
                    </IconButton>

                    {params.row.ownerUid !== currentUser.uid && (
                        <IconButton
                            onClick={() => {
                                setRecipientUid(params.row.ownerUid);
                                setSelectedFlat(params.row);

                                setOpen(true);
                            }}
                        >
                            <Send />
                        </IconButton>
                    )}

                    {isAdmin && (
                        <>
                            <IconButton onClick={() => handleEditFlat(params.row)}>
                                <Edit />
                            </IconButton>
                            <IconButton onClick={() => handleOpenConfirmDelete(params.row.id)}>
                                <Delete sx={{ color: 'red' }} />
                            </IconButton>
                        </>
                    )}
                </>
            ),
        },
    ];

    return (
        <Box>
            <TableContainer >
                <DataGrid
                    sx={{
                        '.MuiDataGrid-menuIcon': {
                            visibility: 'visible !important',
                            width: "auto !important",

                        },
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    }}


                    rows={filteredFlats}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    disableSelectionOnClick
                    autoHeight
                />

                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Send a Message</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Message"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleSend} color="primary">
                            Send
                        </Button>
                    </DialogActions>
                </Dialog>

                {selectedFlat && (
                    <Dialog open={editOpen} onClose={handleEditClose}>
                        <DialogTitle>Edit Flat</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="City"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={selectedFlat.city}
                                onChange={(e) => setSelectedFlat({ ...selectedFlat, city: e.target.value })}
                            />
                            <TextField
                                margin="dense"
                                label="Street Name"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={selectedFlat.streetName}
                                onChange={(e) => setSelectedFlat({ ...selectedFlat, streetName: e.target.value })}
                            />
                            <TextField
                                margin="dense"
                                label="Street Number"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={selectedFlat.streetNumber}
                                onChange={(e) => setSelectedFlat({ ...selectedFlat, streetNumber: e.target.value })}
                            />
                            <TextField
                                margin="dense"
                                label="Area Size"
                                type="number"
                                fullWidth
                                variant="outlined"
                                value={selectedFlat.areaSize}
                                onChange={(e) => setSelectedFlat({ ...selectedFlat, areaSize: e.target.value })}
                            />
                            <TextField
                                margin="dense"
                                label="Rent Price"
                                type="number"
                                fullWidth
                                variant="outlined"
                                value={selectedFlat.rentPrice}
                                onChange={(e) => setSelectedFlat({ ...selectedFlat, rentPrice: e.target.value })}
                            />
                            <TextField
                                margin="dense"
                                label="Date Available"
                                type="date"
                                fullWidth
                                variant="outlined"
                                value={selectedFlat.dateAvailable}
                                onChange={(e) => setSelectedFlat({ ...selectedFlat, dateAvailable: e.target.value })}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px' }}>
                                <Checkbox
                                    checked={selectedFlat.ac == 'yes'}
                                    onChange={(e) => setSelectedFlat({ ...selectedFlat, ac: e.target.checked })}
                                    color="primary"
                                />
                                <label>Has AC</label>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleEditClose} color="primary">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdateFlat}
                                sx={{
                                    backgroundColor: 'green',
                                    color: 'white',
                                    width: '100px',
                                    height: '30px',
                                    marginTop: 1
                                }}
                            >
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}

                <Dialog

                    open={confirmDeleteOpen}
                    onClose={handleCloseConfirmDelete}
                >
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <p>Are you sure you want to delete this flat? This action cannot be undone.</p>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseConfirmDelete} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteFlat} color="error">
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </TableContainer>
        </Box>
    );
}

export default AllFlats;


