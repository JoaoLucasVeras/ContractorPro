import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    console.log("No token found, redirecting to login...");
    return <Navigate to="/login" replace />;
  }

  return children;
}
