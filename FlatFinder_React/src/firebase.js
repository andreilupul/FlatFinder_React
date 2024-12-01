//firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAuth } from 'firebase/auth';



const firebaseConfig = {
    apiKey: "AIzaSyCZM20CUqrBrT8PD0V4f4XjtUNOx9klDXE",
    authDomain: "flatfinder-react.firebaseapp.com",
    projectId: "flatfinder-react",
    storageBucket: "flatfinder-react.firebasestorage.app",
    messagingSenderId: "1070604573755",
    appId: "1:1070604573755:web:214cffcaa0d09c9526901e",
    measurementId: "G-DCXSN211N2"
  };


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };