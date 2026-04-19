import React from 'react';
import {
  MdDashboard,
  MdEvent,
  MdPeople,
  MdBusiness,
  MdSupervisedUserCircle,
  MdPerson,
  MdMessage,
  MdSettings,
  MdSecurity,
  MdEmail,
  MdPermDeviceInformation,
  MdMedication,
  MdFactCheck,
  MdLogout,
  MdLanguage,
  MdArticle
} from "react-icons/md";

const useMenuItems = () => {

  const allItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <MdDashboard className="text-lg" />,
    },
    {
      title: "Prescription",
      icon: <MdMedication className="text-lg" />,
      list: [
        {
          title: "Create Prescription",
          path: "/create-prescription",
          icon: <MdMedication className="text-lg" />,
        },
        {
          title: "Manage Prescriptions",
          path: "/prescriptions",
          icon: <MdMedication className="text-lg" />,
        },
        {
          title: "Prescription Template",
          path: "/prescription-template",
          icon: <MdMedication className="text-lg" />,
        }
      ]
    },
    {
      title: "Manage Appointment",
      path: "/appointments",
      icon: <MdEvent className="text-lg" />,
    },
    {
      title: "Manage Pre-Checkup",
      path: "/pre-checkup",
      icon: <MdFactCheck className="text-lg" />,
    },
    {
      title: "Doctor Patient",
      path: "/doctor-patient",
      icon: <MdPeople className="text-lg" />,
    },
    {
      title: "Doctor Chamber",
      path: "/doctor-chamber",
      icon: <MdBusiness className="text-lg" />,
    },
    {
      title: "Software Users",
      path: "/users",
      icon: <MdSupervisedUserCircle className="text-lg" />,
    },
    {
      title: "Doctor Profile",
      path: "/profile",
      icon: <MdPerson className="text-lg" />,
    },
    {
      title: "Payment Collection",
      path: "/payment",
      icon: <MdPerson className="text-lg" />,
    },
    {
      title: "Send SMS",
      path: "/send-sms",
      icon: <MdMessage className="text-lg" />,
    },
    {
      title: "Manage Blog",
      path: "/admin/blog",
      icon: <MdArticle className="text-lg" />,
    },

    {
      title: "Setting",
      icon: <MdSettings className="text-lg" />,
      list: [
        {
          title: "Manage Permission",
          path: "/settings/permissions",
          icon: <MdSecurity className="text-lg" />,
        },
        {
          title: "Manage Email",
          path: "/settings/email",
          icon: <MdEmail className="text-lg" />,
        },
        {
          title: "Manage SMS",
          path: "/settings/sms-config",
          icon: <MdMessage className="text-lg" />,
        },
        {
          title: "Manage System",
          path: "/settings/system",
          icon: <MdPermDeviceInformation className="text-lg" />,
        },
        {
          title: "Website Profile",
          path: "/settings/website-profile",
          icon: <MdLanguage className="text-lg" />,
        },
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