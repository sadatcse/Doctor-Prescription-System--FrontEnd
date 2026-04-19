import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

const usePreCheckup = () => {
    const axiosSecure = UseAxiosSecure();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getPreCheckupsByBranch = useCallback(async (branch, params) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get(`/precheckups/${branch}/get-all`, { params });
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    const getPreCheckupById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get(`/precheckups/get-id/${id}`);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    const createPreCheckup = async (preCheckupData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.post('/precheckups/post', preCheckupData);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updatePreCheckup = async (id, updateData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.put(`/precheckups/update/${id}`, updateData);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createPatientWithPreCheckup = async (fullData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.post('/precheckups/create-full', fullData);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removePreCheckup = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.delete(`/precheckups/delete/${id}`);
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
        getPreCheckupsByBranch,
        getPreCheckupById,
        createPreCheckup,
        updatePreCheckup,
        removePreCheckup,
        createPatientWithPreCheckup,
    };
};

export default usePreCheckup;
