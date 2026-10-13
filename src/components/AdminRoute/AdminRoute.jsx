import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminRoute({ children }) {
    const { isAuthenticated, user } = useAuth();
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

    if (user?.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default AdminRoute;