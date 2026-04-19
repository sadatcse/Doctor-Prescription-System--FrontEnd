import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

const useDoctorWebsite = () => {
    const axiosSecure = UseAxiosSecure();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get website profile by branch
    const getWebsiteByBranch = useCallback(async (branch) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get(`/doctorwebsite/branch/${branch}`);
            return data;
        } catch (err) {
            // If 404, it just means no profile exists yet, return null instead of throwing
            if (err.response?.status === 404) {
                return null;
            }
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    // Create a new website profile
    const createWebsite = async (profileData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.post('/doctorwebsite/post', profileData);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update an existing website profile
    const updateWebsite = async (id, updateData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.put(`/doctorwebsite/update/${id}`, updateData);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        getWebsiteByBranch,
        createWebsite,
        updateWebsite,
    };
};

export default useDoctorWebsite;