import { useContext, useEffect, useState, createContext } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebase'
import PropTypes from 'prop-types';

const AuthContext = createContext();
AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};



export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                setUserLoggedIn(true);

                // Check if the user is an admin
                const userDoc = doc(db, "users", user.uid);
                const userSnapshot = await getDoc(userDoc);
                const userData = userSnapshot.data();
                if (userData) {
                    setIsAdmin(userData.isAdmin || false); // Assuming `isAdmin` is a boolean field
                }
            } else {
                setCurrentUser(null);
                setUserLoggedIn(false);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = { currentUser, userLoggedIn, loading, isAdmin };

    return <AuthContext.Provider value={value}>
        {!loading && children}
    </AuthContext.Provider>
}

