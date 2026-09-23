import React from 'react';
import { Link, Outlet } from 'react-router';

const HomeDrawer = () => {
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
                    <li><Link to="/">Dashboard</Link></li>
                    <li><Link to="/profile">Profile</Link></li>
                    <li><Link to="/employees">Employees</Link></li>
                    <li><Link to="/attendance">Attendance</Link></li>
                    <li><Link to="/leave">Leave</Link></li>
                    {/* <li><Link to="/payroll">Payroll</Link></li> */}
                </ul>
            </div>
        </div>
    );
};

export default HomeDrawer;