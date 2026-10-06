import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../apis/api';
import { useNavigate } from 'react-router';
import { AuthContext } from '../providers/AuthProvider';

const Login = () => {

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm()

    const navigate = useNavigate();
    const {
        login,
    } = useContext(AuthContext);

    const [loginError, setLoginError] = useState("");


    const handleLogin = async (data) => {

        setLoginError("");


        const result = await login(
            data.employee_id,
            data.password
        );

        if(result.success == true){
           navigate("/profile");
        }
         else {

            setLoginError(result.message);

        }

    };

    return (
        <div className="hero bg-base-200 min-h-screen">
            <div className="hero-content">
                <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
                    <form className="card-body w-98" onSubmit={handleSubmit(handleLogin)}>
                        <h1 className="text-xl text-center font-bold">Login now</h1>
                        <fieldset className="fieldset">
                            <input type="number" className="input" placeholder="Employee ID" {...register("employee_id")} />
                            <input type="password" className="input" placeholder="Password" {...register("password")} />
                            <input className="btn btn-neutral mt-4" type='submit' value='Log in' />
                            {loginError && <p className="text-red-500 text-sm mt-2">{loginError}</p>}
                        </fieldset>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;