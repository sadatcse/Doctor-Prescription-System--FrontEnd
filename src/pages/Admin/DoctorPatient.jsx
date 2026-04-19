import React, { useState, useEffect, useCallback, useContext } from 'react';
import { HiPlus, HiPencilSquare, HiTrash, HiMagnifyingGlass, HiUser, HiWifi } from "react-icons/hi2";
import { AuthContext } from '../../providers/AuthProvider';
import usePatient from '../../Hook/usePatient';
import PatientFormModal from '../../components/modal/PatientFormModal';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import Pagination from '../../components/common/Pagination';
import SectionTitle from '../../components/common/SectionTitle';
import { toast } from 'react-toastify'; // <-- NEW: Imported toastify

const DoctorPatient = () => {
  const { branch } = useContext(AuthContext);

  // Network Status State
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [limit] = useState(10);
  const [page, setPage] = useState(1);

  // Data State
  const [patients, setPatients] = useState([]);
  const [paginationData, setPaginationData] = useState({ currentPage: 1, totalPages: 1 });

  // --- CHANGED: Added populateOfflineDatabase to the destructuring ---
  const { getPatientsByBranch, removePatient, triggerSync, populateOfflineDatabase, loading, error } = usePatient();

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Network Listeners ---
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (triggerSync) triggerSync();
      toast.success("Software Online"); 
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync]);

  // --- NEW: Trigger Background 7-Day Sync when Component Mounts ---
  useEffect(() => {
    if (branch && isOnline) {
      populateOfflineDatabase(branch).then(() => {
        // Once the background sync finishes downloading the last 7 days,
        // refresh the UI to show the absolute latest data!
        fetchPatientsData();
      });
    }
  }, [branch, isOnline, populateOfflineDatabase]); 
  // -----------------------------------------------------------------

  // Fetch Patients
  const fetchPatientsData = useCallback(async () => {
    if (!branch) return;
    try {
      const response = await getPatientsByBranch(branch, {
        page,
        limit,
        search: searchTerm || undefined
      });

      if (response?.success) {
        setPatients(response.data || []);
        setPaginationData({
          currentPage: response.pagination?.currentPage || 1,
          totalPages: response.pagination?.totalPages || 1,
        });
      }
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    }
  }, [page, limit, searchTerm, branch, getPatientsByBranch]);

  useEffect(() => {
    fetchPatientsData();
  }, [fetchPatientsData]);

  // Handlers
  const handlePageChange = (newPage) => setPage(newPage);
  const handleAddClick = () => { setSelectedPatient(null); setIsModalOpen(true); };
  const handleEditClick = (patient) => { setSelectedPatient(patient); setIsModalOpen(true); };
  const handleDeleteClick = (patient) => { setPatientToDelete(patient); setIsDeleteModalOpen(true); };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;

    // --- NEW: DECLINE OFFLINE DELETION ---
    if (!isOnline) {
      toast.error("Offline — can't delete data");
      setIsDeleteModalOpen(false);
      setPatientToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      // Offline implementation: try localId first, fallback to _id
      const idToDelete = patientToDelete.localId || patientToDelete._id;
      await removePatient(idToDelete);
      setIsDeleteModalOpen(false);
      setPatientToDelete(null);
      fetchPatientsData();
    } catch (err) {
      toast.error(`Error deleting: ${err}`); // Upgraded alert to toast to match style
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-base-100 dark:bg-casual-black min-h-screen font-primary text-casual-black dark:text-concrete transition-colors">

      <SectionTitle
        title="Patient Management"
        subtitle="Managing records"
        rightElement={
          <button
            onClick={handleAddClick}
            className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-concrete border-none w-full md:w-auto font-secondary flex items-center gap-2"
          >
            <HiPlus className="text-xl" />
            Add New Patient
          </button>
        }
      />

      {/* Filtering Toolbar */}
      <div className="bg-concrete dark:bg-white/5 dark:bg-[#121212]/5 p-4 rounded-box shadow-sm mb-6 flex flex-col md:flex-row items-center gap-4 border border-casual-black/5 dark:border-white/10 transition-colors">
        <div className="form-control w-full md:w-auto md:flex-1 max-w-sm relative">
          <HiMagnifyingGlass className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-casual-black/50 dark:text-concrete/50" />
          <input
            type="text"
            placeholder="Search by name, phone or blood group..."
            className="input input-bordered w-full pl-10 bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete dark:border-[#2a2a2a]/20 focus:border-sporty-blue focus:outline-none transition-colors"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && !patients.length && (
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
      {!loading && patients.length === 0 ? (
        <div className="bg-concrete dark:bg-white/5 dark:bg-[#121212]/5 p-12 rounded-box text-center border border-casual-black/5 dark:border-white/10">
          <p className="text-casual-black/70 dark:text-concrete/70 text-lg font-medium">No patients found.</p>
        </div>
      ) : (
        !loading && (
          <div className="bg-concrete dark:bg-[#1a1a1a] rounded-box shadow-sm overflow-hidden border border-casual-black/5 dark:border-white/10 transition-colors">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-casual-black dark:text-concrete">
                <thead className="bg-casual-black/5 dark:bg-white/5 dark:bg-[#121212]/5 text-casual-black dark:text-concrete font-secondary">
                  <tr>
                    <th>Patient Name</th>
                    <th>Contact Info</th>
                    <th>Age/Gender</th>
                    <th>Blood Group</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.localId || p._id} className={`hover:bg-casual-black/5 dark:hover:bg-white/5 dark:bg-[#121212]/5 transition-colors border-b border-b-casual-black/5 dark:border-b-white/5 ${p.syncStatus?.includes('pending') ? 'opacity-70' : ''}`}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-sporty-blue/10 text-sporty-blue rounded-full w-8">
                              <HiUser />
                            </div>
                          </div>
                          <div>
                            <span className="font-bold">{p.fullName}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div className="font-medium">{p.phone}</div>
                          <div className="opacity-50 text-xs">{p.email || 'No Email'}</div>
                        </div>
                      </td>
                      <td>{p.age || '-'} Yrs / {p.gender}</td>
                      <td>
                        <span className={`badge badge-ghost font-bold ${p.bloodGroup ? 'text-fascinating-magenta' : 'opacity-30'}`}>
                          {p.bloodGroup || 'N/A'}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="join">
                          <button 
                            onClick={() => handleEditClick(p)} 
                            className="btn btn-sm btn-ghost join-item text-sporty-blue" 
                            title="Edit"
                            disabled={p.syncStatus === 'pending_create'} 
                          >
                            <HiPencilSquare className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(p)} 
                            className="btn btn-sm btn-ghost join-item text-fascinating-magenta" 
                            title="Delete"
                          >
                            <HiTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

      <PatientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={selectedPatient}
        onSuccess={fetchPatientsData} 
        branch={branch}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={patientToDelete?.fullName || 'this patient'}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default DoctorPatient;