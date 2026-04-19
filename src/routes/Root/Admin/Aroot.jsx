// src/layouts/ARoot.js

import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom"; // 💡 Import useLocation
import Sidebar from "./Sidebar";
import Header from "../../../components/Header";
import useThemeMode from "../../../Hook/useThemeMode";

const ARoot = () => {
  const { mode } = useThemeMode();
  const location = useLocation(); // 💡 Get current route

  // 💡 Check if we are on the Create Prescription page
  const isCreatePrescription = location.pathname === '/create-prescription';

  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // EFFECT: Handle window resizing & Route changes
  useEffect(() => {
    const handleResize = () => {
      // 💡 If on create-prescription, default to closed. Otherwise, base on screen width.
      if (isCreatePrescription) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(window.innerWidth > 768);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, [isCreatePrescription]); // 💡 Add dependency so it runs on route change

  const mainWrapperClasses = `
    ${mode === 'dark' ? 'dark' : ''}
    flex h-screen transition-colors duration-300
    bg-concrete dark:bg-casual-black font-primary text-casual-black dark:text-concrete
  `;

  const contentMainClasses = `
    flex-1 flex flex-col overflow-hidden transition-all duration-300
    ${isSidebarOpen 
       ? "md:ml-64" 
       : isCreatePrescription 
          ? "ml-0 md:ml-0" 
          : "md:ml-20"
    }
  `;

  return (
    <div className={mainWrapperClasses}>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        mode={mode}
      />

      <div className={contentMainClasses}>
        {/* 💡 Hide the global Header ONLY on the create-prescription route */}
        {!isCreatePrescription && (
          <Header
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />
        )}

        {/* 💡 Remove padding on create-prescription so it takes the full screen */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto transition-colors duration-300 bg-concrete dark:bg-casual-black ${isCreatePrescription ? 'p-0' : 'p-4 md:p-6'}`}>
          {/* 💡 Pass the toggle function via context so children can use it */}
          <Outlet context={{ toggleGlobalSidebar: toggleSidebar }} />
        </main>
      </div>
    </div>
  );
};

export default ARoot;