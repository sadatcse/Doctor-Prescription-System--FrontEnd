import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiPhone,
  HiCalendarDays,
  HiMapPin,
  HiBuildingOffice,
  HiClock,
  HiInformationCircle,
  HiBanknotes,
  HiArrowPath,
  HiUsers // <-- Added HiUsers icon here
} from "react-icons/hi2";
import useChamber from '../../Hook/useChamber';
import ChamberFormModal from '../../components/modal/ChamberFormModal';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import Pagination from '../../components/common/Pagination';
import SectionTitle from '../../components/common/SectionTitle';
import { AuthContext } from '../../providers/AuthProvider';

const DoctorChamber = () => {
  // Pagination State
  const [limit, setLimit] = useState(12);
  const [page, setPage] = useState(1);
  const { branch } = useContext(AuthContext);

  // Data State
  const [chambers, setChambers] = useState([]);
  const [paginationData, setPaginationData] = useState({ currentPage: 1, totalPages: 1 });

  // Hook Destructuring
  const { getPaginatedChambers, getChambersByBranch, removeChamber, loading: chambersLoading, error: chambersError } = useChamber();

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChamber, setSelectedChamber] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chamberToDelete, setChamberToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Chambers
  const fetchChambersData = useCallback(async () => {
    try {
      let response;
      if (branch) {
        response = await getChambersByBranch(branch, { page, limit });
      } else {
        response = await getPaginatedChambers({ page, limit });
      }

      if (response && response.success) {
        setChambers(response.data || []);
        setPaginationData({
          currentPage: response.pagination?.currentPage || 1,
          totalPages: response.pagination?.totalPages || 1,
        });
      }
    } catch (err) {
      console.error("Failed to fetch chambers:", err);
    }
  }, [page, limit, branch, getPaginatedChambers, getChambersByBranch]);

  useEffect(() => {
    fetchChambersData();
  }, [fetchChambersData]);

  // Handlers
  const handlePageChange = (newPage) => setPage(newPage);
  const handleAddClick = () => { setSelectedChamber(null); setIsModalOpen(true); };
  const handleEditClick = (chamber) => { setSelectedChamber(chamber); setIsModalOpen(true); };
  const handleDeleteClick = (chamber) => { setChamberToDelete(chamber); setIsDeleteModalOpen(true); };

  const confirmDelete = async () => {
    if (!chamberToDelete) return;
    setIsDeleting(true);

    try {
      await removeChamber(chamberToDelete._id);
      setIsDeleteModalOpen(false);
      setChamberToDelete(null);
      fetchChambersData();
    } catch (err) {
      alert(`Error deleting: ${err}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-base-100 dark:bg-casual-black min-h-screen font-primary text-casual-black dark:text-concrete transition-colors">

      <SectionTitle
        title="Chamber List"
        subtitle="Manage your doctor chambers and schedules."
        rightElement={
          <button
            onClick={handleAddClick}
            className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-concrete border-none w-full md:w-auto font-secondary flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <HiPlus className="text-xl" />
            Add New Chamber
          </button>
        }
      />

      {/* Loading State */}
      {chambersLoading && (
        <div className="flex justify-center items-center py-20">
          <span className="loading loading-spinner loading-lg text-sporty-blue"></span>
        </div>
      )}

      {/* Error State */}
      {chambersError && !chambersLoading && (
        <div className="alert alert-error bg-fascinating-magenta/10 text-fascinating-magenta border border-fascinating-magenta/20 shadow-sm mb-6 rounded-box">
          <div className="flex items-center gap-2">
            <HiTrash className="h-6 w-6" />
            <div>
              <h3 className="font-bold font-secondary">Error retrieving data</h3>
              <div className="text-xs">{chambersError}</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!chambersLoading && !chambersError && chambers.length === 0 && (
        <div className="bg-concrete dark:bg-white/5 p-16 rounded-3xl text-center shadow-sm border border-casual-black/5 dark:border-white/10 transition-colors flex flex-col items-center justify-center">
          <div className="h-24 w-24 bg-sporty-blue/5 rounded-full flex items-center justify-center mb-6">
            <HiBuildingOffice className="h-12 w-12 text-sporty-blue/40" />
          </div>
          <h3 className="text-2xl font-bold font-secondary text-casual-black dark:text-concrete mb-2">No chambers found</h3>
          <p className="text-casual-black/60 dark:text-concrete/60 max-w-sm">
            You haven't added any chambers yet. Click the add button to create your first one.
          </p>
        </div>
      )}

      {/* Data Cards Grid */}
      {!chambersLoading && !chambersError && chambers.length > 0 && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {chambers.map((chamber) => (
              <div
                key={chamber._id}
                className="card bg-base-100 dark:bg-[#1a1a1a] border border-casual-black/10 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden relative group"
              >
                {/* Top Accent Gradient Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sporty-blue to-fascinating-magenta opacity-70 group-hover:opacity-100 transition-opacity"></div>

                <div className="card-body p-6 flex-1 flex flex-col gap-5">

                  {/* Card Header: Name */}
                  <div>
                    <h2 className="card-title text-xl font-bold text-casual-black dark:text-concrete font-secondary leading-tight line-clamp-2 group-hover:text-sporty-blue transition-colors">
                      {chamber.chamberName || 'Unnamed Chamber'}
                    </h2>
                  </div>

                  {/* Card Body: Info */}
                  <div className="flex flex-col gap-3.5 text-sm text-casual-black/70 dark:text-concrete/70">

                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-sporty-blue/10 text-sporty-blue rounded-lg shrink-0 mt-0.5">
                        <HiMapPin className="h-4 w-4" />
                      </div>
                      <span className="line-clamp-2 pt-1">{chamber.address || 'No address provided'}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-sporty-blue/10 text-sporty-blue rounded-lg shrink-0">
                        <HiPhone className="h-4 w-4" />
                      </div>
                      <span className="font-medium pt-0.5">{chamber.mobileNumber || '-'}</span>
                    </div>

                    {/* Fees Section */}
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg shrink-0">
                        <HiBanknotes className="h-4 w-4" />
                      </div>
                      <span className="pt-0.5 flex items-center gap-2 flex-wrap">
                        <span>New: <strong className="text-casual-black dark:text-concrete">{chamber.consultancyFee ? `৳${chamber.consultancyFee}` : 'N/A'}</strong></span>
                        {chamber.oldConsultancyFee && (
                          <span className="text-xs border-l border-casual-black/20 dark:border-concrete/20 pl-2">
                            Old: <strong className="text-casual-black dark:text-concrete">৳{chamber.oldConsultancyFee}</strong>
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Follow Up Section */}
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg shrink-0">
                        <HiArrowPath className="h-4 w-4" />
                      </div>
                      <span className="pt-0.5">
                        Follow-up: <strong className="text-casual-black dark:text-concrete">{chamber.followUpDay ? `Within ${chamber.followUpDay} Days` : 'N/A'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-fascinating-magenta/10 text-fascinating-magenta rounded-lg shrink-0">
                        <HiCalendarDays className="h-4 w-4" />
                      </div>
                      <span className="pt-0.5">
                        Adv. Booking: <strong className="text-casual-black dark:text-concrete">{chamber.advanceBookingDays ? `${chamber.advanceBookingDays} Days` : 'N/A'}</strong>
                      </span>
                    </div>

                    {/* --- Newly Added: Max Patients Section --- */}
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg shrink-0">
                        <HiUsers className="h-4 w-4" />
                      </div>
                      <span className="pt-0.5">
                        Max Patients/Day: <strong className="text-casual-black dark:text-concrete">{chamber.maxDailyPatient ? chamber.maxDailyPatient : 'N/A'}</strong>
                      </span>
                    </div>
                    {/* ----------------------------------------- */}

                    {/* Styled Description Box */}
                    {chamber.description && (
                      <div className="bg-casual-black/5 dark:bg-white/5 p-3.5 rounded-xl border border-casual-black/5 dark:border-white/5 mt-1">
                        <div className="flex items-start gap-2.5">
                          <HiInformationCircle className="h-4 w-4 mt-0.5 text-casual-black/40 dark:text-concrete/40 shrink-0" />
                          <span className="text-xs italic leading-relaxed line-clamp-3 text-casual-black/60 dark:text-concrete/60">
                            {chamber.description}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Schedule Section */}
                  <div className="mt-auto pt-5 border-t border-dashed border-casual-black/10 dark:border-white/10">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-casual-black/40 dark:text-concrete/40 mb-3 flex items-center gap-1.5">
                      <HiClock className="h-4 w-4" />
                      Weekly Schedule
                    </h4>

                    <div className="space-y-2 text-xs">
                      {chamber.schedule && chamber.schedule.length > 0 ? (
                        chamber.schedule.map((s) => (
                          <div key={s._id || s.day} className="flex justify-between items-center py-1">
                            <span className="font-medium text-casual-black/80 dark:text-concrete/80 w-24">
                              {s.day}
                            </span>

                            <div className="flex-1 text-right">
                              {s.isHoliday ? (
                                <span className="text-fascinating-magenta/90 font-bold bg-fascinating-magenta/10 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider">
                                  Holiday
                                </span>
                              ) : s.startTime && s.endTime ? (
                                <span className="text-sporty-blue/90 font-bold bg-sporty-blue/10 px-2.5 py-1 rounded-md tracking-wide">
                                  {s.startTime} - {s.endTime}
                                </span>
                              ) : (
                                <span className="text-casual-black/30 dark:text-concrete/30 font-medium bg-casual-black/5 dark:bg-white/5 px-2.5 py-1 rounded-md">
                                  Not Set
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-2 bg-casual-black/5 dark:bg-white/5 rounded-lg text-casual-black/50 dark:text-concrete/50 italic">
                          No schedule configured
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="card-actions justify-between items-center mt-2 pt-5 border-t border-casual-black/5 dark:border-white/5">
                    <button
                      onClick={() => handleEditClick(chamber)}
                      className="btn btn-sm bg-sporty-blue/10 hover:bg-sporty-blue text-sporty-blue hover:text-white border-none flex-1 gap-2 font-secondary transition-all"
                    >
                      <HiPencilSquare className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(chamber)}
                      className="btn btn-sm bg-fascinating-magenta/10 hover:bg-fascinating-magenta text-fascinating-magenta hover:text-white border-none flex-1 gap-2 font-secondary transition-all"
                    >
                      <HiTrash className="h-4 w-4" />
                      Delete
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Pagination Container */}
          {paginationData.totalPages > 1 && (
            <div className="flex justify-center md:justify-end mt-6 bg-base-100 dark:bg-[#1a1a1a] p-4 rounded-box border border-casual-black/10 dark:border-white/10 shadow-sm transition-colors">
              <Pagination
                currentPage={paginationData.currentPage}
                totalPages={paginationData.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      <ChamberFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        chamber={selectedChamber}
        onSuccess={fetchChambersData}
        currentBranch={branch}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={chamberToDelete?.chamberName || 'this chamber'}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default DoctorChamber;