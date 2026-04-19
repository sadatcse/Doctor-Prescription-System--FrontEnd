import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

export const useNews = () => {
    const axiosSecure = UseAxiosSecure();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // GET: Fetch all news
    const getAllNews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get('/news/get-all');
            return data;
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    // --- Add: Fetch news by branch ---
    const getNewsByBranch = useCallback(async (branch) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get(`/news/${branch}/get-all`);
            return data;
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);
    // ---------------------------------

    // GET: Fetch a single news item by ID
    const getNewsById = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.get(`/news/get-id/${id}`);
            return data;
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // POST: Create a new news/blog post
    const createNews = async (newsData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.post('/news/post', newsData);
            return data;
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // PUT: Update an existing news/blog post
    const updateNews = async (id, newsData) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.put(`/news/put/${id}`, newsData);
            return data;
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // DELETE: Remove a news/blog post
    const deleteNews = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosSecure.delete(`/news/delete/${id}`);
            return data;
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        getAllNews,
        getNewsByBranch, // <-- Expose the new function here
        getNewsById,
        createNews,
        updateNews,
        deleteNews
    };
};