import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../providers/AuthProvider';
import { FiAlertCircle, FiCheckCircle, FiPlus, FiX, FiXCircle } from 'react-icons/fi';
import api from '../apis/api';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';

const Leave = () => {

    const [leaveRequests, setLeaveRequests] = useState([]);
    const { user } = useContext(AuthContext);
    const employeeId = user?.employee_id;
    const [showLeaveModal, setShowLeaveModal] = useState(false);

    const getLeaveRequests = async (employeeId) => {
        try {
            const response = await api.get(
                `leave/leave_by_id/${employeeId}/`
            );

            setLeaveRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch leave requests:", error);
        }
    };

    useEffect(() => {

        getLeaveRequests(employeeId)
    }, [employeeId]);

    const getLeaveBadge = (status) => {
        if (status === "Approved") {
            return (
                <span className="badge badge-success gap-1 text-white">
                    <FiCheckCircle size={13} />
                    Approved
                </span>
            );
        }

        if (status === "Pending") {
            return (
                <span className="badge badge-warning gap-1">
                    <FiAlertCircle size={13} />
                    Pending
                </span>
            );
        }

        return (
            <span className="badge badge-error gap-1 text-white">
                <FiXCircle size={13} />
                Rejected
            </span>
        );
    };

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            start_date: "",
            end_date: "",
            leave_days: 0,
            reason: "",
            leave_type: "Casual Leave",
            application_date: new Date().toISOString().split("T")[0],
            substitute_name: "",
            substitute_id: "",
            address_during_leave: "",
        },
    });

    const startDate = watch("start_date");
    const endDate = watch("end_date");


    useEffect(() => {
        if (!startDate || !endDate) {
            setValue("leave_days", 0);
            return;
        }

        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T00:00:00`);

        // End date cannot be before start date
        if (end < start) {
            setValue("leave_days", 0);
            return;
        }

        const difference =
            Math.floor(
                (end.getTime() - start.getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1;

        setValue("leave_days", difference);
    }, [startDate, endDate, setValue]);

    const handleLeaveSubmit = async (data) => {
        console.log("Leave form submitted:", data);
        try {
            const response = await api.post(
                "leave/list/",
                {
                    name: data.name,
                    employee_id: data.employee_id,
                    department: data.department,
                    designation: data.designation,
                    leave_type: data.leave_type,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    reason: data.reason,
                    application_date: data.application_date,
                    substitute_name: data.substitute_name,
                    substitute_id: data.substitute_id,
                    address_during_leave: data.address_during_leave,
                }
            );

            console.log("Leave request created:", response.status, response.data);

            if (response.status === 201) {
                Swal.fire({
                    icon: "success",
                    title: "Leave Request Submitted!",
                    timer: 4000,
                    timerProgressBar: true,
                    draggable: true,
                    showConfirmButton: false
                });
                getLeaveRequests(employeeId);
            }


            reset({
                name: "",
                employee_id: user?.employee_id || "",
                leave_type: "Casual Leave",
                department: "",
                designation: "",
                start_date: "",
                end_date: "",
                reason: "",
                application_date: new Date().toISOString().split("T")[0],
                substitute_name: "",
                substitute_id: "",
                address_during_leave: "",
            });

            setShowLeaveModal(false);

        } catch (error) {
            console.error(
                "Leave submission error:",
                error.response?.data || error.message
            );
        }
    };

    const handleLeaveChange = (e) => {
        const { name, value } = e.target;

        setLeaveForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    return (
        <div className="card border border-base-300 bg-base-100 shadow-sm w-full">

            <div className="flex flex-col gap-3 border-b border-base-300 p-5 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h2 className="font-semibold">
                        Leave History
                    </h2>

                    <p className="mt-1 text-sm text-base-content/50">
                        Your recent leave requests
                    </p>
                </div>

                <div className="flex gap-5">
                    <button
                        className="btn btn-primary btn-sm gap-2"
                        onClick={() =>
                            setShowLeaveModal(true)
                        }
                    >
                        <FiPlus size={16} />
                        Apply Leave
                    </button>
                </div>

            </div>

            <div className="overflow-x-auto">

                <table className="table">

                    <thead>
                        <tr>
                            <th>Leave Type</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Days</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>

                        {leaveRequests.map((leave) => (

                            <tr
                                key={leave.id}
                                className="hover"
                            >

                                <td>
                                    <span className="badge badge-ghost">
                                        {leave.leave_type}
                                    </span>
                                </td>

                                <td>
                                    {leave.start_date}
                                </td>

                                <td>
                                    {leave.end_date}
                                </td>

                                <td>
                                    <span className="font-semibold">
                                        {leave.leave_days}
                                    </span>
                                </td>

                                <td>
                                    {getLeaveBadge(
                                        leave.status
                                    )}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>
            {showLeaveModal && (
                <dialog
                    className="modal modal-open"
                    open
                >
                    <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">

                        {/* Modal Header */}
                        <div className="mb-4 flex items-center justify-between border-b pb-3">
                            <div>
                                <h3 className="text-xl font-bold tracking-wide uppercase text-base-content">
                                    Leave Approval Form
                                </h3>
                                <p className="mt-0.5 text-xs text-base-content/60">
                                    Fill out the official details for your leave application request
                                </p>
                            </div>

                            <button
                                className="btn btn-circle btn-ghost btn-sm"
                                onClick={() => setShowLeaveModal(false)}
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Form matching the paper layout */}
                        <form
                            onSubmit={handleSubmit(handleLeaveSubmit)}
                            className="space-y-4 text-sm">

                            {/* Date Row */}
                            {/* Application Date */}
                            <div className="flex justify-end items-center gap-2">
                                <span className="font-semibold">Date:</span>

                                <input
                                    // type="date"
                                    {...register("application_date", {
                                        required: "Application date is required",
                                    })}
                                    readOnly
                                    className="input input-bordered input-sm w-48"
                                />
                            </div>

                            {/* Employee Information Grid */}
                            <div className="border border-base-300 rounded-lg overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-base-300">
                                    <div className="p-2.5 flex items-center gap-2 bg-base-100">
                                        <span className="font-semibold w-28 shrink-0">Name:</span>
                                        <input
                                            type="text"
                                            value={user?.name || ''}
                                            {...register("name")}
                                            readOnly
                                            className="input input-ghost input-sm w-full focus:bg-transparent"
                                        />
                                    </div>
                                    <div className="p-2.5 flex items-center gap-2 bg-base-100">
                                        <span className="font-semibold w-28 shrink-0">ID NO:</span>
                                        <input
                                            type="text"
                                            value={user?.employee_id || ''}
                                            {...register("employee_id")}
                                            readOnly
                                            className="input input-ghost input-sm w-full focus:bg-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-t border-base-300">
                                    <div className="p-2.5 flex items-center gap-2 bg-base-100">
                                        <span className="font-semibold w-28 shrink-0">Designation:</span>
                                        <input
                                            type="text"
                                            value={user?.designation || ''}
                                            {...register("designation")}
                                            readOnly
                                            className="input input-ghost input-sm w-full focus:bg-transparent"
                                        />
                                    </div>
                                    <div className="border-t border-base-300 p-2.5 flex items-center gap-2 bg-base-100">
                                        <span className="font-semibold w-28 shrink-0">Department:</span>
                                        <input
                                            type="text"
                                            value={user?.department || ''}
                                            {...register("department")}
                                            readOnly
                                            className="input input-ghost input-sm w-full focus:bg-transparent"
                                        />
                                    </div>
                                    {/* <div className="p-2.5 flex items-center gap-2 bg-base-100">
                                                    <span className="font-semibold w-28 shrink-0">Date of Join:</span>
                                                    <input
                                                        type="date"
                                                        value={user?.dateOfJoin || ''}
                                                        readOnly
                                                        className="input input-ghost input-sm w-full focus:bg-transparent"
                                                    />
                                                </div> */}
                                </div>


                            </div>

                            {/* Leave Duration Section */}
                            {/* Leave Duration */}
                            <div className="border border-base-300 rounded-lg p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">

                                {/* Leave Type */}
                                <div className="md:col-span-3">
                                    <select
                                        {...register("leave_type", {
                                            required: "Leave type is required",
                                        })}
                                        className="select select-bordered select-sm w-full"
                                    >
                                        <option value="Casual Leave">
                                            Casual Leave
                                        </option>

                                        <option value="Sick Leave">
                                            Sick Leave
                                        </option>

                                        <option value="Annual Leave">
                                            Annual Leave
                                        </option>

                                        <option value="Emergency Leave">
                                            Emergency Leave
                                        </option>

                                        <option value="Unpaid Leave">
                                            Unpaid Leave
                                        </option>
                                    </select>
                                </div>

                                {/* Start Date */}
                                <div className="md:col-span-3 flex items-center gap-2">
                                    <span className="text-xs font-medium">
                                        From
                                    </span>

                                    <input
                                        type="date"
                                        {...register("start_date", {
                                            required: "Start date is required",
                                        })}
                                        className="input input-bordered input-sm w-full"
                                    />
                                </div>

                                {/* End Date */}
                                <div className="md:col-span-3 flex items-center gap-2">
                                    <span className="text-xs font-medium">
                                        To
                                    </span>

                                    <input
                                        type="date"
                                        {...register("end_date", {
                                            required: "End date is required",
                                            validate: (value) =>
                                                !startDate ||
                                                value >= startDate ||
                                                "End date cannot be before start date",
                                        })}
                                        className="input input-bordered input-sm w-full"
                                    />
                                </div>

                                {/* Days */}
                                <div className="md:col-span-3 flex items-center gap-1">
                                    <span className="text-xs font-medium">
                                        Days:
                                    </span>

                                    <input
                                        type="text"
                                        {...register("leave_days")}
                                        readOnly
                                        className="input input-bordered input-sm w-full bg-base-200 text-center font-bold"
                                    />
                                </div>

                            </div>

                            {/* Reason & Address Grid */}
                            <div className="border border-base-300 rounded-lg divide-y divide-base-300">
                                <div className="p-3 flex flex-col md:flex-row gap-2 items-start">
                                    <span className="font-semibold w-40 shrink-0 pt-1">Reason for leave:</span>
                                    <textarea
                                        name="reason"

                                        onChange={handleLeaveChange}
                                        {...register("reason")}
                                        placeholder="Provide a detailed reason for your leave..."
                                        className="textarea textarea-bordered textarea-sm w-full h-20"
                                        required
                                    />
                                </div>
                                <div className="p-3 flex flex-col md:flex-row gap-2 items-start">
                                    <span className="font-semibold w-40 shrink-0 pt-1">Address during leave:</span>
                                    <textarea
                                        name="addressDuringLeave"
                                        onChange={handleLeaveChange}
                                        {...register("address_during_leave")}
                                        placeholder="Enter contact address/location while on leave..."
                                        className="textarea textarea-bordered textarea-sm w-full h-16"
                                    />
                                </div>
                            </div>

                            {/* Duties Carried Out By Section */}
                            <div className="border border-base-300 rounded-lg p-3 space-y-3">
                                <span className="font-semibold block">Duties will be carried out by:</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        name="substitute_name"
                                        placeholder="Colleague Name"
                                        {...register("substitute_name")}
                                        className="input input-bordered input-sm w-full"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Colleague Employee ID"
                                        {...register("substitute_id", {
                                            required: "Employee ID is required",
                                            pattern: {
                                                value: /^\d{1,7}$/,
                                                message: "Employee ID must be 1–7 digits",
                                            },
                                        })}
                                        maxLength={7}
                                        inputMode="numeric"
                                        className="input input-bordered input-sm w-full"
                                    />
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setShowLeaveModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-sm px-6"
                                >
                                    Submit Leave Request
                                </button>
                            </div>

                        </form>

                    </div>

                    {/* Modal Backdrop */}
                    <div
                        className="modal-backdrop"
                        onClick={() => setShowLeaveModal(false)}
                    ></div>
                </dialog>
            )}
        </div>
    );
};

export default Leave;