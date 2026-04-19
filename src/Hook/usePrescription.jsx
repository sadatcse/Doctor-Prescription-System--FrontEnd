import { useState, useEffect, useCallback } from "react";
import UseAxiosSecure from "./UseAxioSecure";

const usePrescription = (initialParams = null) => {
    const axiosSecure = UseAxiosSecure();

    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getAllPrescriptions = useCallback(
        async (params) => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await axiosSecure.get("/prescriptions", { params });
                setData(data?.data || []);
                setPagination(data?.pagination || null);
                setResponse(data);
                return data;
            } catch (err) {
                const message =
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    err.message;
                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [axiosSecure]
    );

    const getPrescriptionsByBranch = useCallback(
        async (branch, params) => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await axiosSecure.get(`/prescriptions/${branch}/get-all`, { params });
                setData(data?.data || []);
                setPagination(data?.pagination || null);
                setResponse(data);
                return data;
            } catch (err) {
                const message =
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    err.message;
                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [axiosSecure]
    );

    const getPrescriptionById = useCallback(
        async (id) => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await axiosSecure.get(`/prescriptions/get-id/${id}`);
                setResponse(data);
                return data;
            } catch (err) {
                const message =
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    err.message;
                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [axiosSecure]
    );

    const createPrescription = useCallback(
        async (payload) => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await axiosSecure.post("/prescriptions/post", payload);
                setResponse(data);
                return data;
            } catch (err) {
                const message =
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    err.message;
                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [axiosSecure]
    );

    const updatePrescription = useCallback(
        async (id, payload) => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await axiosSecure.put(`/prescriptions/update/${id}`, payload);
                setResponse(data);
                return data;
            } catch (err) {
                const message =
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    err.message;
                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [axiosSecure]
    );

    const removePrescription = useCallback(
        async (id) => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await axiosSecure.delete(`/prescriptions/delete/${id}`);
                setResponse(data);
                return data;
            } catch (err) {
                const message =
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    err.message;
                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [axiosSecure]
    );

    const getPrescriptionStats = useCallback(
        async (branch) => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await axiosSecure.get(`/prescriptions/${branch}/prescription-stats`);
                setResponse(data);
                return data;
            } catch (err) {
                const message =
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    err.message;
                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [axiosSecure]
    );

    useEffect(() => {
        if (initialParams) {
            getAllPrescriptions(initialParams);
        }
    }, [initialParams, getAllPrescriptions]);

    return {
        data,
        pagination,
        response,
        loading,
        error,
        getAllPrescriptions,
        getPrescriptionsByBranch,
        getPrescriptionStats,
        getPrescriptionById,
        createPrescription,
        updatePrescription,
        removePrescription
    };
};

export default usePrescription;