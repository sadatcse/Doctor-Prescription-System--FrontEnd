import React, { useState, useEffect, useCallback, useContext } from 'react';
import { HiXMark, HiPlus, HiTrash, HiCalendarDays } from 'react-icons/hi2';
import useAppointmentBlock from '../../Hook/useAppointmentBlock';
import useDoctorProfile from '../../Hook/useDoctorProfile';
import { AuthContext } from '../../providers/AuthProvider';

const AppointmentBlockModal = ({ isOpen, onClose, chambers, currentBranch }) => {
    const { chamber: authChamber } = useContext(AuthContext);

    const { getAppointmentBlocksByBranch, createAppointmentBlock, removeAppointmentBlock, loading: blockLoading } = useAppointmentBlock();
    const { getProfilesByBranch, loading: doctorLoading } = useDoctorProfile();

    const [blocks, setBlocks] = useState([]);
    const [currentDoctor, setCurrentDoctor] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [isDeleting, setIsDeleting] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        chamberId: '',
        doctorId: '',
        blockFrom: '',
        blockTo: ''
    });

    const fetchBlocks = useCallback(async () => {
        if (!currentBranch) return;
        setIsFetching(true);
        try {
            // Fetch with limit to ensure we get older/all blocks
            const res = await getAppointmentBlocksByBranch(currentBranch, { limit: 100 });
            if (res && res.data) {
                setBlocks(res.data);
            }
        } catch (error) {
            console.error("Error fetching blocks:", error);
        } finally {
            setIsFetching(false);
        }
    }, [currentBranch, getAppointmentBlocksByBranch]);

    const fetchDoctor = useCallback(async () => {
        if (!currentBranch) return;
        try {
            const res = await getProfilesByBranch(currentBranch, { limit: 1 });
            const doctorData = Array.isArray(res?.data) ? res.data[0] : (res?.data || res);

            if (doctorData && doctorData._id) {
                setCurrentDoctor(doctorData);
                setFormData(prev => ({ ...prev, doctorId: doctorData._id }));
            }
        } catch (error) {
            console.error("Error fetching doctor profile:", error);
        }
    }, [currentBranch, getProfilesByBranch]);

    useEffect(() => {
        if (isOpen) {
            fetchBlocks();
            fetchDoctor();

            const defaultChamberId = authChamber?._id || authChamber || (chambers && chambers.length > 0 ? chambers[0]._id : '');
            setFormData(prev => ({ ...prev, chamberId: defaultChamberId }));

        } else {
            // Reset state when closed
            setFormData({ chamberId: '', doctorId: '', blockFrom: '', blockTo: '' });
            setCurrentDoctor(null);
        }
    }, [isOpen, fetchBlocks, fetchDoctor, chambers, authChamber]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateBlock = async (e) => {
        e.preventDefault();

        if (!formData.doctorId) {
            alert("Doctor profile not found for this branch. Cannot create block.");
            return;
        }

        const payload = {
            branch: currentBranch,
            chamberId: formData.chamberId,
            doctorId: formData.doctorId,
            blockFrom: new Date(formData.blockFrom).toISOString(),
            blockTo: new Date(formData.blockTo).toISOString()
        };

        try {
            await createAppointmentBlock(payload);
            setFormData(prev => ({ ...prev, blockFrom: '', blockTo: '' }));
            fetchBlocks();
        } catch (error) {
            console.error("Failed to create block:", error);
            alert(error || "Failed to create block.");
        }
    };

    const handleDeleteBlock = async (id) => {
        if (!window.confirm("Are you sure you want to remove this block?")) return;

        setIsDeleting(id);
        try {
            await removeAppointmentBlock(id);
            fetchBlocks();
        } catch (error) {
            console.error("Failed to delete block:", error);
            alert("Failed to delete block.");
        } finally {
            setIsDeleting(null);
        }
    };

    if (!isOpen) return null;

    // Filter out blocks where the 'blockTo' date is in the past
    const activeAndFutureBlocks = blocks.filter(block => new Date(block.blockTo) >= new Date());

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-casual-black/50 backdrop-blur-sm p-4">
            <div className="bg-base-100 dark:bg-[#1a1a1a] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden font-primary">

                <div className="flex justify-between items-center p-6 border-b border-casual-black/10 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sporty-blue/10 rounded-lg">
                            <HiCalendarDays className="w-6 h-6 text-sporty-blue" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-secondary text-casual-black dark:text-concrete">
                                Manage Appointment Blocks
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Block specific date and time ranges</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-casual-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                        <HiXMark className="w-6 h-6 text-casual-black/60 dark:text-concrete/60" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-8">

                    {/* Add New Block Form */}
                    <div className="bg-gray-50 dark:bg-gray-800/30 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Create New Block</h3>
                        <form onSubmit={handleCreateBlock} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Auto-populated Doctor Field */}
                            <div className="form-control">
                                <label className="label"><span className="label-text">Doctor*</span></label>
                                <input
                                    type="text"
                                    value={doctorLoading ? "Loading..." : (currentDoctor?.name || "No Doctor Found")}
                                    readOnly
                                    className="input input-bordered w-full bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed border-none shadow-inner"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text">Chamber*</span></label>
                                <select name="chamberId" value={formData.chamberId} onChange={handleChange} required className="select select-bordered w-full bg-white dark:bg-[#1a1a1a]">
                                    <option value="" disabled>Select Chamber</option>
                                    {chambers.map(ch => <option key={ch._id} value={ch._id}>{ch.chamberName}</option>)}
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text">Block From*</span></label>
                                <input type="datetime-local" name="blockFrom" value={formData.blockFrom} onChange={handleChange} required className="input input-bordered w-full bg-white dark:bg-[#1a1a1a]" />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text">Block To*</span></label>
                                <input type="datetime-local" name="blockTo" value={formData.blockTo} onChange={handleChange} required className="input input-bordered w-full bg-white dark:bg-[#1a1a1a]" />
                            </div>

                            <div className="md:col-span-2 flex justify-end mt-2">
                                <button type="submit" disabled={blockLoading || !formData.doctorId} className="btn bg-accent hover:bg-teal-600 text-white border-none gap-2">
                                    {blockLoading ? <span className="loading loading-spinner loading-sm"></span> : <HiPlus />} Add Block Range
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* List Existing Blocks */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Active Blocks</h3>
                        {isFetching ? (
                            <div className="flex justify-center py-6">
                                <span className="loading loading-spinner text-sporty-blue"></span>
                            </div>
                        ) : activeAndFutureBlocks.length === 0 ? (
                            <p className="text-sm text-gray-500 italic border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                                No active time blocks found for this branch.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {activeAndFutureBlocks.map(block => (
                                    <div key={block._id} className="flex justify-between items-center bg-white dark:bg-casual-black border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                                        <div>
                                            <div className="font-medium text-sporty-blue">
                                                {new Date(block.blockFrom).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                <span className="text-gray-400 font-normal mx-2">to</span>
                                                {new Date(block.blockTo).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 flex gap-3">
                                                <span>Doctor: {currentDoctor?.name || block.doctorId}</span>
                                                <span>Chamber: {chambers.find(c => c._id === block.chamberId)?.chamberName || block.chamberId}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteBlock(block._id)}
                                            disabled={isDeleting === block._id}
                                            className="btn btn-sm btn-square btn-ghost text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            {isDeleting === block._id ? <span className="loading loading-spinner loading-xs"></span> : <HiTrash className="w-5 h-5" />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                <div className="p-5 border-t border-casual-black/10 dark:border-white/10 bg-casual-black/5 dark:bg-white/5 flex justify-end">
                    <button type="button" onClick={onClose} className="btn bg-gray-200 text-casual-black hover:bg-gray-300 border-none dark:bg-gray-800 dark:text-concrete dark:hover:bg-gray-700">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentBlockModal;