import React, { useState, useEffect } from 'react';
import useChamber from '../../Hook/useChamber';

const DAYS_OF_WEEK = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const ChamberFormModal = ({ isOpen, onClose, chamber, onSuccess, currentBranch }) => {
    const { createChamber, updateChamber } = useChamber();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        chamberName: '',
        address: '',
        mobileNumber: '',
        description: '',
        advanceBookingDays: 7,
        consultancyFee: '',
        oldConsultancyFee: '',
        followUpDay: 0,
        maxDailyPatient: '', // <-- Added field here
        branch: '',
        schedule: DAYS_OF_WEEK.map(day => ({
            day,
            startTime: '',
            endTime: '',
            isHoliday: false
        }))
    });

    useEffect(() => {
        if (chamber) {
            // Map existing schedule or create default for missing days
            const mappedSchedule = DAYS_OF_WEEK.map(day => {
                const existingDay = chamber.schedule?.find(s => s.day === day);
                return existingDay || { day, startTime: '', endTime: '', isHoliday: false };
            });

            setFormData({
                chamberName: chamber.chamberName || '',
                address: chamber.address || '',
                mobileNumber: chamber.mobileNumber || '',
                description: chamber.description || '',
                advanceBookingDays: chamber.advanceBookingDays || 7,
                consultancyFee: chamber.consultancyFee || '',
                oldConsultancyFee: chamber.oldConsultancyFee || '',
                followUpDay: chamber.followUpDay || 0,
                maxDailyPatient: chamber.maxDailyPatient || '', // <-- Populated field here
                branch: chamber.branch || currentBranch || '',
                schedule: mappedSchedule
            });
        } else {
            setFormData({
                chamberName: '',
                address: '',
                mobileNumber: '',
                description: '',
                advanceBookingDays: 7,
                consultancyFee: '',
                oldConsultancyFee: '',
                followUpDay: 0,
                maxDailyPatient: '', // <-- Added field here
                branch: currentBranch || '',
                schedule: DAYS_OF_WEEK.map(day => ({
                    day,
                    startTime: '',
                    endTime: '',
                    isHoliday: false
                }))
            });
        }
        setError(null);
    }, [chamber, isOpen, currentBranch]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleScheduleChange = (index, field, value) => {
        const updatedSchedule = [...formData.schedule];
        updatedSchedule[index][field] = value;
        setFormData(prev => ({ ...prev, schedule: updatedSchedule }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Filter out schedules that are completely empty (unless holiday) and ensure branch is attached
        const cleanedData = {
            ...formData,
            branch: currentBranch || formData.branch,
            schedule: formData.schedule.filter(s => s.isHoliday || (s.startTime && s.endTime))
        };

        try {
            if (chamber && chamber._id) {
                await updateChamber(chamber._id, cleanedData);
            } else {
                await createChamber(cleanedData);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err?.response?.data?.error || err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-casual-black/60 backdrop-blur-sm transition-opacity p-4 md:p-0">
            <div className="bg-base-100 dark:bg-casual-black w-full max-w-3xl rounded-box shadow-2xl flex flex-col max-h-[90vh] border border-casual-black/10 dark:border-white/10 overflow-hidden">

                <div className="p-6 border-b border-casual-black/5 dark:border-white/5 bg-concrete/50 dark:bg-white/5">
                    <h2 className="text-xl font-bold font-secondary text-casual-black dark:text-concrete">
                        {chamber ? 'Edit Chamber' : 'Add New Chamber'}
                    </h2>
                    <p className="text-sm text-casual-black/60 dark:text-concrete/60 mt-1">
                        {chamber ? 'Update the details for this chamber.' : 'Fill in the details to create a new chamber.'}
                    </p>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {error && (
                        <div className="alert alert-error bg-fascinating-magenta/10 text-fascinating-magenta border-none text-sm mb-6">
                            {error}
                        </div>
                    )}

                    <form id="chamberForm" onSubmit={handleSubmit} className="space-y-5">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text font-medium dark:text-concrete">Chamber Name *</span></label>
                                <input
                                    type="text"
                                    name="chamberName"
                                    value={formData.chamberName}
                                    onChange={handleChange}
                                    required
                                    className="input input-bordered bg-transparent border-casual-black/20 dark:border-white/20 dark:text-concrete focus:border-sporty-blue"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text font-medium dark:text-concrete">Mobile Number *</span></label>
                                <input
                                    type="text"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    required
                                    className="input input-bordered bg-transparent border-casual-black/20 dark:border-white/20 dark:text-concrete focus:border-sporty-blue"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text font-medium dark:text-concrete">Consultancy Fee (New) *</span></label>
                                <input
                                    type="number"
                                    name="consultancyFee"
                                    value={formData.consultancyFee}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="input input-bordered bg-transparent border-casual-black/20 dark:border-white/20 dark:text-concrete focus:border-sporty-blue"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text font-medium dark:text-concrete">Consultancy Fee (Old)</span></label>
                                <input
                                    type="number"
                                    name="oldConsultancyFee"
                                    value={formData.oldConsultancyFee}
                                    onChange={handleChange}
                                    min="0"
                                    className="input input-bordered bg-transparent border-casual-black/20 dark:border-white/20 dark:text-concrete focus:border-sporty-blue"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text font-medium dark:text-concrete">Follow-up Window (Days)</span></label>
                                <input
                                    type="number"
                                    name="followUpDay"
                                    value={formData.followUpDay}
                                    onChange={handleChange}
                                    min="0"
                                    className="input input-bordered bg-transparent border-casual-black/20 dark:border-white/20 dark:text-concrete focus:border-sporty-blue"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text font-medium dark:text-concrete">Advance Booking (Days)</span></label>
                                <input
                                    type="number"
                                    name="advanceBookingDays"
                                    value={formData.advanceBookingDays}
                                    onChange={handleChange}
                                    min="0"
                                    className="input input-bordered bg-transparent border-casual-black/20 dark:border-white/20 dark:text-concrete focus:border-sporty-blue"
                                />
                            </div>

                            {/* --- Newly Added: Form Input --- */}
                            <div className="form-control">
                                <label className="label"><span className="label-text font-medium dark:text-concrete">Max Daily Patients</span></label>
                                <input
                                    type="number"
                                    name="maxDailyPatient"
                                    value={formData.maxDailyPatient}
                                    onChange={handleChange}
                                    min="0"
                                    className="input input-bordered bg-transparent border-casual-black/20 dark:border-white/20 dark:text-concrete focus:border-sporty-blue"
                                />
                            </div>
                            {/* ------------------------------- */}
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium dark:text-concrete">Address *</span></label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                className="textarea textarea-bordered bg-transparent border-casual-black/20 dark:border-white/20 dark:text-concrete focus:border-sporty-blue h-20"
                            />
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium dark:text-concrete">Description</span></label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="textarea textarea-bordered bg-transparent border-casual-black/20 dark:border-white/20 dark:text-concrete focus:border-sporty-blue h-20"
                            />
                        </div>

                        <div className="divider text-casual-black/40 dark:text-concrete/40 font-secondary text-sm">Weekly Schedule</div>

                        <div className="space-y-3">
                            {formData.schedule.map((daySchedule, index) => (
                                <div key={daySchedule.day} className="flex flex-col md:flex-row items-center gap-3 p-3 bg-concrete dark:bg-white/5 rounded-lg border border-casual-black/5 dark:border-white/10">
                                    <div className="w-full md:w-32 font-medium dark:text-concrete">
                                        {daySchedule.day}
                                    </div>

                                    <div className="flex-1 flex gap-2 w-full">
                                        <input
                                            type="time"
                                            value={daySchedule.startTime}
                                            onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                                            disabled={daySchedule.isHoliday}
                                            className="input input-sm input-bordered w-full bg-base-100 dark:bg-casual-black dark:text-concrete disabled:opacity-50"
                                        />
                                        <span className="self-center dark:text-concrete/50">-</span>
                                        <input
                                            type="time"
                                            value={daySchedule.endTime}
                                            onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                                            disabled={daySchedule.isHoliday}
                                            className="input input-sm input-bordered w-full bg-base-100 dark:bg-casual-black dark:text-concrete disabled:opacity-50"
                                        />
                                    </div>

                                    <div className="w-full md:w-auto flex items-center gap-2 mt-2 md:mt-0">
                                        <label className="label cursor-pointer p-0 gap-2">
                                            <input
                                                type="checkbox"
                                                checked={daySchedule.isHoliday}
                                                onChange={(e) => handleScheduleChange(index, 'isHoliday', e.target.checked)}
                                                className="checkbox checkbox-sm checkbox-error"
                                            />
                                            <span className="label-text text-xs dark:text-concrete">Holiday</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </form>
                </div>

                <div className="p-4 border-t border-casual-black/5 dark:border-white/5 bg-base-100 dark:bg-casual-black flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost text-casual-black dark:text-concrete font-secondary"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="chamberForm"
                        className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-concrete border-none font-secondary px-8"
                        disabled={loading}
                    >
                        {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Save Chamber'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ChamberFormModal;