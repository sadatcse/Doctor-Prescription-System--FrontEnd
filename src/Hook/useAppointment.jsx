import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

const useAppointment = () => {
    const axiosSecure = UseAxiosSecure();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getPaginatedAppointments = useCallback(async (params) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get('/appointments', { params });
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    const getAppointmentsByBranch = useCallback(async (branch, params) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get(`/appointments/${branch}/get-all`, { params });
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    const getAppointmentById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get(`/appointments/get-id/${id}`);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    const createAppointment = async (appointmentData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.post('/appointments/post', appointmentData);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateAppointment = async (id, updateData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.put(`/appointments/update/${id}`, updateData);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeAppointment = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.delete(`/appointments/delete/${id}`);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getPaymentStats = useCallback(async (branch, params) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get(`/appointments/${branch}/payment-stats`, { params });
            return data;
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
        getPaginatedAppointments,
        getAppointmentsByBranch,
        getAppointmentById,
        createAppointment,
        updateAppointment,
        removeAppointment,
        getPaymentStats,
    };
};

export default useAppointment;