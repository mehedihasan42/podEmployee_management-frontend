
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";

import { Link } from "react-router";

import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiUserX,
} from "react-icons/fi";

import api from "../apis/api";

// =====================================
// 1. API ENDPOINTS
// =====================================

const EMPLOYEES_API = "api/employees/";
const TODAY_API = "api/attendance/today/";
const IMPORT_API = "api/attendance/import/";

// =====================================
// 2. API RESPONSE HELPER
// =====================================

const getRows = (payload) => {
  const data = payload?.data ?? payload;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

// =====================================
// 3. NORMALIZE ATTENDANCE STATUS
// =====================================

const normalizeStatus = (value) => {
  const status = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  switch (status) {
    case "present":
      return "Present";

    case "on_time":
    case "ontime":
      return "On Time";

    case "late":
      return "Late";

    case "absent":
      return "Absent";

    default:
      return "Unknown";
  }
};

// =====================================
// 4. DATE & TIME HELPERS
// =====================================

const getLocalDate = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatTime = (value) => {
  if (!value || value === "--") {
    return "--";
  }

  const text = String(value);

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(text)) {
    const [hours, minutes] = text
      .split(":")
      .map(Number);

    const period = hours >= 12 ? "PM" : "AM";

    const formattedHours = hours % 12 || 12;

    return `${formattedHours}:${String(
      minutes
    ).padStart(2, "0")} ${period}`;
  }

  return text;
};

// =====================================
// 5. EMPLOYEE INITIALS
// =====================================

