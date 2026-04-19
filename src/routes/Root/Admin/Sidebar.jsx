import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Link, useLocation } from "react-router-dom";
import { MdChevronRight } from "react-icons/md";
import useMenuItems from "./MenuItems";

import Logo from "../../../assets/Logo/data-it-rx-logo.svg";
import Logo_Dark from "../../../assets/Logo/data-it-rx-dark.svg";

// KEEP THESE (FUNCTIONALITY)
import useUserPermissions from '../../../Hook/useUserPermissions';
import { AuthContext } from '../../../providers/AuthProvider';

// Skeleton Loader
const SidebarSkeleton = ({ isSidebarOpen }) => (
    <div className="p-2">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 my-4 h-8">
                <div className="bg-gray-200 rounded-md w-8 h-full animate-pulse"></div>
                {isSidebarOpen && <div className="bg-gray-200 rounded-md h-5 w-3/4 animate-pulse"></div>}
            </div>
        ))}
    </div>
);

const AccordionItem = ({ item, isSidebarOpen, mode, logoutUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (!isSidebarOpen) setIsOpen(false);
    }, [isSidebarOpen]);

    useEffect(() => {
        if (item.list && item.list.some(child => child.path === location.pathname)) {
            setIsOpen(true);
        }
    }, [location.pathname, item.list]);

    const getLinkClasses = (path) => {
        const baseClasses = "flex p-3 my-1 rounded-md gap-3 items-center transition-colors";
        const textHoverClasses = "text-base-content dark:text-gray-300 hover:bg-base-content/10 dark:hover:bg-gray-700";

        if (location.pathname === path) {
            return `bg-primary text-white ${baseClasses}`;
        }
        return `${textHoverClasses} ${baseClasses}`;
    };

    if (item.list) {
        return (
            <li className="my-1">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex justify-between items-center p-3 rounded-md text-base-content dark:text-gray-300 hover:bg-base-content/10 dark:hover:bg-gray-700 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        {item.icon}
                        {isSidebarOpen && <span className="font-medium text-sm">{item.title}</span>}
                    </div>
                    {isSidebarOpen && <MdChevronRight className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />}
                </button>

                {isOpen && isSidebarOpen && (
                    <ul className="pl-6 pt-1">
                        {item.list.map((child) => (
                            <AccordionItem
                                key={child.title}
                                item={child}
                                isSidebarOpen={isSidebarOpen}
                                mode={mode}
                            />
                        ))}
                    </ul>
                )}
            </li>
        );
    }
    
    if (item.action === 'logout') {
        return (
            <li>
                <button 
                    onClick={logoutUser}
                    className={`w-full ${getLinkClasses('')}`}
                >
                    {item.icon}
                    {isSidebarOpen && <span className="font-medium text-sm">{item.title}</span>}
                </button>
            </li>
        );
    }

    return (
        <li>
            <Link to={item.path} className={getLinkClasses(item.path)}>
                {item.icon}
                {isSidebarOpen && <span className="font-medium text-sm">{item.title}</span>}
            </Link>
        </li>
    );
};

const Sidebar = ({ isSidebarOpen, toggleSidebar, mode }) => {
    const location = useLocation();
    const { user, logoutUser } = useContext(AuthContext);
    const { allowedRoutes, loading: permissionsLoading } = useUserPermissions();
    const allItems = useMenuItems();

    const menuItems = useMemo(() => {
        if (permissionsLoading) return [];

        const isAdmin = user?.role === 'admin';
        const hasPermissions = allowedRoutes && allowedRoutes.length > 0;

        if (isAdmin && !hasPermissions) return allItems;

        return allItems.reduce((acc, item) => {
            if (item.path) {
                if (allowedRoutes.includes(item.path)) acc.push(item);
            } else if (item.list) {
                const allowedSub = item.list.filter(sub => allowedRoutes.includes(sub.path));
                if (allowedSub.length > 0) acc.push({ ...item, list: allowedSub });
            }
            return acc;
        }, []);
    }, [allowedRoutes, permissionsLoading, allItems, user]);

    const isCreatePrescription = location.pathname === '/create-prescription';

    const sidebarClasses = `
        fixed top-0 left-0 h-full shadow-lg z-30 transition-all duration-300 flex flex-col
        bg-base-100 dark:bg-gray-800 
        ${isSidebarOpen
            ? 'w-64 translate-x-0'
            : isCreatePrescription 
               ? '-translate-x-full w-0 overflow-hidden' 
               : 'w-64 -translate-x-full md:w-20 md:translate-x-0'
        }
    `;

    // ✅ FIXED LOGO (NO HOOK)
    const currentLogo = mode === 'dark' ? Logo_Dark : Logo;

    return (
        <>
            <div
                onClick={toggleSidebar}
                className={`fixed inset-0 bg-black/50 z-20 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            ></div>

            <div className={sidebarClasses}>
                <div className={`flex items-center justify-center p-8 border-b h-[65px] flex-shrink-0 my-5 transition-colors duration-300 
                    border-base-content/10 dark:border-gray-700 
                `}>
                    <img src={currentLogo} alt="Logo" className="transition-all duration-300 w-48" />
                </div>

                <nav className="flex-1 overflow-y-auto p-2">
                    {permissionsLoading ? (
                        <SidebarSkeleton isSidebarOpen={isSidebarOpen} />
                    ) : (
                        <ul>
                            {menuItems.map((item) => (
                                <AccordionItem
                                    key={item.title}
                                    item={item}
                                    isSidebarOpen={isSidebarOpen}
                                    mode={mode}
                                    logoutUser={logoutUser}
                                />
                            ))}
                        </ul>
                    )}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;