import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing Transaction Activity Logs.
 * Handles pagination, synchronization, secure deletion, and filtering.
 */
export const useTransactionLogs = (limit = 10) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  /**
   * Maps frontend filter keys to backend parameter names.
   * Adjust this object if your API expects different query param names.
   */
  const filterKeyMapping = {
    search: 'search',        // change to 'q' or 'userName' if needed
    branch: 'branch',
    status: 'status',
    transactionType: 'transactionType',
    statusCode: 'statusCode',
    startDate: 'startDate',
    endDate: 'endDate',
  };

  /**
   * Transforms filter values to the format expected by the backend.
   * Modify this function based on your backend's requirements.
   */
  const transformFilterValue = (key, value) => {
    if (!value || value.trim === '') return undefined;

    switch (key) {
      case 'status':
        // Example: if backend expects 'Success' (capitalised), uncomment the next line
        // return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        return value.toLowerCase(); // default: lowercase

      case 'statusCode':
        // Convert to number if possible, otherwise omit
        const num = Number(value);
        return isNaN(num) ? undefined : num;

      case 'search':
        // Trim whitespace and remove extra spaces
        return value.trim();

      default:
        return value;
    }
  };

  const fetchLogs = useCallback(async (page = 1, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');

      // Build query parameters with transformed values and mapped keys
      const params = new URLSearchParams({
        page,
        limit,
      });

      Object.entries(filters).forEach(([key, value]) => {
        const transformedValue = transformFilterValue(key, value);
        if (transformedValue !== undefined && transformedValue !== '') {
          const mappedKey = filterKeyMapping[key] || key; // fallback to original key
          params.append(mappedKey, transformedValue);
        }
      });

      const response = await fetch(`http://localhost:5000/api/transaction-logs/paginated?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch activity logs");

      setLogs(data.logs);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setTotalLogs(data.totalLogs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const deleteLog = async (id, currentFilters = {}) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
    const response = await fetch(`http://localhost:5000/api/transaction-logs/delete/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Server failed to delete record');

    // Re-fetch current page with active filters to keep UI consistent
    await fetchLogs(currentPage, currentFilters);
    return data;
  };

  return { logs, loading, error, currentPage, totalPages, totalLogs, fetchLogs, deleteLog };
};