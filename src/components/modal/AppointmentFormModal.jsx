import React, { useState, useEffect, useContext } from 'react';
import { HiXMark, HiMagnifyingGlass, HiExclamationTriangle, HiInformationCircle, HiCalendarDays } from 'react-icons/hi2';
import useAppointment from '../../Hook/useAppointment';
import useChamber from '../../Hook/useChamber';
import usePatient from '../../Hook/usePatient';
import { AuthContext } from '../../providers/AuthProvider';
import dayjs from 'dayjs';

// Helper function to add minutes to a HH:mm time string
const addMinutesToTime = (timeStr, minsToAdd) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    return dayjs().hour(hours).minute(minutes).add(minsToAdd, 'minute').format('HH:mm');
};

const AppointmentFormModal = ({ isOpen, onClose, appointment, onSuccess, currentBranch }) => {
    const { chamber: authChamber } = useContext(AuthContext);

    const { createAppointment, updateAppointment, getAppointmentsByBranch, loading } = useAppointment();
    const { getChambersByBranch } = useChamber();
    const { getPatientsByBranch } = usePatient();

    const [chambers, setChambers] = useState([]);

    // Advanced/Capacity States
    const [selectedChamberDetails, setSelectedChamberDetails] = useState(null);
    const [bookedCount, setBookedCount] = useState(0);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [isHoliday, setIsHoliday] = useState(false);

    // Helper to get today's date in YYYY-MM-DD format
    const getTodayDate = () => dayjs().format('YYYY-MM-DD');

    // Helper to format an incoming date to DD/MM/YYYY
    const formatToDDMMYYYY = (dateString) => {
        if (!dateString) return '';
        try {
            return dayjs(dateString).format('DD/MM/YYYY');
        } catch (e) {
            return '';
        }
    };

    // Patient Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [formData, setFormData] = useState({
        patientId: null,
        phone: '',
        fullName: '',
        email: '',
        dateOfBirth: '',
        age: '',
        gender: 'Male',
        bloodGroup: '',
        address: '',
        chamberId: '',
        appointmentDate: getTodayDate(),
        appointmentTime: '',
        patientType: 'New Patient',
    });

    useEffect(() => {
        if (isOpen && currentBranch) {
            fetchChambers();
        }
        if (appointment) {
            setFormData({
                patientId: appointment.patientId?._id || null,
                phone: appointment.patientId?.phone || '',
                fullName: appointment.patientId?.fullName || '',
                email: appointment.patientId?.email || '',
                dateOfBirth: formatToDDMMYYYY(appointment.patientId?.dateOfBirth),
                age: appointment.patientId?.age || '',
                gender: appointment.patientId?.gender || 'Male',
                bloodGroup: appointment.patientId?.bloodGroup || '',
                address: appointment.patientId?.address || '',
                chamberId: appointment.chamberId?._id || appointment.chamberId || '',
                appointmentDate: appointment.appointmentDate ? dayjs(appointment.appointmentDate).format('YYYY-MM-DD') : getTodayDate(),
                appointmentTime: appointment.appointmentTime || '',
                patientType: appointment.patientType || 'New Patient',
            });
        } else {
            resetForm();
        }
    }, [isOpen, appointment, currentBranch]);

    const fetchChambers = async () => {
        try {
            const res = await getChambersByBranch(currentBranch, { limit: 100 });
            if (res && res.data) {
                setChambers(res.data);
                if (!appointment) {
                    const defaultChamberId = authChamber?._id || authChamber || (res.data.length > 0 ? res.data[0]._id : '');
                    setFormData(prev => ({ ...prev, chamberId: defaultChamberId }));
                }
            }
        } catch (error) {
            console.error("Error fetching chambers", error);
        }
    };

    // Auto-Time Mapping (+10 mins) & Capacity Checking
    useEffect(() => {
        const updateTimeAndCheckAvailability = async () => {
            if (!formData.chamberId || !formData.appointmentDate || !chambers.length) return;

            const chamber = chambers.find(c => c._id === formData.chamberId);
            setSelectedChamberDetails(chamber);

            const dateObj = dayjs(formData.appointmentDate);
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const dayName = days[dateObj.day()];
            const todaySchedule = chamber?.schedule?.find(s => s.day === dayName);

            if (todaySchedule?.isHoliday) {
                setIsHoliday(true);
                if (!appointment) setFormData(prev => ({ ...prev, appointmentTime: '' }));
                return;
            }

            setIsHoliday(false);
            setCheckingAvailability(true);

            try {
                // Fetch existing appointments for this date to determine the latest time
                const res = await getAppointmentsByBranch(currentBranch, {
                    chamberId: formData.chamberId,
                    date: formData.appointmentDate,
                    limit: 100 // Fetch enough to find the latest
                });

                const existingAppts = res?.data || [];
                setBookedCount(res?.pagination?.totalItems || existingAppts.length);

                if (!appointment) {
                    let nextTime = todaySchedule?.startTime || "09:00";

                    if (existingAppts.length > 0) {
                        // Extract times, sort them to find the latest
                        const times = existingAppts
                            .map(a => a.appointmentTime)
                            .filter(Boolean)
                            .sort();

                        if (times.length > 0) {
                            const latestTime = times[times.length - 1];
                            nextTime = addMinutesToTime(latestTime, 10); // Add 10 mins to the last booked appt
                        }
                    }
                    setFormData(prev => ({ ...prev, appointmentTime: nextTime }));
                }
            } catch (error) {
                console.error("Failed to fetch availability", error);
            } finally {
                setCheckingAvailability(false);
            }
        };

        if (isOpen) {
            updateTimeAndCheckAvailability();
        }
    }, [formData.chamberId, formData.appointmentDate, chambers, currentBranch, appointment, isOpen]);

    const resetForm = () => {
        setFormData({
            patientId: null,
            phone: '',
            fullName: '',
            email: '',
            dateOfBirth: '',
            age: '',
            gender: 'Male',
            bloodGroup: '',
            address: '',
            chamberId: authChamber?._id || authChamber || (chambers.length > 0 ? chambers[0]._id : ''),
            appointmentDate: getTodayDate(),
            appointmentTime: '',
            patientType: 'New Patient',
        });
        setSearchQuery('');
        setSearchResults([]);
        setShowDropdown(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if ((name === 'phone' || name === 'fullName') && formData.patientId) {
            setFormData(prev => ({ ...prev, patientId: null, patientType: 'New Patient' }));
        }

        // Automatic Dynamic Search when 10th digit of phone is inputted
        if (name === 'phone' && !appointment) {
            const digitCount = value.replace(/\D/g, '').length;
            if (digitCount === 10) {
                setSearchQuery(value); // Mirrors search to top bar
                setIsSearching(true);
                getPatientsByBranch(currentBranch, { search: value, limit: 5 })
                    .then(res => {
                        if (res && res.data && res.data.length > 0) {
                            setSearchResults(res.data);
                            setShowDropdown(true);
                        }
                    })
                    .catch(err => console.error("Search failed", err))
                    .finally(() => setIsSearching(false));
            }
        }
    };

    // Auto-formatting mask for Date of Birth (DD/MM/YYYY) with Auto-Slash
    const handleDobChange = (e) => {
        const input = e.target.value;
        let val = input.replace(/\D/g, ''); // Remove all non-digits
        if (val.length > 8) val = val.substring(0, 8);

        let formatted = val;
        if (val.length >= 5) {
            formatted = `${val.substring(0, 2)}/${val.substring(2, 4)}/${val.substring(4, 8)}`;
        } else if (val.length >= 3) {
            formatted = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
            // Auto append 2nd slash if moving forward
            if (val.length === 4 && input.length > formData.dateOfBirth.length) {
                formatted += '/';
            }
        } else if (val.length >= 1) {
            formatted = val;
            // Auto append 1st slash if moving forward
            if (val.length === 2 && input.length > formData.dateOfBirth.length) {
                formatted += '/';
            }
        } else {
            formatted = '';
        }

        setFormData(prev => ({ ...prev, dateOfBirth: formatted }));

        // Unlink patient if manually editing
        if (formData.patientId) {
            setFormData(prev => ({ ...prev, patientId: null, patientType: 'New Patient' }));
        }
    };

    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 2) {
            setIsSearching(true);
            try {
                const res = await getPatientsByBranch(currentBranch, { search: query, limit: 5 });
                if (res && res.data) {
                    setSearchResults(res.data);
                    setShowDropdown(true);
                }
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
            setShowDropdown(false);
        }
    };

    const handleSelectPatient = (patient) => {
        setFormData(prev => ({
            ...prev,
            patientId: patient._id,
            phone: patient.phone || '',
            fullName: patient.fullName || '',
            email: patient.email || '',
            dateOfBirth: formatToDDMMYYYY(patient.dateOfBirth),
            age: patient.age || '',
            gender: patient.gender || 'Male',
            bloodGroup: patient.bloodGroup || '',
            address: patient.address || '',
            patientType: 'Old Patient',
        }));
        setSearchQuery('');
        setShowDropdown(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const basePayload = {
            chamberId: formData.chamberId,
            appointmentDate: formData.appointmentDate,
            appointmentTime: formData.appointmentTime,
            patientType: formData.patientType,
            branch: currentBranch
        };

        try {
            if (appointment) {
                // UPDATE SINGLE APPOINTMENT
                const payload = { ...basePayload };
                if (formData.patientId) {
                    payload.patientId = formData.patientId;
                } else {
                    payload.patientDetails = {
                        fullName: formData.fullName,
                        email: formData.email,
                        phone: formData.phone,
                        dateOfBirth: formData.dateOfBirth || undefined,
                        age: formData.age || undefined,
                        gender: formData.gender,
                        bloodGroup: formData.bloodGroup || undefined,
                        address: formData.address,
                    };
                }
                await updateAppointment(appointment._id, payload);
            } else {
                // CREATE APPOINTMENT
                const payload = { ...basePayload };
                if (formData.patientId) {
                    payload.patientId = formData.patientId;
                } else {
                    payload.patientDetails = {
                        fullName: formData.fullName,
                        email: formData.email,
                        phone: formData.phone,
                        dateOfBirth: formData.dateOfBirth || undefined,
                        age: formData.age || undefined,
                        gender: formData.gender,
                        bloodGroup: formData.bloodGroup || undefined,
                        address: formData.address,
                    };
                }
                await createAppointment(payload);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Submission error:", error);
            alert("Failed to save appointment. Please check the data.");
        }
    };

    if (!isOpen) return null;

    // Derived Capacity Variables
    const maxAllowed = selectedChamberDetails?.maxDailyPatient || 0;
    const isUnlimited = maxAllowed === 0;
    const availableSlots = isUnlimited ? Infinity : Math.max(0, maxAllowed - bookedCount);
    const isFull = !isUnlimited && availableSlots < 1;

    // Prevent Save conditions
    const isSubmitDisabled = loading || isFull || isHoliday || checkingAvailability;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-casual-black/50 backdrop-blur-sm p-4">
            <div className="bg-base-100 dark:bg-[#1a1a1a] w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-casual-black/10 dark:border-white/10">
                    <h2 className="text-2xl font-bold font-secondary text-casual-black dark:text-concrete">
                        {appointment ? 'Edit Appointment' : 'Create Appointment'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-casual-black/5 dark:hover:bg-white/5 rounded-full transition-colors self-start">
                        <HiXMark className="w-6 h-6 text-casual-black/60 dark:text-concrete/60" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">

                    {/* Status/Warning Banners */}
                    {isHoliday && (
                        <div className="alert alert-warning shadow-sm py-2 mb-4 bg-yellow-50 text-yellow-800 border-yellow-200">
                            <HiExclamationTriangle className="w-5 h-5" />
                            <span>The selected chamber is closed on this date (Holiday).</span>
                        </div>
                    )}
                    {isFull && (
                        <div className="alert alert-error shadow-sm py-2 mb-4 bg-red-50 text-red-800 border-red-200">
                            <HiExclamationTriangle className="w-5 h-5" />
                            <span>Chamber capacity reached for this date. Cannot book more.</span>
                        </div>
                    )}
                    {!isFull && !isUnlimited && !isHoliday && maxAllowed > 0 && (
                        <div className="alert alert-info shadow-sm py-2 mb-4 bg-blue-50 text-blue-800 border-blue-200">
                            <HiInformationCircle className="w-5 h-5" />
                            <span>Available Capacity: {availableSlots} slots remaining (Booked {bookedCount}/{maxAllowed}).</span>
                        </div>
                    )}

                    {/* Patient Search */}
                    {!appointment && (
                        <div className="mb-8 relative z-20">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <HiMagnifyingGlass className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search existing patient by Phone Number or Name..."
                                    className="input input-bordered w-full pl-10 bg-blue-50/30 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 focus:border-[#008080]"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                                {isSearching && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <span className="loading loading-spinner loading-sm text-[#008080]"></span>
                                    </div>
                                )}
                            </div>

                            {showDropdown && searchResults.length > 0 && (
                                <ul className="absolute z-30 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {searchResults.map(patient => (
                                        <li
                                            key={patient._id}
                                            className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                                            onClick={() => handleSelectPatient(patient)}
                                        >
                                            <div className="font-semibold text-gray-800 dark:text-gray-200">{patient.fullName}</div>
                                            <div className="text-xs text-gray-500 flex gap-3 mt-1">
                                                <span>📱 {patient.phone}</span>
                                                <span>🩸 {patient.bloodGroup || 'N/A'}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <form id="appointment-form" onSubmit={handleSubmit} className="space-y-8">

                        {/* PATIENT INFO SECTION */}
                        <section>
                            <h3 className="text-lg font-bold font-secondary text-[#008080] border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                                Patient Information
                                {formData.patientId && <span className="ml-3 badge badge-sm bg-blue-100 text-blue-800 border-none">Existing Patient Linked</span>}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">Full Name*</span></label>
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Enter patient full name" className="input input-bordered w-full bg-transparent" />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">Phone Number*</span></label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+8801XXXXXXXXX" className="input input-bordered w-full bg-transparent" />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">Email</span></label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="patient@example.com" className="input input-bordered w-full bg-transparent" />
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">Date of Birth</span></label>
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleDobChange}
                                            placeholder="DD/MM/YYYY"
                                            className="input input-bordered w-full bg-transparent pr-10"
                                            maxLength="10"
                                        />
                                        {/* Invisible date input strictly for opening the native picker dropdown */}
                                        <input
                                            type="date"
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    const [y, m, d] = e.target.value.split('-');
                                                    setFormData(prev => ({ ...prev, dateOfBirth: `${d}/${m}/${y}` }));
                                                    if (formData.patientId) {
                                                        setFormData(prev => ({ ...prev, patientId: null, patientType: 'New Patient' }));
                                                    }
                                                }
                                            }}
                                            className="absolute right-0 top-0 w-10 h-full opacity-0 cursor-pointer z-10"
                                            title="Select Date"
                                        />
                                        <HiCalendarDays className="absolute right-3 text-gray-500 z-0 pointer-events-none" size={20} />
                                    </div>
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">Age</span></label>
                                    <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Years" className="input input-bordered w-full bg-transparent" min="0" />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">Gender*</span></label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} required className="select select-bordered w-full bg-transparent">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">Blood Group</span></label>
                                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="select select-bordered w-full bg-transparent">
                                        <option value="">Select</option>
                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-control md:col-span-2">
                                    <label className="label"><span className="label-text font-medium">Address</span></label>
                                    <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="e.g., Mirpur DOHS, Dhaka, Bangladesh" className="input input-bordered w-full bg-transparent" />
                                </div>
                            </div>
                        </section>

                        {/* CHAMBER & TIME SECTION */}
                        <section>
                            <h3 className="text-lg font-bold font-secondary text-[#008080] border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                                Appointment Configuration
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">Chamber*</span></label>
                                    <select name="chamberId" value={formData.chamberId} onChange={handleChange} required className="select select-bordered w-full bg-transparent">
                                        <option value="" disabled>Select Chamber</option>
                                        {chambers.map(ch => (
                                            <option key={ch._id} value={ch._id}>{ch.chamberName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">Appointment Date*</span></label>
                                    <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleChange} required className="input input-bordered w-full bg-transparent" />
                                </div>
                                <div className="form-control relative">
                                    <label className="label">
                                        <span className="label-text font-medium">Time* (Auto-set +10m)</span>
                                    </label>
                                    <input type="time" name="appointmentTime" value={formData.appointmentTime} onChange={handleChange} required className="input input-bordered w-full bg-transparent" />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-medium">Patient Type*</span></label>
                                    <select name="patientType" value={formData.patientType} onChange={handleChange} required className="select select-bordered w-full bg-transparent">
                                        <option value="New Patient">New Patient</option>
                                        <option value="Old Patient">Old Patient</option>
                                        <option value="Report">Report</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-casual-black/10 dark:border-white/10 bg-casual-black/5 dark:bg-white/5 flex justify-end gap-3 z-10">
                    <button type="button" onClick={onClose} className="btn btn-ghost border border-gray-300 dark:border-gray-600">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="appointment-form"
                        disabled={isSubmitDisabled}
                        className="btn bg-[#008080] hover:bg-[#006666] text-white border-none px-8 disabled:bg-gray-400 disabled:text-gray-200"
                    >
                        {loading || checkingAvailability ? (
                            <span className="loading loading-spinner"></span>
                        ) : (
                            appointment ? 'Save Changes' : 'Create Appointment'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentFormModal;