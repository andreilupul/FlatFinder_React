import React, { useState, useEffect } from 'react';
import {
    Box, IconButton, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, Button, Paper, TableContainer, Toolbar
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Delete } from '@mui/icons-material';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import Header from './Header';
import backgroundImage from '../assets/ny1.jpg';
import { Link } from "react-router-dom";



function AllUsers() {
    const [users, setUsers] = useState([]);// stochează lista de utilizatori aduși din baza de date.
    const [open, setOpen] = useState(false); // controlează deschiderea/închiderea unui modal
    const [selectedUserId, setSelectedUserId] = useState(null);  //stochează ID-ul utilizatorului selectat pentru ștergere
    const [activeButton, setActiveButton] = useState(location.pathname);   //gestionează butonul activ pe baza rutei curente (location.pathname).


    // Folosim useEffect pentru a aduce utilizatorii din baza de date atunci când componenta este montată 
    useEffect(() => {

        // fetchUsers: aduce documentele din colecția users din baza de date Firestore,
        //  le transformă într-o listă și le stochează în starea users.
        const fetchUsers = async () => {
            try {
                const usersCollection = collection(db, 'users');
                const usersSnapshot = await getDocs(usersCollection);
                const usersList = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsers(usersList);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);


    // Funcția de ștergere a utilizatorului selectat
    const handleDeleteUser = async () => {
        try {
            if (selectedUserId) {    //Verifică dacă selectedUserId este definit

                // Șterge utilizatorul din baza de date și actualizează lista de
                //  utilizatori din starea locală pentru a reflecta ștergerea   
                await deleteDoc(doc(db, 'users', selectedUserId));
                setUsers(users.filter(user => user.id !== selectedUserId));
                console.log('User deleted successfully');
            }
            setOpen(false);
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    // Deschide modalul pentru confirmarea ștergerii unui utilizator și setează ID-ul utilizatorului selectat
    const handleOpenModal = (userId) => {
        setSelectedUserId(userId);
        setOpen(true);
    };

    // Închide modalul fără să facă nicio modificare
    const handleCloseModal = () => {
        setOpen(false);
    };

    // Definește coloanele pentru afișarea datelor utilizatorilor într-un tabel
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

    // Stilizează butonul pe baza rutei active
    const buttonStyle = (path) => ({
        backgroundColor: activeButton === path ? '#1976d2' : 'transparent', // Fundalul butonului activ
        color: activeButton === path ? '#ffffff' : '#000000', // Textul butonului activ (alb) sau negru
        border: '1px solid #1976d2', // Conturul butonului
        '&:hover': {
            backgroundColor: activeButton === path ? '#1565c0' : 'rgba(0, 0, 0, 0.1)', // Fundal la hover
            color: activeButton === path ? '#ffffff' : '#000000', // Textul la hover
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
                    // filter: 'blur(0px)', // Efectul de blur
                    zIndex: -1, // Asigură că imaginea este în spate
                    opacity: 0.95, // Aplica un nivel de transparență
                }}
            />

            <Header />
            <Toolbar>
                < Button
                    color="inherit"
                    component={Link}
                    to="/all-flats"
                    sx={{
                        ...buttonStyle('/all-flats'),
                        border: 'none', // Elimină border-ul
                        padding: 0,     // Opțional: elimină padding-ul pentru a face butonul să fie doar text
                        textTransform: 'none', // Opțional: menține textul în forma originală (fără uppercase)
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
                        border: 0,
                        textTransform: 'none',

                    }}
                    onClick={() => setActiveButton('/add-flat')}
                >
                    Add Flat
                </Button>
            </Toolbar>
            <Box sx={{ height: 400, width: '100%', marginTop: 2, }}>
                <TableContainer >

                    <DataGrid

                        rows={users}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10]}
                        disableSelectionOnClick
                        autoHeight
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.5)', // Fundal semi-transparent (alb cu 70% opacitate)
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

            {/* Modal de confirmare ștergere */}
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

