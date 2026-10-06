import React, {
    createContext,
    useCallback,
    useEffect,
    useState,
} from "react";
import api from "../apis/api";



export const AuthContext = createContext(null);


const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);


    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    const logout = useCallback(() => {

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        setUser(null);

    }, []);


    /*
    |--------------------------------------------------------------------------
    | Get current logged-in employee
    |--------------------------------------------------------------------------
    */

    const getCurrentUser = useCallback(async () => {

        const accessToken = localStorage.getItem("access_token");

        // No token = no user
        if (!accessToken) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {

            const response = await api.get("api/me/");

            if (response.data.success) {

                setUser(response.data.user);

            } else {

                logout();

            }

        } catch (error) {

            console.log(
                "Authentication check failed:",
                error.response?.data
            );

            logout();

        } finally {

            setLoading(false);

        }

    }, [logout]);


    /*
    |--------------------------------------------------------------------------
    | Check authentication when application starts
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        getCurrentUser();

    }, [getCurrentUser]);


    /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    */

    const login = async (employee_id, password) => {

        try {

            const response = await api.post(
                "api/login/",
                {
                    employee_id,
                    password,
                }
            );

            const {
                access,
                refresh,
            } = response.data.tokens;


            // Only tokens are stored
            localStorage.setItem(
                "access_token",
                access
            );

            localStorage.setItem(
                "refresh_token",
                refresh
            );


            /*
             * IMPORTANT:
             *
             * Don't use response.data.data as the
             * permanent user state.
             *
             * Ask the backend for /me instead.
             */

            await getCurrentUser();


            return {
                success: true,
            };

        } catch (error) {

            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Login failed.",
            };

        }

    };


    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );

};


export default AuthProvider;