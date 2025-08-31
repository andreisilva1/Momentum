import type { JSX } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: Props) {
  const user = JSON.parse(localStorage.getItem("currentUser") ?? "null");

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
