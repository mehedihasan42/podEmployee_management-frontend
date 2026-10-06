import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    FiSearch, FiUsers, FiBriefcase, FiFilter, FiMail, FiPhone,
    FiChevronLeft, FiChevronRight, FiUpload, FiRefreshCw, FiX,
} from "react-icons/fi";
import api from "../apis/api";
import { Link } from "react-router";
import { useForm } from "react-hook-form";

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const addEmployeeModalRef = useRef(null);

    /*-----add employee form-----*/
    // import.meta.env.VITE_IMGBB_API_KEY
    const {
        register,
        handleSubmit,
        watch,
        reset,
        setError,
        formState: { errors },
    } = useForm()

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

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const imageFile = data.profile_pic[0];

            const imageFormData = new FormData();
            imageFormData.append("image", imageFile);

            const imageResponse = await fetch(
                `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
                {
                    method: "POST",
                    body: imageFormData,
                }
            );

            const imageResult = await imageResponse.json();

            if (!imageResult.success) {
                throw new Error("Image upload failed");
            }

            // Get image URL from ImgBB
            const imageUrl = imageResult.data.url;

            console.log("ImgBB URL:", imageUrl);

            // Remove FileList because Django only needs the URL
            const employeeData = {
                ...data,
                profile_pic: imageUrl,
            };

            console.log("Employee data to send:", employeeData);

            const response = await api.post(
                "api/add/employees/",
                employeeData
            );

            console.log("Employee created:", response.status);

            if (response.status == 201) {
                console.log("ref value:", addEmployeeModalRef.current);
                console.log("is open:", addEmployeeModalRef.current?.open);
                reset();
                addEmployeeModalRef.current?.close();
                fetchEmployees()
            }

            // Clear the form after successful submission


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
        }
    }



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


    const handleUserRole = async (employeeId, role) => {
        console.log("Employee ID:", employeeId, "Role:", role);
        try {
            const response = await api.patch(`api/update/user_role/${employeeId}/`,
                { role }
            );
            console.log("User role updated:", response.status);
            if (response.status === 200) {
                setEmployees((prevEmployees) =>
                    prevEmployees.map((employee) =>
                        employee.employee_id === employeeId
                            ? { ...employee, role: role }
                            : employee
                    )
                );
            }
        } catch (error) {
            console.error("Error updating user role:", error);
        }
    }

    return (
        <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold md:text-3xl">Employees</h1>
                    <p className="mt-1 text-sm text-base-content/60">Manage your employee directory</p>
                </div>
                <div>
                    <button className="btn btn-info mr-2" onClick={() => addEmployeeModalRef.current?.showModal()}>Add Employee</button>
                    <button type="button" onClick={fetchEmployees} disabled={loading || importing} className="btn btn-outline gap-2">
                        <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>
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
                        <thead><tr>
                            <th>Employee</th><th>Department</th><th>Designation</th><th>Contact</th><th>Machine ID</th><th>Role</th>
                        </tr></thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="py-16 text-center"><span className="loading loading-spinner loading-lg" /> <p>Loading employees...</p></td></tr>
                            ) : pageEmployees.length ? pageEmployees.map((employee) => (
                                <tr key={employee.id ?? employee.employee_id} className="hover">
                                    <td><div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-content">{getInitials(employee.name)}</div>
                                        <div>
                                            <Link
                                                to={`/userInfo/${employee.employee_id}`}
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
                                    <td>
                                        <select value={employee.role} className="select" onChange={(e) => handleUserRole(employee.employee_id, e.target.value)}>
                                            <option value="User">User</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="py-16 text-center"><FiUsers size={40} className="mx-auto mb-3 opacity-30" /><p className="font-semibold">No employees found</p><p className="text-sm opacity-50">Try changing your search or filters.</p></td></tr>
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
            <dialog
                ref={addEmployeeModalRef}
                id="add_employee_modal"
                className="modal"
            >
                <div className="modal-box max-w-3xl">

                    <h3 className="font-bold text-2xl mb-6">
                        Add Employee
                    </h3>

                    <form onSubmit={handleSubmit(onSubmit)}>

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
                                    placeholder="01XXXXXXXXX"
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
                                    placeholder="1001"
                                    className="input input-bordered w-full"
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
                                placeholder="Employee address"
                                className="textarea textarea-bordered w-full"
                                rows={3}
                                {...register("address")}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/*Password */}
                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">
                                        Password
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    placeholder="Password"
                                    className="input input-bordered w-full"
                                    {...register("password", {
                                        required: "Password is required",
                                    })}
                                />

                                {errors.password && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">
                                        Confirm Password
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    placeholder="Confirm Password"
                                    className="input input-bordered w-full"
                                    {...register("confirmPassword", {
                                        required: "Confirm Password is required",
                                    })}
                                />

                                {errors.confirmPassword && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Profile Picture */}
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
                                {...register("profile_pic", {
                                    required: "Employee image is required",
                                })}
                            />
                            {errors.profile_pic && (
                                <p className="text-red-500 font-bold">{errors.profile_pic.message}</p>
                            )}
                            {/* <input
                                type="file"
                                className="file-input file-input-bordered w-full"
                                {...register("profile_pic")}
                            /> */}
                        </div>

                        {/* Buttons */}
                        <div className="modal-action">

                            <button
                                type="button"
                                className="btn"
                                onClick={() => addEmployeeModalRef.current?.close()}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Adding...
                                    </>
                                ) : (
                                    "Add Employee"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
}
