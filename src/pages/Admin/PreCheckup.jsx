import React, { useState, useEffect, useCallback, useContext } from 'react';
import dayjs from 'dayjs';
import { 
  HiPlus, 
  HiPencilSquare, 
  HiTrash, 
  HiMagnifyingGlass, 
  HiClipboardDocumentList,
  HiCloudArrowUp
} from "react-icons/hi2";
import { AuthContext } from '../../providers/AuthProvider';
import usePreCheckup from '../../Hook/usePreCheckup';
import PreCheckupFormModal from '../../components/modal/PreCheckupFormModal';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import Pagination from '../../components/common/Pagination';
import SectionTitle from '../../components/common/SectionTitle';
import { toast } from 'react-toastify';

const PreCheckup = () => {
  const { branch } = useContext(AuthContext);

  // Network Status State
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  // Data State
  const [preCheckups, setPreCheckups] = useState([]);
  const [paginationData, setPaginationData] = useState({ currentPage: 1, totalPages: 1 });

  // Hook Destructuring
  const { 
    getPreCheckupsByBranch, 
    removePreCheckup, 
    triggerSync,
    loading, 
    error 
  } = usePreCheckup();

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPreCheckup, setSelectedPreCheckup] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [preCheckupToDelete, setPreCheckupToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch PreCheckups
  const fetchPreCheckupData = useCallback(async () => {
    if (!branch) return;
    try {
      const response = await getPreCheckupsByBranch(branch, {
        page,
        limit,
        search: searchTerm || undefined
      });

      if (response?.success) {
        setPreCheckups(response.data || []);
        setPaginationData({
          currentPage: response.pagination.currentPage || 1,
          totalPages: response.pagination.totalPages || 1,
        });
      }
    } catch (err) {
      console.error("Failed to fetch pre-checkups:", err);
    }
  }, [page, limit, searchTerm, branch, getPreCheckupsByBranch]);

  // --- Network Listeners ---
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      toast.success("Software Online"); 
      if (triggerSync) {
        await triggerSync();
        fetchPreCheckupData(); // Hot reload data immediately after sync finishes
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync, fetchPreCheckupData]);

  useEffect(() => {
    fetchPreCheckupData();
  }, [fetchPreCheckupData]);

  // Handlers
  const handlePageChange = (newPage) => setPage(newPage);
  const handleAddClick = () => { setSelectedPreCheckup(null); setIsModalOpen(true); };
  const handleEditClick = (preCheckup) => { setSelectedPreCheckup(preCheckup); setIsModalOpen(true); };
  const handleDeleteClick = (preCheckup) => { setPreCheckupToDelete(preCheckup); setIsDeleteModalOpen(true); };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!preCheckupToDelete) return;
    setIsDeleting(true);
    try {
      // Use localId fallback for offline created items that don't have MongoDB _id yet
      const targetId = preCheckupToDelete.localId || preCheckupToDelete._id;
      await removePreCheckup(targetId);
      setIsDeleteModalOpen(false);
      setPreCheckupToDelete(null);
      fetchPreCheckupData();
    } catch (err) {
      toast.error(`Error deleting: ${err}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-base-100 dark:bg-casual-black min-h-screen font-primary text-casual-black dark:text-concrete transition-colors">

      <SectionTitle
        title="Pre-Checkup Management"
        subtitle="Manage patient vitals and preliminary records"
        rightElement={
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={handleAddClick}
              className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-concrete border-none font-secondary flex items-center gap-2"
            >
              <HiPlus className="text-xl" />
              Add New
            </button>
          </div>
        }
      />

      {/* Filtering Toolbar */}
      <div className="bg-concrete dark:bg-white/5 p-4 rounded-box shadow-sm mb-6 flex flex-col md:flex-row items-center gap-4 border border-casual-black/5 dark:border-white/10 transition-colors">
        <div className="form-control w-full md:w-auto md:flex-1 max-w-sm relative">
          <HiMagnifyingGlass className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-casual-black/50 dark:text-concrete/50" />
          <input
            type="text"
            placeholder="Search by patient name or phone..."
            className="input input-bordered w-full pl-10 bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue focus:outline-none transition-colors"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && !preCheckups.length && (
        <div className="flex justify-center items-center py-20">
          <span className="loading loading-spinner loading-lg text-sporty-blue"></span>
        </div>
      )}

      {error && (
        <div className="alert alert-error bg-fascinating-magenta/10 text-fascinating-magenta border-fascinating-magenta/20 mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Data Table */}
      {!loading && preCheckups.length === 0 ? (
        <div className="bg-concrete dark:bg-white/5 p-12 rounded-box text-center border border-casual-black/5 dark:border-white/10">
          <p className="text-casual-black/70 dark:text-concrete/70 text-lg font-medium">No pre-checkup records found.</p>
        </div>
      ) : (
        !loading && (
          <div className="bg-concrete dark:bg-[#1a1a1a] rounded-box shadow-sm overflow-hidden border border-casual-black/5 dark:border-white/10 transition-colors">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-casual-black dark:text-concrete">
                <thead className="bg-casual-black/5 dark:bg-white/5 text-casual-black dark:text-concrete font-secondary">
                  <tr>
                    <th>Patient Name</th>
                    <th>Appointment Info</th>
                    <th>Vitals Snippet</th>
                    <th>Conditions</th>
                    <th>Created At</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {preCheckups.map((pc) => {
                    const isPendingSync = pc.syncStatus && pc.syncStatus !== 'synced';
                    
                    const displayApptId = pc.appointmentId?.appointmentId 
                        || (typeof pc.appointmentId === 'string' || typeof pc.appointmentId === 'number' ? pc.appointmentId : null) 
                        || 'Walk-in/Unknown';
                    
                    const rawDate = pc.appointmentId?.appointmentDate || pc.appointmentDate;
                    const displayApptDate = rawDate ? dayjs(rawDate).format('MMM D, YYYY') : '-';

                    return (
                    <tr key={pc.localId || pc._id} className="hover:bg-casual-black/5 dark:hover:bg-white/5 transition-colors border-b border-b-casual-black/5 dark:border-b-white/5">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder relative">
                            <div className="bg-sporty-blue/10 text-sporty-blue rounded-full w-8 h-8 flex items-center justify-center">
                              <HiClipboardDocumentList />
                            </div>
                            {/* Offline Indicator Dot */}
                            {isPendingSync && (
                                <div className="absolute -top-1 -right-1 bg-warning text-warning-content rounded-full p-[2px] shadow-sm" title="Pending Sync">
                                  <HiCloudArrowUp className="w-3 h-3" />
                                </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{pc.patient?.fullName || 'Unknown'}</span>
                                {isPendingSync && (
                                  <span className="badge badge-warning badge-xs opacity-70">offline</span>
                                )}
                            </div>
                            <div className="text-xs opacity-60 font-medium">{pc.patient?.phone || 'No Phone'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div className="font-medium text-sporty-blue">ID: {displayApptId}</div>
                          <div className="opacity-50 text-xs">{displayApptDate}</div>
                        </div>
                      </td>
                      <td>
                        <div className="text-xs space-y-1">
                          {pc.examination?.vitals?.bp && <div><span className="font-semibold text-gray-500">BP:</span> {pc.examination.vitals.bp}</div>}
                          {pc.examination?.vitals?.weight && <div><span className="font-semibold text-gray-500">WT:</span> {pc.examination.vitals.weight}kg</div>}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {pc.conditions && Object.entries(pc.conditions).map(([key, val]) => (
                                val === true && (
                                    <span key={key} className="badge badge-sm badge-outline text-[10px] capitalize">
                                        {key}
                                    </span>
                                )
                            ))}
                        </div>
                      </td>
                      <td className="text-xs opacity-70">
                        {dayjs(pc.createdAt).format('MMM D, YYYY')}
                      </td>
                      <td className="text-center">
                        <div className="join">
                          <button onClick={() => handleEditClick(pc)} className="btn btn-sm btn-ghost join-item text-sporty-blue" title="Edit"><HiPencilSquare className="h-5 w-5" /></button>
                          <button onClick={() => handleDeleteClick(pc)} className="btn btn-sm btn-ghost join-item text-fascinating-magenta" title="Delete"><HiTrash className="h-5 w-5" /></button>
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-casual-black/5 dark:border-white/10 bg-base-100 dark:bg-transparent">
              <Pagination
                currentPage={paginationData.currentPage}
                totalPages={paginationData.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )
      )}

      {isModalOpen && (
          <PreCheckupFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            preCheckup={selectedPreCheckup}
            onSuccess={fetchPreCheckupData}
            branch={branch}
          />
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={preCheckupToDelete?.patient?.fullName ? `${preCheckupToDelete.patient.fullName}'s Pre-Checkup` : 'this record'}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default PreCheckup;