import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

const useDoctorProfile = () => {
    const axiosSecure = UseAxiosSecure();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get all profiles with pagination and search
    const getPaginatedProfiles = useCallback(async (params) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get('/doctor-profiles', { params });
            return data;
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
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    // Get unique branch list for filters
    const getBranchDoctorNames = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get('/branch-doctor-list');
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    const getProfileById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get(`/doctor-profiles/get-id/${id}`);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    const createProfile = async (profileData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.post('/doctor-profiles/post', profileData);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (id, updateData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.put(`/doctor-profiles/update/${id}`, updateData);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeProfile = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.delete(`/doctor-profiles/delete/${id}`);
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
        getPaginatedProfiles,
        getProfilesByBranch,
        getBranchDoctorNames,
        getProfileById,
        createProfile,
        updateProfile,
        removeProfile,
    };
};

export default useDoctorProfile;