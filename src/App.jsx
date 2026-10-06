import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import HomeDrawer from './components/HomeDrawer'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import Leave from './pages/Leave'
import Payroll from './pages/Payroll'
import Dashboard from './pages/Dashboard'
import UserInfo from './pages/UserInfo'
import UserAttendance from './users/Attendance'
import UserLeave from './users/Leave'
import Login from './users/Login'
import Profile from './users/Profile'
import PrivateRoute from './routes/PrivateRoute'
import LeaveRequestToSubstitute from './users/LeaveRequestToSubstitute'
import ChangePass from './users/ChangePass'
import AdminRouter from './routes/AdminRouter'

const router = createBrowserRouter([
  { path: "login", Component: Login },
   {
    element: <AdminRouter />,
    children: [
      {
        path: "/",
        Component: HomeDrawer,
        children: [
          { index: true, Component: Dashboard },
          { path: "employees", Component: Employees },
          { path: "attendance", Component: Attendance },
          { path: "leave", Component: Leave },
          { path: "payroll", Component: Payroll },
          { path: "userInfo", Component: UserInfo },
          {
            path: "/userInfo/:employeeId",
            Component: UserInfo,
          }
        ],
      },
    ]
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "/",
        Component: HomeDrawer,
        children: [
          { path: "userInfo", Component: UserInfo },
          { path: "profile", Component: Profile },
          { path: "user/attendance", Component: UserAttendance },
          { path: "user/leave", Component: UserLeave },
          { path: "user/changePassword", Component: ChangePass },
          { path: "user/leaveRequestToSubstitute", Component: LeaveRequestToSubstitute },

          {
            path: "/userInfo/:employeeId",
            Component: UserInfo,
          }
        ],
      },
    ]
  }

]);

function App() {
  return <RouterProvider router={router} />;
}

export default App