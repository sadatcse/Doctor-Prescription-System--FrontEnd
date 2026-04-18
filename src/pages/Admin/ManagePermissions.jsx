import React, { useState, useEffect, useCallback, useContext } from "react";
import menuItems from "../../routes/Root/Admin/MenuItems";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import toast from "react-hot-toast";
import { HiShieldCheck } from "react-icons/hi2";
import SectionTitle from '../../components/common/SectionTitle'; // Added standard SectionTitle
import OfflineComponent from '../../components/common/offlineComponent'; // Capitalized for React

// ✅ Fixed Roles
const ROLES = ["Compounders", "Assistants", "Doctor"];

// =======================
// ✅ Child Component
// =======================

const PermissionItem = ({ item, groupName, role, branch, initialChecked }) => {
  const [isChecked, setIsChecked] = useState(initialChecked);
  const [loading, setLoading] = useState(false);
  const axiosSecure = UseAxiosSecure();

  useEffect(() => {
    setIsChecked(initialChecked);
  }, [initialChecked]);

  const handleCheckboxChange = async (e) => {
    const checked = e.target.checked;

    // Optimistic UI
    setIsChecked(checked);
    setLoading(true);

    const permissionPayload = {
      title: item.title,
      isAllowed: checked,
      role,
      group_name: groupName,
      path: item.path,
      branch,
    };

    try {
      await axiosSecure.put(`/permissions`, permissionPayload);
      toast.success(`Permission for '${item.title}' updated.`);
    } catch (error) {
      console.error("Error updating permission:", error);
      toast.error("Update failed. Please try again.");

      // rollback
      setIsChecked(!checked);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-control bg-casual-black/5 dark:bg-white/5 p-3 rounded-xl hover:bg-sporty-blue/5 dark:hover:bg-sporty-blue/10 border border-transparent hover:border-sporty-blue/20 transition-all duration-300">
      <label className="cursor-pointer label justify-between items-center py-0">
        <span className="label-text font-medium text-casual-black/80 dark:text-concrete/80">{item.title}</span>

        {loading ? (
          <span className="loading loading-spinner loading-sm text-sporty-blue"></span>
        ) : (
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            className="checkbox checkbox-sm border-casual-black/30 dark:border-white/30 checked:border-sporty-blue [--chkbg:theme(colors.sporty-blue)] [--chkfg:white]"
          />
        )}
      </label>
    </div>
  );
};

// =======================
// ✅ Main Component
// =======================

const ManagePermissions = () => {
  const [role, setRole] = useState(ROLES[0]); // default first role
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- ADDED: Network tracking state ---
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const { user } = useContext(AuthContext);
  const axiosSecure = UseAxiosSecure();

  // --- ADDED: Listen for network changes ---
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // =======================
  // Fetch Permissions
  // =======================
  const fetchPermissions = useCallback(async () => {
    if (!role || !user?.branch) return;

    setLoading(true);
    try {
      const response = await axiosSecure.get(
        `/permissions/${role}?branch=${user.branch}`
      );
      setPermissions(response.data.routesData || []);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Could not fetch permissions.");
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [role, user?.branch, axiosSecure]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // =======================
  // Check permission
  // =======================
  const isRouteAllowed = (path) => {
    const permission = permissions.find((p) => p.path === path);
    return permission ? permission.isAllowed : false;
  };

  const allMenuItems = menuItems();

  // --- ADDED: Show warning if offline ---
  if (!isOnline) {
    return <OfflineComponent />;
  }

  return (
    <div className="p-4 md:p-6 bg-base-100 dark:bg-casual-black min-h-screen font-primary text-casual-black dark:text-concrete transition-colors">

      {/* Replaced standard header with SectionTitle to match design system */}
      <SectionTitle
        title="Manage Role Permissions"
        subtitle="Configure access levels and menu visibility for different roles."
        rightElement={
          <div className="flex items-center gap-3 w-full md:w-auto bg-base-100 dark:bg-[#1a1a1a] p-2 rounded-xl border border-casual-black/10 dark:border-white/10 shadow-sm">
            <span className="text-sm font-semibold pl-2 hidden md:block text-casual-black/70 dark:text-concrete/70 font-secondary">
              Select Role:
            </span>
            <select
              className="select select-sm select-bordered w-full md:w-48 bg-transparent border-casual-black/20 dark:border-white/20 focus:border-sporty-blue focus:ring-1 focus:ring-sporty-blue text-casual-black dark:text-concrete font-secondary"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map((r, i) => (
                <option key={i} value={r} className="bg-base-100 dark:bg-[#1a1a1a]">
                  {r}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="mt-8">
        {/* =======================
            Skeleton Loading
        ======================= */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-base-100 dark:bg-[#1a1a1a] border border-casual-black/10 dark:border-white/10 shadow-sm animate-pulse"
              >
                <div className="h-5 bg-casual-black/10 dark:bg-white/10 rounded w-1/2 mb-5"></div>
                <div className="space-y-3">
                  <div className="h-10 bg-casual-black/5 dark:bg-white/5 rounded-xl"></div>
                  <div className="h-10 bg-casual-black/5 dark:bg-white/5 rounded-xl"></div>
                  <div className="h-10 bg-casual-black/5 dark:bg-white/5 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =======================
            Permissions Grid
        ======================= */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allMenuItems.map((menuGroup) => (
              <div
                key={menuGroup.title}
                className="card bg-base-100 dark:bg-[#1a1a1a] border border-casual-black/10 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden relative group"
              >
                {/* Top Accent Gradient Line (Matching DoctorChamber) */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sporty-blue to-fascinating-magenta opacity-70 group-hover:opacity-100 transition-opacity"></div>

                <div className="card-body p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-3 border-b border-casual-black/10 dark:border-white/10 pb-3 text-casual-black dark:text-concrete font-secondary group-hover:text-sporty-blue transition-colors">
                    <span className="p-1.5 bg-sporty-blue/10 text-sporty-blue rounded-lg">
                      {menuGroup.icon ? menuGroup.icon : <HiShieldCheck className="w-5 h-5" />}
                    </span>
                    {menuGroup.title}
                  </h3>

                  <div className="space-y-2">
                    {menuGroup.list ? (
                      menuGroup.list.map((item) => (
                        <PermissionItem
                          key={item.path}
                          item={item}
                          groupName={menuGroup.title}
                          role={role}
                          branch={user?.branch}
                          initialChecked={isRouteAllowed(item.path)}
                        />
                      ))
                    ) : (
                      <PermissionItem
                        key={menuGroup.path}
                        item={menuGroup}
                        groupName="General"
                        role={role}
                        branch={user?.branch}
                        initialChecked={isRouteAllowed(menuGroup.path)}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePermissions;