import React, { useState, useEffect } from 'react';
import {
    Box, IconButton, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, Button, Paper, TableContainer, Toolbar
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Delete } from '@mui/icons-material';
import axios from 'axios';  // Use axios to make HTTP requests
import Header from './Header';
import backgroundImage from '../assets/ny1.jpg';
import { Link } from "react-router-dom";

function AllUsers() {
    const [users, setUsers] = useState([]);  // Stores the list of users fetched from the database
    const [open, setOpen] = useState(false);  // Controls modal open/close state
    const [selectedUserId, setSelectedUserId] = useState(null);  // Stores the ID of the selected user for deletion
    const [activeButton, setActiveButton] = useState(location.pathname); // Manages active button based on the current route

    // Fetch users from MongoDB on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetch users from your backend API
                const response = await axios.get('http://localhost:5000/api/users');
                setUsers(response.data);  // Update the state with the fetched users
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);  // Empty dependency array means this will run only once when the component is mounted

    // Handle deleting a user from MongoDB
    const handleDeleteUser = async () => {
        try {
            if (selectedUserId) {
                // Send DELETE request to the backend to delete the user
                await axios.delete(`http://localhost:5000/api/users/${selectedUserId}`);
                setUsers(users.filter(user => user.id !== selectedUserId));  // Update the state after deletion
                console.log('User deleted successfully');
            }
            setOpen(false);  // Close the modal
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    // Open the modal for confirming the deletion
    const handleOpenModal = (userId) => {
        setSelectedUserId(userId);
        setOpen(true);
    };

    // Close the modal without making changes
    const handleCloseModal = () => {
        setOpen(false);
    };

    // Define columns for the data grid
    const columns = [
        { field: 'email', headerName: 'Email', width: 550 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <IconButton onClick={() => handleOpenModal(params.row.id)}>
                    <Delete color="error" />
                </IconButton>
            ),
        },
    ];

    // Style the active button based on the current route
    const buttonStyle = (path) => ({
        backgroundColor: activeButton === path ? '#1976d2' : 'transparent',
        color: activeButton === path ? '#ffffff' : '#000000',
        border: '1px solid #1976d2',
        '&:hover': {
            backgroundColor: activeButton === path ? '#1565c0' : 'rgba(0, 0, 0, 0.1)',
            color: activeButton === path ? '#ffffff' : '#000000',
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
                    zIndex: -1,
                    opacity: 0.95,
                }}
            />
            <Header />
            <Toolbar>
                <Button
                    color="inherit"
                    component={Link}
                    to="/all-flats"
                    sx={{
                        ...buttonStyle('/all-flats'),
                        border: 'none',
                        padding: 0,
                        textTransform: 'none',
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
                        textTransform: 'none',
                    }}
                    onClick={() => setActiveButton('/add-flat')}
                >
                    Add Flat
                </Button>
            </Toolbar>
            <Box sx={{ height: 400, width: '100%', marginTop: 2, }}>
                <TableContainer>
                    <DataGrid
                        rows={users}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10]}
                        disableSelectionOnClick
                        autoHeight
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent background
                        }}
                        sortModel={[
                            {
                                field: 'email',
                                sort: 'asc',
                            },
                        ]}
                    />
                </TableContainer>
            </Box>

            {/* Confirmation Dialog */}
            <Dialog
                open={open}
                onClose={handleCloseModal}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this user? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteUser} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default AllUsers;
