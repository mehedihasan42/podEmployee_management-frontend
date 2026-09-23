import api from "./api";


const getEmployeeAttendance = async (employeeId) => {
  try {
    const response = await api.get(
      `attendance/employee/${encodeURIComponent(employeeId)}/`
    );

    console.log("Employee attendance:", response.data.data);

    return response.data.data;
  } catch (error) {
    console.error(
      "Get employee attendance error:",
      error.response?.data || error.message
    );

    return [];
  }
};