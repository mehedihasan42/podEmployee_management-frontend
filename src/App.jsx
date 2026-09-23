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
import Profile from './pages/Profile'

const router = createBrowserRouter([
  {
    path: "/",
    Component: HomeDrawer,
    children: [
      { index: true, Component: Dashboard },
      { path: "employees", Component: Employees },
      { path: "attendance", Component: Attendance },
      { path: "leave", Component: Leave },
      { path: "payroll", Component: Payroll },
      { path: "profile", Component: Profile },
      {
        path: "/profile/:employeeId",
        Component: Profile,
      }
    ],
  },

]);

function App() {
  return <RouterProvider router={router} />;
}

export default App