import React, { useContext, useEffect, useMemo, useState } from "react";
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
    FiEdit,
    FiFileText,
    FiX,
    FiArrowRight,
} from "react-icons/fi";
import api from "../apis/api";
import { Link, useParams } from "react-router";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useReducer } from "react";
import { AuthContext } from "../providers/AuthProvider";

const Profile = () => {
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [attendance, setAttendance] = useState([]);
    const [users, setEmployeeData] = useState(null);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    const {user} = useContext(AuthContext);
    const employeeId = user?.employee_id;

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


    useEffect(() => {
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

        getEmployeeData();
    }, [employeeId]);


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

    // --------------------------------------------------
    // Form Handlers
    // --------------------------------------------------

    const handleLeaveChange = (e) => {
        const { name, value } = e.target;

        setLeaveForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

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


    /*------handle leave form submission*/

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

    // const leaveDays = calculateLeaveDays();
    // console.log(leaveDays)

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

            console.log("Leave request created:", response.data);

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

    // useEffect(() => {
    //     setValue("leave_days", leaveDays);
    // }, [leaveDays, setValue]);

    return (
        <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8">

            {/* ==================================================
                         PROFILE HEADER
                    ================================================== */}

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
                                    {user?.profile_pic ? (
                                        <img
                                            src={user.profile_pic}
                                            alt={user?.name || "Employee"}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-primary text-primary-content">
                                            <span className="text-2xl font-bold">
                                                {user?.name
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
                                        {user?.name || "N/A"}
                                    </h1>
                                </div>

                                {/* Designation */}
                                <p className="mt-1 text-base-content/60">
                                    {user?.designation || "N/A"}
                                </p>

                                {/* Department, ID, Join Date */}
                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-base-content/60">

                                    <span className="flex items-center gap-1.5">
                                        <FiBriefcase size={15} />
                                        {user?.department || "N/A"}
                                    </span>

                                    <span className="flex items-center gap-1.5">
                                        <FiFileText size={15} />
                                        {user?.employee_id || "N/A"}
                                    </span>

                                    <span className="flex items-center gap-1.5">
                                        <FiCalendar size={15} />
                                        Joined{" "}
                                        {user?.join_date
                                            ? new Date(
                                                user.join_date
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
                            {/* <button className="btn btn-outline gap-2">
                                <FiEdit size={17} />
                                Edit Profile
                            </button> */}

                            <button
                                className="btn btn-primary gap-2"
                                onClick={() => setShowLeaveModal(true)}
                            >
                                <FiPlus size={18} />
                                Apply Leave
                            </button>
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
                                    {user?.name || "N/A"}
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

                                    {user?.email || "Not provided"}
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

                                    {user?.phone || "Not provided"}
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

                                    {user?.address || "Not provided"}
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
                                    {/* <div className="rounded-xl bg-base-200 p-4">

                                        <p className="text-xs text-base-content/50">
                                            Working Days
                                        </p>

                                        <p className="mt-1 text-2xl font-bold">
                                            {monthlyWorkingDays}
                                        </p>

                                    </div> */}


                                    {/* Leave */}
                                    <div className="rounded-xl bg-base-200 p-4">

                                        <p className="text-xs text-base-content/50">
                                            Absent
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

                                    <div className="rounded-xl bg-base-200 p-4">

                                        <p className="text-xs text-base-content/50">
                                            Early Leave
                                        </p>

                                        <p className="mt-1 text-2xl font-bold">
                                            {monthlyLeaveDays}
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

                                {/* <div className="rounded-xl bg-base-200 p-4">
                                    <p className="text-xs text-base-content/50">
                                        Working Days
                                    </p>

                                    <p className="mt-1 text-2xl font-bold">
                                        {yearlyWorkingDays}
                                    </p>
                                </div> */}

                                <div className="rounded-xl bg-base-200 p-4">
                                    <p className="text-xs text-base-content/50">
                                        Absent
                                    </p>

                                    <p className="mt-1 text-2xl font-bold">
                                        {yearlyLeaveDays}
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
                                        Early Leave
                                    </p>

                                    <p className="mt-1 text-2xl font-bold">
                                        {yearlyLeaveDays}
                                    </p>
                                </div>

                                {/* <div className="rounded-xl bg-base-200 p-4">
                                    <p className="text-xs text-base-content/50">
                                        Present
                                    </p>

                                    <p className="mt-1 text-2xl font-bold">
                                        154
                                    </p>
                                </div> */}

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
           

            {/* ==================================================
                LEAVE HISTORY
            ================================================== */}
            

            {/* ==================================================
                APPLY LEAVE DAISYUI MODAL
            ================================================== */}
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

export default Profile;