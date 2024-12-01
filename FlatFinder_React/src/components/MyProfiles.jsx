import React, { useState, useEffect, useCallback } from 'react';
import Header from "./Header";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    IconButton,
    Button
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/authContext';
import axios from 'axios'; // Axios for API calls
import backgroundImage from '../assets/ny1.jpg';

const MyProfiles = () => {
    const { currentUser } = useAuth();
    const [open, setOpen] = useState(false);
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        birthdate: ''
    });
    const [editData, setEditData] = useState({});
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

    const fetchUserData = useCallback(async () => {
        if (currentUser) {
            try {
                const response = await axios.get(`/api/users/${currentUser.uid}`);
                setUserData(response.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }
    }, [currentUser]);

    const checkIfAdmin = useCallback(async () => {
        if (currentUser) {
            try {
                const response = await axios.get(`/api/users/${currentUser.uid}`);
                setIsAdmin(response.data.isAdmin || false);
            } catch (error) {
                console.error("Error checking admin status:", error);
            }
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            fetchUserData();
            checkIfAdmin();
        }
    }, [currentUser, fetchUserData, checkIfAdmin]);

    const handleEditOpen = () => {
        setEditData(userData);
        setPassword('');
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e) => {
        setEditData({
            ...editData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setEditData({
            ...editData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdate = async () => {
        try {
            // Update user data
            await axios.put(`/api/users/${currentUser.uid}`, editData);
            setUserData(editData);

            // Update password if provided
            if (password) {
                await axios.put(`/api/users/${currentUser.uid}/password`, { password });
                alert('Parola a fost actualizată cu succes.');
            }

            handleClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('A apărut o eroare la actualizarea profilului.');
        }
    };

    const handleOpenDeleteConfirm = () => {
        setOpenDeleteConfirm(true);
    };

    const handleCloseDeleteConfirm = () => {
        setOpenDeleteConfirm(false);
    };

    const handleDelete = async () => {
        try {
            // Delete user from MongoDB
            await axios.delete(`/api/users/${currentUser.uid}`);
            alert('Contul a fost șters cu succes.');
            handleCloseDeleteConfirm();
            // Additional logic for logout or redirection
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('A apărut o eroare la ștergerea utilizatorului.');
        }
    };

    return (
        <Box>
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
            <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '80vh' }}>
                <Grid item xs={12} sm={8} md={6}>
                    <Card sx={{ backgroundColor: 'rgba(222, 235, 250,0.7)' }}>
                        <CardContent>
                            <Typography variant="h5" align="center" gutterBottom
                                sx={{ backgroundColor: 'rgba(255, 255, 255, 1)' }}>
                                Profil
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1"><strong>Prenume:</strong> {userData.firstName}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1"><strong>Nume:</strong> {userData.lastName}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1"><strong>Email:</strong> {userData.email}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1"><strong>Data nașterii:</strong> {userData.birthdate}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <IconButton color="primary" onClick={handleEditOpen}>
                                        <EditIcon />
                                    </IconButton>
                                </Grid>
                                {isAdmin && (
                                    <Grid item xs={12} sm={6}>
                                        <IconButton color="error" onClick={handleOpenDeleteConfirm}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Editare Profil</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Prenume"
                        name="firstName"
                        fullWidth
                        value={editData.firstName}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Nume"
                        name="lastName"
                        fullWidth
                        value={editData.lastName}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        name="email"
                        fullWidth
                        value={editData.email}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Data nașterii"
                        name="birthdate"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={editData.birthdate}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Parolă Nouă"
                        name="password"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={handlePasswordChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Anulează
                    </Button>
                    <Button onClick={handleUpdate} color="primary">
                        Actualizează
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openDeleteConfirm}
                onClose={handleCloseDeleteConfirm}
            >
                <DialogTitle>Confirmare Ștergere</DialogTitle>
                <DialogContent>
                    <Typography>
                        Sunteți sigur că doriți să ștergeți acest utilizator? Această acțiune este ireversibilă.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteConfirm} color="primary">
                        Anulează
                    </Button>
                    <Button onClick={handleDelete} color="secondary">
                        Confirmă
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MyProfiles;
