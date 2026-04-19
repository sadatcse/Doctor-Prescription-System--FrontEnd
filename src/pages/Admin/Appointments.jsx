import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    HiPlus,
    HiPencilSquare,
    HiTrash,
    HiEye,
    HiCalendarDays,
    HiDocumentText
} from "react-icons/hi2";
import { useNavigate } from 'react-router-dom'; // 👈 ADD THIS IMPORT
import dayjs from 'dayjs';
import useAppointment from '../../Hook/useAppointment';
import useChamber from '../../Hook/useChamber';
import AppointmentFormModal from '../../components/modal/AppointmentFormModal';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import Pagination from '../../components/common/Pagination';
import AppointmentBlockModal from '../../components/modal/AppointmentBlockModal';
import SectionTitle from '../../components/common/SectionTitle';
import AppointmentViewModal from '../../components/modal/AppointmentViewModal';
import { AuthContext } from '../../providers/AuthProvider';
import Swal from 'sweetalert2';

const Appointments = () => {
    // Helper to get today's date in YYYY-MM-DD format for the date input
    const getTodayDateString = () => {
        return dayjs().format('YYYY-MM-DD');
    };

    const navigate = useNavigate(); // 👈 INIT NAVIGATE

    // Pagination & Config State
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const { branch, chamber: authChamber } = useContext(AuthContext);

    // Data State
    const [appointments, setAppointments] = useState([]);
    const [chambers, setChambers] = useState([]);
    const [paginationData, setPaginationData] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState(getTodayDateString()); // Defaults to today
    const [selectedChamberFilter, setSelectedChamberFilter] = useState(authChamber?._id || authChamber || "");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedGender, setSelectedGender] = useState("");
    const [selectedPatientType, setSelectedPatientType] = useState("");
    const [selectedIsPrescription, setSelectedIsPrescription] = useState("");
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [appointmentToDelete, setAppointmentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewAppointmentId, setViewAppointmentId] = useState(null);

    // Time Block Modal State
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

    // Hooks - Ensure getAppointmentById is destructured here
    const { 
        getAppointmentsByBranch, 
        removeAppointment, 
        updateAppointment, 
        getAppointmentById, // 👈 MAKE SURE THIS IS HERE
        loading: appointmentsLoading 
    } = useAppointment();
    const { getChambersByBranch } = useChamber();

    // Setup Search Debounce (waits 500ms after user stops typing)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Reset to page 1 when other filters change
    useEffect(() => {
        setPage(1);
    }, [selectedDate, selectedChamberFilter, selectedStatus, selectedGender, selectedPatientType, selectedIsPrescription, selectedPaymentStatus]);

    const fetchDropdownData = useCallback(async () => {
        if (!branch) return;
        try {
            const chamberRes = await getChambersByBranch(branch, { limit: 100 });
            if (chamberRes?.data) setChambers(chamberRes.data);
        } catch (err) {
            console.error("Failed to fetch dropdown dependencies:", err);
        }
    }, [branch, getChambersByBranch]);

    const fetchAppointmentsData = useCallback(async () => {
        if (!branch) return;
        try {
            const params = { page, limit };

            // Attach active filters
            if (debouncedSearchQuery) params.search = debouncedSearchQuery;
            if (selectedDate) params.date = selectedDate;
            if (selectedChamberFilter) params.chamberId = selectedChamberFilter;
            if (selectedStatus) params.status = selectedStatus;
            if (selectedGender) params.gender = selectedGender;
            if (selectedPatientType) params.patientType = selectedPatientType;
            if (selectedIsPrescription) params.isPrescription = selectedIsPrescription;
            if (selectedPaymentStatus) params.paymentStatus = selectedPaymentStatus;

            const response = await getAppointmentsByBranch(branch, params);

            if (response && response.success) {
                setAppointments(response.data || []);
                setPaginationData({
                    currentPage: response.pagination?.currentPage || 1,
                    totalPages: response.pagination?.totalPages || 1,
                    totalItems: response.pagination?.totalItems || 0
                });
            }
        } catch (err) {
            console.error("Failed to fetch appointments:", err);
        }
    }, [page, limit, branch, debouncedSearchQuery, selectedDate, selectedChamberFilter, selectedStatus, selectedGender, selectedPatientType, selectedIsPrescription, selectedPaymentStatus, getAppointmentsByBranch]);

    useEffect(() => {
        fetchDropdownData();
    }, [fetchDropdownData]);

    useEffect(() => {
        fetchAppointmentsData();
    }, [fetchAppointmentsData]);

    // Handlers
    const handlePageChange = (newPage) => setPage(newPage);
    const handleAddClick = () => { setSelectedAppointment(null); setIsModalOpen(true); };
    const handleEditClick = (appointment) => { setSelectedAppointment(appointment); setIsModalOpen(true); };
    const handleDeleteClick = (appointment) => { setAppointmentToDelete(appointment); setIsDeleteModalOpen(true); };
    const handleViewClick = (appointment) => { setViewAppointmentId(appointment._id); setIsViewModalOpen(true); };

    // 👇 UPDATED PRESCRIPTION CLICK FUNCTION 👇
    const handlePrescriptionClick = async (appointment) => {
        try {
            // Fetch the full appointment details (including preCheckup data)
            const fullAppointmentData = await getAppointmentById(appointment._id);
            
            // Navigate to the create prescription page and pass the data in state
            navigate('/create-prescription', { 
                state: { appointmentData: fullAppointmentData } 
            });
        } catch (error) {
            console.error("Failed to fetch full appointment data for prescription", error);
            Swal.fire('Error', 'Could not load appointment details.', 'error');
        }
    };
    // 👆 -------------------------------------- 👆

    const handleUpdatePayment = async (id, status) => {
        Swal.fire({
            title: 'Confirm Payment',
            text: "Are you sure you want to mark this appointment as Collected?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10b981', // green / accent
            cancelButtonColor: '#ef4444', // red
            confirmButtonText: 'Yes, collect it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await updateAppointment(id, { paymentStatus: status });
                    fetchAppointmentsData();
                    Swal.fire({
                        title: 'Collected!',
                        text: 'Payment has been successfully recorded.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } catch (err) {
                    Swal.fire('Error!', `Error updating payment: ${err}`, 'error');
                }
            }
        });
    };

    const handleUpdatePrescription = async (id, status) => {
        try {
            await updateAppointment(id, { isPrescription: status });
            fetchAppointmentsData();
        } catch (err) {
            alert(`Error updating prescription: ${err}`);
        }
    };

    const confirmDelete = async () => {
        if (!appointmentToDelete) return;
        setIsDeleting(true);
        try {
            await removeAppointment(appointmentToDelete._id);
            setIsDeleteModalOpen(false);
            setAppointmentToDelete(null);
            fetchAppointmentsData();
        } catch (err) {
            alert(`Error deleting: ${err}`);
        } finally {
            setIsDeleting(false);
        }
    };

    // New handleCollectPayment function
    const handleCollectPayment = async (appointmentId) => {
        try {
            await updateAppointment(appointmentId, { paymentStatus: "Collect" });
            fetchAppointmentsData(); // Refresh the table to show updated status
        } catch (err) {
            alert(`Error updating payment status: ${err}`);
        }
    };

    return (
        <div className="p-4 md:p-6 bg-base-100 dark:bg-casual-black min-h-screen font-primary text-casual-black dark:text-concrete transition-colors">

            <SectionTitle
                title="Appointment Management"
                subtitle={`View and manage all patient appointments (${paginationData.totalItems} total appointments)`}
                rightElement={
                    <button
                        onClick={handleAddClick}
                        className="btn bg-sporty-blue hover:bg-sporty-blue/80 text-white border-none font-secondary flex items-center gap-2 shadow-sm"
                    >
                        <HiPlus className="text-lg" />
                        New Appointment
                    </button>
                }
            />

            {/* Date/Time Blocking Management Section */}
            <div className="bg-sporty-blue/10 dark:bg-sporty-blue/20 border border-sporty-blue/20 dark:border-sporty-blue/30 rounded-xl p-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <HiCalendarDays className="text-sporty-blue text-xl" />
                        <h3 className="font-semibold text-casual-black dark:text-concrete">Date & Time Blocking</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Block off specific time ranges for chambers and doctors so appointments cannot be booked.
                    </p>
                </div>
                <button
                    onClick={() => setIsBlockModalOpen(true)}
                    className="btn btn-sm bg-sporty-blue hover:bg-sporty-blue/80 text-white border-none gap-2 whitespace-nowrap"
                >
                    <HiCalendarDays /> Manage Blocked Dates
                </button>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
                <select
                    className="select select-bordered select-sm w-full md:w-auto bg-transparent"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                >
                    <option value="">All Pre-Checkup Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                </select>

                <select
                    className="select select-bordered select-sm w-full md:w-auto bg-transparent"
                    value={selectedPatientType}
                    onChange={(e) => setSelectedPatientType(e.target.value)}
                >
                    <option value="">All Patient Types</option>
                    <option value="New Patient">New Patient</option>
                    <option value="Old Patient">Old Patient</option>
                    <option value="Report">Report</option>
                </select>

                <select
                    className="select select-bordered select-sm w-full md:w-auto bg-transparent"
                    value={selectedIsPrescription}
                    onChange={(e) => setSelectedIsPrescription(e.target.value)}
                >
                    <option value="">All Prescription</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>

                <select
                    className="select select-bordered select-sm w-full md:w-auto bg-transparent"
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                >
                    <option value="">All Payments</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Collect">Collected</option>
                </select>

                <select
                    className="select select-bordered select-sm w-full md:w-auto bg-transparent"
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>

                <select
                    className="select select-bordered select-sm w-full md:w-auto bg-transparent"
                    value={selectedChamberFilter}
                    onChange={(e) => setSelectedChamberFilter(e.target.value)}
                >
                    <option value="">All Chambers</option>
                    {chambers.map(ch => <option key={ch._id} value={ch._id}>{ch.chamberName}</option>)}
                </select>

                <div className="flex-1 min-w-[200px] flex gap-2">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="input input-bordered input-sm w-full max-w-xs bg-transparent"
                        title="Clear date to see all times" // Helpful tooltip
                    />
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Search patient name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input input-bordered input-sm w-full max-w-xs bg-transparent"
                />
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead className="bg-concrete text-casual-black">
                            <tr>
                                <th>Appointment ID</th>
                                <th>Serial</th>
                                <th>Patient Info</th>
                                <th>Phone</th>
                                <th>Type</th>
                                <th>Chamber</th>
                                <th>Appointment Date</th>
                                <th>Pre-Checkup</th>
                                <th>Prescription</th>
                                <th>Consultancy Fee</th>
                                <th>Payment Status</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointmentsLoading ? (
                                <tr>
                                    <td colSpan="12" className="text-center py-10">
                                        <span className="loading loading-spinner text-accent"></span>
                                    </td>
                                </tr>
                            ) : appointments.length === 0 ? (
                                <tr>
                                    <td colSpan="12" className="text-center py-10 text-gray-500">
                                        No appointments found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                appointments.map((appt) => (
                                    <tr key={appt._id} className="border-b border-casual-black/5 dark:border-white/5 hover:bg-casual-black/5 dark:hover:bg-white/5 transition-colors">
                                        <td className="font-medium text-sporty-blue">{appt.appointmentId}</td>
                                        <td className="text-sporty-blue font-medium">{appt.serial}</td>
                                        <td>
                                            <div className="font-medium">{appt.patientId?.fullName || '-'}</div>
                                            <div className="text-xs text-gray-500">{appt.patientId?.gender} | {appt.patientId?.age ? `${appt.patientId.age}y` : 'N/A'}</div>
                                        </td>
                                        <td>{appt.patientId?.phone || '-'}</td>
                                        <td>
                                            <span className="bg-sporty-blue text-white text-xs px-2 py-1 rounded">
                                                {appt.patientType === 'New Patient' ? 'New' : appt.patientType === 'Old Patient' ? 'Old' : 'Report'}
                                            </span>
                                        </td>
                                        <td className="text-gray-500 italic">{appt.chamberId?.chamberName || 'Default'}</td>
                                        <td>
                                            <div>{dayjs(appt.appointmentDate).format('MMM D, YYYY')}</div>
                                            <div className="text-xs text-gray-500">{appt.appointmentTime}</div>
                                        </td>
                                        <td>
                                            <span className={`px-2 py-1 rounded text-xs font-medium text-white ${appt.preCheckupId ? 'bg-accent' : 'bg-gray-500'}`}>
                                                {appt.preCheckupId ? 'Completed' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 whitespace-nowrap">
                                                <span className={`text-[10px] px-2 py-1 rounded uppercase tracking-wider text-white ${appt.isPrescription === 'Yes' ? 'bg-green-600' : 'bg-casual-black'}`}>
                                                    {appt.isPrescription === 'Yes' ? 'Done' : 'No'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-green-600 font-medium text-sm">৳{appt.chamberId?.consultancyFee || '0'}</td>

                                        {/* Updated Payment Status cell */}
                                        <td>
                                            <div className="flex items-center gap-2 whitespace-nowrap">
                                                <span className={`text-[10px] px-2 py-1 rounded uppercase tracking-wider text-white ${appt.paymentStatus === 'Collect' ? 'bg-green-600' : 'bg-casual-black'}`}>
                                                    {appt.paymentStatus === 'Collect' ? 'Collected' : 'Unpaid'}
                                                </span>
                                                {appt.paymentStatus !== 'Collect' && (
                                                    <button
                                                        onClick={() => handleUpdatePayment(appt._id, 'Collect')}
                                                        className="btn btn-xs btn-outline border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    >
                                                        Collect
                                                    </button>
                                                )}
                                            </div>
                                        </td>

                                        <td className="text-xs text-gray-500">
                                            {dayjs(appt.createdAt).format('MMM D, YYYY, h:mm A')}
                                        </td>
                                        <td>
                                            <div className="flex gap-1">
                                                 {/* New Prescription Button */}
                                                <button title="Create Prescription" onClick={() => handlePrescriptionClick(appt)} className="btn btn-xs btn-square bg-transparent border-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:border-gray-600">
                                                    <HiDocumentText className="text-blue-500" />
                                                </button>
                                                <button title="View" onClick={() => handleViewClick(appt)} className="btn btn-xs btn-square bg-transparent border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800">
                                                    <HiEye className="text-gray-600 dark:text-gray-300" />
                                                </button>
                                                <button title="Edit" onClick={() => handleEditClick(appt)} className="btn btn-xs btn-square bg-transparent border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800">
                                                    <HiPencilSquare className="text-gray-600 dark:text-gray-300" />
                                                </button>
                                               
                                                <button title="Delete" onClick={() => handleDeleteClick(appt)} className="btn btn-xs btn-square bg-transparent border-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-gray-600">
                                                    <HiTrash className="text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-white dark:bg-[#1a1a1a] border-t border-casual-black/5 dark:border-white/5 flex justify-between items-center text-sm text-gray-500">
                    <div>
                        Showing {(page - 1) * limit + 1 > paginationData.totalItems ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, paginationData.totalItems)} of {paginationData.totalItems} entries
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span>Rows per page</span>
                            <select
                                value={limit}
                                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                                className="select select-bordered select-xs bg-transparent"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        {paginationData.totalPages > 1 && (
                            <Pagination
                                currentPage={paginationData.currentPage}
                                totalPages={paginationData.totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                </div>
            </div>

            <AppointmentFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                appointment={selectedAppointment}
                onSuccess={fetchAppointmentsData}
                currentBranch={branch}
            />

            <AppointmentBlockModal
                isOpen={isBlockModalOpen}
                onClose={() => setIsBlockModalOpen(false)}
                chambers={chambers}
                currentBranch={branch}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                itemName={`Appointment ${appointmentToDelete?.appointmentId || ''}`}
                isDeleting={isDeleting}
            />

            <AppointmentViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                appointmentId={viewAppointmentId}
            />
        </div>
    );
};

export default Appointments;