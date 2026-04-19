import React, { useState, useEffect, useCallback } from 'react';
import { HiPlus, HiPencilSquare, HiTrash, HiMagnifyingGlass, HiCheck, HiClock, HiDocumentText } from "react-icons/hi2";
import useMedicine from '../../Hook/useMedicine';
import useMedicineManufacturer from '../../Hook/useMedicineManufacturer';
import MedicineFormModal from '../../components/Medicine/MedicineFormModal';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import Pagination from '../../components/common/Pagination';
import SectionTitle from '../../components/common/SectionTitle';


const MedicineList = () => {
  // Filters & Pagination State
  const [selectedFilter, setSelectedFilter] = useState(''); // Manufacturer Filter
  const [statusFilter, setStatusFilter] = useState('');     // Status Filter (pending, draft, final)
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  
  // Data State
  const [medicines, setMedicines] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [paginationData, setPaginationData] = useState({ currentPage: 1, totalPages: 1 });

  // Hook Destructuring
  const { getPaginatedMedicines, removeMedicine, loading: medsLoading, error: medsError } = useMedicine();
  const { getAllMedicineManufacturers } = useMedicineManufacturer();

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Companies for Dropdown
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await getAllMedicineManufacturers({ limit: 100 });
        const rawData = response?.data?.data || response?.data || response || [];
        
        if (Array.isArray(rawData)) {
          const companyNames = rawData.map((manufacturer) => manufacturer.name).filter(Boolean);
          setCompanies(companyNames);
        }
      } catch (err) {
        console.error("Failed to fetch companies:", err);
      }
    };
    fetchCompanies();
  }, [getAllMedicineManufacturers]);

  // Fetch Medicines
  const fetchMedicinesData = useCallback(async () => {
    try {
      const response = await getPaginatedMedicines({
        page,
        limit,
        manufacturer: selectedFilter || undefined,
        status: statusFilter || undefined,
        search: searchTerm || undefined
      });
      
      if (response) {
        setMedicines(response.data || []);
        setPaginationData({
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
        });
      }
    } catch (err) {
      console.error("Failed to fetch medicines:", err);
    }
  }, [page, limit, selectedFilter, statusFilter, searchTerm, getPaginatedMedicines]);

  useEffect(() => {
    fetchMedicinesData();
  }, [fetchMedicinesData]);

  // Handlers
  const handlePageChange = (newPage) => setPage(newPage);
  const handleAddClick = () => { setSelectedMedicine(null); setIsModalOpen(true); };
  const handleEditClick = (medicine) => { setSelectedMedicine(medicine); setIsModalOpen(true); };
  const handleDeleteClick = (medicine) => { setMedicineToDelete(medicine); setIsDeleteModalOpen(true); };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); 
  };

  const confirmDelete = async () => {
    if (!medicineToDelete) return;
    setIsDeleting(true);
    
    try {
      await removeMedicine(medicineToDelete._id);
      setIsDeleteModalOpen(false);
      setMedicineToDelete(null);
      fetchMedicinesData(); 
    } catch (err) {
      alert(`Error deleting: ${err}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to render status based on Mongoose Enum
  const renderStatusBadge = (status) => {
    const s = status?.toLowerCase() || 'pending';
    
    let config = {
      className: "bg-casual-black/10 dark:bg-white/10 text-casual-black dark:text-concrete",
      icon: null,
      label: s
    };

    if (s === 'final') {
      config = {
        className: "bg-earls-green/20 dark:bg-earls-green/30 text-earls-green",
        icon: <HiCheck className="h-3 w-3" />,
        label: "final"
      };
    } else if (s === 'pending') {
      config = {
        className: "bg-fascinating-magenta/20 dark:bg-fascinating-magenta/30 text-fascinating-magenta",
        icon: <HiClock className="h-3 w-3" />,
        label: "pending"
      };
    } else if (s === 'draft') {
      config = {
        className: "bg-sporty-blue/20 dark:bg-sporty-blue/30 text-sporty-blue",
        icon: <HiDocumentText className="h-3 w-3" />,
        label: "draft"
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
        title="Medicine List" 
        subtitle="Manage your medicine inventory, manufacturers, and statuses."
        rightElement={
          <button 
            onClick={handleAddClick}
            className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-concrete border-none w-full md:w-auto font-secondary flex items-center gap-2"
          >
            <HiPlus className="text-xl" />
            Add New Medicine
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
            placeholder="Search generic or brand..." 
            className="input input-bordered w-full pl-10 bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue dark:focus:border-sporty-blue focus:outline-none transition-colors" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Status Dropdown */}
        <div className="form-control w-full md:w-48">
          <select 
            className="select select-bordered w-full bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue focus:outline-none transition-colors"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="final">Final</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Manufacturer Dropdown */}
        <div className="form-control w-full md:w-48">
          {companies.length === 0 ? (
             <select disabled className="select select-bordered w-full bg-base-100 dark:bg-casual-black text-casual-black/40 dark:text-concrete/40 border-casual-black/20 dark:border-concrete/20 transition-colors">
               <option>No Manufacturers</option>
             </select>
          ) : (
             <select 
               className="select select-bordered w-full bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue focus:outline-none transition-colors"
               value={selectedFilter}
               onChange={(e) => { setSelectedFilter(e.target.value); setPage(1); }}
             >
               <option value="">All Manufacturers</option>
               {companies.map((companyName, index) => (
                 <option key={index} value={companyName}>{companyName}</option>
               ))}
             </select>
          )}
        </div>

        {/* Clear Filters */}
        {(selectedFilter || searchTerm || statusFilter) && (
          <button 
            onClick={() => { setSelectedFilter(''); setSearchTerm(''); setStatusFilter(''); setPage(1); }}
            className="btn btn-ghost text-fascinating-magenta hover:bg-fascinating-magenta/10 w-full md:w-auto font-secondary"
          >
            Clear
          </button>
        )}
      </div>
      
      {/* Loading State */}
      {medsLoading && (
        <div className="flex justify-center items-center py-20">
          <span className="loading loading-spinner loading-lg text-sporty-blue"></span>
        </div>
      )}
      
      {/* Error State */}
      {medsError && !medsLoading && (
        <div className="alert alert-error bg-fascinating-magenta/10 text-fascinating-magenta border border-fascinating-magenta/20 shadow-sm mb-6">
          <div className="flex items-center gap-2">
            <HiTrash className="h-6 w-6" />
            <div>
              <h3 className="font-bold font-secondary">Error retrieving data</h3>
              <div className="text-xs">{medsError}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {!medsLoading && !medsError && medicines.length === 0 && (
        <div className="bg-concrete dark:bg-white/5 p-12 rounded-box text-center shadow-sm border border-casual-black/5 dark:border-white/10 transition-colors">
          <p className="text-casual-black/70 dark:text-concrete/70 text-lg font-medium font-secondary">No medicines found.</p>
          {(selectedFilter || searchTerm || statusFilter) && (
            <p className="text-sm text-casual-black/50 dark:text-concrete/50 mt-2">Try adjusting your search or filters.</p>
          )}
        </div>
      )}

      {/* Data Table */}
      {!medsLoading && !medsError && medicines.length > 0 && (
        <div className="bg-concrete dark:bg-[#1a1a1a] rounded-box shadow-sm overflow-hidden border border-casual-black/5 dark:border-white/10 transition-colors">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-casual-black dark:text-concrete">
              <thead className="bg-casual-black/5 dark:bg-white/5 text-casual-black dark:text-concrete font-secondary transition-colors">
                <tr>
                  <th>Brand Name</th>
                  <th>Generic Name</th>
                  <th>Manufacturer</th>
                  <th>Strength</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((med) => (
                  <tr key={med._id} className="hover:bg-casual-black/5 dark:hover:bg-white/5 transition-colors border-b-casual-black/5 dark:border-b-white/5 border-b">
                    <td>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 font-medium">
                        <span>{med.brandName || '-'}</span>
                        {renderStatusBadge(med.status)}
                      </div>
                    </td>
                    <td>{med.genericName || '-'}</td>
                    <td>{med.manufacturer || '-'}</td>
                    <td>{med.strength || '-'}</td>
                    <td className="text-center">
                      <div className="join">
                        <button 
                          onClick={() => handleEditClick(med)} 
                          className="btn btn-sm btn-ghost join-item text-sporty-blue hover:bg-sporty-blue/10 hover:text-sporty-blue" 
                          title="Edit"
                        >
                          <HiPencilSquare className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(med)} 
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

      <MedicineFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        medicine={selectedMedicine} 
        onSuccess={fetchMedicinesData} 
        companies={companies}  
      />
      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={confirmDelete} 
        itemName={medicineToDelete?.brandName || medicineToDelete?.genericName || 'this item'} 
        isDeleting={isDeleting} 
      />
    </div>
  );
};

export default MedicineList;