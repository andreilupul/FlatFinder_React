import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Add axios for API requests
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, IconButton } from '@mui/material';
import { Favorite, FavoriteBorder, Send, Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../contexts/authContext';
import { DataGrid } from '@mui/x-data-grid';

function AllFlats() {
    const [flats, setFlats] = useState([]);
    const [filteredFlats, setFilteredFlats] = useState([]);
    const [favoriteFlats, setFavoriteFlats] = useState([]);
    const { currentUser, isAdmin } = useAuth();
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [recipientUid, setRecipientUid] = useState('');
    const [editOpen, setEditOpen] = useState(false);
    const [selectedFlat, setSelectedFlat] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [flatToDelete, setFlatToDelete] = useState(null);

    // Fetch flats from MongoDB API
    useEffect(() => {
        const fetchFlats = async () => {
            try {
                const response = await axios.get('/api/flats'); // API call to fetch flats
                setFlats(response.data);
                setFilteredFlats(response.data);
            } catch (error) {
                console.error('Error fetching flats:', error);
            }
        };

        const fetchFavorites = async () => {
            // You need to fetch favorites from your MongoDB or another service
            // This is just an example assuming your favorites are stored in user data
        };

        fetchFlats();
        fetchFavorites();
    }, [currentUser]);

    const handleFavorite = async (flatId) => {
        try {
            // Handle adding/removing favorites via an API
            // Example: POST request to add/remove favorite
            if (favoriteFlats.includes(flatId)) {
                await axios.delete(`/api/favorites/${flatId}`); // API call to remove favorite
                setFavoriteFlats(favoriteFlats.filter(id => id !== flatId));
            } else {
                await axios.post(`/api/favorites/${flatId}`); // API call to add favorite
                setFavoriteFlats([...favoriteFlats, flatId]);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleSend = async () => {
        if (!recipientUid) {
            console.error('Recipient UID is undefined. Cannot send message.');
            return;
        }

        try {
            await axios.post('/api/messages', {
                ownerEmail: currentUser.email,
                senderUid: currentUser.uid,
                recipientUid: recipientUid,
                message: message,
                flatsList: { ...selectedFlat } // Pass flat details
            });
            handleClose();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleDeleteFlat = async () => {
        if (flatToDelete) {
            try {
                await axios.delete(`/api/flats/${flatToDelete}`); // API call to delete flat
                setFlats(flats.filter(flat => flat.id !== flatToDelete));
                setFilteredFlats(filteredFlats.filter(flat => flat.id !== flatToDelete));
                handleCloseConfirmDelete();
            } catch (error) {
                console.error('Error deleting flat:', error);
            }
        }
    };

    const handleEditFlat = (flat) => {
        setSelectedFlat(flat);
        setEditOpen(true);
    };

    const handleUpdateFlat = async () => {
        try {
            await axios.put(`/api/flats/${selectedFlat.id}`, selectedFlat); // API call to update flat
            setFlats(flats.map(flat => (flat.id === selectedFlat.id ? selectedFlat : flat)));
            setFilteredFlats(filteredFlats.map(flat => (flat.id === selectedFlat.id ? selectedFlat : flat)));
            handleEditClose();
        } catch (error) {
            console.error('Error updating flat:', error);
        }
    };

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
                        <IconButton onClick={() => {
                            setRecipientUid(params.row.ownerUid);
                            setSelectedFlat(params.row);
                            setOpen(true);
                        }}>
                            <Send />
                        </IconButton>
                    )}
                    {isAdmin && (
                        <>
                            <IconButton onClick={() => handleEditFlat(params.row)}>
                                <Edit />
                            </IconButton>
                            <IconButton onClick={() => setFlatToDelete(params.row.id)}>
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
            <DataGrid
                rows={filteredFlats}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                disableSelectionOnClick
                autoHeight
            />

            {/* Dialogs for sending messages, editing flats, and confirming delete would remain unchanged */}
        </Box>
    );
}

export default AllFlats;
