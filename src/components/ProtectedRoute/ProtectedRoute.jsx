import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        const returnPath = location.pathname + location.search;
        return (
            <Navigate
                to={`/login?returnTo=${encodeURIComponent(returnPath)}`}
                state={{ from: location }}
                replace
            />
        );
    }

    return children;
}

export default ProtectedRoute;