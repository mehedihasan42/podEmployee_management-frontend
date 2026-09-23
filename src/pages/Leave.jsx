import React, { useEffect, useMemo, useState } from "react";
import {
    FiSearch,
    FiPlus,
    FiCalendar,
    FiUsers,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiFilter,
    FiMoreVertical,
    FiEye,
    FiCheck,
    FiX,
    FiEdit,
    FiTrash2,
    FiChevronLeft,
    FiChevronRight,
} from "react-icons/fi";
import api from "../apis/api";

const Leave = () => {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState(null);

    console.log(leaveRequests)

    console.log(details)


    const updateLeaveStatus = async (leaveId, newStatus) => {
        try {
            await api.patch(
                `leave/update_status/${leaveId}/`,
                {
                    status: newStatus,
                }
            );

            // Update the UI immediately
            setLeaveRequests((prevRequests) =>
                prevRequests.map((item) =>
                    item.id === leaveId
                        ? { ...item, status: newStatus }
                        : item
                )
            );

        } catch (error) {
            console.error(
                "Failed to update leave status:",
                error.response?.data || error.message
            );
        }
    };


    useEffect(() => {
        const getLeaveRequests = async () => {
            try {
                const response = await api.get("leave/list/");

                setLeaveRequests(response.data);

                setLoading(false);
                return response.data;
            } catch (error) {
                console.error("Error fetching leave requests:", error);
                setLoading(false);
            }
        };
        getLeaveRequests()
    }, [])


    const getLeaveRequestById = async (leaveId) => {
        try {
            const response = await api.get(`leave/details/${leaveId}/`);

            setDetails(response.data);
        } catch (error) {
            console.error("Error fetching leave request:", error);
            throw error;
        }
    };

    const leaveTypes = [
        "All",
        ...new Set(leaveRequests.map((item) => item.leave_type)),
    ];

    const filteredRequests = useMemo(() => {
        return leaveRequests.filter((request) => {
            const searchValue = search.toLowerCase();

            const matchesSearch =
                request.name?.toLowerCase().includes(searchValue) ||
                request.employee_id?.toLowerCase().includes(searchValue) ||
                request.department?.toLowerCase().includes(searchValue);

            const matchesStatus =
                statusFilter === "All" ||
                request.status === statusFilter;

            const matchesLeaveType =
                leaveTypeFilter === "All" ||
                request.leave_type === leaveTypeFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesLeaveType
            );
        });
    }, [
        leaveRequests,
        search,
        statusFilter,
        leaveTypeFilter,
    ]);

    const totalRequests = leaveRequests.length;

    const pendingRequests = leaveRequests.filter(
        (item) => item.status === "Pending"
    ).length;

    const approvedRequests = leaveRequests.filter(
        (item) => item.status === "Approved"
    ).length;

    const rejectedRequests = leaveRequests.filter(
        (item) => item.status === "Rejected"
    ).length;

    const getInitials = (name) => {
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    const getStatusBadge = (status) => {
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

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <span className="loading loading-spinner loading-lg text-info" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8">

            {/* Page Header */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                    <h1 className="text-2xl font-bold md:text-3xl">
                        Leave Management
                    </h1>

                    <p className="mt-1 text-sm text-base-content/60">
                        Manage employee leave requests and approvals
                    </p>
                </div>
            </div>

            {/* Leave Requests */}
            <div className="card border border-base-300 bg-base-100 shadow-sm">

                {/* Filters */}
                <div className="border-b border-base-300 p-4 md:p-5">

                    <div className="mb-4 flex items-center gap-2">
                        <FiFilter size={18} />

                        <h2 className="font-semibold">
                            Leave Requests
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

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
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                className="grow"
                            />

                        </label>

                        {/* Leave Type */}
                        <select
                            className="select select-bordered w-full"
                            value={leaveTypeFilter}
                            onChange={(e) =>
                                setLeaveTypeFilter(e.target.value)
                            }
                        >
                            {leaveTypes.map((type) => (
                                <option
                                    key={type}
                                    value={type}
                                >
                                    {type === "All"
                                        ? "All Leave Types"
                                        : type}
                                </option>
                            ))}
                        </select>

                        {/* Status */}
                        <select
                            className="select select-bordered w-full"
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                        >
                            <option value="All">
                                All Status
                            </option>

                            <option value="Pending">
                                Pending
                            </option>

                            <option value="Approved">
                                Approved
                            </option>

                            <option value="Rejected">
                                Rejected
                            </option>
                        </select>

                    </div>
                </div>

                {/* Result Information */}
                <div className="flex flex-col gap-2 border-b border-base-300 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">

                    <div>
                        <p className="text-sm text-base-content/60">
                            Leave Requests
                        </p>

                        <p className="font-semibold">
                            Employee leave applications
                        </p>
                    </div>

                    <p className="text-sm text-base-content/60">
                        Showing{" "}
                        <span className="font-semibold text-base-content">
                            {filteredRequests.length}
                        </span>{" "}
                        requests
                    </p>

                </div>

                {/* Table */}
                <div className="overflow-x-auto">

                    <table className="table">

                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Leave Type</th>
                                <th>Leave Period</th>
                                <th>Days</th>
                                <th>Reason</th>
                                <th>Applied Date</th>
                                <th>Status</th>
                                <th className="text-center">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredRequests.length > 0 ? (

                                filteredRequests.map((request) => (

                                    <tr
                                        key={request.id}
                                        className="hover"
                                    >

                                        {/* Employee */}
                                        <td>

                                            <div className="flex items-center gap-3">

                                                <div className="avatar placeholder">
                                                    <div className="w-10 rounded-full bg-primary text-primary-content">
                                                        <span className="text-sm font-semibold">
                                                            {getInitials(
                                                                request.name
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="font-semibold">
                                                        {
                                                            request.name
                                                        }
                                                    </p>

                                                    <p className="text-xs text-base-content/50">
                                                        {
                                                            request.employee_id
                                                        }{" "}
                                                        •{" "}
                                                        {
                                                            request.department
                                                        }
                                                    </p>
                                                </div>

                                            </div>

                                        </td>

                                        {/* Leave Type */}
                                        <td>

                                            <span className="badge badge-ghost">
                                                {
                                                    request.leave_type
                                                }
                                            </span>

                                        </td>

                                        {/* Leave Period */}
                                        <td>

                                            <div className="flex items-center gap-2">

                                                <FiCalendar
                                                    size={15}
                                                    className="text-base-content/50"
                                                />

                                                <div>
                                                    <p className="text-sm">
                                                        {
                                                            request.start_date
                                                        }
                                                    </p>

                                                    <p className="text-xs text-base-content/50">
                                                        to{" "}
                                                        {
                                                            request.end_date
                                                        }
                                                    </p>
                                                </div>

                                            </div>

                                        </td>

                                        {/* Days */}
                                        <td>

                                            <span className="font-semibold">
                                                {request.leave_days}
                                            </span>

                                            <span className="ml-1 text-xs text-base-content/50">
                                                {request.leave_days === 1
                                                    ? "day"
                                                    : "days"}
                                            </span>

                                        </td>

                                        {/* Reason */}
                                        <td>

                                            <div
                                                className="max-w-[180px] truncate text-sm"
                                                title={request.reason}
                                            >
                                                {request.reason}
                                            </div>

                                        </td>

                                        {/* Applied Date */}
                                        <td>

                                            <span className="text-sm">
                                                {
                                                    request.application_date
                                                }
                                            </span>

                                        </td>

                                        {/* Status */}
                                        <td>
                                            {getStatusBadge(
                                                request.status
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td>

                                            <div className="dropdown dropdown-end">

                                                <button
                                                    tabIndex={0}
                                                    className="btn btn-ghost btn-sm btn-square"
                                                >
                                                    <FiMoreVertical size={18} />
                                                </button>

                                                <ul
                                                    tabIndex={0}
                                                    className="dropdown-content menu z-[1] w-44 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
                                                >

                                                    {/* View Details */}
                                                    <button className="btn"
                                                        onClick={() => {
                                                            getLeaveRequestById(request.id);
                                                            document.getElementById("my_modal_1").showModal();
                                                        }}
                                                    >View Details</button>

                                                    {/* Approve / Reject */}
                                                    {request.status === "Pending" && (
                                                        <>
                                                            <li>
                                                                <button
                                                                    className="text-success"
                                                                    onClick={() =>
                                                                        updateLeaveStatus(
                                                                            request.id,
                                                                            "Approved"
                                                                        )
                                                                    }
                                                                >
                                                                    <FiCheck size={16} />
                                                                    Approve
                                                                </button>
                                                            </li>

                                                            <li>
                                                                <button
                                                                    className="text-error"
                                                                    onClick={() =>
                                                                        updateLeaveStatus(
                                                                            request.id,
                                                                            "Rejected"
                                                                        )
                                                                    }
                                                                >
                                                                    <FiX size={16} />
                                                                    Reject
                                                                </button>
                                                            </li>
                                                        </>
                                                    )}
                                                </ul>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>
                                    <td
                                        colSpan="8"
                                        className="py-16 text-center"
                                    >

                                        <div className="flex flex-col items-center justify-center">

                                            <FiCalendar
                                                size={42}
                                                className="mb-3 text-base-content/30"
                                            />

                                            <p className="font-semibold">
                                                No leave requests found
                                            </p>

                                            <p className="mt-1 text-sm text-base-content/50">
                                                Try changing your search or
                                                filters.
                                            </p>

                                        </div>

                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

                {/* Pagination */}
                <div className="flex flex-col gap-3 border-t border-base-300 p-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-sm text-base-content/60">
                        Showing{" "}
                        <span className="font-medium text-base-content">
                            1
                        </span>{" "}
                        to{" "}
                        <span className="font-medium text-base-content">
                            {filteredRequests.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-base-content">
                            {filteredRequests.length}
                        </span>{" "}
                        requests
                    </p>

                    <div className="join">

                        <button className="btn btn-sm join-item">
                            <FiChevronLeft />
                        </button>

                        <button className="btn btn-primary btn-sm join-item">
                            1
                        </button>

                        <button className="btn btn-sm join-item">
                            <FiChevronRight />
                        </button>

                    </div>

                </div>

            </div>
            <dialog id="my_modal_1" className="modal">
                <div className="modal-box max-w-3xl p-0">

                    {/* Header */}
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <div>
                            <h3 className="text-xl font-bold">
                                Leave Request Details
                            </h3>
                            <p className="text-sm text-base-content/60">
                                Application #{details?.id}
                            </p>
                        </div>

                        <div>
                            <span
                                className={`badge ${details?.status === "Pending"
                                    ? "badge-warning"
                                    : details?.status === "Approved"
                                        ? "badge-success"
                                        : "badge-error"
                                    }`}
                            >
                                {details?.status}
                            </span>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">

                        {/* Employee Information */}
                        <div>
                            <h4 className="font-semibold text-base mb-3">
                                Employee Information
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div className="bg-base-200 rounded-lg p-3">
                                    <p className="text-xs text-base-content/60">
                                        Employee Name
                                    </p>
                                    <p className="font-semibold">
                                        {details?.name || "N/A"}
                                    </p>
                                </div>

                                <div className="bg-base-200 rounded-lg p-3">
                                    <p className="text-xs text-base-content/60">
                                        Employee ID
                                    </p>
                                    <p className="font-semibold">
                                        {details?.employee_id || "N/A"}
                                    </p>
                                </div>

                                <div className="bg-base-200 rounded-lg p-3">
                                    <p className="text-xs text-base-content/60">
                                        Department
                                    </p>
                                    <p className="font-semibold">
                                        {details?.department || "N/A"}
                                    </p>
                                </div>

                                <div className="bg-base-200 rounded-lg p-3">
                                    <p className="text-xs text-base-content/60">
                                        Designation
                                    </p>
                                    <p className="font-semibold">
                                        {details?.designation || "N/A"}
                                    </p>
                                </div>

                            </div>
                        </div>


                        {/* Leave Information */}
                        <div>
                            <h4 className="font-semibold text-base mb-3">
                                Leave Information
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                <div className="bg-base-200 rounded-lg p-3">
                                    <p className="text-xs text-base-content/60">
                                        Leave Type
                                    </p>
                                    <p className="font-semibold">
                                        {details?.leave_type || "N/A"}
                                    </p>
                                </div>

                                <div className="bg-base-200 rounded-lg p-3">
                                    <p className="text-xs text-base-content/60">
                                        Start Date
                                    </p>
                                    <p className="font-semibold">
                                        {details?.start_date || "N/A"}
                                    </p>
                                </div>

                                <div className="bg-base-200 rounded-lg p-3">
                                    <p className="text-xs text-base-content/60">
                                        End Date
                                    </p>
                                    <p className="font-semibold">
                                        {details?.end_date || "N/A"}
                                    </p>
                                </div>

                                <div className="bg-base-200 rounded-lg p-3">
                                    <p className="text-xs text-base-content/60">
                                        Total Leave Days
                                    </p>
                                    <p className="font-semibold">
                                        {details?.leave_days || 0} Days
                                    </p>
                                </div>

                                <div className="bg-base-200 rounded-lg p-3">
                                    <p className="text-xs text-base-content/60">
                                        Application Date
                                    </p>
                                    <p className="font-semibold">
                                        {details?.application_date || "N/A"}
                                    </p>
                                </div>

                            </div>
                        </div>


                        {/* Substitute Information */}
                        <div>
                            <h4 className="font-semibold text-base mb-3">
                                Substitute Information
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div className="bg-base-200 rounded-lg p-3">
                                    <p className="text-xs text-base-content/60">
                                        Substitute Name
                                    </p>
                                    <p className="font-semibold">
                                        {details?.substitute_name || "N/A"}
                                    </p>
                                </div>

                                <div className="bg-base-200 rounded-lg p-3">
                                    <p className="text-xs text-base-content/60">
                                        Substitute ID
                                    </p>
                                    <p className="font-semibold">
                                        {details?.substitute_id || "N/A"}
                                    </p>
                                </div>

                            </div>
                        </div>


                        {/* Reason */}
                        <div>
                            <h4 className="font-semibold text-base mb-3">
                                Reason
                            </h4>

                            <div className="bg-base-200 rounded-lg p-4">
                                <p className="text-sm">
                                    {details?.reason || "No reason provided."}
                                </p>
                            </div>
                        </div>


                        {/* Address */}
                        <div>
                            <h4 className="font-semibold text-base mb-3">
                                Address During Leave
                            </h4>

                            <div className="bg-base-200 rounded-lg p-4">
                                <p className="text-sm">
                                    {details?.address_during_leave || "N/A"}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="modal-action border-t px-6 py-4 mt-0">

                        <form method="dialog">
                            <button className="btn">
                                Close
                            </button>
                        </form>

                    </div>

                </div>
            </dialog>
        </div>
    );
};

export default Leave;