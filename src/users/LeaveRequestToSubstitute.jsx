import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../providers/AuthProvider";
import api from "../apis/api";

const LeaveRequestToSubstitute = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const { user } = useContext(AuthContext);

    const employeeId = user.employee_id;

    const getLeaveRequests = async () => {
        try {
            const response = await api.get(
                `leave/substitute/${employeeId}/`
            );
            
            setLeaveRequests(response.data.data);
        } catch (error) {
            console.error("Error fetching leave requests:", error);
        }
    };

    useEffect(() => {
        getLeaveRequests();
    }, [employeeId]);

     const updateSubstituteChoice = async (leaveId, substitute_choice) => {
        console.log(`Updating leave ID ${leaveId} with choice: ${substitute_choice}`);
        try {
            await api.patch(
                `leave/update_status/${leaveId}/`,
                {
                    substitute_choice: substitute_choice,
                }
            );

            // Update the UI immediately
            setLeaveRequests((prevRequests) =>
                prevRequests.map((item) =>
                    item.id === leaveId
                        ? { ...item, substitute_choice: substitute_choice }
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


    return (
        <div className="overflow-x-auto bg-base-100 shadow-xl rounded-box p-4">
            <table className="table table-zebra w-full">
                {/* head */}
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Designation / Dept</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Duration</th>
                        <th className="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {leaveRequests.map((leave, index) => (
                        <tr key={leave.id || leave.employee_id || index} className="hover">
                            {/* Employee Info */}
                            <td>
                                <div className="font-bold">{leave.name}</div>
                                <div className="text-sm opacity-50">ID: {leave.employee_id}</div>
                            </td>

                            {/* Designation & Department */}
                            <td>
                                <div>{leave.designation}</div>
                                <span className="badge badge-ghost badge-sm">{leave.department}</span>
                            </td>

                            {/* Dates */}
                            <td className="text-sm">{leave.start_date}</td>
                            <td className="text-sm">{leave.end_date}</td>

                            {/* Leave Days */}
                            <td>
                                <span className="badge badge-primary badge-outline font-semibold">
                                    {leave.leave_days} {leave.leave_days === 1 ? 'day' : 'days'}
                                </span>
                            </td>

                            {/* Actions (Optional - Approve/Reject buttons) */}
                            <td className="text-right space-x-2">
                                {leave.substitute_choice ? leave.substitute_choice :
                                    <>
                                        <button className="btn btn-xs btn-success text-white" onClick={() => updateSubstituteChoice(leave.id, 'Accept')}>Accept</button>
                                        <button className="btn btn-xs btn-error text-white" onClick={() => updateSubstituteChoice(leave.id, 'Reject')}>Reject</button>
                                    </>
                                }

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LeaveRequestToSubstitute;