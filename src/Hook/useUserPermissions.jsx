import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../providers/AuthProvider";
import UseAxiosSecure from "./UseAxioSecure";

// --- ADDED: Import the offline DB functions ---
import { getOfflinePermissions, savePermissionsOffline } from "../db/permissionDb";
// ----------------------------------------------

const useUserPermissions = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = UseAxiosSecure();

  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {

      if (!user || !user.role) { 
        setLoading(false);
        return;
      }
      
      setLoading(true);

      // --- ADDED: 1. TTL CACHE LOGIC ---
      const offlineData = await getOfflinePermissions(user.role);
      let isUIBlocked = true; // Tracks if we should keep the loading spinner running

      if (offlineData) {
        // Safely extract routes whether DB returns the raw array or the full object
        const cachedRoutes = Array.isArray(offlineData) ? offlineData : offlineData.allowedRoutes;
        const lastUpdatedDate = offlineData.lastUpdated ? new Date(offlineData.lastUpdated) : new Date(0);
        const cacheAgeHours = (new Date() - lastUpdatedDate) / (1000 * 60 * 60);

        // Trust cache if younger than 24 hours OR if the user is offline
        if (cacheAgeHours < 24 || !navigator.onLine) {
          if (cachedRoutes) setAllowedRoutes(cachedRoutes);
          isUIBlocked = false;
          
          // If the user is offline, stop here.
          if (!navigator.onLine) {
            setLoading(false);
            return;
          }
        } else {
          console.log("Permission cache expired. Waiting for network...");
        }
      }
      // ------------------------------------------------------------------

      // --- EXISTING LOGIC: Only run network request if online ---
      if (navigator.onLine) {
        try {
          console.log(`Fetching permissions for role: ${user.role}`);
          const response = await axiosSecure.get(`/permissions/${user.role}`);

          const allowedPaths = response.data.routesData
            .filter(permission => permission.isAllowed)
            .map(permission => permission.path);

          setAllowedRoutes(allowedPaths);

          // --- ADDED: 2. Save fresh data to offline cache ---
          await savePermissionsOffline(user.role, allowedPaths);
          // --------------------------------------------------

        } catch (err) {
          console.error("Failed to fetch user permissions:", err);
          setError(err);

          // Failsafe: If network fails but we had an expired cache, use it anyway so the app doesn't break
          if (isUIBlocked && offlineData) {
            const cachedRoutes = Array.isArray(offlineData) ? offlineData : offlineData.allowedRoutes;
            if (cachedRoutes) setAllowedRoutes(cachedRoutes);
          }
        }
      }
      
      // Replaced the 'finally' block to ensure loading always stops, even if offline
      setLoading(false);
    };

    fetchPermissions();
  }, [user, axiosSecure]);

  return { allowedRoutes, loading, error };
};

export default useUserPermissions;