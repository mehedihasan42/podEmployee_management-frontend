import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../providers/AuthProvider';
import { Link } from 'react-router';
import { FiAlertCircle, FiArrowRight, FiCalendar, FiClock } from 'react-icons/fi';
import api from '../apis/api';

const Attendance = () => {

    const { user } = useContext(AuthContext);
    const employeeId = user?.employee_id;
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(false);


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

    return (
        <div className="card mb-6 border border-base-300 bg-base-100 shadow-sm w-full">

            <div className="flex flex-wrap items-center justify-between border-b border-base-300 p-5">

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
    );
};

export default Attendance;