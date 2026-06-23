import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // ✅ FIX ICI

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;