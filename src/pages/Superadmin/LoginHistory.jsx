import React from 'react';
import dayjs from 'dayjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Don't forget the CSS!
import { useUserLogs } from '../../Hook/useUserLogs'; 
import SectionTitle from "../../components/common/SectionTitle";
import Pagination from "../../components/common/Pagination"; 

const UserLogTable = () => {
  const { logs, loading, error, currentPage, totalPages, totalLogs, fetchLogs, deleteLog } = useUserLogs(10);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format('MMM D, YYYY, hh:mm A');
  };

  // NEW: Wrapper function to handle the Confirm window and Toast notifications
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this log entry?");
    if (!isConfirmed) return;

    try {
      // We await the hook's delete function
      await deleteLog(id);
      
      // If it doesn't throw an error, trigger the success toast
      toast.success("User log deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
         // Uses solid colors (green for success, red for error)
      });
    } catch (err) {
      // If the hook throws an error, catch it and show an error toast
      toast.error(err.message || "Failed to delete user log.", {
        position: "top-right",
        autoClose: 3000,
      
      });
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-[#cd3c84]/10 border border-[#cd3c84] text-[#cd3c84] rounded-lg mt-5 font-medium">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className="bg-[#f2f2f2] dark:bg-[#181818] p-6 md:p-8 rounded-xl shadow-sm border border-[#181818]/10 dark:border-[#f2f2f2]/10 w-full font-sans transition-colors duration-200 mt-5 relative">
      
      <SectionTitle 
        title="User Activity Logs"
        subtitle={`Monitoring system access and user sessions. Total records: ${totalLogs}`}
        onAction={() => fetchLogs(currentPage)}
        isLoading={loading}
        actionText="Refresh Data"
        actionLoadingText="Refreshing..."
      />

      <div className="overflow-x-auto rounded-lg border border-[#181818]/10 dark:border-[#f2f2f2]/10">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-[#181818]/5 dark:bg-[#f2f2f2]/5 border-b border-[#181818]/10 dark:border-[#f2f2f2]/10">
              <th className="p-4 text-xs tracking-wider uppercase font-bold text-[#181818]/80 dark:text-[#f2f2f2]/80">User</th>
              <th className="p-4 text-xs tracking-wider uppercase font-bold text-[#181818]/80 dark:text-[#f2f2f2]/80">Role & Branch</th>
              <th className="p-4 text-xs tracking-wider uppercase font-bold text-[#181818]/80 dark:text-[#f2f2f2]/80">Login Time</th>
              <th className="p-4 text-xs tracking-wider uppercase font-bold text-[#181818]/80 dark:text-[#f2f2f2]/80">Logout Time</th>
              <th className="p-4 text-xs tracking-wider uppercase font-bold text-[#181818]/80 dark:text-[#f2f2f2]/80 text-center">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-[#181818]/10 dark:divide-[#f2f2f2]/10 relative">
            {loading && logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-[#181818]/60 dark:text-[#f2f2f2]/60 font-medium">
                  <span className="w-6 h-6 border-2 border-[#147bff] border-b-transparent rounded-full animate-spin inline-block mb-2"></span>
                  <p>Loading logs...</p>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-[#181818]/60 dark:text-[#f2f2f2]/60 font-medium">
                  No user logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-[#181818]/5 dark:hover:bg-[#f2f2f2]/5 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#181818] dark:text-[#f2f2f2]">{log.username || 'Unknown'}</div>
                    <div className="text-xs font-medium text-[#181818]/60 dark:text-[#f2f2f2]/60 mt-0.5">{log.userEmail}</div>
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-2 py-1 bg-[#00bda9]/10 text-[#00bda9] text-xs font-bold uppercase tracking-wide rounded mr-2">
                      {log.role || 'User'}
                    </span>
                    <span className="text-sm font-medium text-[#181818]/80 dark:text-[#f2f2f2]/80">{log.branch || 'Global'}</span>
                  </td>
                  <td className="p-4 text-sm font-medium text-[#181818]/80 dark:text-[#f2f2f2]/80">{formatDate(log.loginTime)}</td>
                  <td className="p-4 text-sm font-medium text-[#181818]/80 dark:text-[#f2f2f2]/80">{formatDate(log.logoutTime)}</td>
                  <td className="p-4 text-center">
                    {/* Changed onClick to trigger our new handleDelete function */}
                    <button 
                      onClick={() => handleDelete(log._id)}
                      className="px-3 py-1.5 bg-[#cd3c84]/10 hover:bg-[#cd3c84] text-[#cd3c84] hover:text-white rounded text-sm font-bold tracking-wide transition-all active:scale-95"
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
            onPageChange={fetchLogs}
          />
        </div>
      )}

      {/* NEW: Toast Container for popups */}
      {/* <ToastContainer /> */}
    </div>
  );
};

export default UserLogTable;