// pages/DepartmentList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { HiPlus, HiPencilSquare, HiTrash, HiMagnifyingGlass } from "react-icons/hi2";
import useLabTestDept from '../../Hook/useLabTestDept';
import LabTestDeptFormModal from '../../components/modal/LabTestDeptFormModal';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import Pagination from '../../components/common/Pagination';
import SectionTitle from '../../components/common/SectionTitle';

const DepartmentList = () => {
  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  
  // Data State
  const [departments, setDepartments] = useState([]);
  const [paginationData, setPaginationData] = useState({ currentPage: 1, totalPages: 1 });

  // Hook Destructuring
  const { getPaginatedLabTestDepts, removeLabTestDept, loading: deptsLoading, error: deptsError } = useLabTestDept();

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Departments
  const fetchDepartmentsData = useCallback(async () => {
    try {
      const response = await getPaginatedLabTestDepts({
        page,
        limit,
        search: searchTerm || undefined
      });
      
      if (response && response.success) {
        setDepartments(response.data || []);
        setPaginationData({
          currentPage: response.pagination?.currentPage || 1,
          totalPages: response.pagination?.totalPages || 1,
        });
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  }, [page, limit, searchTerm, getPaginatedLabTestDepts]);

  useEffect(() => {
    fetchDepartmentsData();
  }, [fetchDepartmentsData]);

  // Handlers
  const handlePageChange = (newPage) => setPage(newPage);
  const handleAddClick = () => { setSelectedDepartment(null); setIsModalOpen(true); };
  const handleEditClick = (department) => { setSelectedDepartment(department); setIsModalOpen(true); };
  const handleDeleteClick = (department) => { setDepartmentToDelete(department); setIsDeleteModalOpen(true); };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); 
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;
    setIsDeleting(true);
    
    try {
      await removeLabTestDept(departmentToDelete._id);
      setIsDeleteModalOpen(false);
      setDepartmentToDelete(null);
      fetchDepartmentsData(); 
    } catch (err) {
      alert(`Error deleting: ${err}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-base-100 dark:bg-casual-black min-h-screen font-primary text-casual-black dark:text-concrete transition-colors">
      
      <SectionTitle 
        title="Lab Test Departments" 
        subtitle="Manage categories and departments for laboratory tests."
        rightElement={
          <button 
            onClick={handleAddClick}
            className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-concrete border-none w-full md:w-auto font-secondary flex items-center gap-2"
          >
            <HiPlus className="text-xl" />
            Add New Department
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
            placeholder="Search department name..." 
            className="input input-bordered w-full pl-10 bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue dark:focus:border-sporty-blue focus:outline-none transition-colors" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Clear Filters */}
        {searchTerm && (
          <button 
            onClick={() => { setSearchTerm(''); setPage(1); }}
            className="btn btn-ghost text-fascinating-magenta hover:bg-fascinating-magenta/10 w-full md:w-auto font-secondary"
          >
            Clear
          </button>
        )}
      </div>
      
      {/* Loading State */}
      {deptsLoading && (
        <div className="flex justify-center items-center py-20">
          <span className="loading loading-spinner loading-lg text-sporty-blue"></span>
        </div>
      )}
      
      {/* Error State */}
      {deptsError && !deptsLoading && (
        <div className="alert alert-error bg-fascinating-magenta/10 text-fascinating-magenta border border-fascinating-magenta/20 shadow-sm mb-6">
          <div className="flex items-center gap-2">
            <HiTrash className="h-6 w-6" />
            <div>
              <h3 className="font-bold font-secondary">Error retrieving data</h3>
              <div className="text-xs">{deptsError}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {!deptsLoading && !deptsError && departments.length === 0 && (
        <div className="bg-concrete dark:bg-white/5 p-12 rounded-box text-center shadow-sm border border-casual-black/5 dark:border-white/10 transition-colors">
          <p className="text-casual-black/70 dark:text-concrete/70 text-lg font-medium font-secondary">No departments found.</p>
          {searchTerm && (
            <p className="text-sm text-casual-black/50 dark:text-concrete/50 mt-2">Try adjusting your search query.</p>
          )}
        </div>
      )}

      {/* Data Table */}
      {!deptsLoading && !deptsError && departments.length > 0 && (
        <div className="bg-concrete dark:bg-[#1a1a1a] rounded-box shadow-sm overflow-hidden border border-casual-black/5 dark:border-white/10 transition-colors">
          <div className="overflow-x-auto">
            {/* Removed 'table-zebra' to fix dark mode clash */}
            <table className="table w-full text-casual-black dark:text-concrete">
              <thead className="bg-casual-black/5 dark:bg-white/5 text-casual-black dark:text-concrete font-secondary transition-colors">
                <tr>
                  <th className="pl-6">Department Name</th>
                  <th className="text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, index) => (
                  <tr 
                    key={dept._id} 
                    // Manually applying alternating background colors that respect dark mode
                    className={`transition-colors border-b-casual-black/5 dark:border-b-white/5 border-b 
                      ${index % 2 === 0 ? 'bg-transparent' : 'bg-casual-black/5 dark:bg-white/5'}
                      hover:bg-casual-black/10 dark:hover:bg-white/10`}
                  >
                    <td className="pl-6">
                      <span className="font-medium">{dept.departmentName || '-'}</span>
                    </td>
                    <td className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEditClick(dept)} 
                          className="btn btn-sm btn-ghost text-sporty-blue hover:bg-sporty-blue/10 hover:text-sporty-blue" 
                          title="Edit"
                        >
                          <HiPencilSquare className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(dept)} 
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

      <LabTestDeptFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        department={selectedDepartment} 
        onSuccess={fetchDepartmentsData} 
      />
      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={confirmDelete} 
        itemName={departmentToDelete?.departmentName || 'this department'} 
        isDeleting={isDeleting} 
      />
    </div>
  );
};

export default DepartmentList;