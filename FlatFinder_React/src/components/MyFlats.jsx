import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField
} from '@mui/material';
import { useAuth } from '../contexts/authContext';
import { Delete, Edit } from '@mui/icons-material';
import axios from 'axios';

function MyFlats() {
    const { currentUser } = useAuth(); // Get the authenticated user details
    const [flats, setFlats] = useState([]); // Stores the user's flats
    const [editOpen, setEditOpen] = useState(false); // Controls if the edit form is open
    const [selectedFlat, setSelectedFlat] = useState(null); // Stores the selected flat for editing
    const [editedFlat, setEditedFlat] = useState({}); // Stores the data of the flat being edited
    const [favoriteFlats, setFavoriteFlats] = useState(new Set()); // Stores a set of favorite flat IDs
    const [deleteOpen, setDeleteOpen] = useState(false); // Controls if the delete confirmation dialog is open
    const [flatToDelete, setFlatToDelete] = useState(null); // Stores the flat ID to be deleted

    // Fetch the flats for the current user from MongoDB
    useEffect(() => {
        const fetchFlats = async () => {
            try {
                const response = await axios.get(`/api/flats/${currentUser.uid}`);
                setFlats(response.data); // Assuming your backend sends back an array of flats
            } catch (error) {
                console.error('Error fetching flats:', error);
            }
        };

        fetchFlats();
    }, [currentUser.uid]);

    // Fetch favorite flats for the current user
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await axios.get(`/api/favorites/${currentUser.uid}`);
                setFavoriteFlats(new Set(response.data)); // Assuming your backend sends back an array of favorite flat IDs
            } catch (error) {
                console.error('Error fetching favorites:', error);
            }
        };

        fetchFavorites();
    }, [currentUser.uid]);

    // Handle deleting a flat
    const handleDelete = (flatId) => {
        setFlatToDelete(flatId);
        setDeleteOpen(true);
    };

    // Confirm delete operation
    const confirmDelete = async () => {
        try {
            await axios.delete(`/api/flats/${flatToDelete}`);
            setFlats(flats.filter(flat => flat.id !== flatToDelete));
            console.log('Flat deleted successfully');
        } catch (error) {
            console.error('Error deleting flat:', error);
        } finally {
            setDeleteOpen(false);
            setFlatToDelete(null);
        }
    };

    // Handle toggling a flat as favorite
    const handleFavorite = async (flatId) => {
        try {
            if (favoriteFlats.has(flatId)) {
                // Remove from favorites
                await axios.delete(`/api/favorites/${currentUser.uid}/${flatId}`);
                setFavoriteFlats(prev => {
                    const updatedFavorites = new Set(prev);
                    updatedFavorites.delete(flatId);
                    return updatedFavorites;
                });
                console.log('Removed from favorites');
            } else {
                // Add to favorites
                await axios.post(`/api/favorites/${currentUser.uid}/${flatId}`);
                setFavoriteFlats(prev => new Set(prev).add(flatId));
                console.log('Added to favorites');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    // Open edit form
    const handleEditClick = (flat) => {
        setSelectedFlat(flat);
        setEditedFlat(flat);
        setEditOpen(true);
    };

    // Close the edit form
    const handleEditClose = () => {
        setEditOpen(false);
        setSelectedFlat(null);
    };

    // Handle changes in the edit form
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditedFlat(prevState => ({ ...prevState, [name]: value }));
    };

    // Save the edited flat to MongoDB
    const handleEditSave = async () => {
        try {
            await axios.put(`/api/flats/${editedFlat.id}`, editedFlat);
            setFlats(flats.map(flat => flat.id === editedFlat.id ? editedFlat : flat));
            handleEditClose();
            console.log('Flat updated successfully');
        } catch (error) {
            console.error('Error updating flat:', error);
        }
    };

    // Favorite button style based on if it's a favorite
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
                            backgroundColor: 'rgba(255, 255, 255, 1)', // Semi-transparent white background
                        }}
                    >
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
                            backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white background
                        }}
                    >
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
                                    >
                                        Favorite
                                    </Button>

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

            {/* Edit Flat Modal */}
            {selectedFlat && (
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
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleEditClose} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={handleEditSave} color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <DialogTitle>Delete Flat</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this flat?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteOpen(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} color="primary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default MyFlats;
