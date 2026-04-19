import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import useAxiosPublic from "../Hook/useAxiosPublic";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Configure dayjs plugins globally
dayjs.extend(utc);
dayjs.extend(timezone);

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // --- ADDED CHAMBER STATE ---
  const [chamber, setChamber] = useState(() => {
    const storedChamber = localStorage.getItem("authChamber");
    return storedChamber ? JSON.parse(storedChamber) : null;
  });

  const [loading, setLoading] = useState(false);
  const axiosSecure = useAxiosPublic();
  const [branch, setBranch] = useState(() => {
    const storedBranch = localStorage.getItem("authBranch");
    return storedBranch || user?.branch || "teaxo";
  });
  const [clientIP, setClientIP] = useState(localStorage.getItem("clientIP") || "");

  useEffect(() => {
    const fetchClientIP = async () => {
      try {
        const response = await fetch("https://api64.ipify.org?format=json");
        const data = await response.json();
        setClientIP(data.ip);
        localStorage.setItem("clientIP", data.ip);
      } catch (error) {
        console.error("Error fetching IP address:", error);
      }
    };

    if (!clientIP) {
      fetchClientIP();
    }
  }, [clientIP]);

  const [systemPreferences, setSystemPreferences] = useState(null);

  const refreshPreferences = async () => {
    if (branch && axiosSecure) {
      try {
        const res = await axiosSecure.get(`/system-preferences/${branch}`);
        if (res?.data?.data?.timezone) {
          setSystemPreferences(res.data.data);
          dayjs.tz.setDefault(res.data.data.timezone);
        }
      } catch (err) {
        console.error("Failed to load global preferences", err);
      }
    }
  };

  useEffect(() => {
    refreshPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch]);

  const registerUser = async (email, password, name, branch) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post("/user/post", {
        email,
        password,
        name,
        branch,
        clientIP,
      });
      return data;
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosSecure.post("/user/login", { email, password, clientIP });
      const data = response.data;

      setUser(data.user);
      setBranch(data.user.branch);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      localStorage.setItem("authBranch", data.user.branch);
      // Removed localStorage.setItem("authToken") - Now handled natively by secure HttpOnly Cookies
      
      return data.user;
    } catch (error) {

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    try {
      if (user?.email) {
        await axiosSecure.post("/user/logout", { email: user?.email, clientIP });
      }
    } catch (error) {
      console.error("Logout API failed, continuing local clear", error);
    } finally {
      setUser(null);
      setBranch(null);
      setChamber(null); 
      localStorage.removeItem("authUser");
      localStorage.removeItem("authBranch");
      // Keep clientIP because it's hardware tied
      localStorage.removeItem("authChamber"); 
      setLoading(false);
    }
  };

  const authInfo = {
    user,
    loading,
    branch,
    chamber, // --- EXPOSED CHAMBER ---
    clientIP,
    systemPreferences,
    refreshPreferences,
    registerUser,
    loginUser,
    logoutUser,
    setUser,
    setChamber, // --- EXPOSED SETTER ---
  };

  return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;