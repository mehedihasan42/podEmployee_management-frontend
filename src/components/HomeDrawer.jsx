import React, { useContext } from 'react';
import { Link, Outlet } from 'react-router';
import { AuthContext } from '../providers/AuthProvider';

const HomeDrawer = () => {
    const { user, logout } = useContext(AuthContext);

    const isAdmin = user && user.role === 'Admin';

    const Logout = () => {
        logout();
    }
    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col items-center justify-center">
                <Outlet />
                <label htmlFor="my-drawer-3" className="btn drawer-button lg:hidden">
                    Open drawer
                </label>
            </div>
            <div className="drawer-side">
                <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="menu bg-base-200 min-h-full w-80 p-4">
                    {/* Sidebar content here */}
                    {
                        isAdmin && (
                            <>
                                <li><Link to="/">Dashboard</Link></li>
                                <li><Link to="/employees">Employees</Link></li>
                                <li><Link to="/attendance">Attendance</Link></li>
                                <li><Link to="/leave">Leave</Link></li>
                                <div className="divider" />
                            </>
                        )
                    }
                    <li><Link to="/profile">Profile</Link></li>
                    <li><Link to="/user/attendance">Attendance</Link></li>
                    <li><Link to="/user/leave">Leave</Link></li>
                    <li><Link to="/user/leaveRequestToSubstitute">Requests</Link></li>
                    <li><Link to="/user/changePassword">Change Password</Link></li>
                    <li><button className='btn btn-sm btn-info text-white' onClick={Logout}>
                        Log out
                    </button></li>
                    {/* <li><Link to="/payroll">Payroll</Link></li> */}
                </ul>
            </div>
        </div>
    );
};

export default HomeDrawer;