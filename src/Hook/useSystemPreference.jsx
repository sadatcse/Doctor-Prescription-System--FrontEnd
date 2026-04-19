import { useState, useCallback } from 'react';
import UseAxiosSecure from './UseAxioSecure';

const useSystemPreference = () => {
  const axiosSecure = UseAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPreferenceByBranch = useCallback(async (branch) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.get(`/system-preferences/${branch}`);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const upsertPreference = async (branch, preferenceData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosSecure.put(`/system-preferences/upsert/${branch}`, preferenceData);
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
    getPreferenceByBranch,
    upsertPreference,
  };
};

export default useSystemPreference;
