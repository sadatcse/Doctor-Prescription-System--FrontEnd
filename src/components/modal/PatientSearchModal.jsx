import React, { useState, useEffect, useContext } from 'react';
import { ICONS } from '../Prescription/Icons'; // Adjust path if needed
import usePatient from '../../Hook/usePatient'; // Adjust path if needed
import { AuthContext } from '../../providers/AuthProvider'; // Adjust path if needed

export default function PatientSearchModal({ isOpen, onClose, onSelect }) {
  const { branch } = useContext(AuthContext); 
  const { getPatientsByBranch } = usePatient();
  
  const [modalPatients, setModalPatients] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  
  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false); // Helps disable the "Next" button if no more data

  // Reset to page 1 whenever the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [modalSearchTerm]);

  // Fetch patients when Modal opens, search term changes, or page changes
  useEffect(() => {
    if (!isOpen) return;
    if (!branch) {
      console.warn("Branch is missing. Cannot fetch patients.");
      return;
    }

    const fetchPatients = async () => {
      setIsModalLoading(true);
      try {
        const response = await getPatientsByBranch(branch, { 
          search: modalSearchTerm || undefined,
          limit: 5, // Show exactly 5 data points
          page: currentPage
        });
        
        let fetchedData = [];
        if (response?.success) {
          fetchedData = response.data || [];
        } else if (response?.data) {
          fetchedData = response.data;
        } else if (Array.isArray(response)) {
          fetchedData = response;
        }
        
        setModalPatients(fetchedData);
        
        // If we get exactly 5 items back, assume there might be a next page.
        // (If your API returns a `totalPages` property, you can use that instead!)
        setHasMore(fetchedData.length === 5);

      } catch (err) {
        console.error("Failed to fetch patients for modal:", err);
      } finally {
        setIsModalLoading(false);
      }
    };

    // Debounce the search
    const timerId = setTimeout(() => {
      fetchPatients();
    }, 400);

    return () => clearTimeout(timerId);
  }, [isOpen, modalSearchTerm, currentPage, getPatientsByBranch, branch]);

  // Reset all states when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setModalSearchTerm('');
      setModalPatients([]);
      setCurrentPage(1);
    }
  }, [isOpen]);

  // Don't render anything if it's not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[85vh] border border-slate-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <ICONS.History size={20} className="text-cyan-600" />
            Select Existing Patient
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-full text-slate-500 transition-colors"
          >
            <ICONS.Close size={20} />
          </button>
        </div>

        {/* Modal Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-gray-700">
          <div className="relative">
            <ICONS.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, phone..."
              value={modalSearchTerm}
              onChange={(e) => setModalSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Modal Patient List */}
        <div className="p-2 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 dark:bg-transparent min-h-[300px]">
          {isModalLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-cyan-600">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium">Loading patients...</p>
            </div>
          ) : modalPatients.length > 0 ? (
            <div className="space-y-1">
              {modalPatients.map((p, index) => (
                <div 
                  key={p._id || index}
                  onClick={() => onSelect(p)}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 hover:bg-cyan-50 dark:hover:bg-gray-700 border border-transparent hover:border-cyan-200 dark:hover:border-cyan-900 rounded-lg cursor-pointer transition-all group"
                >
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
                      {p.fullName || p.name} 
                    </div>
                    <div className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 flex gap-2">
                      <span>{p.phone || 'No phone'}</span> • 
                      <span>{p.age || '-'} Yrs</span> • 
                      <span>{p.gender || '-'}</span>
                    </div>
                  </div>
                  <button className="text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 px-3 py-1.5 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Select
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <ICONS.History size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">No patients found</p>
            </div>
          )}
        </div>
        
        {/* --- Simple Pagination Footer --- */}
        <div className="p-4 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isModalLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <span className="text-sm font-medium text-slate-500 dark:text-gray-400">
            Page {currentPage}
          </span>
          
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!hasMore || isModalLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}