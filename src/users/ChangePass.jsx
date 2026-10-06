import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { FiLock, FiCheckCircle } from "react-icons/fi";
import api from '../apis/api';
import { AuthContext } from '../providers/AuthProvider';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router';

const ChangePass = () => {

    const {user,logout} = useContext(AuthContext);
    const navigate = useNavigate();

        const {
            register: resetPasswordRegister,
            handleSubmit: handleResetPassword,
            reset: resetPasswordForm,
            formState: { errors: resetPasswordErrors },
        } = useForm()

         const onResetPassword = async (data) => {
            
        try {
            const response = await api.patch(
                `api/update/employee-password/${user.employee_id}/`,
                {
                    password: data.password,
                    confirmPassword: data.confirmPassword,
                }
            );

            console.log("Password updated successfully:", response.status);

            if (response.status === 200) {
                Swal.fire({
                    icon: "success",
                    title: "Update Successful!",
                    text: "Password updated successfully. Please log in again.",
                    timer: 4000,
                    timerProgressBar: true,
                    draggable: true,
                    showConfirmButton: false
                });
                resetPasswordForm()
                logout()
                navigate('/login');
            }

        } catch (error) {
            console.error(
                "Password update error:",
                error.response?.data || error.message
            );
        }
    }

    return (
       <form onSubmit={handleResetPassword(onResetPassword)} className="space-y-5 bg-base-300 p-6 rounded-lg shadow-md">
    {/* Header / Intro inside modal if needed */}
    <div className="space-y-1">
        <h3 className="text-lg font-bold text-base-content">Set New Password</h3>
        <p className="text-sm text-base-content/70">
            Please enter your new password below. Make sure it's secure.
        </p>
    </div>

    <div className="flex flex-col gap-4">
        {/* Password */}
        <div className="form-control w-full">
            <label className="label">
                <span className="label-text font-semibold text-base-content/80">New Password</span>
            </label>
            <div className="relative flex items-center">
                <span className="absolute left-3.5 text-base-content/40 text-lg">
                    <FiLock />
                </span>
                <input
                    type="password"
                    placeholder="Enter new password"
                    className={`input input-bordered w-full pl-11 focus:input-primary transition-all ${
                        resetPasswordErrors.password ? 'input-error' : ''
                    }`}
                    {...resetPasswordRegister("password", {
                        required: "Password is required",
                    })}
                />
            </div>
            {resetPasswordErrors.password && (
                <label className="label pt-1 pb-0">
                    <span className="label-text-alt text-error font-medium">
                        {resetPasswordErrors.password.message}
                    </span>
                </label>
            )}
        </div>

        {/* Confirm Password */}
        <div className="form-control w-full">
            <label className="label">
                <span className="label-text font-semibold text-base-content/80">Confirm Password</span>
            </label>
            <div className="relative flex items-center">
                <span className="absolute left-3.5 text-base-content/40 text-lg">
                    <FiCheckCircle />
                </span>
                <input
                    type="password"
                    placeholder="Confirm new password"
                    className={`input input-bordered w-full pl-11 focus:input-primary transition-all ${
                        resetPasswordErrors.confirmPassword ? 'input-error' : ''
                    }`}
                    {...resetPasswordRegister("confirmPassword", {
                        required: "Confirm Password is required",
                    })}
                />
            </div>
            {resetPasswordErrors.confirmPassword && (
                <label className="label pt-1 pb-0">
                    <span className="label-text-alt text-error font-medium">
                        {resetPasswordErrors.confirmPassword.message}
                    </span>
                </label>
            )}
        </div>
    </div>

    {/* Modal Actions */}
    <div className="modal-action pt-2 border-t border-base-200 mt-6">
        <button type="submit" className="btn btn-primary px-6 shadow-md w-full hover:shadow-lg transition-all">
            Confirm
        </button>
    </div>
</form>
    );
};

export default ChangePass;