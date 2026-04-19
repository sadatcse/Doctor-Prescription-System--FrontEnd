import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

const useUserDoctor = () => {
    const axiosSecure = UseAxiosSecure();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getUsersByBranch = useCallback(async (branch, params) => {
        setLoading(true);
        setError(null);
        try {
            // Endpoint: /user/:branch/get-all
            const { data } = await axiosSecure.get(`/user/${branch}/get-all`, { params });
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    const getUserById = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get(`/user/get-id/${id}`);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createUser = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.post('/user/post', userData);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (id, updateData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.put(`/user/update/${id}`, updateData);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeUser = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.delete(`/user/delete/${id}`);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (passwordData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.put(`/user/change-password`, passwordData);
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
        getUsersByBranch,
        getUserById,
        createUser,
        updateUser,
        removeUser,
        changePassword,
    };
};

export default useUserDoctor;