import React, { useState } from "react";
import { auth, provider, db } from "../firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  getAdditionalUserInfo,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Login() {
  const [user, loading] = useAuthState(auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newUser, setNewUser] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const additionalInfo = getAdditionalUserInfo(result);
      const isNewUser = additionalInfo?.isNewUser;

      if (isNewUser) {
        await setDoc(doc(db, "users", firebaseUser.uid), {
          email: firebaseUser.email,
          createdAt: new Date().toISOString(),
          provider: "google",
        });
      }
    } catch (err: any) {
      console.error("Google login failed:", err);
      setError(err.message || "An unexpected error occurred during Google login.");
    }
  };

  const handleEmailLogin = async () => {
    try {
      if (newUser) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = result.user;

        await sendEmailVerification(firebaseUser);

        await setDoc(doc(db, "users", firebaseUser.uid), {
          email: firebaseUser.email,
          createdAt: new Date().toISOString(),
          provider: "email",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Email login failed:", err);
      setError(err.message || "An unexpected error occurred during email authentication.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error("Logout failed:", err);
      setError("Failed to log out. Try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-bold">
        Checking session...
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 text-black bg-offwhite">
        <h2 className="text-3xl font-bold text-primary font-display">Welcome, {user.email}</h2>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
        >
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-offwhite text-black">
      <h2 className="text-3xl font-bold text-primary font-display">Log In</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        className="border p-2 rounded w-64"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        className="border p-2 rounded w-64"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="bg-primary text-white px-6 py-2 rounded hover:bg-red-700 transition"
        onClick={handleEmailLogin}
      >
        {newUser ? "Sign Up" : "Log In"}
      </button>

      <button
        onClick={handleGoogleLogin}
        className="bg-white text-black border border-gray-400 px-6 py-2 rounded hover:bg-gray-100 transition"
      >
        Sign in with Google
      </button>

      <button
        className="text-sm underline text-blue-600"
        onClick={() => setNewUser(!newUser)}
      >
        {newUser ? "Already have an account?" : "Create an account"}
      </button>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
