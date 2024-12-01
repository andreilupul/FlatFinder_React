import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import { useAuth } from '../contexts/authContext';
import { Delete } from '@mui/icons-material';
import axios from 'axios';

function FavoriteFlats() {
    const [favoriteFlats, setFavoriteFlats] = useState([]);
    const { currentUser } = useAuth(); // get the logged-in user's details
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [flatToDelete, setFlatToDelete] = useState(null); // store the ID of the flat to delete

    useEffect(() => {
        // Fetch favorite flats from MongoDB API
        const fetchFavoriteFlats = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/favorites/${currentUser.uid}`);
                setFavoriteFlats(response.data);
            } catch (error) {
                console.error('Error fetching favorite flats:', error);
            }
        };

        if (currentUser) {
            fetchFavoriteFlats();
        }
    }, [currentUser]);

    const handleOpenConfirmDelete = (flatId) => {
        setFlatToDelete(flatId);
        setConfirmDeleteOpen(true);
    };

    const handleCloseConfirmDelete = () => {
        setConfirmDeleteOpen(false);
        setFlatToDelete(null);
    };

    const handleDelete = async () => {
        try {
            if (flatToDelete) {
                // Delete the favorite flat from MongoDB via API
                await axios.delete(`http://localhost:5000/api/favorites/${currentUser.uid}/${flatToDelete}`);

                // Update local state to remove the deleted flat
                setFavoriteFlats(prevFlats => prevFlats.filter(flat => flat.id !== flatToDelete));
                console.log('Favorite deleted');
                handleCloseConfirmDelete();
            }
        } catch (error) {
            console.error('Error deleting favorite:', error);
        }
    };

    return (
        <>
            <TableContainer>
                <Table>
                    <TableHead sx={{ backgroundColor: 'rgba(255, 255, 255, 1)' }}>
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
                    <TableBody sx={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', boxShadow: 'none' }}>
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

            <Dialog open={confirmDeleteOpen} onClose={handleCloseConfirmDelete}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to delete this flat from your favorites? This action cannot be undone.</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDelete} color="primary">Cancel</Button>
                    <Button onClick={handleDelete} color="error">Confirm</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default FavoriteFlats;
