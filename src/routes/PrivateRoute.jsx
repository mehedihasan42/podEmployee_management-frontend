import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router";
import { AuthContext } from "../providers/AuthProvider";



const PrivateRoute = () => {

    const {
        user,
        loading,
    } = useContext(AuthContext);


    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                Loading...
            </div>
        );
    }


    if (!user) {
        return <Navigate to="/login" replace />;
    }


    return <Outlet />;
};


export default PrivateRoute;