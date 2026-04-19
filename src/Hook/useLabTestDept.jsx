// hooks/useLabTestDept.js
import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

const useLabTestDept = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPaginatedLabTestDepts = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const { search, ...restParams } = params;
      // Use the specific search route if search term exists, otherwise use base route
      const url = search ? `/labtestdepts/search/${search}` : '/labtestdepts';
      
      const { data } = await axiosSecure.get(url, { params: restParams });
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const getLabTestDeptById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get(`/labtestdepts/get-id/${id}`);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const createLabTestDept = async (deptData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.post('/labtestdepts/post', deptData);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLabTestDept = async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.put(`/labtestdepts/update/${id}`, updateData);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeLabTestDept = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.delete(`/labtestdepts/delete/${id}`);
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
    getPaginatedLabTestDepts,
    getLabTestDeptById,
    createLabTestDept,
    updateLabTestDept,
    removeLabTestDept,
  };
};

export default useLabTestDept;