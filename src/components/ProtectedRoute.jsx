import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = JSON.parse(localStorage.getItem("authToken"));

  if (!token || Date.now() > token.expiry) {
    localStorage.removeItem("authToken");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
