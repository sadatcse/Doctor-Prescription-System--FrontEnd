import { createBrowserRouter, Navigate } from "react-router-dom";

// Existing Roots & Pages
import Error404 from "../pages/Error404/Error";
import Login from "../pages/Login/Login";
import Root from "./Root/Root";
import PrivateRoot from "./Root/PrivateRoot";
import PermissionPrivateRoute from "./Root/PermissionPrivateRoute";
// Admin Imports
import Aroot from "./Root/Admin/Aroot";
// import HomeA from "../pages/Dashboard/Home";
import Dashboard from "../pages/Admin/Dashboard";
import Prescriptions from "../pages/Admin/Prescriptions";
import Appointments from "../pages/Admin/Appointments";
import PreCheckup from "../pages/Admin/PreCheckup";
import DoctorPatient from "../pages/Admin/DoctorPatient";
import DoctorChamber from "../pages/Admin/DoctorChamber";
import Users from "../pages/Admin/Users";
import Profile from "../pages/Admin/Profile";
import Payment from "../pages/Admin/Payment";
import SendSms from "../pages/Admin/SendSms";
import ManagePermissions from "../pages/Admin/ManagePermissions";
import ManageEmail from "../pages/Admin/ManageEmail";
import ManageSms from "../pages/Admin/ManageSms";
import ManageSystem from "../pages/Admin/ManageSystem";
import WebsiteProfile from "../pages/Admin/WebsiteProfile";
import CreatePrescription from "../pages/Admin/CreatePrescription";
import PrescriptionTemplate from "../pages/Admin/PrescriptionTemplate";
import AdminBlog from "../pages/Admin/Blog";
import SoftwareLanding from "../pages/SoftwareLanding";

// Software Landing Legal Pages
import SoftwareTerms from "../pages/SoftwareLegal/TermsOfService";
import SoftwarePrivacyPolicy from "../pages/SoftwareLegal/PrivacyPolicy";
import SoftwareCookiePolicy from "../pages/SoftwareLegal/CookiePolicy";
import SoftwareRefundPolicy from "../pages/SoftwareLegal/RefundPolicy";

import SAroot from "./Root/Superadmin/Sroot";
import SuperAdminHome from "../pages/Superadmin/Home";
import SADashboard from "../pages/Superadmin/Dashboard";
import MedicineList from "../pages/Superadmin/MedicineList";
import MedicineCompanies from "../pages/Superadmin/MedicineCompanies";
import TestList from "../pages/Superadmin/TestList";
import TestDepartments from "../pages/Superadmin/TestDepartments";
import ManageBranches from "../pages/Superadmin/ManageBranches";
import SAManageUsers from "../pages/Superadmin/ManageUsers";
import CreateAccountWizard from "../pages/Superadmin/CreateAccountWizard";
import ImportData from "../pages/Superadmin/ImportData";
import ExportData from "../pages/Superadmin/ExportData";
import LoginHistory from "../pages/Superadmin/LoginHistory";
import UserActivities from "../pages/Superadmin/UserActivities";

import Home from "../pages/Home";
import About from "../pages/About";
import Blog from "../pages/Blog";
import Contact from "../pages/Contact";
import Expertise from "../pages/Expertise";
import TermsOfUse from "../pages/TermsOfUse";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import CookiePolicy from "../pages/CookiePolicy";
import RefundPolicy from "../pages/RefundPolicy";

