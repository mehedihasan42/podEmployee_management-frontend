import { useContext } from "react";
import { Navigate, Outlet } from "react-router";
import { AuthContext } from "../providers/AuthProvider";

const AdminRouter = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "Admin") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRouter;