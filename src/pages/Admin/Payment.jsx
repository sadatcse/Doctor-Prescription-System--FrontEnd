import React, { useState, useEffect, useCallback, useContext } from 'react';
import { HiMagnifyingGlass, HiCurrencyDollar, HiCheckCircle, HiCalendarDays, HiUserPlus, HiUser, HiDocumentChartBar } from "react-icons/hi2";
import { AuthContext } from '../../providers/AuthProvider';
import useAppointment from '../../Hook/useAppointment';
import useChamber from '../../Hook/useChamber';
import Pagination from '../../components/common/Pagination';
import SectionTitle from '../../components/common/SectionTitle';
import dayjs from 'dayjs';
import OfflineWarning from '../../components/common/offlineComponent';

const Payment = () => {
    const { branch } = useContext(AuthContext);

    // Filters & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChamber, setSelectedChamber] = useState('');
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
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

    // Data State
    const [chambers, setChambers] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({ 
        todaysEarning: 0, monthlyEarning: 0, yearlyEarning: 0,
        newPatientCount: 0, oldPatientCount: 0, reportCount: 0 
    });
    const [paginationData, setPaginationData] = useState({ currentPage: 1, totalPages: 1 });

    // Hook Destructuring
    const { getAppointmentsByBranch, getPaymentStats, loading, error } = useAppointment();
    const { getChambersByBranch } = useChamber();

    // Fetch Chambers for Filter
    useEffect(() => {
        const fetchChambers = async () => {
            if (!branch) return;
            try {
                const res = await getChambersByBranch(branch);
                if (res?.success) {
                    setChambers(res.data);
                    if (res.data.length > 0) setSelectedChamber(res.data[0]._id);
                }
            } catch (err) {
                console.error("Failed to fetch chambers", err);
            }
        };
        fetchChambers();
    }, [branch, getChambersByBranch]);

    // Fetch Table Data & Stats
    const fetchData = useCallback(async () => {
        if (!branch) return;
        try {
            // 1. Fetch Stats
            const statsRes = await getPaymentStats(branch, {
                chamberId: selectedChamber || undefined,
                date: selectedDate || undefined
            });
            if (statsRes?.success) {
                setStats(statsRes.data);
            }

            // 2. Fetch Paginated List
            const apptRes = await getAppointmentsByBranch(branch, {
                page,
                limit,
                search: searchTerm || undefined,
                chamberId: selectedChamber || undefined,
                date: selectedDate || undefined,
                paymentStatus: 'Collect'
            });
            if (apptRes?.success) {
                setAppointments(apptRes.data || []);
                setPaginationData({
                    currentPage: apptRes.pagination?.currentPage || 1,
                    totalPages: apptRes.pagination?.totalPages || 1,
                });
            }
        } catch (err) {
            console.error("Failed to fetch payment data:", err);
        }
    }, [page, limit, searchTerm, selectedChamber, selectedDate, branch, getAppointmentsByBranch, getPaymentStats]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleChamberChange = (e) => {
        setSelectedChamber(e.target.value);
        setPage(1);
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        setPage(1);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT' }).format(amount || 0).replace('BDT', '৳');
    };

    const isToday = selectedDate === dayjs().format('YYYY-MM-DD');

    
          if (!isOnline) {
        return <OfflineWarning />;
      }

    return (
        <div className="p-4 md:p-6 bg-base-100 dark:bg-casual-black min-h-screen font-primary text-casual-black dark:text-concrete transition-colors">
            
            <SectionTitle
                title="Payments & Earnings"
                subtitle="Financial records and revenue tracking"
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-concrete dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-casual-black/5 dark:border-white/10 flex items-center gap-5 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-sporty-blue/10 dark:bg-sporty-blue/20 flex items-center justify-center text-sporty-blue shrink-0">
                        <HiCurrencyDollar className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-casual-black/60 dark:text-concrete/60 text-sm font-bold uppercase tracking-wider mb-1">
                            {isToday ? "Today's Earnings" : "Daily Earnings"}
                        </p>
                        <h3 className="text-3xl font-black text-casual-black dark:text-concrete">{formatCurrency(stats.todaysEarning)}</h3>
                    </div>
                </div>

                <div className="bg-concrete dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-casual-black/5 dark:border-white/10 flex items-center gap-5 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-blue-green/10 dark:bg-blue-green/20 flex items-center justify-center text-blue-green shrink-0">
                        <HiCheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-casual-black/60 dark:text-concrete/60 text-sm font-bold uppercase tracking-wider mb-1">Monthly Earnings</p>
                        <h3 className="text-3xl font-black text-casual-black dark:text-concrete">{formatCurrency(stats.monthlyEarning)}</h3>
                    </div>
                </div>

                <div className="bg-concrete dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-casual-black/5 dark:border-white/10 flex items-center gap-5 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-fascinating-magenta/10 dark:bg-fascinating-magenta/20 flex items-center justify-center text-fascinating-magenta shrink-0">
                        <HiCalendarDays className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-casual-black/60 dark:text-concrete/60 text-sm font-bold uppercase tracking-wider mb-1">Yearly Earnings</p>
                        <h3 className="text-3xl font-black text-casual-black dark:text-concrete">{formatCurrency(stats.yearlyEarning)}</h3>
                    </div>
                </div>
            </div>

            {/* Daily Visits Stats Grid */}
            <h3 className="text-sm font-bold text-casual-black/60 dark:text-concrete/60 uppercase tracking-wider mb-4 border-b border-casual-black/10 dark:border-white/10 pb-2">
                Daily Appointments Schedule ({isToday ? 'Today' : dayjs(selectedDate).format('MMM D, YYYY')})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-concrete dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-casual-black/5 dark:border-white/10 flex items-center gap-5 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-sporty-blue/10 dark:bg-sporty-blue/20 flex items-center justify-center text-sporty-blue shrink-0">
                        <HiUserPlus className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-casual-black/60 dark:text-concrete/60 text-sm font-bold uppercase tracking-wider mb-1">New Patients</p>
                        <h3 className="text-3xl font-black text-casual-black dark:text-concrete">{stats.newPatientCount || 0}</h3>
                    </div>
                </div>

                <div className="bg-concrete dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-casual-black/5 dark:border-white/10 flex items-center gap-5 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                        <HiUser className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-casual-black/60 dark:text-concrete/60 text-sm font-bold uppercase tracking-wider mb-1">Old Patients</p>
                        <h3 className="text-3xl font-black text-casual-black dark:text-concrete">{stats.oldPatientCount || 0}</h3>
                    </div>
                </div>

                <div className="bg-concrete dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-casual-black/5 dark:border-white/10 flex items-center gap-5 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-fascinating-magenta/10 dark:bg-fascinating-magenta/20 flex items-center justify-center text-fascinating-magenta shrink-0">
                        <HiDocumentChartBar className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-casual-black/60 dark:text-concrete/60 text-sm font-bold uppercase tracking-wider mb-1">Report Views</p>
                        <h3 className="text-3xl font-black text-casual-black dark:text-concrete">{stats.reportCount || 0}</h3>
                    </div>
                </div>
            </div>

            {/* Filtering Toolbar */}
            <div className="bg-concrete dark:bg-white/5 p-4 rounded-box shadow-sm mb-6 flex flex-col md:flex-row items-center gap-4 border border-casual-black/5 dark:border-white/10 transition-colors">
                <div className="form-control w-full md:w-auto md:flex-1 max-w-sm relative">
                    <HiMagnifyingGlass className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-casual-black/50 dark:text-concrete/50" />
                    <input
                        type="text"
                        placeholder="Search by ID, Phone..."
                        className="input input-bordered w-full pl-10 bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue focus:outline-none transition-colors"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                
                <div className="form-control w-full md:w-auto">
                    <select
                        className="select select-bordered w-full bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue focus:outline-none transition-colors max-w-[200px]"
                        value={selectedChamber}
                        onChange={handleChamberChange}
                    >
                        <option value="">All Chambers</option>
                        {chambers.map(chamber => (
                            <option key={chamber._id} value={chamber._id}>{chamber.chamberName}</option>
                        ))}
                    </select>
                </div>

                <div className="form-control w-full md:w-auto">
                    <input
                        type="date"
                        className="input input-bordered w-full bg-base-100 dark:bg-casual-black text-casual-black dark:text-concrete border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue focus:outline-none transition-colors"
                        value={selectedDate}
                        onChange={handleDateChange}
                    />
                </div>
            </div>

            {/* Loading & Error States */}
            {loading && !appointments.length && (
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
            {!loading && appointments.length === 0 ? (
                <div className="bg-concrete dark:bg-white/5 p-12 rounded-box text-center border border-casual-black/5 dark:border-white/10">
                    <p className="text-casual-black/70 dark:text-concrete/70 text-lg font-medium">No collected payments found for the selected criteria.</p>
                </div>
            ) : (
                !loading && (
                    <div className="bg-concrete dark:bg-[#1a1a1a] rounded-box shadow-sm overflow-hidden border border-casual-black/5 dark:border-white/10 transition-colors">
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full text-casual-black dark:text-concrete">
                                <thead className="bg-casual-black/5 dark:bg-white/5 text-casual-black dark:text-concrete font-secondary">
                                    <tr>
                                        <th>Date & ID</th>
                                        <th>Patient Details</th>
                                        <th>Chamber</th>
                                        <th>Type</th>
                                        <th className="text-right">Amount Collected</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((appt) => (
                                        <tr key={appt._id} className="hover:bg-casual-black/5 dark:hover:bg-white/5 transition-colors border-b border-b-casual-black/5 dark:border-b-white/5">
                                            <td>
                                                <div className="font-bold">{new Date(appt.appointmentDate).toLocaleDateString()}</div>
                                                <div className="text-xs opacity-50 bg-base-200 dark:bg-casual-black px-2 py-0.5 rounded mt-1 inline-block">ID: {appt.appointmentId}</div>
                                            </td>
                                            <td>
                                                <div className="font-bold">{appt.patientId?.fullName || 'Unknown'}</div>
                                                <div className="text-sm opacity-70">{appt.patientId?.phone || 'No Phone'}</div>
                                            </td>
                                            <td>
                                                <div className="font-medium text-sporty-blue">{appt.chamberId?.chamberName || 'N/A'}</div>
                                            </td>
                                            <td>
                                                <span className={`badge border-none font-bold text-xs py-2 px-3 ${
                                                    appt.patientType === 'New Patient' ? 'bg-sporty-blue/10 text-sporty-blue' :
                                                    appt.patientType === 'Old Patient' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-base-200/10 text-slate-500'
                                                }`}>
                                                    {appt.patientType}
                                                </span>
                                            </td>
                                            <td className="text-right">
                                                <div className="font-black text-lg text-blue-green">{formatCurrency(appt.amount)}</div>
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
                                onPageChange={(newPage) => setPage(newPage)}
                            />
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default Payment;