import SelectChamber from "../pages/SelectChamber";
import TodaysAppointments from "../pages/TodaysAppointments";
import BookingConfirmation from "../pages/BookingConfirmation";
import SharedPrescriptionView from "../pages/SharedPrescriptionView";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SoftwareLanding />,
    errorElement: <Error404 />,
  },
  {
    path: "/terms-of-service",
    element: <SoftwareTerms />,
    errorElement: <Error404 />,
  },
  {
    path: "/privacy-policy",
    element: <SoftwarePrivacyPolicy />,
    errorElement: <Error404 />,
  },
  {
    path: "/cookie-policy",
    element: <SoftwareCookiePolicy />,
    errorElement: <Error404 />,
  },
  {
    path: "/refund-policy",
    element: <SoftwareRefundPolicy />,
    errorElement: <Error404 />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/doctorwebsite",
    element: <Root />,
    errorElement: <Error404 />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "blog", element: <Blog /> },
      { path: "contact", element: <Contact /> },
      { path: "expertise", element: <Expertise /> },
      { path: "terms-of-use", element: <TermsOfUse /> },
      { path: "privacy-policy", element: <PrivacyPolicy /> },
      { path: "cookie-policy", element: <CookiePolicy /> },
      { path: "refund-policy", element: <RefundPolicy /> },
      { path: "booking-confirmation", element: <BookingConfirmation /> },
      { path: "select-chamber", element: <SelectChamber /> },
      { path: "todays-appointments", element: <TodaysAppointments /> },
    ],
  },

  // 1.5 Shared Public Views
  {
    path: "/prescription/:id",
    element: <SharedPrescriptionView />,
    errorElement: <Error404 />,
  },

  // 2. Admin Routes Wrapped in Aroot Layout
  {
    element: <Aroot />,
    errorElement: <Error404 />,
    children: [
      {
        path: "/dashboard",
        // element: <PermissionPrivateRoute><Dashboard /></PermissionPrivateRoute>, 
        element: <PrivateRoot><Dashboard /></PrivateRoot>,
      },
      {
        path: "/create-prescription",
        element: <PermissionPrivateRoute><CreatePrescription /></PermissionPrivateRoute>,
      },
      {
        path: "/prescription-template",
        element: <PermissionPrivateRoute><PrescriptionTemplate /></PermissionPrivateRoute>,
      },
      {
        path: "/prescriptions",
        element: <PermissionPrivateRoute><Prescriptions /></PermissionPrivateRoute>,
      },
      {
        path: "/appointments",
        element: <PermissionPrivateRoute><Appointments /></PermissionPrivateRoute>,
      },
      {
        path: "/pre-checkup",
        element: <PermissionPrivateRoute><PreCheckup /></PermissionPrivateRoute>,
      },
      {
        path: "/doctor-patient",
        element: <PermissionPrivateRoute><DoctorPatient /></PermissionPrivateRoute>,
      },
      {
        path: "/doctor-chamber",
        element: <PermissionPrivateRoute><DoctorChamber /></PermissionPrivateRoute>,
      },
      {
        path: "/users",
        element: <PermissionPrivateRoute><Users /></PermissionPrivateRoute>,
      },
      {
        path: "/profile",
        element: <PermissionPrivateRoute><Profile /></PermissionPrivateRoute>,
      },
      {
        path: "/payment",
        element: <PermissionPrivateRoute><Payment /></PermissionPrivateRoute>,
      },
      {
        path: "/send-sms",
        element: <PermissionPrivateRoute><SendSms /></PermissionPrivateRoute>,
      },
      {
        path: "/settings/permissions",
        element: <PermissionPrivateRoute><ManagePermissions /></PermissionPrivateRoute>,
      },
      {
        path: "/settings/email",
        element: <PermissionPrivateRoute><ManageEmail /></PermissionPrivateRoute>,
      },
      {
        path: "/settings/sms-config",
        element: <PermissionPrivateRoute><ManageSms /></PermissionPrivateRoute>,
      },
      {
        path: "/settings/system",
        element: <PermissionPrivateRoute><ManageSystem /></PermissionPrivateRoute>,
      },
      {
        path: "/settings/website-profile",
        element: <PermissionPrivateRoute><WebsiteProfile /></PermissionPrivateRoute>,
      },
      {
        path: "/admin/blog",
        element: <PermissionPrivateRoute><AdminBlog /></PermissionPrivateRoute>,
      },
    ],
  },

  // 3. Super Admin Routes Wrapped in SAroot Layout
  {
    element: <SAroot />,
    errorElement: <Error404 />,
    children: [
      // Legacy redirect/home from your previous setup
      {
        path: "/superadmin",
        element: <PrivateRoot><Navigate to="/super-admin/dashboard" replace /></PrivateRoot>,
      },
      {
        path: "/superadmin/home",
        element: <PrivateRoot><SuperAdminHome /></PrivateRoot>,
      },

      // New Super Admin Routes
      {
        path: "/super-admin/dashboard",
        element: <PrivateRoot><SADashboard /></PrivateRoot>,
      },
      {
        path: "/medicines/list",
        element: <PrivateRoot><MedicineList /></PrivateRoot>,
      },
      {
        path: "/medicines/companies",
        element: <PrivateRoot><MedicineCompanies /></PrivateRoot>,
      },
      {
        path: "/labtest/list",
        element: <PrivateRoot><TestList /></PrivateRoot>,
      },
      {
        path: "/labtest/departments",
        element: <PrivateRoot><TestDepartments /></PrivateRoot>,
      },
      {
        path: "/admin/branches",
        element: <PrivateRoot><ManageBranches /></PrivateRoot>,
      },
      {
        path: "/admin/users",
        element: <PrivateRoot><SAManageUsers /></PrivateRoot>,
      },
      {
        path: "/admin/create-account-wizard",
        element: <PrivateRoot><CreateAccountWizard /></PrivateRoot>,
      },
      {
        path: "/backup/import",
        element: <PrivateRoot><ImportData /></PrivateRoot>,
      },
      {
        path: "/backup/export",
        element: <PrivateRoot><ExportData /></PrivateRoot>,
      },
      {
        path: "/logs/login-history",
        element: <PrivateRoot><LoginHistory /></PrivateRoot>,
      },
      {
        path: "/logs/user-activities",
        element: <PrivateRoot><UserActivities /></PrivateRoot>,
      },
    ],
  },
]);