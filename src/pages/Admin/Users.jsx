import React, { useState, useEffect, useCallback, useContext } from 'react';
import { HiPlus, HiPencilSquare, HiTrash, HiMagnifyingGlass, HiCheck, HiClock, HiDocumentText, HiKey } from "react-icons/hi2";
import { useUser } from '../../Hook/useUser';
import { AuthContext } from '../../providers/AuthProvider';
import BranchUserFormModal from '../../components/modal/BranchUserFormModal';
import BranchPasswordResetModal from '../../components/modal/BranchPasswordResetModal';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import SectionTitle from '../../components/common/SectionTitle';
import OfflineWarning from '../../components/common/offlineComponent';

const ROLES = ["Compounders", "Assistants", "Doctor"];

const Users = () => {
  // Context
  const { branch } = useContext(AuthContext);

  // Filters State (Frontend filtering since backend route /user/branch/:branch doesn't accept query params)
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Data State
  const [users, setUsers] = useState([]);

  // Hook Destructuring
  const { getUserByBranch, deleteUser, loading: usersLoading, error: usersError } = useUser();

  // Modals States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
   const [isOnline, setIsOnline] = useState(navigator.onLine);


   useEffect(() => {
    // Functions to update the state
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listen for changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup listeners when the component unmounts
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [userForPasswordReset, setUserForPasswordReset] = useState(null);

  // Fetch Users by Context Branch
  const fetchBranchUsers = useCallback(async () => {
    if (!branch) return;
    try {
      const response = await getUserByBranch(branch);
      if (response) {
        setUsers(response);
      }
    } catch (err) {
      console.error("Failed to fetch branch users:", err);
    }
  }, [branch, getUserByBranch]);

  useEffect(() => {
    fetchBranchUsers();
  }, [fetchBranchUsers]);

  // Frontend Filtering Logic
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (user.name?.toLowerCase().includes(searchLower)) ||
      (user.email?.toLowerCase().includes(searchLower)) ||
      (user.phone?.includes(searchTerm));

    const matchesRole = roleFilter ? user.role === roleFilter : true;

    return matchesSearch && matchesRole;
  });

  // Handlers
  const handleAddClick = () => { setSelectedUser(null); setIsFormModalOpen(true); };
  const handleEditClick = (user) => { setSelectedUser(user); setIsFormModalOpen(true); };
  const handleDeleteClick = (user) => { setUserToDelete(user); setIsDeleteModalOpen(true); };
  const handlePasswordResetClick = (user) => { setUserForPasswordReset(user); setIsPasswordModalOpen(true); };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);

    try {
      await deleteUser(userToDelete._id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchBranchUsers();
    } catch (err) {
      alert(err || "Error deleting user");
    } finally {
      setIsDeleting(false);
    }
  };

      if (!isOnline) {
    return <OfflineWarning />;
  }

  // Helper to render status
  const renderStatusBadge = (status) => {
    const s = status?.toLowerCase() || 'active';

    let config = {
      className: "bg-casual-black/10 dark:bg-white/10 text-casual-black dark:text-concrete",
      icon: null,
      label: s
    };

    if (s === 'active') {
      config = {
        className: "bg-earls-green/20 dark:bg-earls-green/30 text-earls-green",
        icon: <HiCheck className="h-3 w-3" />,
        label: "active"
      };
    } else if (s === 'on-leave') {
      config = {
        className: "bg-sporty-blue/20 dark:bg-sporty-blue/30 text-sporty-blue",
        icon: <HiClock className="h-3 w-3" />,
        label: "on-leave"
      };
    } else if (s === 'inactive') {
      config = {
        className: "bg-fascinating-magenta/20 dark:bg-fascinating-magenta/30 text-fascinating-magenta",
        icon: <HiDocumentText className="h-3 w-3" />,
        label: "inactive"
      };
    }

    return (
      <div className={`badge badge-sm gap-1 border-none ${config.className}`}>
        {config.icon}
        <span className="text-[10px] uppercase font-bold tracking-wider">{config.label}</span>
      </div>
    );
  };


  return (
    <div className="p-4 md:p-6 bg-base-100 dark:bg-casual-black min-h-screen font-primary text-casual-black dark:text-concrete transition-colors">

      <SectionTitle
        title="Manage Users"
        subtitle="Manage users specific to your branch."
        rightElement={
          <button
            onClick={handleAddClick}
            disabled={!branch}
            className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-concrete border-none w-full md:w-auto font-secondary flex items-center gap-2"
          >
            <HiPlus className="text-xl" />
            Add Branch User
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
            placeholder="Search email, name or phone..."
            className="input input-bordered w-full pl-10 bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue dark:focus:border-sporty-blue focus:outline-none transition-colors"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Role Dropdown */}
        <div className="form-control w-full md:w-48">
          <select
            className="select select-bordered w-full bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue focus:outline-none transition-colors"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {(searchTerm || roleFilter) && (
          <button
            onClick={() => { setSearchTerm(''); setRoleFilter(''); }}
            className="btn btn-ghost text-fascinating-magenta hover:bg-fascinating-magenta/10 w-full md:w-auto font-secondary"
          >
            Clear
          </button>
        )}
      </div>

      {/* Loading State */}
      {usersLoading && (
        <div className="flex justify-center items-center py-20">
          <span className="loading loading-spinner loading-lg text-sporty-blue"></span>
        </div>
      )}

      {/* Error State */}
      {usersError && !usersLoading && (
        <div className="alert alert-error bg-fascinating-magenta/10 text-fascinating-magenta border border-fascinating-magenta/20 shadow-sm mb-6">
          <div className="flex items-center gap-2">
            <HiTrash className="h-6 w-6" />
            <div>
              <h3 className="font-bold font-secondary">Error retrieving data</h3>
              <div className="text-xs">{usersError}</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!usersLoading && !usersError && filteredUsers.length === 0 && (
        <div className="bg-concrete dark:bg-white/5 p-12 rounded-box text-center shadow-sm border border-casual-black/5 dark:border-white/10 transition-colors">
          <p className="text-casual-black/70 dark:text-concrete/70 text-lg font-medium font-secondary">No users found in this branch.</p>
          {(searchTerm || roleFilter) && (
            <p className="text-sm text-casual-black/50 dark:text-concrete/50 mt-2">Try adjusting your search or filters.</p>
          )}
        </div>
      )}

      {/* Data Table */}
      {!usersLoading && !usersError && filteredUsers.length > 0 && (
        <div className="bg-concrete dark:bg-[#1a1a1a] rounded-box shadow-sm overflow-hidden border border-casual-black/5 dark:border-white/10 transition-colors">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-casual-black dark:text-concrete">
              <thead className="bg-casual-black/5 dark:bg-white/5 text-casual-black dark:text-concrete font-secondary transition-colors">
                <tr>
                  <th>Name</th>
                  <th>Contact Info</th>
                  <th>Role</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-casual-black/5 dark:hover:bg-white/5 transition-colors border-b-casual-black/5 dark:border-b-white/5 border-b">
                    <td>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 font-medium">
                        <span>{user.name}</span>
                        {renderStatusBadge(user.status)}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col text-sm">
                        <span className="opacity-80">{user.email}</span>
                        <span className="opacity-60 text-xs">{user.phone}</span>
                      </div>
                    </td>
                    <td>{user.role}</td>
                    <td className="text-center">
                      <div className="join">
                        <button
                          onClick={() => handlePasswordResetClick(user)}
                          className="btn btn-sm btn-ghost join-item text-earls-green hover:bg-earls-green/10 hover:text-earls-green"
                          title="Reset Password"
                        >
                          <HiKey className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditClick(user)}
                          className="btn btn-sm btn-ghost join-item text-sporty-blue hover:bg-sporty-blue/10 hover:text-sporty-blue"
                          title="Edit"
                        >
                          <HiPencilSquare className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
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
        </div>
      )}

      {/* Modals */}
      {isFormModalOpen && (
        <BranchUserFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          user={selectedUser}
          currentBranch={branch}
          onSuccess={fetchBranchUsers}
        />
      )}

      {isPasswordModalOpen && (
        <BranchPasswordResetModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          user={userForPasswordReset}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          itemName={userToDelete?.name || 'this branch user'}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default Users;