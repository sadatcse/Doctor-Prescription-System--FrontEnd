import { useState, useEffect, useCallback } from 'react';

export const useUserLogs = (limit = 10) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

 const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      // Check your browser's Application tab. Is your token saved under 'token', 'adminToken', or something else?
      const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken'); 
      
      if (!token) {
        console.warn("No authentication token found in localStorage.");
      }

      const response = await fetch(`http://localhost:5000/api/userlog/paginated?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // BETTER ERROR HANDLING: 
      if (!response.ok) {
        // Try to read the error message sent from the backend
        const errorData = await response.json().catch(() => ({})); 
        throw new Error(errorData.error || errorData.message || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      
      setLogs(data.logs);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setTotalLogs(data.totalLogs);
    } catch (err) {
      console.error("Fetch logs failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const deleteLog = async (id) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
    const response = await fetch(`http://localhost:5000/api/userlog/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to delete log');
    }
    
    // Refresh the current page after successful deletion
    fetchLogs(currentPage);
  };

  // Fetch initial data on mount
  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  return { 
    logs, 
    loading, 
    error, 
    currentPage, 
    totalPages, 
    totalLogs, 
    fetchLogs, 
    deleteLog 
  };
};