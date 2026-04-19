import React, { useState, useEffect, useCallback, useContext } from 'react';
import { HiPlus, HiPencilSquare, HiTrash, HiMagnifyingGlass, HiDocumentText, HiUserPlus, HiUser, HiDocumentChartBar } from "react-icons/hi2";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../providers/AuthProvider';
import usePrescription from '../../Hook/usePrescription';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import Pagination from '../../components/common/Pagination';
import SectionTitle from '../../components/common/SectionTitle';
import dayjs from 'dayjs'; // Assuming dayjs is used for date formatting based on standard practices

const Prescriptions = () => {
  const { branch } = useContext(AuthContext);
  const navigate = useNavigate();

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  // Data State
  const [prescriptions, setPrescriptions] = useState([]);
  const [stats, setStats] = useState({ newCount: 0, oldCount: 0, reportCount: 0, unassignedCount: 0 });
  const [paginationData, setPaginationData] = useState({ currentPage: 1, totalPages: 1 });

  // Hook Destructuring
  const { getPrescriptionsByBranch, getPrescriptionStats, removePrescription, loading, error } = usePrescription();

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Prescriptions
  const fetchPrescriptionsData = useCallback(async () => {
    if (!branch) return;
    try {
      const statsRes = await getPrescriptionStats(branch);
      if (statsRes?.success) {
        setStats(statsRes.data);
      }

      const response = await getPrescriptionsByBranch(branch, {
        page,
        limit,
        // Passing search even if backend doesn't explicitly filter it yet, 
        // to maintain contract and prepare for future backend search implementation.
        search: searchTerm || undefined
      });

      if (response?.success) {
        setPrescriptions(response.data || []);
        setPaginationData({
          currentPage: response.pagination.currentPage || 1,
          totalPages: response.pagination.totalPages || 1,
        });
      }
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err);
    }
  }, [page, limit, searchTerm, branch, getPrescriptionsByBranch]);

  useEffect(() => {
    fetchPrescriptionsData();
  }, [fetchPrescriptionsData]);

  // Handlers
  const handlePageChange = (newPage) => setPage(newPage);
  const handleAddClick = () => { navigate('/create-prescription'); };
  const handleEditClick = (prescription) => { navigate('/create-prescription', { state: { editPrescription: prescription } }); };
  const handleDeleteClick = (prescription) => { setPrescriptionToDelete(prescription); setIsDeleteModalOpen(true); };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!prescriptionToDelete) return;
    setIsDeleting(true);
    try {
      await removePrescription(prescriptionToDelete._id);
      setIsDeleteModalOpen(false);
      setPrescriptionToDelete(null);
      fetchPrescriptionsData();
    } catch (err) {
      alert(`Error deleting: ${err}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Client-side filtering fallback for search term if backend doesn't filter
  const filteredPrescriptions = searchTerm
    ? prescriptions.filter(p =>
      p.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prescriptionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patient?.phone?.includes(searchTerm)
    )
    : prescriptions;

  return (
    <div className="p-4 md:p-6 bg-base-100 dark:bg-casual-black min-h-screen font-primary text-casual-black dark:text-concrete transition-colors">

      <SectionTitle
        title="Prescription Management"
        subtitle="Managing clinical records and treatments"
        rightElement={
          <button
            onClick={handleAddClick}
            className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-concrete border-none w-full md:w-auto font-secondary flex items-center gap-2"
          >
            <HiPlus className="text-xl" />
            Create Prescription
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-concrete dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-casual-black/5 dark:border-white/10 flex items-center gap-5 transition-colors">
              <div className="w-14 h-14 rounded-full bg-sporty-blue/10 dark:bg-sporty-blue/20 flex items-center justify-center text-sporty-blue shrink-0">
                  <HiUserPlus className="w-8 h-8" />
              </div>
              <div>
                  <p className="text-casual-black/60 dark:text-concrete/60 text-sm font-bold uppercase tracking-wider mb-1">New Patients</p>
                  <h3 className="text-3xl font-black text-casual-black dark:text-concrete">{stats.newCount}</h3>
              </div>
          </div>

          <div className="bg-concrete dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-casual-black/5 dark:border-white/10 flex items-center gap-5 transition-colors">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                  <HiUser className="w-8 h-8" />
              </div>
              <div>
                  <p className="text-casual-black/60 dark:text-concrete/60 text-sm font-bold uppercase tracking-wider mb-1">Old Patients</p>
                  <h3 className="text-3xl font-black text-casual-black dark:text-concrete">{stats.oldCount}</h3>
              </div>
          </div>

          <div className="bg-concrete dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-casual-black/5 dark:border-white/10 flex items-center gap-5 transition-colors">
              <div className="w-14 h-14 rounded-full bg-fascinating-magenta/10 dark:bg-fascinating-magenta/20 flex items-center justify-center text-fascinating-magenta shrink-0">
                  <HiDocumentChartBar className="w-8 h-8" />
              </div>
              <div>
                  <p className="text-casual-black/60 dark:text-concrete/60 text-sm font-bold uppercase tracking-wider mb-1">Report Views</p>
                  <h3 className="text-3xl font-black text-casual-black dark:text-concrete">{stats.reportCount}</h3>
              </div>
          </div>
      </div>

      {/* Filtering Toolbar */}
      <div className="bg-concrete dark:bg-white/5 p-4 rounded-box shadow-sm mb-6 flex flex-col md:flex-row items-center gap-4 border border-casual-black/5 dark:border-white/10 transition-colors">
        <div className="form-control w-full md:w-auto md:flex-1 max-w-sm relative">
          <HiMagnifyingGlass className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-casual-black/50 dark:text-concrete/50" />
          <input
            type="text"
            placeholder="Search by patient name, ID, or phone..."
            className="input input-bordered w-full pl-10 bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue focus:outline-none transition-colors"
            value={searchTerm}
            onChange={handleSearchChange}
            autoFocus
          />
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && !prescriptions.length && (
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
      {!loading && filteredPrescriptions.length === 0 ? (
        <div className="bg-concrete dark:bg-white/5 p-12 rounded-box text-center border border-casual-black/5 dark:border-white/10">
          <p className="text-casual-black/70 dark:text-concrete/70 text-lg font-medium">No prescriptions found.</p>
        </div>
      ) : (
        !loading && (
          <div className="bg-concrete dark:bg-[#1a1a1a] rounded-box shadow-sm overflow-hidden border border-casual-black/5 dark:border-white/10 transition-colors">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-casual-black dark:text-concrete">
                <thead className="bg-casual-black/5 dark:bg-white/5 text-casual-black dark:text-concrete font-secondary">
                  <tr>
                    <th>Prescription ID</th>
                    <th>Patient Details</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrescriptions.map((p) => (
                    <tr key={p._id} className="hover:bg-casual-black/5 dark:hover:bg-white/5 transition-colors border-b border-b-casual-black/5 dark:border-b-white/5">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-sporty-blue/10 text-sporty-blue rounded-full w-8">
                              <HiDocumentText />
                            </div>
                          </div>
                          <span className="font-bold">{p.prescriptionId}</span>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div className="font-medium">{p.patient?.name || 'Unknown Patient'}</div>
                          <div className="opacity-50 text-xs">
                            {p.patient?.age ? `${p.patient.age} Yrs` : ''}
                            {p.patient?.gender ? ` • ${p.patient.gender}` : ''}
                            {p.patient?.phone ? ` • ${p.patient.phone}` : ''}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          {p.createdAt ? dayjs(p.createdAt).format('DD MMM YYYY, hh:mm A') : 'N/A'}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-sm font-bold border-none text-white ${p.status === 'Completed' ? 'bg-green-500' :
                          p.status === 'Draft' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}>
                          {p.status || 'Completed'}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="join">
                          <button onClick={() => handleEditClick(p)} className="btn btn-sm btn-ghost join-item text-sporty-blue" title="Edit">
                            <HiPencilSquare className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDeleteClick(p)} className="btn btn-sm btn-ghost join-item text-fascinating-magenta" title="Delete">
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

      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => { setIsDeleteModalOpen(false); setPrescriptionToDelete(null); }}
          onConfirm={confirmDelete}
          title="Delete Prescription"
          message={`Are you sure you want to delete prescription ${prescriptionToDelete?.prescriptionId}? This action cannot be undone.`}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default Prescriptions;