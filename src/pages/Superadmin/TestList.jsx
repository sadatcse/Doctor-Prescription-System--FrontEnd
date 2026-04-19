// pages/TestList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { HiPlus, HiPencilSquare, HiTrash, HiMagnifyingGlass } from "react-icons/hi2";
import useLabtest from '../../Hook/useLabtest';
import useLabTestDept from '../../Hook/useLabTestDept';
import LabtestFormModal from '../../components/modal/LabtestFormModal';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import Pagination from '../../components/common/Pagination';
import SectionTitle from '../../components/common/SectionTitle';

const TestList = () => {
  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // ADDED: Status filter state
  const [limit] = useState(10);
  const [page, setPage] = useState(1);

  // Data State
  const [labtests, setLabtests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [paginationData, setPaginationData] = useState({ currentPage: 1, totalPages: 1 });

  // Hook Destructuring
  const { getPaginatedLabtests, removeLabtest, loading: testsLoading, error: testsError } = useLabtest();
  const { getPaginatedLabTestDepts } = useLabTestDept();

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLabtest, setSelectedLabtest] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [labtestToDelete, setLabtestToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Departments for Dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await getPaginatedLabTestDepts({ limit: 100 });
        if (response && response.success) {
          const deptNames = response.data.map(dept => dept.departmentName).filter(Boolean);
          setDepartments(deptNames);
        }
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      }
    };
    fetchDepartments();
  }, [getPaginatedLabTestDepts]);

  // Fetch Labtests
  const fetchLabtestsData = useCallback(async () => {
    try {
      const response = await getPaginatedLabtests({
        page,
        limit,
        search: searchTerm || undefined,
        department: departmentFilter || undefined,
        status: statusFilter || undefined // ADDED: Pass status to API
      });

      if (response && response.success) {
        setLabtests(response.data || []);
        setPaginationData({
          currentPage: response.pagination?.currentPage || 1,
          totalPages: response.pagination?.totalPages || 1,
        });
      }
    } catch (err) {
      console.error("Failed to fetch lab tests:", err);
    }
  }, [page, limit, searchTerm, departmentFilter, statusFilter, getPaginatedLabtests]); // ADDED: statusFilter to dependencies

  useEffect(() => {
    fetchLabtestsData();
  }, [fetchLabtestsData]);

  // Handlers
  const handlePageChange = (newPage) => setPage(newPage);
  const handleAddClick = () => { setSelectedLabtest(null); setIsModalOpen(true); };
  const handleEditClick = (labtest) => { setSelectedLabtest(labtest); setIsModalOpen(true); };
  const handleDeleteClick = (labtest) => { setLabtestToDelete(labtest); setIsDeleteModalOpen(true); };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!labtestToDelete) return;
    setIsDeleting(true);

    try {
      await removeLabtest(labtestToDelete._id);
      setIsDeleteModalOpen(false);
      setLabtestToDelete(null);
      fetchLabtestsData();
    } catch (err) {
      alert(`Error deleting: ${err}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper function for status badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success badge-sm text-white">Active</span>;
      case 'inactive':
        return <span className="badge badge-error badge-sm text-white">Inactive</span>;
      case 'pending':
      default:
        return <span className="badge badge-warning badge-sm text-white">Pending</span>;
    }
  };

  return (
    <div className="p-4 md:p-6 bg-base-100 dark:bg-casual-black min-h-screen font-primary text-casual-black dark:text-concrete transition-colors">

      <SectionTitle
        title="Lab Test List"
        subtitle="Manage your laboratory tests and departments."
        rightElement={
          <button
            onClick={handleAddClick}
            className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-concrete border-none w-full md:w-auto font-secondary flex items-center gap-2"
          >
            <HiPlus className="text-xl" />
            Add New Test
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
            placeholder="Search test name or department..."
            className="input input-bordered w-full pl-10 bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue dark:focus:border-sporty-blue focus:outline-none transition-colors"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Dynamic Department Dropdown */}
        <div className="form-control w-full md:w-48">
          {departments.length === 0 ? (
            <select disabled className="select select-bordered w-full bg-base-100 dark:bg-casual-black text-casual-black/40 dark:text-concrete/40 border-casual-black/20 dark:border-concrete/20 transition-colors">
              <option>No Departments</option>
            </select>
          ) : (
            <select
              className="select select-bordered w-full bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue focus:outline-none transition-colors"
              value={departmentFilter}
              onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Departments</option>
              {departments.map((deptName, index) => (
                <option key={index} value={deptName}>{deptName}</option>
              ))}
            </select>
          )}
        </div>

        {/* ADDED: Status Filter Dropdown */}
        <div className="form-control w-full md:w-40">
          <select
            className="select select-bordered w-full bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue focus:outline-none transition-colors"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(searchTerm || departmentFilter || statusFilter) && (
          <button
            onClick={() => { setSearchTerm(''); setDepartmentFilter(''); setStatusFilter(''); setPage(1); }}
            className="btn btn-ghost text-fascinating-magenta hover:bg-fascinating-magenta/10 w-full md:w-auto font-secondary"
          >
            Clear
          </button>
        )}
      </div>

      {/* Loading State */}
      {testsLoading && (
        <div className="flex justify-center items-center py-20">
          <span className="loading loading-spinner loading-lg text-sporty-blue"></span>
        </div>
      )}

      {/* Error State */}
      {testsError && !testsLoading && (
        <div className="alert alert-error bg-fascinating-magenta/10 text-fascinating-magenta border border-fascinating-magenta/20 shadow-sm mb-6">
          <div className="flex items-center gap-2">
            <HiTrash className="h-6 w-6" />
            <div>
              <h3 className="font-bold font-secondary">Error retrieving data</h3>
              <div className="text-xs">{testsError}</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!testsLoading && !testsError && labtests.length === 0 && (
        <div className="bg-concrete dark:bg-white/5 p-12 rounded-box text-center shadow-sm border border-casual-black/5 dark:border-white/10 transition-colors">
          <p className="text-casual-black/70 dark:text-concrete/70 text-lg font-medium font-secondary">No lab tests found.</p>
          {(searchTerm || departmentFilter || statusFilter) && (
            <p className="text-sm text-casual-black/50 dark:text-concrete/50 mt-2">Try adjusting your search or filters.</p>
          )}
        </div>
      )}

      {/* Data Table */}
      {!testsLoading && !testsError && labtests.length > 0 && (
        <div className="bg-concrete dark:bg-[#1a1a1a] rounded-box shadow-sm overflow-hidden border border-casual-black/5 dark:border-white/10 transition-colors">
          <div className="overflow-x-auto">
            <table className="table w-full text-casual-black dark:text-concrete">
              <thead className="bg-casual-black/5 dark:bg-white/5 text-casual-black dark:text-concrete font-secondary transition-colors">
                <tr>
                  <th className="pl-6">Test Name</th>
                  <th>Department</th>
                  <th>Status</th> {/* ADDED: Status Column */}
                  <th className="text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {labtests.map((test, index) => (
                  <tr
                    key={test._id}
                    className={`transition-colors border-b-casual-black/5 dark:border-b-white/5 border-b 
                      ${index % 2 === 0 ? 'bg-transparent' : 'bg-casual-black/5 dark:bg-white/5'}
                      hover:bg-casual-black/10 dark:hover:bg-white/10`}
                  >
                    <td className="pl-6">
                      <span className="font-medium">{test.testName || '-'}</span>
                    </td>
                    <td>{test.department || '-'}</td>
                    <td>{getStatusBadge(test.status)}</td> {/* ADDED: Status Badge */}
                    <td className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(test)}
                          className="btn btn-sm btn-ghost text-sporty-blue hover:bg-sporty-blue/10 hover:text-sporty-blue"
                          title="Edit"
                        >
                          <HiPencilSquare className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(test)}
                          className="btn btn-sm btn-ghost text-fascinating-magenta hover:bg-fascinating-magenta/10 hover:text-fascinating-magenta"
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

      <LabtestFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        labtest={selectedLabtest}
        onSuccess={fetchLabtestsData}
        departments={departments}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={labtestToDelete?.testName || 'this test'}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default TestList;