const getInitials = (name = "") => {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

// =====================================
// 6. STATUS BADGE
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
          <FiClock size={14} />
          Late
        </span>
      );

    case "Absent":
      return (
        <span className="badge badge-error gap-1 text-white">
          <FiUserX size={14} />
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
// 7. DASHBOARD COMPONENT
// =====================================

const Dashboard = () => {
  const fileInputRef = useRef(null);

  // =====================================
  // STATE
  // =====================================

  const [employees, setEmployees] = useState([]);

  const [todayAttendance, setTodayAttendance] =
    useState([]);

  const [loading, setLoading] = useState(true);

  const [importing, setImporting] = useState(false);

  const [employeesLoaded, setEmployeesLoaded] =
    useState(false);

  const [attendanceLoaded, setAttendanceLoaded] =
    useState(false);

  const [attendanceDate, setAttendanceDate] =
    useState("");

  const [error, setError] = useState("");

  // =====================================
  // TODAY'S DATE
  // =====================================

  const today = getLocalDate();

  const formattedDate = new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  // =====================================
  // 8. FETCH DASHBOARD DATA
  // =====================================

  const fetchDashboardData = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        setError("");

        const results = await Promise.allSettled([
          api.get(EMPLOYEES_API),
          api.get(TODAY_API),
        ]);

        const [
          employeeResult,
          attendanceResult,
        ] = results;

        // Employee API

        if (employeeResult.status === "fulfilled") {
          setEmployees(
            getRows(employeeResult.value.data)
          );

          setEmployeesLoaded(true);
        } else {
          console.error(
            "Employee API error:",
            employeeResult.reason
          );

          setEmployeesLoaded(false);
          setEmployees([]);
        }

        // Today's Attendance API

        if (attendanceResult.status === "fulfilled") {
          const records = getRows(
            attendanceResult.value.data
          );

          const normalizedRecords = records.map(
            (item) => ({
              ...item,

              attendanceStatus: normalizeStatus(
                item.attendanceStatus
              ),
            })
          );

          setTodayAttendance(normalizedRecords);

          setAttendanceLoaded(true);
        } else {
          console.error(
            "Attendance API error:",
            attendanceResult.reason
          );

          setTodayAttendance([]);

          setAttendanceLoaded(false);
        }

        if (
          employeeResult.status === "rejected" ||
          attendanceResult.status === "rejected"
        ) {
          setError(
            "Some dashboard data could not be loaded. Please check your API."
          );
        }
      } catch (err) {
        console.error(
          "Dashboard error:",
          err
        );

        setError(
          err.message ||
          "Failed to fetch dashboard data"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // =====================================
  // 9. LOAD DATA ON MOUNT
  // =====================================

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // =====================================
  // 10. UNIQUE ATTENDANCE RECORDS
  // =====================================

  const uniqueAttendance = useMemo(() => {
    const attendanceMap = new Map();

    todayAttendance.forEach((record) => {
      const employeeId =
        record.employee_id ??
        record.employee?.employee_id;

      if (employeeId !== null &&
        employeeId !== undefined &&
        employeeId !== "") {

        attendanceMap.set(
          String(employeeId),
          record
        );
      }
    });

    return Array.from(attendanceMap.values());
  }, [todayAttendance]);

  // =====================================
  // 11. ATTENDANCE SUMMARY
  // =====================================

  const totalEmployees = employees.length;

  // const presentCount = uniqueAttendance.filter(
  //   (item) =>
  //     item.attendanceStatus === "Present"
  // ).length;

  // console.log(presentCount)

  const onTimeCount = uniqueAttendance.filter(
    (item) =>
      item.attendanceStatus === "On Time"
  ).length;

  const lateCount = uniqueAttendance.filter(
    (item) =>
      item.attendanceStatus === "Late"
  ).length;

  const presentCount = onTimeCount + lateCount

  const explicitAbsentCount = uniqueAttendance.filter(
    (item) =>
      item.attendanceStatus === "Absent"
  ).length;

  // Present, On Time and Late are attended statuses.

  // const attendedCount = presentCount

  // Count employees without an attendance record
  // as absent, matching the existing dashboard logic.

  const absentCount = useMemo(() => {
    if (!employeesLoaded || !attendanceLoaded) {
      return 0;
    }

    const attendanceMap = new Map();

    uniqueAttendance.forEach((record) => {
      attendanceMap.set(
        String(record.employee_id),
        record
      );
    });

    return employees.filter((employee) => {
      const record = attendanceMap.get(
        String(employee.employee_id)
      );

      return (
        !record ||
        record.attendanceStatus === "Absent"
      );
    }).length;
  }, [
    employees,
    uniqueAttendance,
    employeesLoaded,
    attendanceLoaded,
  ]);

  const attendancePercentage =
    totalEmployees > 0
      ? Math.round(
        (presentCount / totalEmployees) * 100
      )
      : 0;

  // =====================================
  // 12. IMPORT EXCEL FILE
  // =====================================

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!attendanceDate) {
      alert(
        "Please select attendance date first."
      );

      event.target.value = "";

      return;
    }

    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (![".xlsx", ".xls"].includes(extension)) {
      alert(
        "Please select an Excel file (.xlsx or .xls)"
      );

      event.target.value = "";

      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    formData.append(
      "attendanceDate",
      attendanceDate
    );

    try {
      setImporting(true);

      // const response = await api.post(
      //   IMPORT_API,
      //   formData
      // );

      const response = await api.post(
        "api/attendance/import/",
        formData,
        {
          headers: {
            "Content-Type": undefined,
          },
        }
      );

      console.log("Attendance import response:", response);

      const data = response.data;

      alert(
        `Attendance import completed!\n\n` +
        `Imported: ${data.importedCount ?? 0}\n` +
        `Failed: ${data.failedCount ?? 0}`
      );

      // Refresh dashboard after importing

      await fetchDashboardData(false);
    } catch (err) {
      console.error(
        "Attendance import error:",
        err
      );

      alert(
        err.response?.data?.message ||
        err.message ||
        "Failed to import attendance"
      );
    } finally {
      setImporting(false);

      event.target.value = "";
    }
  };

  // =====================================
  // 13. STATISTICS CARDS
  // =====================================

  const stats = [
    {
      title: "Total Employees",
      value: employeesLoaded
        ? totalEmployees
        : "—",

      description: "Registered employees",

      icon: FiUsers,

      iconBg: "bg-primary/10",

      iconColor: "text-primary",
    },

    {
      title: "Present",
      value: attendanceLoaded
        ? presentCount
        : "—",

      description: "Marked present",

      icon: FiCheckCircle,

      iconBg: "bg-success/10",

      iconColor: "text-success",
    },

    {
      title: "On Time",
      value: attendanceLoaded
        ? onTimeCount
        : "—",

      description: "Checked in on time",

      icon: FiCheckCircle,

      iconBg: "bg-emerald-500/10",

      iconColor: "text-emerald-600",
    },

    {
      title: "Late",
      value: attendanceLoaded
        ? lateCount
        : "—",

      description: "Late check-ins",

      icon: FiClock,

      iconBg: "bg-warning/10",

      iconColor: "text-warning",
    },

    {
      title: "Absent",
      value:
        employeesLoaded && attendanceLoaded
          ? absentCount
          : "—",

      description: "Not checked in",

      icon: FiUserX,

      iconBg: "bg-error/10",

      iconColor: "text-error",
    },
  ];

  // =====================================
  // 14. DEPARTMENT HEADCOUNT
  // =====================================

  const departmentHeadcount = useMemo(() => {
    const groups = {};

    employees.forEach((employee) => {
      const department =
        employee.department || "Unassigned";

      groups[department] =
        (groups[department] || 0) + 1;
    });

    return Object.entries(groups);
  }, [employees]);

  // =====================================
  // 15. LOADING SCREEN
  // =====================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-info" />
      </div>
    );
  }

  // =====================================
  // 16. DASHBOARD UI
  // =====================================

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 lg:px-10">
      <div className="mx-auto max-w-[1400px]">

        {/* ===============================
            HEADER
        =============================== */}

        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <h1 className="font-serif text-3xl font-semibold text-slate-800 md:text-4xl">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {formattedDate}
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">

            {/* Attendance Date */}

            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Attendance Date
                </span>
              </label>

              <input
                type="date"
                value={attendanceDate}
                onChange={(e) =>
                  setAttendanceDate(e.target.value)
                }
                className="input input-bordered"
              />
            </div>

            {/* Hidden File Input */}

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Import Button */}

            <button
              type="button"
              onClick={handleImportClick}
              disabled={importing}
              className="btn btn-info"
            >
              {importing ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Importing...
                </>
              ) : (
                "Import File"
              )}
            </button>

          </div>
        </div>

        {/* ===============================
            API ERROR
        =============================== */}

        {error && (
          <div
            role="alert"
            className="alert alert-warning mb-5"
          >
            <span>{error}</span>

            <button
              type="button"
              className="btn btn-sm"
              onClick={() => fetchDashboardData()}
            >
              Retry
            </button>
          </div>
        )}

        {/* ===============================
            STATISTICS CARDS
        =============================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="card border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md"
              >

                <div className="card-body p-5">

                  <div className="flex items-center justify-between gap-3">

                    <div>
                      <p className="text-sm text-base-content/60">
                        {stat.title}
                      </p>

                      <h2 className="mt-1 text-2xl font-bold">
                        {stat.value}
                      </h2>

                      <p className="mt-1 text-xs text-base-content/50">
                        {stat.description}
                      </p>
                    </div>

                    <div
                      className={`rounded-xl p-3 ${stat.iconBg} ${stat.iconColor}`}
                    >
                      <Icon size={24} />
                    </div>

                  </div>
                </div>
              </div>
            );
          })}

        </div>

        {/* ===============================
            ATTENDANCE PERCENTAGE
        =============================== */}

        <div className="mb-6 rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">

          <div className="mb-3 flex items-center justify-between gap-3">

            <div>
              <h2 className="text-lg font-semibold">
                Today's Attendance
              </h2>

              <p className="text-xs text-base-content/50">
                Present, on-time and late employees
              </p>
            </div>

            <span className="text-2xl font-bold text-success">
              {employeesLoaded && attendanceLoaded
                ? `${attendancePercentage}%`
                : "—"}
            </span>

          </div>

          <progress
            className="progress progress-success w-full"
            value={
              employeesLoaded && attendanceLoaded
                ? attendancePercentage
                : 0
            }
            max="100"
          />

          <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-base-content/60">

            <span>
              {attendanceLoaded
                ? presentCount
                : "—"}{" "}
              employees attended
            </span>

            <span>
              {employeesLoaded
                ? totalEmployees
                : "—"}{" "}
              total employees
            </span>

          </div>
        </div>

        {/* ===============================
            MAIN CONTENT
        =============================== */}

        <div className="mt-7 grid grid-cols-1 gap-5">

          {/* ===========================
              ATTENDANCE LEDGER
          =========================== */}

          <div className="min-w-0 border border-slate-200 bg-white">

            {/* Ledger Header */}

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-5">

              <h2 className="font-serif text-xl font-semibold text-slate-800">
                Today's attendance ledger
              </h2>

              <Link
                to="/attendance"
                className="group flex items-center gap-1 text-sm font-medium text-yellow-700 hover:text-yellow-800"
              >
                View full log

                <FiArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

            </div>

            {/* ===========================
                ATTENDANCE TABLE
            =========================== */}

            <div className="overflow-x-auto">

              <table className="table w-full">

                <thead>
                  <tr className="border-b border-slate-200 text-left">

                    <th>Employee</th>

                    <th>ID</th>

                    <th>Department</th>

                    <th>Check-in</th>

                    <th>Check-out</th>

                    <th>Working Hours</th>

                    <th>Status</th>

                  </tr>
                </thead>

                <tbody>

                  {!attendanceLoaded ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-10 text-center text-sm text-slate-500"
                      >
                        Attendance data unavailable.
                      </td>
                    </tr>
                  ) : uniqueAttendance.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-10 text-center text-sm text-slate-500"
                      >
                        No attendance data found for today.
                      </td>
                    </tr>
                  ) : (
                    uniqueAttendance.map(
                      (employee, index) => {

                        const status =
                          employee.attendanceStatus;

                        return (
                          <tr
                            key={
                              employee.id ??
                              employee.employee_id ??
                              index
                            }
                            className="hover:bg-slate-50"
                          >

                            {/* Employee Name */}

                            <td>
                              <div className="flex items-center gap-3">

                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                                  {getInitials(
                                    employee.name
                                  ) || "?"}
                                </div>

                                <span className="whitespace-nowrap text-sm font-medium text-slate-700">
                                  {employee.name ||
                                    "Unknown Employee"}
                                </span>

                              </div>
                            </td>

                            {/* Employee ID */}

                            <td className="font-mono text-xs">
                              {employee.employee_id ||
                                "—"}
                            </td>

                            {/* Department */}

                            <td>
                              {employee.department ||
                                "—"}
                            </td>

                            {/* Check In */}

                            <td className="font-mono text-sm">
                              {formatTime(
                                employee.entryTime
                              )}
                            </td>

                            {/* Check Out */}

                            <td className="font-mono text-sm">
                              {formatTime(
                                employee.exitTime
                              )}
                            </td>

                            {/* Working Hours */}

                            <td className="font-mono text-sm">
                              {employee.workingHours ??
                                "—"}
                            </td>

                            {/* Attendance Status */}

                            <td>
                              {getStatusBadge(status)}
                            </td>

                          </tr>
                        );
                      }
                    )
                  )}

                </tbody>
              </table>
            </div>
          </div>

          {/* ===========================
              HEADCOUNT BY TEAM
          =========================== */}


        </div>

        {/* ===============================
            FOOTER
        =============================== */}

        <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">

          <FiClock size={14} />

          Attendance data is updated from the biometric machine.

        </div>

      </div>
    </div>
  );
};

export default Dashboard;