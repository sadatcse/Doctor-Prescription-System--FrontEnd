import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

const useBranch = () => {
    const axiosSecure = UseAxiosSecure();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get unique branch list for filters
    const getBranchDoctorNames = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get('/branch-doctor-list');
            // Returns data.data to cleanly extract the array from your backend structure
            return data.data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    // Get profiles filtered by a specific branch
    const getProfilesByBranch = useCallback(async (branch, params) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get(`/doctor-profiles/${branch}/get-all`, { params });
            // Returns data.data to cleanly extract the array from your backend structure
            return data.data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    return {
        loading,
        error,
        getBranchDoctorNames,
        getProfilesByBranch,
    };
};

export default useBranch;