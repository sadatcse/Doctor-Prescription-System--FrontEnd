import axios from "axios";
import { AuthContext } from "../providers/AuthProvider";
import { useContext, useEffect } from "react";

const axiosSecure = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}`,
  withCredentials: true,
});

const UseAxiosSecure = () => {
  const { user, branch, clientIP } = useContext(AuthContext);

  useEffect(() => {
    // 1. Create the request interceptor
    const requestInterceptor = axiosSecure.interceptors.request.use(
      (config) => {
        // HttpOnly Cookies are handled automatically by the browser securely.
        // We no longer manually attach the bearer token here.

        // Attach user data in headers for every request
        config.headers["X-User-Email"] = user?.email || "Unknown User";
        config.headers["X-User-Name"] = user?.name || "Unknown User";
        config.headers["X-User-Branch"] = branch || "Unknown Branch";
        config.headers["X-User-IP"] = clientIP || "Unknown IP";

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 2. Create the response interceptor
    const responseInterceptor = axiosSecure.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.error("Unauthorized or Token expired");
          // Add your logout logic here later if needed (e.g., clear localStorage, redirect to login)
        }
        return Promise.reject(error);
      }
    );

    // 3. CLEANUP: This is crucial. It removes the interceptor when the component 
    // unmounts or updates, preventing duplicate headers and memory leaks.
    return () => {
      axiosSecure.interceptors.request.eject(requestInterceptor);
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, [user, branch, clientIP]); // Re-run only if the user context changes

  return axiosSecure;
};

export default UseAxiosSecure;