// hooks/useLabtest.js
// No changes required here! This is your existing code.
import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

const useLabtest = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPaginatedLabtests = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get('/labtests', { params });
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const getLabtestById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get(`/labtests/get-id/${id}`);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const createLabtest = async (labtestData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.post('/labtests/post', labtestData);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLabtest = async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.put(`/labtests/update/${id}`, updateData);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeLabtest = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.delete(`/labtests/delete/${id}`);
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
    getPaginatedLabtests,
    getLabtestById,
    createLabtest,
    updateLabtest,
    removeLabtest,
  };
};

export default useLabtest;