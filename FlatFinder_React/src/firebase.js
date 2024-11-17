import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAuth } from 'firebase/auth';



const firebaseConfig = {
    apiKey: "AIzaSyBDleDl9rssuRraCqoz2-n0txT10XoAYs8",
    authDomain: "fir-be000.firebaseapp.com",
    projectId: "fir-be000",
    storageBucket: "fir-be000.appspot.com",
    messagingSenderId: "871891628968",
    appId: "1:871891628968:web:12bf53b0a5e6e43850239d",
    measurementId: "G-KHELWDN2P4"
}


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };