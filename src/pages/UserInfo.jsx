import React, { useEffect, useMemo, useState } from "react";
import {
    FiUser,
    FiMail,
    FiPhone,
    FiBriefcase,
    FiCalendar,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiPlus,
    FiMapPin,
    FiFileText,
    FiEdit,
    FiKey,
    FiTrash2,
    FiMoreVertical,
    FiX,
} from "react-icons/fi";
import api from "../apis/api";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { useForm } from "react-hook-form";
import { FaBullseye } from "react-icons/fa";
import Swal from "sweetalert2";

const UserInfo = () => {
    const { employeeId } = useParams();
    const [attendance, setAttendance] = useState([]);
    const [employeeData, setEmployeeData] = useState(null);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit: handleUpdateEmployee,
        watch,
        reset,
        setError,
        formState: { errors },
    } = useForm()

    const {
        register: resetPasswordRegister,
        handleSubmit: handleResetPassword,
        reset: resetPasswordForm,
        formState: { errors: resetPasswordErrors },
    } = useForm()


    useEffect(() => {
        if (employeeData) {
            reset({
                employee_id: employeeData.employee_id || "",
                name: employeeData.name || "",
                department: employeeData.department || "",
                designation: employeeData.designation || "",
                email: employeeData.email || "",
                phone: employeeData.phone || "",
                machine_user_id: employeeData.machine_user_id || "",
                join_date: employeeData.join_date || "",
                address: employeeData.address || "",
            });
        }
    }, [employeeData, reset]);



    const onResetPassword = async (data) => {
        try {
            const response = await api.patch(
                `api/update/employee-password/${employeeId}/`,
                {
                    password: data.password,
                    confirmPassword: data.confirmPassword,
                }
            );

            console.log("Password updated successfully:", response.status);

            if (response.status === 200) {
                const modal = document.getElementById("my_modal_1");

                if (modal) {
                    modal.close();
                }
                Swal.fire({
                    icon: "success",
                    title: "Update Successful!",
                    text: "Password updated successfully.",
                    timer: 4000,
                    timerProgressBar: true,
                    draggable: true,
                    showConfirmButton: false
                });
            }

        } catch (error) {
            console.error(
                "Password update error:",
                error.response?.data || error.message
            );
        }

    }

    const getCurrentMonth = () => {
        const now = new Date();

        return `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}`;
    };

    const [selectedMonth, setSelectedMonth] = useState(
        getCurrentMonth()
    );

    const [monthlyAttendance, setMonthlyAttendance] = useState([]);
    const [monthlySummary, setMonthlySummary] = useState({
        working_days: 0,
        leave_days: 0,
        late_days: 0,
        attendance_percentage: 0,
    });

    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [attendanceError, setAttendanceError] = useState("");

    const [leaveForm, setLeaveForm] = useState({
        leaveType: "Casual Leave",
        startDate: "",
        endDate: "",
        reason: "",
    });

    const monthlyWorkingDays = monthlySummary.working_days;
    const monthlyLeaveDays = monthlySummary.leave_days;
    const lateDays = monthlySummary.late_days;
    const monthlyAttendancePercentage =
        monthlySummary.attendance_percentage;


    /*yearly attendance*/
    const currentYear = new Date().getFullYear();

    const [selectedYear, setSelectedYear] = useState(
        currentYear
    );

    const [yearlySummary, setYearlySummary] = useState({
        working_days: 0,
        leave_days: 0,
        present_days: 0,
        late_days: 0,
        attendance_percentage: 0,
    });

    const [yearlyLoading, setYearlyLoading] = useState(false);

    const [yearlyError, setYearlyError] = useState("");

    const yearlyWorkingDays =
        yearlySummary.working_days;

    const yearlyLeaveDays =
        yearlySummary.leave_days;

    const yearlyPresentDays =
        yearlySummary.present_days;

    const yearlyAttendancePercentage =
        yearlySummary.attendance_percentage;

    const fetchYearlyAttendance = async () => {

        if (!employeeId || !selectedYear) {
            return;
        }

        try {

            setYearlyLoading(true);
            setYearlyError("");

            const response = await api.get(
                `api/attendance/yearly/${employeeId}/`,
                {
                    params: {
                        year: selectedYear,
                    },
                }
            );

            const data = response.data;

            setYearlySummary(
                data.summary || {
                    working_days: 0,
                    leave_days: 0,
                    present_days: 0,
                    late_days: 0,
                    attendance_percentage: 0,
                }
            );

        } catch (error) {

            console.error(error);

            setYearlyError(
                error.response?.data?.error ||
                "Failed to load yearly attendance"
            );

            setYearlySummary({
                working_days: 0,
                leave_days: 0,
                present_days: 0,
                late_days: 0,
                attendance_percentage: 0,
            });

        } finally {

            setYearlyLoading(false);

        }
    };

    useEffect(() => {

        if (employeeId && selectedYear) {
            fetchYearlyAttendance();
        }

    }, [employeeId, selectedYear]);
    /*-------------------end-------------------------*/


    useEffect(() => {
        const getEmployeeAttendance = async () => {
            try {
                setLoading(true);

                const response = await api.get(
                    `api/attendance/employee/${employeeId}/`
                );

                // DRF returns the attendance array directly
                setAttendance(response.data.data)
            } catch (error) {
                console.error(
                    "Get employee attendance error:",
                    error.response?.data || error.message
                );

                setAttendance([]);
            } finally {
                setLoading(false);
            }
        };

        getEmployeeAttendance();
    }, [employeeId]);

    const getEmployeeData = async () => {
        try {
            setLoading(true);

            const response = await api.get(
                `api/employee/${employeeId}/`
            );

            // DRF returns the employee data directly
            setEmployeeData(response.data.data);

        } catch (error) {
            console.error(
                "Get employee data error:",
                error.response?.data || error.message
            );

            setEmployeeData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getEmployeeData();
    }, [employeeId]);


    const onEmployeeUpdate = async (data) => {
        setLoading(true)
        setIsSubmitting(true);

        try {
            const response = await api.patch(
                `api/update/employee/${data.employee_id}/`,
                data
            );
            console.log("Employee updated:", response.status);

            if (response.status == 200) {
                const modal = document.getElementById("my_modal_4");

                if (modal) {
                    modal.close();
                }
                reset();
                await getEmployeeData()
                Swal.fire({
                    icon: "success",
                    title: "Update Successful!",
                    text: "Employee info updated successfully.",
                    timer: 4000,
                    timerProgressBar: true,
                    draggable: true,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error(
                "Failed to create employee:",
                error.response?.data || error.message
            );
            if (error.response?.status === 400) {
                const backendErrors = error.response.data;

                if (backendErrors.confirmPassword) {
                    setError("confirmPassword", {
                        type: "server",
                        message: backendErrors.confirmPassword[0],
                    });
                }
            }
        }
        finally {
            setIsSubmitting(false);
            setLoading(false)
        }
    }


    useEffect(() => {
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
        getLeaveRequests(employeeId)
    }, [employeeId]);

    // --------------------------------------------------
    // Monthly Attendance Data
    // --------------------------------------------------
    const fetchMonthlyAttendance = async () => {

        if (!employeeId || !selectedMonth) {
            return;
        }

        try {
            setAttendanceLoading(true);
            setAttendanceError("");

            const response = await api.get(
                `api/attendance/monthly/${employeeId}/`,
                {
                    params: {
                        month: selectedMonth,
                    },
                }
            );

            const data = response.data;

            setMonthlyAttendance(
                data.attendance_records || []
            );

            setMonthlySummary(
                data.summary || {
                    working_days: 0,
                    leave_days: 0,
                    late_days: 0,
                    attendance_percentage: 0,
                }
            );

        } catch (error) {

            console.error(error);

            setAttendanceError(
                error.response?.data?.error ||
                "Failed to load attendance"
            );

            setMonthlyAttendance([]);

            setMonthlySummary({
                working_days: 0,
                leave_days: 0,
                late_days: 0,
                attendance_percentage: 0,
            });

        } finally {

            setAttendanceLoading(false);

        }
    };

    useEffect(() => {

        if (employeeId && selectedMonth) {
            fetchMonthlyAttendance();
        }

    }, [employeeId, selectedMonth]);


    // --------------------------------------------------
    // Attendance Calculations
    // --------------------------------------------------

    const currentMonthAttendance = useMemo(() => {
        return attendance;
    }, []);

    const presentDays = currentMonthAttendance.filter(
        (item) => item.status === "Present" || item.status === "Late"
    ).length;

    const absentDays = currentMonthAttendance.filter(
        (item) => item.status === "Absent"
    ).length;

    const getAttendanceBadge = (status) => {
        if (status === "Present") {
            return (
                <span className="badge badge-success gap-1 text-white">
                    <FiCheckCircle size={13} />
                    Present
                </span>
            );
        }

        if (status === "Late") {
            return (
                <span className="badge badge-warning gap-1">
                    <FiAlertCircle size={13} />
                    Late
                </span>
            );
        }

        return (
            <span className="badge badge-error gap-1 text-white">
                <FiXCircle size={13} />
                Absent
            </span>
        );
    };

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

    const onError = (errors) => {
        console.log("Form validation errors:", errors);

        if (loading) {
            <span className="loading loading-infinity loading-xl"></span>
        }
    };

    const handleDelete = async (employeeId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async(result) => {
            if (result.isConfirmed) {
                const response = await api.delete(
                    `api/delete/employee/${employeeId}/`
                );

                if (response.status == 204) {
                    Swal.fire({
                        icon: "success",
                        title: "Deleted!",
                        text: "Employee deleted successfully.",
                        timer: 4000,
                        timerProgressBar: true,
                        draggable: true,
                        showConfirmButton: false
                    });
                    navigate("/employees")
                }
            }
        });

    }

    return (
        <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8">

            {/* ==============================================
                         PROFILE HEADER
               =============================================== */}

            <div className="card mb-6 border border-base-300 bg-base-100 shadow-sm">
                <div className="card-body">

                    {/* =========================================
                          PROFILE HEADER
                        ========================================= */}
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        {/* Employee Information */}
                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">

                            {/* Profile Picture */}
                            <div className="avatar shrink-0">
                                <div className="w-24 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                                    {employeeData?.profile_pic ? (
                                        <img
                                            src={employeeData.profile_pic}
                                            alt={employeeData?.name || "Employee"}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-primary text-primary-content">
                                            <span className="text-2xl font-bold">
                                                {employeeData?.name
                                                    ?.split(" ")
                                                    .map((word) => word[0])
                                                    .join("")
                                                    .slice(0, 2)
                                                    .toUpperCase() || "N/A"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Name and Basic Information */}
                            <div className="min-w-0">

                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-bold md:text-3xl">
                                        {employeeData?.name || "N/A"}
                                    </h1>
                                </div>

                                {/* Designation */}
                                <p className="mt-1 text-base-content/60">
                                    {employeeData?.designation || "N/A"}
                                </p>

                                {/* Department, ID, Join Date */}
                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-base-content/60">

                                    <span className="flex items-center gap-1.5">
                                        <FiBriefcase size={15} />
                                        {employeeData?.department || "N/A"}
                                    </span>

                                    <span className="flex items-center gap-1.5">
                                        <FiFileText size={15} />
                                        {employeeData?.employee_id || "N/A"}
                                    </span>

                                    <span className="flex items-center gap-1.5">
                                        <FiCalendar size={15} />
                                        Joined{" "}
                                        {employeeData?.join_date
                                            ? new Date(
                                                employeeData.join_date
                                            ).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })
                                            : "N/A"}
                                    </span>

                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <div className="dropdown dropdown-end">
                                <div
                                    tabIndex={0}
                                    role="button"
                                    className="btn btn-sm btn-outline gap-2"
                                >
                                    <FiMoreVertical size={18} />
                                    Actions
                                </div>

                                <ul
                                    tabIndex={-1}
                                    className="dropdown-content menu bg-base-100 rounded-box z-50 mt-2 w-56 p-2 shadow-xl border border-base-300"
                                >
                                    <li>
                                        <button
                                            onClick={() =>
                                                document.getElementById("my_modal_4").showModal()
                                            }
                                        >
                                            <FiEdit size={17} />
                                            Edit Profile
                                        </button>
                                    </li>

                                    <li>
                                        <button
                                            onClick={() =>
                                                document.getElementById("my_modal_1").showModal()
                                            }
                                        >
                                            <FiKey size={17} />
                                            Reset Password
                                        </button>
                                    </li>

                                    <li>
                                        <button
                                            onClick={() =>
                                                handleDelete(employeeData?.employee_id)
                                            }
                                            className="text-error"
                                        >
                                            <FiTrash2 size={17} />
                                            Delete Account
                                        </button>
                                    </li>
                                </ul>
                            </div>

                        </div>

                    </div>

                    {/* =========================================
            DIVIDER
        ========================================= */}
                    <div className="my-6 border-t border-base-300"></div>

                    {/* =========================================
            PERSONAL INFORMATION
        ========================================= */}
                    <div>
                        <h2 className="mb-4 text-lg font-semibold">
                            Personal Information
                        </h2>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                            {/* Full Name */}
                            <div className="min-w-0">
                                <p className="text-xs text-base-content/50">
                                    Full Name
                                </p>

                                <p className="mt-1 break-words font-medium">
                                    {employeeData?.name || "N/A"}
                                </p>
                            </div>

                            {/* Email */}
                            <div className="min-w-0">
                                <p className="text-xs text-base-content/50">
                                    Email
                                </p>

                                <p className="mt-1 flex items-start gap-2 break-words text-sm">
                                    <FiMail
                                        size={15}
                                        className="mt-0.5 shrink-0 text-base-content/50"
                                    />

                                    {employeeData?.email || "Not provided"}
                                </p>
                            </div>

                            {/* Phone */}
                            <div className="min-w-0">
                                <p className="text-xs text-base-content/50">
                                    Phone
                                </p>

                                <p className="mt-1 flex items-center gap-2 text-sm">
                                    <FiPhone
                                        size={15}
                                        className="shrink-0 text-base-content/50"
                                    />

                                    {employeeData?.phone || "Not provided"}
                                </p>
                            </div>

                            {/* Address */}
                            <div className="min-w-0">
                                <p className="text-xs text-base-content/50">
                                    Address
                                </p>

                                <p className="mt-1 flex items-start gap-2 break-words text-sm">
                                    <FiMapPin
                                        size={15}
                                        className="mt-0.5 shrink-0 text-base-content/50"
                                    />

                                    {employeeData?.address || "Not provided"}
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>


            {/* ==================================================
                PERSONAL INFORMATION
              ================================================== */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            </div>

            {/* ==================================================
                MONTHLY / YEARLY PERFORMANCE
            ================================================== */}
            <div className="mb-6">

                <div className="mb-4">
                    <h2 className="text-lg font-bold">
                        Attendance Performance
                    </h2>

                    <p className="text-sm text-base-content/60">
                        Your attendance and leave summary
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* Monthly */}
                    <div className="card border border-base-300 bg-base-100 shadow-sm">

                        <div className="card-body">

                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <div>
                                    <h3 className="font-semibold">
                                        This Month
                                    </h3>

                                    <p className="text-sm text-base-content/50">
                                        {new Date(`${selectedMonth}-01`).toLocaleDateString(
                                            "en-US",
                                            {
                                                month: "long",
                                                year: "numeric"
                                            }
                                        )}
                                    </p>
                                </div>

                                {/* Month Selector */}
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="input input-bordered input-sm w-full sm:w-auto"
                                />

                            </div>

                            {attendanceLoading ? (

                                <div className="flex justify-center py-8">
                                    <span className="loading loading-spinner loading-md"></span>
                                </div>

                            ) : attendanceError ? (

                                <div className="alert alert-error">
                                    <span>{attendanceError}</span>
                                </div>

                            ) : (

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                                    {/* Working Days */}
                                    <div className="rounded-xl bg-base-200 p-4">

                                        <p className="text-xs text-base-content/50">
                                            Working Days
                                        </p>

                                        <p className="mt-1 text-2xl font-bold">
                                            {monthlyWorkingDays}
                                        </p>

                                    </div>


                                    {/* Leave */}
                                    <div className="rounded-xl bg-base-200 p-4">

                                        <p className="text-xs text-base-content/50">
                                            Leave
                                        </p>

                                        <p className="mt-1 text-2xl font-bold">
                                            {monthlyLeaveDays}
                                        </p>

                                    </div>


                                    {/* Late */}
                                    <div className="rounded-xl bg-base-200 p-4">

                                        <p className="text-xs text-base-content/50">
                                            Late
                                        </p>

                                        <p className="mt-1 text-2xl font-bold">
                                            {lateDays}
                                        </p>

                                    </div>


                                    {/* Attendance */}
                                    <div className="rounded-xl bg-base-200 p-4">

                                        <p className="text-xs text-base-content/50">
                                            Attendance
                                        </p>

                                        <p className="mt-1 text-2xl font-bold text-success">
                                            {monthlyAttendancePercentage}%
                                        </p>

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>

                    {/* Yearly */}
                    <div className="card border border-base-300 bg-base-100 shadow-sm">

                        <div className="card-body">

                            <div className="mb-5 flex items-center justify-between">

                                <div>
                                    <h3 className="font-semibold">
                                        This Year
                                    </h3>

                                    <p className="text-sm text-base-content/50">
                                        January - August 2026
                                    </p>
                                </div>

                                <div className="rounded-lg bg-success/10 p-2 text-success">
                                    <FiCheckCircle size={20} />
                                </div>

                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                                <div className="rounded-xl bg-base-200 p-4">
                                    <p className="text-xs text-base-content/50">
                                        Working Days
                                    </p>

                                    <p className="mt-1 text-2xl font-bold">
                                        {yearlyWorkingDays}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-base-200 p-4">
                                    <p className="text-xs text-base-content/50">
                                        Leave
                                    </p>

                                    <p className="mt-1 text-2xl font-bold">
                                        {yearlyLeaveDays}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-base-200 p-4">
                                    <p className="text-xs text-base-content/50">
                                        Present
                                    </p>

                                    <p className="mt-1 text-2xl font-bold">
                                        154
                                    </p>
                                </div>

                                <div className="rounded-xl bg-base-200 p-4">
                                    <p className="text-xs text-base-content/50">
                                        Attendance
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-success">
                                        {yearlyAttendancePercentage}%
                                    </p>
                                </div>

                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* ==================================================
                ATTENDANCE HISTORY
            ================================================== */}
            <div className="card mb-6 border border-base-300 bg-base-100 shadow-sm">

                <div className="border-b border-base-300 p-5">

                    <div>
                        <h2 className="font-semibold">
                            Attendance History
                        </h2>

                        <p className="mt-1 text-sm text-base-content/50">
                            Your daily check-in and check-out records
                        </p>
                    </div>

                </div>

                <div className="overflow-x-auto">

                    <table className="table">

                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Working Hours</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>

                            {attendance.map((attendance, index) => (

                                <tr
                                    key={index}
                                    className="hover"
                                >

                                    <td>
                                        <div className="flex items-center gap-2">
                                            <FiCalendar
                                                size={15}
                                                className="text-base-content/50"
                                            />

                                            <span className="font-medium">
                                                {attendance.attendance_date}
                                            </span>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="flex items-center gap-2">
                                            <FiClock
                                                size={15}
                                                className="text-success"
                                            />

                                            {attendance.entryTime}
                                        </div>
                                    </td>

                                    <td>
                                        <div className="flex items-center gap-2">
                                            <FiClock
                                                size={15}
                                                className="text-error"
                                            />

                                            {attendance.exitTime}
                                        </div>
                                    </td>

                                    <td>
                                        <span className="font-medium">
                                            {attendance.workingHours}
                                        </span>
                                    </td>

                                    <td>
                                        {getAttendanceBadge(
                                            attendance.attendanceStatus
                                        )}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>
            </div>

            {/* ==================================================
                LEAVE HISTORY
            ================================================== */}
            <div className="card border border-base-300 bg-base-100 shadow-sm">

                <div className="flex flex-col gap-3 border-b border-base-300 p-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h2 className="font-semibold">
                            Leave History
                        </h2>

                        <p className="mt-1 text-sm text-base-content/50">
                            Your recent leave requests
                        </p>
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
            </div>
            <dialog id="my_modal_4" className="modal">
                <div className="modal-box w-11/12 md:w-7/12 max-w-5xl">
                    <form onSubmit={handleUpdateEmployee(onEmployeeUpdate)}>
                        <h3 className="font-bold text-lg mb-4">Update Employee</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Employee ID */}
                            <div>
                                <label className="label">
                                    <span className="label-text">
                                        Employee ID
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    placeholder="EMP001"
                                    className="input input-bordered w-full"
                                    {...register("employee_id", {
                                        required: "Employee ID is required",
                                    })}
                                />

                                {errors.employee_id && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.employee_id.message}
                                    </p>
                                )}
                            </div>

                            {/* Name */}
                            <div>
                                <label className="label">
                                    <span className="label-text">
                                        Name
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    placeholder="Employee name"
                                    className="input input-bordered w-full"
                                    {...register("name", {
                                        required: "Name is required",
                                    })}
                                />

                                {errors.name && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* Department */}
                            <div>
                                <label className="label">
                                    <span className="label-text">
                                        Department
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    placeholder="IT"
                                    className="input input-bordered w-full"
                                    {...register("department", {
                                        required: "Department is required",
                                    })}
                                />

                                {errors.department && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.department.message}
                                    </p>
                                )}
                            </div>

                            {/* Designation */}
                            <div>
                                <label className="label">
                                    <span className="label-text">
                                        Designation
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    placeholder="Software Engineer"
                                    className="input input-bordered w-full"
                                    {...register("designation", {
                                        required: "Designation is required",
                                    })}
                                />

                                {errors.designation && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.designation.message}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="label">
                                    <span className="label-text">
                                        Email
                                    </span>
                                </label>

                                <input
                                    type="email"
                                    placeholder="employee@example.com"
                                    className="input input-bordered w-full"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Enter a valid email address",
                                        },
                                    })}
                                />

                                {errors.email && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="label">
                                    <span className="label-text">
                                        Phone
                                    </span>
                                </label>

                                <input
                                    type="tel"
                                    className="input input-bordered w-full"
                                    {...register("phone", {
                                        required: "Phone number is required",
                                    })}
                                />

                                {errors.phone && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>

                            {/* Machine User ID */}
                            <div>
                                <label className="label">
                                    <span className="label-text">
                                        Machine User ID
                                    </span>
                                </label>

                                <input
                                    type="number"
                                    {...register("machine_user_id", {
                                        required: "Machine User ID is required",
                                    })}
                                />

                                {errors.machine_user_id && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.machine_user_id.message}
                                    </p>
                                )}
                            </div>

                            {/* Join Date */}
                            <div>
                                <label className="label">
                                    <span className="label-text">
                                        Join Date
                                    </span>
                                </label>

                                <input
                                    type="date"
                                    className="input input-bordered w-full"
                                    {...register("join_date", {
                                        required: "Join date is required",
                                    })}
                                />

                                {errors.join_date && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.join_date.message}
                                    </p>
                                )}
                            </div>

                        </div>

                        {/* Address */}
                        <div className="mt-4">
                            <label className="label">
                                <span className="label-text">
                                    Address
                                </span>
                            </label>

                            <textarea
                                className="textarea textarea-bordered w-full"
                                rows={3}
                                {...register("address")}
                            />
                        </div>

                        {/* 
                        Profile Picture 
                        <div className="mt-4">
                            <label className="label">
                                <span className="label-text">
                                    Profile Picture
                                </span>
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                className="file-input file-input-bordered w-full"
                                defaultValue={employeeData?.profile_pic || ""}
                                {...register("profile_pic", {
                                    // required: "Employee image is required",
                                })}
                            />
                            {errors.profile_pic && (
                                <p className="text-red-500 font-bold mt-1">{errors.profile_pic.message}</p>
                            )}
                        </div>
                        */}


                        {/* Buttons */}
                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn"
                                onClick={() => document.getElementById('my_modal_4').close()}
                            >
                                Cancel
                            </button>

                            <input
                                type="submit"
                                className="btn btn-primary"
                                value="Confirm"
                            />
                            {/* {isSubmitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Updating...
                                    </>
                                ) : (
                                    "Confirm"
                                )}
                            </input> */}
                        </div>
                    </form>
                </div>
            </dialog>
            {/* reset password dialog */}
            <dialog id="my_modal_1" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Reset Password</h3>

                    <form onSubmit={handleResetPassword(onResetPassword, onError)}>
                        <div className="flex flex-col gap-4">
                            {/* Password */}
                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Password</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    className="input input-bordered w-full"
                                    {...resetPasswordRegister("password", {
                                        required: "Password is required",
                                    })}
                                />
                                {resetPasswordErrors.password && (
                                    <p className="text-error text-sm mt-1">
                                        {resetPasswordErrors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Confirm Password</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    className="input input-bordered w-full"
                                    {...resetPasswordRegister("confirmPassword", {
                                        required: "Confirm Password is required",
                                    })}
                                />
                                {resetPasswordErrors.confirmPassword && (
                                    <p className="text-error text-sm mt-1">
                                        {resetPasswordErrors.confirmPassword.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="modal-action">
                            {/* if there is a button in form, it will close the modal */}
                            <button type="button" className="btn" onClick={() => document.getElementById('my_modal_1').close()}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Confirm
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default UserInfo;

// const imageFile = data.profile_pic[0];

// const imageFormData = new FormData();
// imageFormData.append("image", imageFile);

// const imageResponse = await fetch(
//     `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
//     {
//         method: "POST",
//         body: imageFormData,
//     }
// );

// const imageResult = await imageResponse.json();

// if (!imageResult.success) {
//     throw new Error("Image upload failed");
// }

// // Get image URL from ImgBB
// const imageUrl = imageResult.data.url;

// console.log("ImgBB URL:", imageUrl);

// Remove FileList because Django only needs the URL