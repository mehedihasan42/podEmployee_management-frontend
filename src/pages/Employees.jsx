import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    FiSearch, FiUsers, FiBriefcase, FiFilter, FiMail, FiPhone,
    FiChevronLeft, FiChevronRight, FiUpload, FiRefreshCw, FiX,
} from "react-icons/fi";
import api from "../apis/api";
import { Link } from "react-router";

const PAGE_SIZE = 10;

const getErrorMessage = (error) =>
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.message ||
    "Something went wrong. Please try again.";

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("All");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [importError, setImportError] = useState("");
    const fileInputRef = useRef(null);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        setListError("");
        try {
            const response = await api.get("api/employees/");
            if (response.data?.success === false || !Array.isArray(response.data?.data)) {
                throw new Error(response.data?.message || "Unexpected employee response.");
            }
            setEmployees(response.data.data);
        } catch (error) {
            setListError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const departments = useMemo(() => [
        "All",
        ...new Set(employees.map((employee) => employee.department).filter(Boolean)),
    ], [employees]);

    const filteredEmployees = useMemo(() => {
        const term = search.trim().toLowerCase();
        return employees.filter((employee) => {
            const searchable = [
                employee.employee_id, employee.name, employee.email,
                employee.phone, employee.department, employee.designation,
                employee.machine_user_id,
            ].map((value) => String(value ?? "").toLowerCase());
            return searchable.some((value) => value.includes(term)) &&
                (departmentFilter === "All" || employee.department === departmentFilter);
        });
    }, [employees, search, departmentFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageEmployees = filteredEmployees.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const changeSearch = (value) => { setSearch(value); setPage(1); };
    const changeDepartment = (value) => { setDepartmentFilter(value); setPage(1); };

    const handleImport = async (event) => {
        event.preventDefault();
        if (!selectedFile || importing) return;
        setImporting(true);
        setImportError("");
        setImportResult(null);

        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await api.post(
            "api/employees/import/",
            formData,
            {
                headers: {
                    "Content-Type": undefined,
                },
            }
        );

        console.log("Import result:", response.data);
    };

    const getInitials = (name = "") =>
        name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
            .map((word) => word[0]).join("").toUpperCase() || "?";

    return (
        <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold md:text-3xl">Employees</h1>
                    <p className="mt-1 text-sm text-base-content/60">Manage your employee directory</p>
                </div>
                <button type="button" onClick={fetchEmployees} disabled={loading || importing} className="btn btn-outline gap-2">
                    <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="card border border-base-300 bg-base-100 shadow-sm">
                    <div className="card-body flex-row items-center justify-between p-5">
                        <div><p className="text-sm opacity-60">Total Employees</p><h2 className="mt-1 text-2xl font-bold">{employees.length}</h2></div>
                        <div className="rounded-xl bg-primary/10 p-3 text-primary"><FiUsers size={24} /></div>
                    </div>
                </div>
                <div className="card border border-base-300 bg-base-100 shadow-sm">
                    <div className="card-body flex-row items-center justify-between p-5">
                        <div><p className="text-sm opacity-60">Departments</p><h2 className="mt-1 text-2xl font-bold">{departments.length - 1}</h2></div>
                        <div className="rounded-xl bg-secondary/10 p-3 text-secondary"><FiBriefcase size={24} /></div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleImport} className="card mb-6 border border-base-300 bg-base-100 shadow-sm">
                <div className="card-body p-4 md:p-5">
                    <h2 className="card-title text-lg"><FiUpload /> Import Employees</h2>
                    <p className="text-sm opacity-60">Upload an Excel file containing employee_id, name, department and designation. Optional: email, phone and machine_user_id.</p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            className="file-input file-input-bordered w-full max-w-xl"
                            onChange={(event) => {
                                setSelectedFile(event.target.files?.[0] || null);
                                setImportError("");
                                setImportResult(null);
                            }}
                            disabled={importing}
                        />
                        <button type="submit" disabled={!selectedFile || importing} className="btn btn-primary">
                            {importing ? <span className="loading loading-spinner loading-sm" /> : <FiUpload />}
                            {importing ? "Importing..." : "Import Excel"}
                        </button>
                    </div>
                    {importError && <div role="alert" className="alert alert-error"><span>{importError}</span><button type="button" onClick={() => setImportError("")} aria-label="Dismiss error"><FiX /></button></div>}
                    {importResult?.success && (
                        <div role="status" className="alert alert-success">
                            <span>{importResult.message || "Import completed"}. Imported: {importResult.importedCount ?? 0}; Failed: {importResult.failedCount ?? 0}.</span>
                        </div>
                    )}
                    {importResult?.missingColumns?.length > 0 && (
                        <p className="text-sm text-error">Missing columns: {importResult.missingColumns.join(", ")}</p>
                    )}
                    {importResult?.errors?.length > 0 && (
                        <div className="max-h-48 overflow-y-auto rounded-lg border border-warning/40 p-3 text-sm">
                            <p className="mb-2 font-semibold">Import issues ({importResult.errors.length})</p>
                            <ul className="list-inside list-disc space-y-1">
                                {importResult.errors.map((issue, index) => (
                                    <li key={index}>
                                        {issue.row != null ? `Row ${issue.row}: ` : ""}
                                        {issue.employee_id ? `${issue.employee_id}: ` : ""}
                                        {issue.message || "Invalid employee"}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </form>

            <div className="card border border-base-300 bg-base-100 shadow-sm">
                <div className="border-b border-base-300 p-4 md:p-5">
                    <h2 className="mb-4 flex items-center gap-2 font-semibold"><FiFilter /> Employee List</h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <label className="input input-bordered flex items-center gap-2">
                            <FiSearch className="opacity-50" />
                            <input type="text" value={search} onChange={(event) => changeSearch(event.target.value)} placeholder="Search employees..." className="grow" />
                        </label>
                        <select value={departmentFilter} onChange={(event) => changeDepartment(event.target.value)} className="select select-bordered w-full">
                            {departments.map((department) => <option key={department} value={department}>{department === "All" ? "All Departments" : department}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex flex-wrap justify-between gap-2 border-b border-base-300 px-4 py-4 md:px-5">
                    <div><p className="text-sm opacity-60">Employee Directory</p><p className="font-semibold">All registered employees</p></div>
                    <p className="text-sm opacity-60">Showing {filteredEmployees.length} employees</p>
                </div>
                {listError && <div role="alert" className="alert alert-error m-4 w-auto"><span>{listError}</span><button type="button" onClick={fetchEmployees} className="btn btn-sm">Retry</button></div>}
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead><tr><th>Employee</th><th>Department</th><th>Designation</th><th>Contact</th><th>Machine User ID</th></tr></thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="py-16 text-center"><span className="loading loading-spinner loading-lg" /> <p>Loading employees...</p></td></tr>
                            ) : pageEmployees.length ? pageEmployees.map((employee) => (
                                <tr key={employee.id ?? employee.employee_id} className="hover">
                                    <td><div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-content">{getInitials(employee.name)}</div>
                                        <div>
                                            <Link
                                                to={`/profile/${employee.employee_id}`}
                                                className="font-semibold hover:underline"
                                            >
                                                {employee.name}
                                            </Link>

                                            <p className="text-xs opacity-50">
                                                {employee.employee_id}
                                            </p>
                                        </div>
                                    </div></td>
                                    <td><span className="badge badge-ghost">{employee.department || "—"}</span></td>
                                    <td><span className="flex items-center gap-2"><FiBriefcase className="opacity-50" />{employee.designation || "—"}</span></td>
                                    <td><div className="space-y-1 text-xs">
                                        <p className="flex items-center gap-2"><FiMail className="opacity-50" />{employee.email || "—"}</p>
                                        <p className="flex items-center gap-2"><FiPhone className="opacity-50" />{employee.phone || "—"}</p>
                                    </div></td>
                                    <td>{employee.machine_user_id || "—"}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="py-16 text-center"><FiUsers size={40} className="mx-auto mb-3 opacity-30" /><p className="font-semibold">No employees found</p><p className="text-sm opacity-50">Try changing your search or filters.</p></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 p-4">
                    <p className="text-sm opacity-60">
                        Showing {filteredEmployees.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0} to {Math.min(currentPage * PAGE_SIZE, filteredEmployees.length)} of {filteredEmployees.length} employees
                    </p>
                    <div className="join">
                        <button type="button" aria-label="Previous page" className="btn btn-sm join-item" disabled={currentPage <= 1 || loading} onClick={() => setPage(currentPage - 1)}><FiChevronLeft /></button>
                        <span className="btn btn-sm btn-primary join-item pointer-events-none">{currentPage} / {totalPages}</span>
                        <button type="button" aria-label="Next page" className="btn btn-sm join-item" disabled={currentPage >= totalPages || loading} onClick={() => setPage(currentPage + 1)}><FiChevronRight /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}
