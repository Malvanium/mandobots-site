// src/firebase.ts (FOR FRONTEND USE)
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_Ek0S02_0U7A_2SMW8y7ljOMSaMNOtgo",
  authDomain: "mandobots-f02d1.firebaseapp.com",
  projectId: "mandobots-f02d1",
  storageBucket: "mandobots-f02d1.appspot.com",
  messagingSenderId: "153913351736",
  appId: "1:153913351736:web:aff3d6d29847881864d0cd",
};

const app = initializeApp(firebaseConfig);
export { app };
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
