import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>; // Wrap in fragment to satisfy ReactNode
}
