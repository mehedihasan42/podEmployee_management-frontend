
import React, { useEffect, useMemo, useState } from "react";

import {
    FiSearch,
    FiDownload,
    FiCalendar,
    FiClock,
    FiUsers,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiFilter,
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";

import api from "../apis/api";
import { Link } from "react-router";
import Swal from "sweetalert2";

// =====================================
// Attendance Component
// =====================================

const Attendance = () => {
    // =====================================
    // States
    // =====================================

    const [attendanceData, setAttendanceData] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [departmentFilter, setDepartmentFilter] = useState("All");

    const [selectedDate, setSelectedDate] = useState(
        new Date().toLocaleDateString("en-CA")
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalEmployees, setTotalEmployee] = useState()

    const itemsPerPage = 10;

    // =====================================
    // 1. Get Date Wise Attendance
    // =====================================

    useEffect(() => {
        let active = true;

        const getAttendance = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("api/attendance/", {
                    params: {
                        date: selectedDate,
                    },
                });

                // Axios response is already parsed.
                const payload = response.data;

                // Handle common Django REST API response formats.
                const records = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.data)
                        ? payload.data
                        : Array.isArray(payload?.results)
                            ? payload.results
                            : [];

                // Convert API fields into frontend fields.


                const formattedData = records.map((item, index) => {
                    const rawStatus = String(item.attendanceStatus ?? "")
                        .trim()
                        .toLowerCase()
                        .replace(/[\s-]+/g, "_");

                    let status = "Unknown";

                    if (rawStatus === "present") {
                        status = "Present";
                    } else if (rawStatus === "late") {
                        status = "Late";
                    } else if (rawStatus === "absent") {
                        status = "Absent";
                    } else if (rawStatus === "on_time" || rawStatus === "ontime") {
                        status = "On Time";
                    }

                    return {
                        id: item.id ?? index,
                        employeeId: String(item.employee_id ?? ""),
                        name: item.name ?? "Unknown Employee",
                        department: item.department ?? "N/A",
                        designation: item.designation ?? "",
                        checkIn: item.entryTime ?? "--",
                        checkOut: item.exitTime ?? "--",
                        workingHours: item.workingHours ?? "0.00",
                        status,
                    };
                });

                if (active) {
                    setAttendanceData(formattedData);
                    setCurrentPage(1);
                }
            } catch (err) {
                console.error("Get attendance error:", err);

                if (active) {
                    setAttendanceData([]);

                    setError(
                        err.response?.data?.message ||
                        err.response?.data?.detail ||
                        err.message ||
                        "Failed to fetch attendance records"
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        if (selectedDate) {
            getAttendance();
        } else {
            setAttendanceData([]);
            setLoading(false);
        }

        return () => {
            active = false;
        };
    }, [selectedDate]);

    // =====================================
    // 2. Department Options
    // =====================================

    const departments = useMemo(() => {
        const departmentList = attendanceData
            .map((item) => item.department)
            .filter(Boolean);

        return ["All", ...new Set(departmentList)];
    }, [attendanceData]);

    // =====================================
    // 3. Filter Attendance
    // =====================================

    const filteredData = useMemo(() => {
        return attendanceData.filter((employee) => {
            const query = search.trim().toLowerCase();

            const matchesSearch =
                employee.name.toLowerCase().includes(query) ||
                employee.employeeId.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "All" ||
                employee.status === statusFilter;

            const matchesDepartment =
                departmentFilter === "All" ||
                employee.department === departmentFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesDepartment
            );
        });
    }, [
        attendanceData,
        search,
        statusFilter,
        departmentFilter,
    ]);

    // =====================================
    // 4. Attendance Summary
    // =====================================


    // const totalEmployees = attendanceData.length;

    const lateCount = attendanceData.filter(
        (item) => item.status === "Late"
    ).length;

    const onTimeCount = attendanceData.filter(
        (item) => item.status === "On Time"
    ).length;

    const presentCount = lateCount + onTimeCount;

    // const absentCount = attendanceData.filter(
    //     (item) => item.status === "Absent"
    // ).length;

    const absentCount = totalEmployees - presentCount

    const attendancePercentage = totalEmployees
        ? Math.round(
            (presentCount /
                totalEmployees) *
            100
        )
        : 0;

    // =====================================
    // 5. Pagination
    // =====================================

    const totalPages = Math.ceil(
        filteredData.length / itemsPerPage
    );

    const startIndex = (currentPage - 1) * itemsPerPage;

    const paginatedData = filteredData.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // =====================================
    // 6. Employee Initials
    // =====================================

    const getInitials = (name = "") => {
        return name
            .split(" ")
            .filter(Boolean)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    // =====================================
    // 7. Format Time
    // =====================================

    const formatTime = (value) => {
        if (!value || value === "--") {
            return "--";
        }

        const text = String(value);

        // Handle HH:MM or HH:MM:SS.
        if (/^\d{2}:\d{2}(:\d{2})?$/.test(text)) {
            const [hours, minutes] = text.split(":").map(Number);

            const period = hours >= 12 ? "PM" : "AM";

            const formattedHours = hours % 12 || 12;

            return `${formattedHours}:${String(minutes).padStart(
                2,
                "0"
            )} ${period}`;
        }

        return text;
    };

    // =====================================
    // 8. Attendance Status Badge
    // =====================================


    const getStatusBadge = (status) => {
        switch (status) {
            case "Present":
                return (
                    <span className="badge badge-success gap-1 text-white">
                        <FiCheckCircle size={14} />
                        Present
                    </span>
                );

            case "On Time":
                return (
                    <span className="badge badge-success gap-1 text-white">
                        <FiCheckCircle size={14} />
                        On Time
                    </span>
                );

            case "Late":
                return (
                    <span className="badge badge-warning gap-1">
                        <FiAlertCircle size={14} />
                        Late
                    </span>
                );

            case "Absent":
                return (
                    <span className="badge badge-error gap-1 text-white">
                        <FiXCircle size={14} />
                        Absent
                    </span>
                );

            default:
                return (
                    <span className="badge badge-ghost">
                        {status || "Unknown"}
                    </span>
                );
        }
    };

    // =====================================
    // 9. Export Attendance CSV
    // =====================================

    const handleExport = () => {
        if (filteredData.length === 0) {
            return;
        }

        const headers = [
            "Employee ID",
            "Name",
            "Department",
            "Designation",
            "Check In",
            "Check Out",
            "Working Hours",
            "Status",
        ];

        const rows = filteredData.map((employee) => [
            employee.employeeId,
            employee.name,
            employee.department,
            employee.designation,
            employee.checkIn,
            employee.checkOut,
            employee.workingHours,
            employee.status,
        ]);

        const escapeCSV = (value) => {
            const text = String(value ?? "");

            // Protect spreadsheet applications against
            // formula injection from untrusted API values.
            const safeText = /^[=+\-@\t\r]/.test(text)
                ? `'${text}`
                : text;

            return `"${safeText.replace(/"/g, '""')}"`;
        };

        const csvContent = [
            headers.map(escapeCSV).join(","),
            ...rows.map((row) => row.map(escapeCSV).join(",")),
        ].join("\r\n");

        const blob = new Blob(
            ["\uFEFF" + csvContent],
            {
                type: "text/csv;charset=utf-8;",
            }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = `attendance_${selectedDate}.csv`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const fetchData = async () => {
            const response = await api.get("api/employees/");
            setTotalEmployee(response.data.count);
        };

        fetchData();
    }, []);

    const deleteAttendanceByDate = async (date) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed)
                try {
                    const response = await api.delete(
                        `api/attendance/?date=${date}`
                    );

                    console.log(response.data);
                    if (response.status === 200) {
                        Swal.fire({
                            title: "Deleted!",
                            text: "Your file has been deleted.",
                            icon: "success"
                        });
                    }

                } catch (error) {
                    console.error(
                        "Delete attendance error:",
                        error.response?.data || error.message
                    );
                }
        });
    };

    return (
        <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8">

            {/* ===============================
                        Page Header
            =============================== */}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-base-content md:text-3xl">
                        Attendance
                    </h1>

                    <p className="mt-1 text-sm text-base-content/60">
                        Monitor and manage employee attendance
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleExport}
                    disabled={loading || filteredData.length === 0}
                    className="btn btn-primary gap-2"
                >
                    <FiDownload size={18} />
                    Export Report
                </button>

            </div>

            {/* ===============================
          Error Message
      =============================== */}

            {error && (
                <div className="alert alert-error mb-6">
                    <FiAlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* ===============================
          Summary Cards
      =============================== */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {/* Total Employees */}

                <div className="card border border-base-300 bg-base-100 shadow-sm">
                    <div className="card-body p-5">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm text-base-content/60">
                                    Total Employees
                                </p>

                                <h2 className="mt-1 text-2xl font-bold">
                                    {totalEmployees}
                                </h2>

                                <p className="mt-1 text-xs text-base-content/50">
                                    Attendance records
                                </p>
                            </div>

                            <div className="rounded-xl bg-primary/10 p-3 text-primary">
                                <FiUsers size={24} />
                            </div>

                        </div>

                    </div>
                </div>

                {/* Present */}

                <div className="card border border-base-300 bg-base-100 shadow-sm">
                    <div className="card-body p-5">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm text-base-content/60">
                                    Present
                                </p>

                                <h2 className="mt-1 text-2xl font-bold">
                                    {presentCount}
                                </h2>

                                <p className="mt-1 text-xs text-success">
                                    {attendancePercentage}% attendance
                                </p>
                            </div>

                            <div className="rounded-xl bg-success/10 p-3 text-success">
                                <FiCheckCircle size={24} />
                            </div>

                        </div>

                    </div>
                </div>

                {/* Late */}

                <div className="card border border-base-300 bg-base-100 shadow-sm">
                    <div className="card-body p-5">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm text-base-content/60">
                                    Late
                                </p>

                                <h2 className="mt-1 text-2xl font-bold">
                                    {lateCount}
                                </h2>

                                <p className="mt-1 text-xs text-warning">
                                    Needs attention
                                </p>
                            </div>

                            <div className="rounded-xl bg-warning/10 p-3 text-warning">
                                <FiClock size={24} />
                            </div>

                        </div>

                    </div>
                </div>

                {/* Absent */}

                <div className="card border border-base-300 bg-base-100 shadow-sm">
                    <div className="card-body p-5">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm text-base-content/60">
                                    Absent
                                </p>

                                <h2 className="mt-1 text-2xl font-bold">
                                    {absentCount}
                                </h2>

                                <p className="mt-1 text-xs text-error">
                                    Not checked in
                                </p>
                            </div>

                            <div className="rounded-xl bg-error/10 p-3 text-error">
                                <FiXCircle size={24} />
                            </div>

                        </div>

                    </div>
                </div>

            </div>

            {/* ===============================
          Attendance Table Card
      =============================== */}

            <div className="card border border-base-300 bg-base-100 shadow-sm">

                {/* Filters */}

                <div className="border-b border-base-300 p-4 md:p-5">

                    <div className="mb-4 flex items-center gap-2">
                        <FiFilter size={18} />

                        <h2 className="font-semibold">
                            Attendance Records
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">

                        {/* Date */}

                        <label className="input input-bordered flex items-center gap-2">

                            <FiCalendar
                                size={18}
                                className="text-base-content/50"
                            />

                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="grow"
                            />

                        </label>

                        {/* Search */}

                        <label className="input input-bordered flex items-center gap-2">

                            <FiSearch
                                size={18}
                                className="text-base-content/50"
                            />

                            <input
                                type="text"
                                placeholder="Search employee..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="grow"
                            />

                        </label>

                        {/* Department Filter */}

                        <select
                            className="select select-bordered w-full"
                            value={departmentFilter}
                            onChange={(e) => {
                                setDepartmentFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        >

                            {departments.map((department) => (
                                <option
                                    key={department}
                                    value={department}
                                >
                                    {department === "All"
                                        ? "All Departments"
                                        : department}
                                </option>
                            ))}

                        </select>

                        {/* Status Filter */}

                        <select
                            className="select select-bordered w-full"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        >

                            <option value="All">
                                All Status
                            </option>

                            <option value="Present">
                                Present
                            </option>

                            <option value="Late">
                                Late
                            </option>

                            <option value="Absent">
                                Absent
                            </option>

                        </select>
                    </div>

                    <button
                        className="btn btn-error btn-sm text-white mt-4"
                        onClick={() => deleteAttendanceByDate(selectedDate)}
                    >
                        Delete List
                    </button>

                </div>

                {/* ===============================
            Selected Date
        =============================== */}

                <div className="flex flex-col gap-2 border-b border-base-300 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">

                    <div>

                        <p className="text-sm text-base-content/60">
                            Attendance for
                        </p>

                        <p className="font-semibold">

                            {selectedDate
                                ? new Date(
                                    selectedDate + "T00:00:00"
                                ).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })
                                : "Select a date"}

                        </p>

                    </div>

                    <p className="text-sm text-base-content/60">

                        Showing{" "}

                        <span className="font-semibold text-base-content">
                            {filteredData.length}
                        </span>{" "}

                        employees

                    </p>

                </div>

                {/* ===============================
            Attendance Table
        =============================== */}

                <div className="overflow-x-auto">

                    <table className="table">

                        <thead>

                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Working Hours</th>
                                <th>Status</th>
                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-16 text-center"
                                    >

                                        <div className="flex flex-col items-center justify-center gap-3">

                                            <span className="loading loading-spinner loading-lg text-primary"></span>

                                            <p className="text-sm text-base-content/60">
                                                Loading attendance records...
                                            </p>

                                        </div>

                                    </td>
                                </tr>

                            ) : paginatedData.length > 0 ? (

                                paginatedData.map((employee) => (

                                    <tr
                                        key={employee.id}
                                        className="hover"
                                    >

                                        {/* Employee */}

                                        <td>

                                            <div className="flex items-center gap-3">

                                                <div className="avatar placeholder">

                                                    <div className="w-10 rounded-full bg-primary text-primary-content">

                                                        <span className="text-sm font-semibold">
                                                            {getInitials(employee.name)}
                                                        </span>

                                                    </div>

                                                </div>

                                                <div>

                                                    <Link to={`/userInfo/${employee.employeeId}`} className="font-semibold hover:underline">
                                                        {employee.name}
                                                    </Link>

                                                    <p className="text-xs text-base-content/50">
                                                        {employee.employeeId}
                                                    </p>

                                                </div>

                                            </div>

                                        </td>

                                        {/* Department */}

                                        <td>

                                            <span className="text-sm">
                                                {employee.department}
                                            </span>

                                        </td>

                                        {/* Check In */}

                                        <td>

                                            <div className="flex items-center gap-2">

                                                <FiClock
                                                    size={15}
                                                    className="text-success"
                                                />

                                                <span>
                                                    {formatTime(employee.checkIn)}
                                                </span>

                                            </div>

                                        </td>

                                        {/* Check Out */}

                                        <td>

                                            <div className="flex items-center gap-2">

                                                <FiClock
                                                    size={15}
                                                    className="text-error"
                                                />

                                                <span>
                                                    {formatTime(employee.checkOut)}
                                                </span>

                                            </div>

                                        </td>

                                        {/* Working Hours */}

                                        <td>

                                            <span className="font-medium">
                                                {employee.workingHours}
                                            </span>

                                        </td>

                                        {/* Status */}

                                        <td>
                                            {getStatusBadge(employee.status)}
                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan={6}
                                        className="py-16 text-center"
                                    >

                                        <div className="flex flex-col items-center justify-center">

                                            <FiUsers
                                                size={40}
                                                className="mb-3 text-base-content/30"
                                            />

                                            <p className="font-semibold">
                                                No attendance records found
                                            </p>

                                            <p className="mt-1 text-sm text-base-content/50">
                                                Try changing your date, search, or filters.
                                            </p>

                                        </div>

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

                {/* ===============================
            Pagination
        =============================== */}

                <div className="flex flex-col gap-3 border-t border-base-300 p-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-sm text-base-content/60">

                        Showing{" "}

                        <span className="font-medium text-base-content">

                            {filteredData.length === 0
                                ? 0
                                : startIndex + 1}

                        </span>{" "}

                        to{" "}

                        <span className="font-medium text-base-content">

                            {Math.min(
                                startIndex + itemsPerPage,
                                filteredData.length
                            )}

                        </span>{" "}

                        of{" "}

                        <span className="font-medium text-base-content">

                            {filteredData.length}

                        </span>{" "}

                        records

                    </p>

                    <div className="join">

                        {/* Previous */}

                        <button
                            type="button"
                            className="btn btn-sm join-item"
                            disabled={currentPage === 1 || loading}
                            onClick={() =>
                                handlePageChange(currentPage - 1)
                            }
                        >

                            <FiChevronLeft />

                        </button>

                        {/* Page Numbers */}

                        {Array.from(
                            { length: totalPages },
                            (_, index) => index + 1
                        ).map((page) => (

                            <button
                                type="button"
                                key={page}
                                onClick={() => handlePageChange(page)}
                                disabled={loading}
                                className={`btn btn-sm join-item ${currentPage === page
                                    ? "btn-primary"
                                    : ""
                                    }`}
                            >

                                {page}

                            </button>

                        ))}

                        {/* Next */}

                        <button
                            type="button"
                            className="btn btn-sm join-item"
                            disabled={
                                currentPage >= totalPages || loading
                            }
                            onClick={() =>
                                handlePageChange(currentPage + 1)
                            }
                        >

                            <FiChevronRight />

                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Attendance;