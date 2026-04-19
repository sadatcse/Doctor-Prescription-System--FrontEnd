// TransactionLogTable.jsx
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { useTransactionLogs } from '../../Hook/useTransactionLogs';
import SectionTitle from "../../components/common/SectionTitle";
import Pagination from "../../components/common/Pagination";
import FilterDropdown from '../../components/common/FilterDropdown';
import useAuth from "../../Hook/useAuth.jsx";
import useBranch from "../../Hook/useBranch.jsx";

const TransactionLogTable = () => {
  const { logs, loading, error, currentPage, totalPages, totalLogs, fetchLogs, deleteLog } = useTransactionLogs(10);
  const { user } = useAuth();
  const { getBranchDoctorNames } = useBranch();

  // 1. Filter State Management
  const initialFilters = {
    search: '', branch: '', status: '', transactionType: '',
    startDate: '', endDate: ''
  };
  const [filters, setFilters] = useState(initialFilters);
  const [dynamicBranchOptions, setDynamicBranchOptions] = useState([]);

  // 2. Fetch Dynamic Branch Options
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await getBranchDoctorNames();
        const branchData = Array.isArray(response) ? response : [];
        
        const options = branchData.map(b => {
          const branchValue = typeof b === 'object' ? (b.branch || b.branchName || b.name) : b;
          return {
            label: branchValue || "Unknown Branch", 
            value: branchValue
          };
        });
        
        // Remove duplicates if any exist in the response
        const uniqueOptions = Array.from(new Set(options.map(a => a.value)))
          .map(value => options.find(a => a.value === value))
          .filter(option => option.value); // Filter out empty/null values

        setDynamicBranchOptions(uniqueOptions);
      } catch (err) {
        console.error("Failed to load branches:", err);
        toast.error("Failed to load branch filters");
      }
    };

    if (getBranchDoctorNames) {
      fetchBranches();
    }
  }, [getBranchDoctorNames]);

  // 3. Static Dropdown Options
  const statusOptions = [
    { label: 'Failed', value: 'failed' },
    { label: 'Success', value: 'success' },
    { label: 'Pending', value: 'pending' },
  ];

  // 4. Trigger fetch when filters or page change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Pass the complete filters object to fetchLogs, ensuring branch is included
      fetchLogs(1, filters);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [filters, fetchLogs]);

  const handlePageChange = (newPage) => {
    fetchLogs(newPage, filters);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // 5. Helper Functions
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format('MMM D, YYYY, hh:mm A');
  };

  const getStatusBadge = (status) => {
    const baseStyle = "inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded";
    const variants = {
      success: "bg-[#00bda9]/10 text-[#00bda9]",
      failed: "bg-[#cd3c84]/10 text-[#cd3c84]",
      pending: "bg-[#ccc141]/20 text-[#8a801e] dark:text-[#ccc141]"
    };
    return <span className={`${baseStyle} ${variants[status] || "bg-gray-200"}`}>{status}</span>;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this transaction log?")) return;

    try {
      await deleteLog(id, filters);
      toast.success("Transaction log purged successfully.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (error) return (
    <div className="p-4 bg-[#cd3c84]/10 border border-[#cd3c84] text-[#cd3c84] rounded-lg mt-5 font-medium">
      <strong>Error:</strong> {error}
    </div>
  );

  return (
    <div className="bg-[#f2f2f2] dark:bg-[#181818] p-6 md:p-8 rounded-xl shadow-sm border border-[#181818]/10 dark:border-[#f2f2f2]/10 w-full mt-5 relative transition-colors duration-200">
      
      <SectionTitle 
        title="Transaction Activity"
        subtitle={`Audit trail of system financial events. Total records: ${totalLogs}`}
        onAction={() => fetchLogs(currentPage, filters)}
        isLoading={loading}
        actionText="Refresh Logs"
      />

      {/* --- FILTER BAR SECTION --- */}
      <div className="mt-6 mb-6 p-4 rounded-lg bg-[#181818]/5 dark:bg-[#f2f2f2]/5 border border-[#181818]/10 dark:border-[#f2f2f2]/10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#181818]/50 dark:text-[#f2f2f2]/50 ml-1">Search</label>
            <input 
              type="text" 
              placeholder="User, Email, Details..." 
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="bg-[#181818]/5 dark:bg-[#f2f2f2]/5 border border-[#181818]/10 dark:border-[#f2f2f2]/10 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-[#147bff] transition-all text-[#181818] dark:text-[#f2f2f2]"
            />
          </div>

          <FilterDropdown 
            label="Branch" 
            placeholder="All Branches"
            value={filters.branch} 
            onChange={(val) => handleFilterChange('branch', val)} 
            options={dynamicBranchOptions} 
          />

          <FilterDropdown 
            label="Status" 
            placeholder="All Statuses"
            value={filters.status} 
            onChange={(val) => handleFilterChange('status', val)} 
            options={statusOptions} 
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#181818]/50 dark:text-[#f2f2f2]/50 ml-1">Transaction Type</label>
            <input 
              type="text" 
              placeholder="e.g., login" 
              value={filters.transactionType}
              onChange={(e) => handleFilterChange('transactionType', e.target.value)}
              className="bg-[#181818]/5 dark:bg-[#f2f2f2]/5 border border-[#181818]/10 dark:border-[#f2f2f2]/10 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-[#147bff] transition-all text-[#181818] dark:text-[#f2f2f2]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#181818]/50 dark:text-[#f2f2f2]/50 ml-1">Start Date</label>
            <input 
              type="date" 
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="bg-[#181818]/5 dark:bg-[#f2f2f2]/5 border border-[#181818]/10 dark:border-[#f2f2f2]/10 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-[#147bff] transition-all text-[#181818] dark:text-[#f2f2f2]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#181818]/50 dark:text-[#f2f2f2]/50 ml-1">End Date</label>
            <input 
              type="date" 
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="bg-[#181818]/5 dark:bg-[#f2f2f2]/5 border border-[#181818]/10 dark:border-[#f2f2f2]/10 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-[#147bff] transition-all text-[#181818] dark:text-[#f2f2f2]"
            />
          </div>

          <div className="flex items-end justify-start md:justify-end md:col-span-2 lg:col-span-2">
            <button 
              onClick={resetFilters}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#181818]/50 hover:text-[#cd3c84] dark:text-[#f2f2f2]/50 dark:hover:text-[#cd3c84] transition-colors flex items-center gap-2"
            >
              <span>⊗</span> Reset Filters
            </button>
          </div>
        </div>
      </div>
      {/* --- END FILTER BAR SECTION --- */}

      <div className="overflow-x-auto rounded-lg border border-[#181818]/10 dark:border-[#f2f2f2]/10">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-[#181818]/5 dark:bg-[#f2f2f2]/5 border-b border-[#181818]/10 dark:border-[#f2f2f2]/10 text-xs font-bold uppercase text-[#181818]/70 dark:text-[#f2f2f2]/70">
              <th className="p-4">User Details</th>
              <th className="p-4">Transaction Type</th>
              <th className="p-4">Status & Amount</th>
              <th className="p-4">Network & Time</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#181818]/10 dark:divide-[#f2f2f2]/10 text-[#181818] dark:text-[#f2f2f2]">
            {loading && logs.length === 0 ? (
              <tr><td colSpan="5" className="p-12 text-center opacity-50">Fetching records...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="5" className="p-12 text-center opacity-50">No activity logs match your filters.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-[#181818]/5 dark:hover:bg-[#f2f2f2]/5 transition-colors">
                  <td className="p-4">
                    <div className="font-bold">{log.userName}</div>
                    <div className="text-xs opacity-60">{log.userEmail}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-[#147bff]">{log.transactionType}</div>
                    <div className="text-xs opacity-60">Ref: {log.transactionCode}</div>
                  </td>
                  <td className="p-4">
                    <div className="mb-1">{getStatusBadge(log.status)}</div>
                    <div className="font-bold">{log.amount > 0 ? `$${log.amount.toFixed(2)}` : '—'}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium">{formatDate(log.transactionTime)}</div>
                    <div className="text-[10px] opacity-50 uppercase tracking-tighter">IP: {log.ipAddress} • {log.branch || 'Global'}</div>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleDelete(log._id)}
                      className="px-4 py-1.5 bg-[#cd3c84]/10 hover:bg-[#cd3c84] text-[#cd3c84] hover:text-white rounded text-xs font-bold transition-all active:scale-95"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <p className="text-sm font-medium text-[#181818]/70 dark:text-[#f2f2f2]/70">
            Page <b className="text-[#181818] dark:text-[#f2f2f2]">{currentPage}</b> of {totalPages}
          </p>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
          />
        </div>
      )}
    </div>
  );
};

export default TransactionLogTable;