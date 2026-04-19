import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

const useChamber = () => {
    const axiosSecure = UseAxiosSecure();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getPaginatedChambers = useCallback(async (params) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get('/chambers', { params });
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    const getChambersByBranch = useCallback(async (branch, params) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get(`/chambers/${branch}/get-all`, { params });
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    const getChamberById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get(`/chambers/get-id/${id}`);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    const createChamber = async (chamberData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.post('/chambers/post', chamberData);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateChamber = async (id, updateData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.put(`/chambers/update/${id}`, updateData);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeChamber = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.delete(`/chambers/delete/${id}`);
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
        getPaginatedChambers,
        getChambersByBranch,
        getChamberById,
        createChamber,
        updateChamber,
        removeChamber,
    };
};

export default useChamber;