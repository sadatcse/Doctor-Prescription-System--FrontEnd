import React, { useState } from 'react';
import { 
    HiUser, 
    HiBuildingOffice, 
    HiUsers, 
    HiClipboardDocumentCheck,
    HiChevronRight,
    HiChevronLeft,
    HiCheck,
    HiArrowPath,
    HiCalendarDays,
    HiCurrencyBangladeshi
} from "react-icons/hi2";
import { toast } from 'react-toastify';
import { useUser } from '../../Hook/useUser';
import useChamber from '../../Hook/useChamber';
import SectionTitle from '../../components/common/SectionTitle';

const DAYS_OF_WEEK = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const STATUSES = ["active", "inactive", "on-leave"];

export default function AccountWizard({ onComplete, onCancel, branches = [] }) {
    // Hooks
    const { createUser, loading: userLoading } = useUser();
    const { createChamber, loading: chamberLoading } = useChamber();

    // Wizard Step State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Global Wizard Data State
    const [formData, setFormData] = useState({
        doctor: {
            name: '', email: '', phone: '', password: '', branch: '', role: 'Doctor', status: 'active'
        },
        chamber: {
            chamberName: '', address: '', mobileNumber: '', description: '', 
            advanceBookingDays: 7, consultancyFee: '', oldConsultancyFee: '', 
            followUpDay: 0, maxDailyPatient: '', branch: '', 
            schedule: DAYS_OF_WEEK.map(day => ({ day, startTime: '', endTime: '', isHoliday: false }))
        },
        compounder: {
            name: '', email: '', phone: '', password: '', branch: '', role: 'Compounders', status: 'active' 
        }
    });

    const availableBranches = Array.from(new Set([...branches, formData.doctor.branch])).filter(Boolean);

    // --- Handlers ---
    const handleDoctorChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, doctor: { ...prev.doctor, [name]: value } };
            if (name === 'branch') {
                newData.chamber.branch = value;
                newData.compounder.branch = value;
            }
            return newData;
        });
    };

    const handleChamberChange = (e) => {
        setFormData(prev => ({ ...prev, chamber: { ...prev.chamber, [e.target.name]: e.target.value } }));
    };

    const handleChamberScheduleChange = (index, field, value) => {
        const updatedSchedule = [...formData.chamber.schedule];
        updatedSchedule[index][field] = value;
        setFormData(prev => ({ ...prev, chamber: { ...prev.chamber, schedule: updatedSchedule } }));
    };

    const handleCompounderChange = (e) => {
        setFormData(prev => ({ ...prev, compounder: { ...prev.compounder, [e.target.name]: e.target.value } }));
    };

    const generatePassword = (target) => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let generated = "";
        for (let i = 0; i < 12; i++) {
            generated += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, [target]: { ...prev[target], password: generated } }));
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    // --- Final Submission ---
    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            await createUser(formData.doctor);

            const cleanedSchedule = formData.chamber.schedule.filter(s => s.isHoliday || (s.startTime && s.endTime));
            const chamberPayload = {
                ...formData.chamber,
                schedule: cleanedSchedule
            };
            await createChamber(chamberPayload);

            await createUser(formData.compounder);

            toast.success("Account setup completed successfully!");
            if (onComplete) onComplete();
            
        } catch (error) {
            console.error("Wizard Submission Error:", error);
            toast.error(error.message || error || "Failed to complete account setup.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Step Renderers ---
    const renderStep1 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-2">
                <SectionTitle 
                    title="Doctor Profile" 
                    subtitle="Enter the primary credentials for the doctor." 
                />
            </div>
            
            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="form-control w-full">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Full Name *</span></label>
                        <input required type="text" name="name" value={formData.doctor.name} onChange={handleDoctorChange} className="input input-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] focus:ring-1 focus:ring-[#0891B2] w-full transition-all" placeholder="Dr. John Doe" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Email *</span></label>
                        <input required type="email" name="email" value={formData.doctor.email} onChange={handleDoctorChange} className="input input-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] focus:ring-1 focus:ring-[#0891B2] w-full transition-all" placeholder="doctor@example.com" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Phone *</span></label>
                        <input required type="text" name="phone" value={formData.doctor.phone} onChange={handleDoctorChange} className="input input-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] focus:ring-1 focus:ring-[#0891B2] w-full transition-all" placeholder="+880..." />
                    </div>
                    <div className="form-control w-full">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Branch Code (Type) *</span></label>
                        <input required type="text" name="branch" value={formData.doctor.branch} onChange={handleDoctorChange} className="input input-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] focus:ring-1 focus:ring-[#0891B2] w-full transition-all" placeholder="e.g. DHAKA-MAIN" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Status</span></label>
                        <select name="status" value={formData.doctor.status} onChange={handleDoctorChange} className="select select-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] focus:ring-1 focus:ring-[#0891B2] w-full transition-all">
                            {STATUSES.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
                        </select>
                    </div>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-semibold text-slate-700 dark:text-gray-300">Password *</span>
                            <button type="button" onClick={() => generatePassword('doctor')} className="label-text-alt text-[#0891B2] font-bold hover:underline flex items-center gap-1 transition-all">
                                <HiArrowPath /> Generate
                            </button>
                        </label>
                        <input required type="text" name="password" value={formData.doctor.password} onChange={handleDoctorChange} className="input input-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] focus:ring-1 focus:ring-[#0891B2] w-full font-mono text-[#0891B2] transition-all" placeholder="Secure password" />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-2">
                <SectionTitle 
                    title="Primary Chamber" 
                    subtitle="Configure the main clinic or hospital settings." 
                />
            </div>
            
            {/* General Info Card */}
            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/10">
                <h4 className="font-bold text-[#0891B2] mb-4 flex items-center gap-2"><HiBuildingOffice /> Basic Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Chamber Name *</span></label>
                        <input type="text" name="chamberName" value={formData.chamber.chamberName} onChange={handleChamberChange} className="input input-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] w-full" required />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Branch *</span></label>
                        <select name="branch" value={formData.chamber.branch} onChange={handleChamberChange} className="select select-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] w-full" required>
                            <option value="" disabled>Select Branch</option>
                            {availableBranches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Mobile Number *</span></label>
                        <input type="text" name="mobileNumber" value={formData.chamber.mobileNumber} onChange={handleChamberChange} className="input input-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] w-full" required />
                    </div>
                    <div className="form-control md:col-span-2">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Address *</span></label>
                        <textarea name="address" value={formData.chamber.address} onChange={handleChamberChange} className="textarea textarea-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] w-full h-16" required></textarea>
                    </div>
                    <div className="form-control md:col-span-2">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Description</span></label>
                        <textarea name="description" value={formData.chamber.description} onChange={handleChamberChange} className="textarea textarea-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] w-full h-16"></textarea>
                    </div>
                </div>
            </div>

            {/* Operations Card */}
            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/10">
                <h4 className="font-bold text-[#0891B2] mb-4 flex items-center gap-2"><HiCurrencyBangladeshi /> Financials & Operations</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">New Fee *</span></label>
                        <input type="number" name="consultancyFee" value={formData.chamber.consultancyFee} onChange={handleChamberChange} min="0" className="input input-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] w-full" required />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Old Fee</span></label>
                        <input type="number" name="oldConsultancyFee" value={formData.chamber.oldConsultancyFee} onChange={handleChamberChange} min="0" className="input input-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] w-full" />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Follow-up (Days)</span></label>
                        <input type="number" name="followUpDay" value={formData.chamber.followUpDay} onChange={handleChamberChange} min="0" className="input input-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] w-full" />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Adv. Booking</span></label>
                        <input type="number" name="advanceBookingDays" value={formData.chamber.advanceBookingDays} onChange={handleChamberChange} min="0" className="input input-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] w-full" />
                    </div>
                    <div className="form-control sm:col-span-2">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Max Daily Patients</span></label>
                        <input type="number" name="maxDailyPatient" value={formData.chamber.maxDailyPatient} onChange={handleChamberChange} min="0" className="input input-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] w-full" placeholder="0 = Unlimited" />
                    </div>
                </div>
            </div>

            {/* Weekly Schedule */}
            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/10">
                <h4 className="font-bold text-[#0891B2] mb-4 flex items-center gap-2"><HiCalendarDays /> Weekly Schedule</h4>
                <div className="space-y-3">
                    {formData.chamber.schedule.map((daySchedule, index) => (
                        <div key={daySchedule.day} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-200 ${daySchedule.isHoliday ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 opacity-75' : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:border-[#0891B2]/40'}`}>
                            <div className="w-full sm:w-32 font-bold text-slate-700 dark:text-gray-200 flex items-center gap-2">
                                {daySchedule.day}
                            </div>
                            
                            <div className="flex-1 flex items-center gap-3 w-full">
                                <input
                                    type="time"
                                    value={daySchedule.startTime}
                                    onChange={(e) => handleChamberScheduleChange(index, 'startTime', e.target.value)}
                                    disabled={daySchedule.isHoliday}
                                    className="input input-sm input-bordered w-full bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] dark:text-gray-200 disabled:opacity-50 transition-colors"
                                />
                                <span className="text-slate-400 font-bold">to</span>
                                <input
                                    type="time"
                                    value={daySchedule.endTime}
                                    onChange={(e) => handleChamberScheduleChange(index, 'endTime', e.target.value)}
                                    disabled={daySchedule.isHoliday}
                                    className="input input-sm input-bordered w-full bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] dark:text-gray-200 disabled:opacity-50 transition-colors"
                                />
                            </div>
                            
                            <div className="w-full sm:w-auto flex justify-end">
                                <label className="cursor-pointer flex items-center gap-2 bg-slate-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={daySchedule.isHoliday}
                                        onChange={(e) => handleChamberScheduleChange(index, 'isHoliday', e.target.checked)}
                                        className="checkbox checkbox-sm checkbox-error rounded"
                                    />
                                    <span className="text-sm font-semibold text-slate-600 dark:text-gray-300">Holiday</span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-2">
                <SectionTitle 
                    title="Compounder Account" 
                    subtitle="Create the initial assistant to manage the chamber." 
                />
            </div>
            
            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Full Name *</span></label>
                        <input required type="text" name="name" value={formData.compounder.name} onChange={handleCompounderChange} className="input input-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] w-full" placeholder="Assistant Name" />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Branch *</span></label>
                        <select name="branch" value={formData.compounder.branch} onChange={handleCompounderChange} className="select select-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] w-full" required>
                            <option value="" disabled>Select Branch</option>
                            {availableBranches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Email *</span></label>
                        <input required type="email" name="email" value={formData.compounder.email} onChange={handleCompounderChange} className="input input-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] w-full" placeholder="assistant@example.com" />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Phone *</span></label>
                        <input required type="text" name="phone" value={formData.compounder.phone} onChange={handleCompounderChange} className="input input-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] w-full" placeholder="Phone Number" />
                    </div>
                    <div className="form-control w-full">
                        <label className="label"><span className="label-text font-semibold text-slate-700 dark:text-gray-300">Status</span></label>
                        <select name="status" value={formData.compounder.status} onChange={handleCompounderChange} className="select select-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] w-full">
                            {STATUSES.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
                        </select>
                    </div>
                    <div className="form-control md:col-span-2">
                        <label className="label">
                            <span className="label-text font-semibold text-slate-700 dark:text-gray-300">Password *</span>
                            <button type="button" onClick={() => generatePassword('compounder')} className="label-text-alt text-[#0891B2] font-bold hover:underline flex items-center gap-1">
                                <HiArrowPath /> Generate
                            </button>
                        </label>
                        <input required type="text" name="password" value={formData.compounder.password} onChange={handleCompounderChange} className="input input-bordered bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:border-[#0891B2] w-full font-mono text-[#0891B2]" placeholder="Secure password" />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-8 flex flex-col items-center">
                <div className="w-20 h-20 bg-[#0891B2]/10 text-[#0891B2] rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <HiClipboardDocumentCheck className="w-10 h-10" />
                </div>
                <SectionTitle 
                    title="Review & Confirm" 
                    subtitle="Please verify the details before creating the accounts." 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Doctor Summary Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-t-4 border-[#0891B2] shadow-lg shadow-slate-200/50 dark:shadow-none border-x border-b border-slate-100 dark:border-gray-700 h-full flex flex-col">
                    <h4 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2 mb-4"><HiUser className="text-[#0891B2]"/> Doctor</h4>
                    <div className="space-y-3 text-sm text-slate-600 dark:text-gray-300 flex-1">
                        <div className="flex justify-between border-b border-slate-100 dark:border-gray-700 pb-1">
                            <span className="font-medium">Name:</span> <span className="text-right">{formData.doctor.name || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-gray-700 pb-1">
                            <span className="font-medium">Email:</span> <span className="text-right truncate ml-2">{formData.doctor.email || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-gray-700 pb-1">
                            <span className="font-medium">Phone:</span> <span className="text-right">{formData.doctor.phone || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-gray-700 pb-1">
                            <span className="font-medium">Branch:</span> <span className="text-right font-bold text-[#0891B2]">{formData.doctor.branch || '-'}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                            <span className="font-medium">Status:</span> 
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${formData.doctor.status === 'active' ? 'bg-green-500' : 'bg-orange-400'}`}>
                                {formData.doctor.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Chamber Summary Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-t-4 border-indigo-500 shadow-lg shadow-slate-200/50 dark:shadow-none border-x border-b border-slate-100 dark:border-gray-700 h-full flex flex-col">
                    <h4 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2 mb-4"><HiBuildingOffice className="text-indigo-500"/> Chamber</h4>
                    <div className="space-y-3 text-sm text-slate-600 dark:text-gray-300 flex-1">
                        <div className="flex justify-between border-b border-slate-100 dark:border-gray-700 pb-1">
                            <span className="font-medium">Name:</span> <span className="text-right font-bold">{formData.chamber.chamberName || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-gray-700 pb-1">
                            <span className="font-medium">Branch:</span> <span className="text-right">{formData.chamber.branch || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-gray-700 pb-1">
                            <span className="font-medium">Fee:</span> <span className="text-right text-green-600 font-bold">৳{formData.chamber.consultancyFee || '0'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-gray-700 pb-1">
                            <span className="font-medium">Max Daily:</span> <span className="text-right">{formData.chamber.maxDailyPatient || 'Unlimited'}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                            <span className="font-medium">Schedule:</span> 
                            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[10px] uppercase font-bold">
                                {formData.chamber.schedule.filter(s => !s.isHoliday && s.startTime).length} Days Set
                            </span>
                        </div>
                    </div>
                </div>

                {/* Compounder Summary Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-t-4 border-amber-500 shadow-lg shadow-slate-200/50 dark:shadow-none border-x border-b border-slate-100 dark:border-gray-700 h-full flex flex-col">
                    <h4 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2 mb-4"><HiUsers className="text-amber-500"/> Compounder</h4>
                    <div className="space-y-3 text-sm text-slate-600 dark:text-gray-300 flex-1">
                        <div className="flex justify-between border-b border-slate-100 dark:border-gray-700 pb-1">
                            <span className="font-medium">Name:</span> <span className="text-right">{formData.compounder.name || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-gray-700 pb-1">
                            <span className="font-medium">Email:</span> <span className="text-right truncate ml-2">{formData.compounder.email || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-gray-700 pb-1">
                            <span className="font-medium">Branch:</span> <span className="text-right">{formData.compounder.branch || '-'}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                            <span className="font-medium">Status:</span> 
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${formData.compounder.status === 'active' ? 'bg-green-500' : 'bg-orange-400'}`}>
                                {formData.compounder.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // --- Stepper Navigation UI ---
    const steps = [
        { id: 1, title: "Doctor", icon: <HiUser /> },
        { id: 2, title: "Chamber", icon: <HiBuildingOffice /> },
        { id: 3, title: "Compounder", icon: <HiUsers /> },
        { id: 4, title: "Review", icon: <HiClipboardDocumentCheck /> }
    ];

    return (
        <div className="w-full max-w-5xl mx-auto bg-white dark:bg-casual-black shadow-2xl rounded-3xl border border-slate-200 dark:border-gray-700 overflow-hidden font-primary flex flex-col h-[90vh]">
            
            {/* Header / Stepper */}
            <div className="bg-slate-50 dark:bg-gray-800/50 border-b border-slate-200 dark:border-gray-700 px-6 md:px-10 pt-6 pb-8 shrink-0 z-10">
                <div className="mb-2"> {/* ✨ Decreased top gap */}
                    <SectionTitle 
                        title="Setup New Account" 
                    />
                </div>
                
                {/* ✨ Added pb-8 to increase gap at the bottom */}
                <div className="flex items-center justify-between relative max-w-3xl mx-auto pb-8">
                    {/* Progress Line */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-slate-200 dark:bg-gray-700 z-0 rounded-full">
                        <div 
                            className="h-full bg-[#0891B2] transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(8,145,178,0.5)]" 
                            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                        ></div>
                    </div>

                    {/* Step Indicators */}
                    {steps.map((step) => (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 transition-all duration-500 ${
                                currentStep >= step.id 
                                ? 'bg-[#0891B2] border-white dark:border-gray-800 text-white shadow-lg scale-110' 
                                : 'bg-slate-100 border-white dark:bg-gray-700 dark:border-gray-800 text-slate-400'
                            }`}>
                                {currentStep > step.id ? <HiCheck size={24} /> : step.icon}
                            </div>
                            <span className={`absolute top-14 text-xs md:text-sm font-bold whitespace-nowrap transition-colors duration-300 ${currentStep >= step.id ? 'text-[#0891B2]' : 'text-slate-400 dark:text-gray-500'}`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Content Area */}
            <div className="p-6 md:p-10 flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-casual-black">
                <form id="wizardForm" className="max-w-4xl mx-auto" onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                    {currentStep === 4 && renderStep4()}
                </form>
            </div>

            {/* Footer / Controls */}
            <div className="px-6 md:px-10 py-5 border-t border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50 flex justify-between items-center shrink-0">
                <button 
                    type="button"
                    onClick={currentStep === 1 ? onCancel : prevStep}
                    disabled={isSubmitting}
                    className="btn bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-gray-600 flex items-center gap-2 rounded-xl transition-all shadow-sm"
                >
                    {currentStep === 1 ? 'Cancel' : <><HiChevronLeft /> Back</>}
                </button>

                {currentStep < 4 ? (
                    <button 
                        type="button"
                        onClick={() => {
                            const form = document.getElementById("wizardForm");
                            if (form.checkValidity()) {
                                nextStep();
                            } else {
                                form.reportValidity();
                            }
                        }}
                        className="btn bg-[#0891B2] hover:bg-[#067A96] text-white border-none flex items-center gap-2 px-8 rounded-xl shadow-md shadow-[#0891B2]/20 transition-all"
                    >
                        Continue <HiChevronRight />
                    </button>
                ) : (
                    <button 
                        type="button"
                        onClick={handleFinalSubmit} 
                        disabled={isSubmitting || userLoading || chamberLoading}
                        className="btn bg-green-500 hover:bg-green-600 text-white border-none flex items-center gap-2 px-8 rounded-xl shadow-lg shadow-green-500/30 transition-all"
                    >
                        {isSubmitting ? (
                            <><span className="loading loading-spinner loading-sm"></span> Creating Accounts...</>
                        ) : (
                            <><HiCheck size={20} /> Confirm & Launch</>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}