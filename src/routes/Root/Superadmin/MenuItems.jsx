import React from 'react';
import {
  MdDashboard,
  MdInventory,
  MdMedication,
  MdBusiness,
  MdBackup,
  MdCloudUpload,
  MdCloudDownload,
  MdHistory,
  MdManageHistory,
  MdScience,
  MdStore,
  MdSupervisedUserCircle,
  MdAutoFixHigh,
  MdLogout
} from "react-icons/md";

const useMenuItems = () => {

  const allItems = [
    {
      title: "Dashboard",
      path: "/super-admin/dashboard",
      icon: <MdDashboard className="text-lg" />,
    },

    // --- 1. Master Databases ---
    {
      title: "Medicine Database",
      icon: <MdInventory className="text-lg" />,
      list: [
        {
          title: "Medicine List",
          path: "/medicines/list",
          icon: <MdMedication className="text-lg" />,
        },
        {
          title: "Medicine Company",
          path: "/medicines/companies", // Fixed path
          icon: <MdBusiness className="text-lg" />,
        }
      ]
    },
    {
      title: "Labtest Database",
      icon: <MdScience className="text-lg" />,
      list: [
        {
          title: "Test List",
          path: "/labtest/list",
          icon: <MdScience className="text-lg" />,
        },
        {
          title: "Test Departments",
          path: "/labtest/departments",
          icon: <MdInventory className="text-lg" />,
        }
      ]
    },

    // --- 2. Organization Management ---
    {
      title: "Manage Doctors",
      path: "/admin/branches",
      icon: <MdStore className="text-lg" />,
    },
    {
      title: "Manage User",
      path: "/admin/users",
      icon: <MdSupervisedUserCircle className="text-lg" />,
    },
    {
      title: "New Account Wizard",
      path: "/admin/create-account-wizard",
      icon: <MdAutoFixHigh className="text-lg" />, // Wizard icon
    },

    // --- 3. System Maintenance (Backup) ---
    {
      title: "Backup & Restore",
      icon: <MdBackup className="text-lg" />,
      list: [
        {
          title: "Import Data",
          path: "/backup/import",
          icon: <MdCloudUpload className="text-lg" />,
        },
        {
          title: "Export Data",
          path: "/backup/export",
          icon: <MdCloudDownload className="text-lg" />,
        }
      ]
    },

    // --- 4. System Logs ---
    {
      title: "System Logs",
      icon: <MdHistory className="text-lg" />,
      list: [
        {
          title: "User Login Log",
          path: "/logs/login-history",
          icon: <MdHistory className="text-lg" />,
        },
        {
          title: "User Activities",
          path: "/logs/user-activities",
          icon: <MdManageHistory className="text-lg" />,
        }
      ]
    },

    {
      title: "Logout",
      action: "logout",
      icon: <MdLogout className="text-lg" />,
    },
  ];

  return allItems;
};

export default useMenuItems;