import React, { useState } from 'react';
import {
    TextField, Button, Container, Table, TableBody, TableCell,
    TableContainer, TableRow, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

function AddFlat() {
    // Inițializare starea flatData pentru a stoca datele introduse de utilizator pentru apartament  
    const [flatData, setFlatData] = useState({
        city: '',
        streetName: '',
        streetNumber: '',
        areaSize: '',
        ac: '',
        yearBuilt: '',
        rentPrice: '',
        dateAvailable: '',
        ownerEmail: '',
    });
    // Preluarea utilizatorului curent din contextul de
    //  autentificare pentru a lega datele apartamentului de acesta
    const { currentUser } = useAuth();

    // Stări pentru gestionarea erorilor de validare (errors), validitatea
    //  formularului (isFormValid) și dacă formularul a fost trimis (isSubmitted)
    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Hook-ul useNavigate permite redirecționarea între 
    // pagini după trimiterea cu succes a formularului.
    const navigate = useNavigate();

    // Funcția validate creează un obiect temporar pentru a stoca mesajele de eroare și folosește
    //  o expresie regulată pentru a valida că anumite câmpuri conțin doar litere
    const validate = () => {
        let tempErrors = {};
        const lettersRegex = /^[A-Za-z]+$/;


        // Validarea orașului (doar litere și minim 4 caractere)
        tempErrors.city = flatData.city.length >= 4 && lettersRegex.test(flatData.city)
            ? ""
            : "City must be at least 4 characters long and contain only letters.";

        // Validarea numelui străzii (doar litere și minim 4 caractere)
        tempErrors.streetName = flatData.streetName.length >= 4 && lettersRegex.test(flatData.streetName)
            ? ""
            : "Street Name must be at least 4 characters long and contain only letters.";

        tempErrors.streetNumber = flatData.streetNumber && !isNaN(flatData.streetNumber) ? "" : "Street Number is required and must be a number.";
        tempErrors.areaSize = flatData.areaSize && !isNaN(flatData.areaSize) && flatData.areaSize > 0 ? "" : "Area Size is required and must be a positive number.";
        tempErrors.ac = flatData.ac ? "" : "AC status is required.";

        // Validează anul construcției să fie un număr între 1800 și anul curent
        const currentYear = new Date().getFullYear();
        tempErrors.yearBuilt = flatData.yearBuilt && !isNaN(flatData.yearBuilt) && flatData.yearBuilt > 1800 && flatData.yearBuilt <= currentYear
            ? ""
            : `Year Built is required, must be a number, and cannot be greater than ${currentYear}.`;
        tempErrors.rentPrice = flatData.rentPrice && !isNaN(flatData.rentPrice) && flatData.rentPrice > 0 ? "" : "Rent Price is required and must be a positive number.";
        tempErrors.dateAvailable = flatData.dateAvailable ? "" : "Date Available is required.";

        // Verifică dacă data disponibilității a fost selectată
        setErrors(tempErrors);
        return Object.values(tempErrors).every(x => x === "");
    };
    // Funcția handleChange actualizează starea flatData cu valorile introduse
    //  de utilizator și apoi validează formularul după fiecare modificare.
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFlatData(prevData => ({ ...prevData, [name]: value }));
        validate();
    };
    // Gestionează modificările aduse câmpului "dateAvailable" (data disponibilității).
    const handleDateChange = (e) => {
        setFlatData(prevData => ({ ...prevData, dateAvailable: e.target.value }));
        validate();
    };
    // Gestionează modificările stării aerului condiționat (AC)
    const handleACChange = (e, newAC) => {
        if (newAC !== null) {
            setFlatData(prevData => ({ ...prevData, ac: newAC }));
            validate();
        }
    };

    // handleSubmit: Funcția de trimitere a formularului.
    const handleSubmit = async (e) => {

        // Se previne comportamentul implicit al formularului. 
        // Formularul nu se mai trimite automat, astfel încât validarea și alte operațiuni pot fi efectuate
        e.preventDefault();

        // Se validează toate câmpurile. Dacă sunt valide, formularul
        //  este marcat ca fiind valid și datele sunt trimise la baza de date (flats).
        setIsSubmitted(true);
        if (validate()) {
            setIsFormValid(true);
            try {
                if (currentUser) {
                    const flatData1 = { ...flatData, ownerUid: currentUser.uid }

                    const flatsCollection = collection(db, 'flats');
                    await addDoc(flatsCollection, flatData1);
                }
                // Dacă datele sunt trimise cu succes, utilizatorul este redirecționat către pagina /all-flats  
                navigate('/all-flats');

                // În caz de eroare la adăugarea datelor, se afișează eroarea în consolă   
            } catch (error) {
                console.error("Error adding flat: ", error);
            }
        } else {
            setIsFormValid(false);
        }
    };

    return (
        <Container sx={{ maxWidth: '100%', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'start', minHeight: 'autoHeight' }}>
            <TableContainer sx={{
                width: '650px', padding: 1,

                backgroundColor: 'rgba( 255, 255, 255, 0.9)', // Fundal semi-transparent 

            }}>
                <Table sx={{ minWidth: 300, }}>
                    <TableBody>
                        <TableRow sx={{ height: '40px' }}>
                            <TableCell sx={{ padding: '10px 8px' }}>
                                <TextField
                                    size='small'
                                    name="city"
                                    label="City"
                                    onChange={handleChange}
                                    sx={{ width: '100%', margin: 0 }}
                                    InputProps={{ sx: { height: '40px' } }}
                                    error={isSubmitted && !!errors.city}
                                    helperText={isSubmitted && errors.city}
                                />
                            </TableCell>
                            <TableCell sx={{ padding: '10px 8px' }}>
                                <TextField
                                    size='small'
                                    name="yearBuilt"
                                    label="Year Built"
                                    onChange={handleChange}
                                    sx={{ width: '100%', margin: 0 }}
                                    InputProps={{ sx: { height: '40px' } }}
                                    error={isSubmitted && !!errors.yearBuilt}
                                    helperText={isSubmitted && errors.yearBuilt}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow sx={{ height: '40px' }}>
                            <TableCell sx={{ padding: '10px 8px' }}>
                                <TextField
                                    size='small'
                                    name="streetName"
                                    label="Street Name"
                                    onChange={handleChange}
                                    sx={{ width: '100%', margin: 0 }}
                                    InputProps={{ sx: { height: '40px' } }}
                                    error={isSubmitted && !!errors.streetName}
                                    helperText={isSubmitted && errors.streetName}
                                />
                            </TableCell>
                            <TableCell sx={{ padding: '10px 8px' }}>
                                <TextField
                                    size='small'
                                    name="streetNumber"
                                    label="Street Number"
                                    onChange={handleChange}
                                    sx={{ width: '100%', margin: 0 }}
                                    InputProps={{ sx: { height: '40px' } }}
                                    error={isSubmitted && !!errors.streetNumber}
                                    helperText={isSubmitted && errors.streetNumber}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow sx={{ height: '40px' }}>
                            <TableCell sx={{ padding: '10px 8px' }}>
                                <TextField
                                    size='small'
                                    name="areaSize"
                                    label="Area Size"
                                    onChange={handleChange}
                                    sx={{ width: '100%', margin: 0 }}
                                    InputProps={{ sx: { height: '40px' } }}
                                    error={isSubmitted && !!errors.areaSize}
                                    helperText={isSubmitted && errors.areaSize}
                                />
                            </TableCell>
                            <TableCell sx={{ padding: '10px 8px' }}>
                                <ToggleButtonGroup
                                    value={flatData.ac}
                                    exclusive
                                    onChange={handleACChange}
                                    aria-label="Toggle Button"
                                    sx={{ width: '100%' }}
                                >
                                    <ToggleButton value="yes" sx={{ height: '30px' }}>Has AC</ToggleButton>
                                    <ToggleButton value="no" sx={{ height: '30px' }}>No AC</ToggleButton>
                                </ToggleButtonGroup>
                                {isSubmitted && errors.ac && <div style={{ color: 'red', fontSize: '12px' }}>{errors.ac}</div>}
                            </TableCell>
                        </TableRow>
                        <TableRow sx={{ height: '40px' }}>
                            <TableCell sx={{ padding: '10px 8px' }}>
                                <TextField
                                    size='small'
                                    name="rentPrice"
                                    label="Rent Price"
                                    onChange={handleChange}
                                    sx={{ width: '100%', margin: 0 }}
                                    InputProps={{ sx: { height: '40px' } }}
                                    error={isSubmitted && !!errors.rentPrice}
                                    helperText={isSubmitted && errors.rentPrice}
                                />
                            </TableCell>
                            <TableCell sx={{ padding: '10px 8px' }}>
                                <TextField
                                    required
                                    id="dateAvailable"
                                    label="Date Available"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={flatData.dateAvailable}
                                    onChange={handleDateChange}
                                    sx={{ marginBottom: 0, width: '100%' }}
                                    InputProps={{ sx: { height: '40px' } }}
                                    error={isSubmitted && !!errors.dateAvailable}
                                    helperText={isSubmitted && errors.dateAvailable}
                                />
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell align="center" sx={{ padding: '4px 8px' }}>
                                <Button
                                    onClick={handleSubmit}
                                    sx={{
                                        backgroundColor: 'green',
                                        color: 'white',
                                        width: '100px',
                                        height: '30px',
                                        marginTop: 1,
                                        left: '50%',

                                    }}

                                >
                                    Save
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}

export default AddFlat;



