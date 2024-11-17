import React, { useState, useEffect } from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, Table, TableBody, TableCell, TableHead, TableRow, Badge, TableContainer, TablePagination
} from '@mui/material';
import { Delete, Reply } from '@mui/icons-material';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, query, where, addDoc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/authContext';
import Header from './Header';
import NotificationsIcon from '@mui/icons-material/Notifications';

function Messages() {
    const { currentUser } = useAuth();//Obține detaliile despre utilizatorul curent, prin hook-ul de autentificare.
    const [messages, setMessages] = useState([]);//Stochează lista de mesaje
    const [open, setOpen] = useState(false);//Controlează dacă formularul de răspuns este deschis
    const [replyMessage, setReplyMessage] = useState('');//Se referă la mesajul de răspuns, UID-ul destinatarului și
    // apartamentul selectat pentru care se trimite mesajul.
    const [recipientUid, setRecipientUid] = useState('');//Controlează deschiderea unui dialog de confirmare pentru
    //ștergerea unui mesaj și identifică mesajul ce urmează a fi șters.
    const [selectedFlat, setSelectedFlat] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null);
    const [newMessages, setNewMessages] = useState(0); // Pentru a contoriza mesajele noi necitite
    const [lastChecked, setLastChecked] = useState(Timestamp.now()); //  Data ultimei verificări a mesajelor (folosită pentru a determina mesajele noi).
    const [dialogMessage, setDialogMessage] = useState(null); //Mesajul selectat pentru afișare detaliată.
    const [page, setPage] = useState(0);//Controlează paginarea mesajelor afișate
    const [rowsPerPage, setRowsPerPage] = useState(10);//Controlează paginarea mesajelor afișate

    useEffect(() => {

        //Funcție care preia mesajele din baza de date pentru utilizatorul curent și,
        // dacă este cazul, și informațiile despre apartamentele asociate fiecărui mesaj.
        const fetchMessages = async () => {

            try {

                if (!currentUser) return;//Verificarea utilizatorului curent

                const messagesCollection = collection(db, 'messages');//colecție în care sunt stocate toate mesajele din aplicație. Folosind funcția collection
                //din Firebase Firestore, accesăm baza de date (db) și colecția specificată (messages).
                const q = query(messagesCollection, where('recipientUid', '==', currentUser.uid));// Construiește o interogare care filtrează datele din colecția messages
                // Adaugă o condiție la interogare:Este un câmp din documentele colecției messages care conține UID-ul destinatarului fiecărui mesaj.
                //currentUser.uid: UID-ul utilizatorului conectat (obținut din contextul de autentificare).
                const messagesSnapshot = await getDocs(q);// aduce datele din colecția messages filtrate după UID-ul destinatarului.
                const messagesList = await Promise.all(
                    messagesSnapshot.docs.map(async (docSnap) => {//Se parcurg toate documentele returnate de interogare,
                        const messageData = docSnap.data();//Pentru fiecare document, se extrag datele (.data)
                        let flatData = null;
                        console.log(messageData);
                        if (messageData.flatsList?.flatsId || messageData.flatList?.flatsId) { // Verificăm dacă există `flatsId` în datele mesajului
                            let id = messageData.flatsList?.flatsId || messageData.flatList?.flatsId;
                            const flatRef = doc(db, 'flats', messageData.flatsList?.flatsId || messageData.flatList?.flatsId);//Această funcție este folosită pentru a crea o referință la un document specific din Firebase Firestore.
                            const flatDoc = await getDoc(flatRef);// Această funcție este folosită pentru a prelua documentul(await) la care face referință flatRef din Firestore.
                            if (flatDoc.exists()) {//, verificăm dacă documentul există efectiv în Firestore.
                                // Returnează true dacă documentul există în baza de date, și false dacă nu există.
                                flatData = flatDoc.data();//extrage efectiv datele stocate în documentul apartamentului si salveaza cu flatData
                                console.log(flatData);
                                setSelectedFlat({ ...flatData, flatsID: id });// funcția setSelectedFlat pentru a actualiza starea locală selectedFlat cu datele apartamentului extrase.
                            }

                        }

                        return {
                            id: docSnap.id,// ID-ul unic al mesajului.
                            ...messageData,// Toate datele originale ale mesajului (expuse prin operatorul spread).
                            flat: flatData,//Informațiile despre apartamentul asociat, dacă există.

                        };
                    })
                );

                setMessages(messagesList);//starea messages este actualizată cu lista de mesaje (messagesList).
                setNewMessages(messagesList.filter(message => !message.read).length);//numără toate mesajele din messagesList care nu au fost citite
                setLastChecked(Timestamp.now());//setează un timestamp (Timestamp.now()) pentru a marca momentul ultimei verificări
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();//aduce mesajele din Firestore care sunt destinate utilizatorului curent, 
        //și, dacă mesajul este asociat unui apartament
    }, [currentUser]);



    const handleDeleteMessage = async () => {//funcție asincronă care va gestiona ștergerea unui mesaj selectatdin Firestore
        try {//Blochează codul care va încerca să șteargă un mesaj
            await deleteDoc(doc(db, 'messages', messageToDelete));//asteapta finalizarea stergerii din Firestore,
            //(deleteDoc) sterge documentul specificat din colectia mesages  din data base cu id-ul egal messageToDelete
            setMessages(messages.filter(message => message.id !== messageToDelete));//actualizăm starea locală a mesajelor
            setConfirmOpen(false);//După ștergerea mesajului, se închide dialogul de confirmare 
            console.log('Message deleted');
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };



    const handleSendReply = async () => {//funcție asincronă definită pentru a trimite un răspuns sub forma unui mesaj

        try {
            if (!currentUser) {
                console.error('Current user is not defined.');
                return;
            }

            if (!selectedFlat) {
                console.error('Selected flat is not defined.');
                return;
            }

            if (!recipientUid) {
                console.error('Recipient UID is not defined.');
                return;

            }

            await addDoc(collection(db, 'messages'), {//adaugă un nou document într-o colecție specificată din baza de date.
                // db reprezintă instanța bazei de date Firestore conectată la aplicația 
                //datele vor fi stocate in documentul creat 'messages'
                ownerEmail: currentUser.email,
                senderUid: currentUser.uid,
                recipientUid: recipientUid,
                message: replyMessage,
                timestamp: new Date(),
                flatList: {
                    city: selectedFlat.city || 'Unknown',
                    streetName: selectedFlat.streetName || 'Unknown',
                    streetNumber: selectedFlat.streetNumber || 'Unknown',
                    flatsId: selectedFlat.flatsID || 'Unknown'
                }
            });

            console.log('Message sent successfully');
            handleClose();
            setNewMessages(prevCount => Math.max(prevCount + 1, 0));

        } catch (error) {
            console.error('Error sending message:', error);
        }
    };



    const handleReply = (senderUid, flat) => { //handleReply este un handler (manipulator) de eveniment care 
        // este apelată atunci când utilizatorul dorește să răspundă la un mesaj primit
        setRecipientUid(senderUid);//funcție de state setter care actualizează valoarea pentru starea recipientUid din componentă.
        setOpen(true);// deschide modalul ca rspuns la mesaj
    };


    const handleOpenMessage = async (message) => {//Funcția primește un parametru message, care reprezintă obiectul
        // ce conține informațiile mesajului pe care utilizatorul îl dorește deschis.

        setDialogMessage(message);// actualizeaza variabila de stare dialogMessage
        //salvează informațiile mesajului primit si afiseaza in modal

        //Actualizarea listei de mesaje
        try {
            await updateDoc(doc(db, 'messages', message.id), {//actualizează documentul specific din colecția messages din baza de date Firestore.
                read: true
            });
            //Actualizăm starea componentei pentru lista de mesaje. 
            setMessages(messages.map(msg =>
                msg.id === message.id ? { ...msg, read: true } : msg
            ));
            //Actualizează starea care ține cont de câte mesaje necitite există.
            setNewMessages(prevCount => Math.max(prevCount - 1, 0));
        } catch (error) {
            console.error('Error updating message status:', error);
        }
    };


    //funcție este utilizată pentru a închide un formular sau o fereastră modală
    const handleClose = () => {//închide interfața cu utilizatorul (UI) și pentru a reseta mesajul de răspuns.
        setOpen(false);
        setReplyMessage('');// funcție de tip setter, care modifică starea locală replyMessage.
    };


    // functie pentru deschiderea unui modal de confirmare stergere mesaj
    const handleOpenConfirm = (messageId) => {
        setMessageToDelete(messageId);
        setConfirmOpen(true);
    };


    //functie pentru inchiderea  unui modal de confirmare atunci cand utilizatorul nu vrea sa stearga mesajul
    const handleCloseConfirm = () => {
        setConfirmOpen(false);
        setMessageToDelete(null);
    };


    //functie pentru a actualiza pagina curenta intr-o inerfata care utilizeaza paginare si poti apasa un buton sa schimbi pagina  
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };


    // functie actualizeaza numărul de rânduri afișate pe pagină într-un tabel sau într-o listă paginată.
    //Este apelată atunci când utilizatorul schimbă opțiunea de nr de randuri pe pagina 
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };






    return (
        <div className='test'>
            {/* <img
                src={backgroundImage}
                alt="background"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100vh',
                    zIndex: -1,
                    opacity: 0.95,
                }}
            /> */}
            <Header />
            <IconButton color="inherit" style={{ float: 'right' }}>
                <Badge badgeContent={newMessages} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <h1>Messages</h1>

            <TableContainer>
                <Table>
                    <TableHead
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                        }}
                    >
                        <TableRow>
                            <TableCell sx={{ width: '25%' }}>Email Address</TableCell>
                            <TableCell sx={{ width: '25%' }}>Apartment (City, Street, Number)</TableCell>
                            <TableCell sx={{ width: '20%' }}>Timestamp</TableCell>
                            <TableCell sx={{ width: '30%' }}>Message Content</TableCell>
                            <TableCell sx={{ width: '10%' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        }}
                    >
                        {messages
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((message) => (
                                <TableRow key={message.id} onClick={() => handleOpenMessage(message)} style={{ cursor: 'pointer' }}>
                                    <TableCell>{message.ownerEmail}</TableCell>
                                    <TableCell>
                                        {message.flat ? (
                                            `${message.flat.city}, ${message.flat.streetName}, ${message.flat.streetNumber}`
                                        ) : (
                                            'N/A'
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(message.timestamp.toDate()).toLocaleString()}</TableCell>
                                    <TableCell>{message.message}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenConfirm(message.id)}>
                                            <Delete sx={{ color: 'red' }} />
                                        </IconButton>
                                        <IconButton onClick={() => handleReply(message.senderUid, message.flatList)}>
                                            <Reply sx={{ color: 'black' }} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
                <TablePagination
                    sx={{
                        '& .MuiTablePagination-selectLabel': {
                            color: 'white',
                        },
                        '& .MuiTablePagination-displayedRows': {
                            color: 'white',
                        },
                        '& .MuiSvgIcon-root': {
                            color: 'white',
                        },
                        '& .MuiTablePagination-input': {
                            color: 'white',
                        },
                        '& .MuiIconButton-root': {
                            color: 'white',
                        }
                    }}
                    component="div"
                    count={messages.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Reply to Message</DialogTitle>
                <DialogContent>
                    <textarea
                        rows="4"
                        cols="50"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSendReply} color="primary">
                        Send
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={confirmOpen} onClose={handleCloseConfirm}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>Are you sure you want to delete this message?</DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirm} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteMessage} color="secondary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={dialogMessage !== null} onClose={() => setDialogMessage(null)}>
                <DialogTitle>Message Details</DialogTitle>
                <DialogContent>
                    {dialogMessage && (
                        <>
                            <p><strong>Email Address:</strong> {dialogMessage.ownerEmail}</p>
                            <p><strong>Apartment:</strong> {dialogMessage.flat ? `${dialogMessage.flat.city}, ${dialogMessage.flat.streetName}, ${dialogMessage.flat.streetNumber}` : 'N/A'}</p>
                            <p><strong>Timestamp:</strong> {new Date(dialogMessage.timestamp.toDate()).toLocaleString()}</p>
                            <p><strong>Message Content:</strong> {dialogMessage.message}</p>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogMessage(null)} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Messages;
