import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_Ek0S02_0U7A_2SMW8y7ljOMSaMNOtgo",
  authDomain: "mandobots-f02d1.firebaseapp.com",
  databaseURL: "https://mandobots-f02d1-default-rtdb.firebaseio.com",
  projectId: "mandobots-f02d1",
  storageBucket: "mandobots-f02d1.appspot.com",
  messagingSenderId: "153913351736",
  appId: "1:153913351736:web:aff3d6d29847881864d0cd",
  measurementId: "G-FVZMSVMZMT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export initialized Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
