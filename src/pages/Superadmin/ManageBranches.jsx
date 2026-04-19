import React, { useState, useEffect, useCallback } from 'react';
import { HiPlus, HiPencilSquare, HiTrash, HiMagnifyingGlass } from "react-icons/hi2";
import Swal from 'sweetalert2';
import useDoctorProfile from '../../Hook/useDoctorProfile';
import DoctorProfileFormModal from '../../components/DoctorProfile/DoctorProfileFormModal';
import Pagination from '../../components/common/Pagination';
import SectionTitle from '../../components/common/SectionTitle';

const ManageBranches = () => {
  // Filters & Pagination State
  const [selectedBranch, setSelectedBranch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  // Data State
  const [profiles, setProfiles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [paginationData, setPaginationData] = useState({ currentPage: 1, totalPages: 1 });

  // Hook Destructuring
  const {
    getPaginatedProfiles,
    getProfilesByBranch,
    getBranchDoctorNames,
    removeProfile,
    loading: profilesLoading,
    error: profilesError
  } = useDoctorProfile();

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Fetch Available Branches for Filter
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await getBranchDoctorNames();
        const rawData = response?.data || response || [];

        if (Array.isArray(rawData)) {
          // Extract unique branches
          const uniqueBranches = [...new Set(rawData.map((item) => item.branch).filter(Boolean))];
          setBranches(uniqueBranches);
        }
      } catch (err) {
        console.error("Failed to fetch branches:", err);
      }
    };
    fetchBranches();
  }, [getBranchDoctorNames]);

  // Fetch Doctor Profiles / Branches
  const fetchProfilesData = useCallback(async () => {
    try {
      let response;
      // If a branch is selected, use the branch specific endpoint, otherwise use general pagination
      if (selectedBranch) {
        response = await getProfilesByBranch(selectedBranch, { page, limit });
      } else {
        response = await getPaginatedProfiles({
          page,
          limit,
          search: searchTerm || undefined
        });
      }

      if (response && response.success) {
        setProfiles(response.data || []);
        setPaginationData({
          currentPage: response.pagination?.currentPage || 1,
          totalPages: response.pagination?.totalPages || 1,
        });
      }
    } catch (err) {
      console.error("Failed to fetch profiles:", err);
    }
  }, [page, limit, selectedBranch, searchTerm, getPaginatedProfiles, getProfilesByBranch]);

  useEffect(() => {
    fetchProfilesData();
  }, [fetchProfilesData]);

  // Handlers
  const handlePageChange = (newPage) => setPage(newPage);
  const handleAddClick = () => { setSelectedProfile(null); setIsModalOpen(true); };
  const handleEditClick = (profile) => { setSelectedProfile(profile); setIsModalOpen(true); };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedBranch(''); // Reset branch filter if searching globally
    setPage(1);
  };

  const handleBranchFilterChange = (e) => {
    setSelectedBranch(e.target.value);
    setSearchTerm(''); // Reset search if filtering by branch
    setPage(1);
  };

  // SweetAlert2 Delete Confirmation
  const handleDeleteClick = (profile) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${profile.name} from branch ${profile.branch}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await removeProfile(profile._id);
          Swal.fire(
            'Deleted!',
            'The profile has been successfully deleted.',
            'success'
          );
          fetchProfilesData();
        } catch (err) {
          Swal.fire(
            'Error!',
            err || 'An error occurred while deleting the profile.',
            'error'
          );
        }
      }
    });
  };

  return (
    <div className="p-4 md:p-6 bg-base-100 dark:bg-casual-black min-h-screen font-primary text-casual-black dark:text-concrete transition-colors">

      <SectionTitle
        title="Manage Branches & Doctors"
        subtitle="View and manage branch profiles, doctor assignments, and contact info."
        rightElement={
          <button
            onClick={handleAddClick}
            className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-concrete border-none w-full md:w-auto font-secondary flex items-center gap-2"
          >
            <HiPlus className="text-xl" />
            Add Profile / Branch
          </button>
        }
      />

      {/* Filtering Toolbar */}
      <div className="bg-concrete dark:bg-white/5 p-4 rounded-box shadow-sm mb-6 flex flex-col md:flex-row items-center gap-4 border border-casual-black/5 dark:border-white/10 transition-colors">

        {/* Search */}
        <div className="form-control w-full md:w-auto md:flex-1 max-w-sm relative">
          <HiMagnifyingGlass className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-casual-black/50 dark:text-concrete/50" />
          <input
            type="text"
            placeholder="Search by name, phone, email, BMDC..."
            className="input input-bordered w-full pl-10 bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue dark:focus:border-sporty-blue focus:outline-none transition-colors"
            value={searchTerm}
            onChange={handleSearchChange}
            disabled={!!selectedBranch}
          />
        </div>

        {/* Branch Filter Dropdown */}
        <div className="form-control w-full md:w-48">
          {branches.length === 0 ? (
            <select disabled className="select select-bordered w-full bg-base-100 dark:bg-casual-black text-casual-black/40 dark:text-concrete/40 border-casual-black/20 dark:border-concrete/20 transition-colors">
              <option>No Branches</option>
            </select>
          ) : (
            <select
              className="select select-bordered w-full bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue focus:outline-none transition-colors"
              value={selectedBranch}
              onChange={handleBranchFilterChange}
            >
              <option value="">All Branches</option>
              {branches.map((branchName, index) => (
                <option key={index} value={branchName}>{branchName}</option>
              ))}
            </select>
          )}
        </div>

        {/* Clear Filters */}
        {(selectedBranch || searchTerm) && (
          <button
            onClick={() => { setSelectedBranch(''); setSearchTerm(''); setPage(1); }}
            className="btn btn-ghost text-fascinating-magenta hover:bg-fascinating-magenta/10 w-full md:w-auto font-secondary"
          >
            Clear
          </button>
        )}
      </div>

      {/* Loading State */}
      {profilesLoading && (
        <div className="flex justify-center items-center py-20">
          <span className="loading loading-spinner loading-lg text-sporty-blue"></span>
        </div>
      )}

      {/* Error State */}
      {profilesError && !profilesLoading && (
        <div className="alert alert-error bg-fascinating-magenta/10 text-fascinating-magenta border border-fascinating-magenta/20 shadow-sm mb-6">
          <div className="flex items-center gap-2">
            <HiTrash className="h-6 w-6" />
            <div>
              <h3 className="font-bold font-secondary">Error retrieving data</h3>
              <div className="text-xs">{profilesError}</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!profilesLoading && !profilesError && profiles.length === 0 && (
        <div className="bg-concrete dark:bg-white/5 p-12 rounded-box text-center shadow-sm border border-casual-black/5 dark:border-white/10 transition-colors">
          <p className="text-casual-black/70 dark:text-concrete/70 text-lg font-medium font-secondary">No profiles found.</p>
          {(selectedBranch || searchTerm) && (
            <p className="text-sm text-casual-black/50 dark:text-concrete/50 mt-2">Try adjusting your search or filters.</p>
          )}
        </div>
      )}

      {/* Data Table */}
      {!profilesLoading && !profilesError && profiles.length > 0 && (
        <div className="bg-concrete dark:bg-[#1a1a1a] rounded-box shadow-sm overflow-hidden border border-casual-black/5 dark:border-white/10 transition-colors">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-casual-black dark:text-concrete">
              <thead className="bg-casual-black/5 dark:bg-white/5 text-casual-black dark:text-concrete font-secondary transition-colors">
                <tr>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>BMDC Reg No.</th>
                  <th>Designation</th>
                  <th>Contact Info</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile._id} className="hover:bg-casual-black/5 dark:hover:bg-white/5 transition-colors border-b-casual-black/5 dark:border-b-white/5 border-b">
                    <td>
                      <div className="font-medium">{profile.name}</div>
                      <div className="text-xs text-casual-black/60 dark:text-concrete/60">{profile.degree}</div>
                    </td>
                    <td><span className="badge badge-outline border-sporty-blue text-sporty-blue">{profile.branch}</span></td>
                    <td>{profile.bmdcRegistrationNumber}</td>
                    <td>{profile.designation} <br /><span className="text-xs opacity-70">{profile.institution}</span></td>
                    <td>
                      <div className="text-sm">{profile.phone || '-'}</div>
                      <div className="text-xs opacity-70">{profile.email || '-'}</div>
                    </td>
                    <td className="text-center">
                      <div className="join">
                        <button
                          onClick={() => handleEditClick(profile)}
                          className="btn btn-sm btn-ghost join-item text-sporty-blue hover:bg-sporty-blue/10 hover:text-sporty-blue"
                          title="Edit"
                        >
                          <HiPencilSquare className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(profile)}
                          className="btn btn-sm btn-ghost join-item text-fascinating-magenta hover:bg-fascinating-magenta/10 hover:text-fascinating-magenta"
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

          <div className="p-4 border-t border-casual-black/5 dark:border-white/10 bg-base-100 dark:bg-transparent transition-colors">
            <Pagination
              currentPage={paginationData.currentPage}
              totalPages={paginationData.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}

      <DoctorProfileFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profile={selectedProfile}
        onSuccess={fetchProfilesData}
        branches={branches}
      />
    </div>
  );
};

export default ManageBranches;