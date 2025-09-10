
import { Navigate } from "react-router-dom";
import  useAppStore  from "../store/useAuthStore";

const ProtectedRoute = ({ children }) => {
  const { token, user } = useAppStore();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
