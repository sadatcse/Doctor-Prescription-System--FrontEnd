import React, { useState, useEffect, useContext } from 'react';
import usePrescription from '../../Hook/usePrescription';
import { AuthContext } from '../../providers/AuthProvider';
import dayjs from 'dayjs';
import { ICONS } from '../Prescription/Icons';

export default function PastPrescriptionsModal({ isOpen, onClose, patientPhone, patientName, onSelectPrescription }) {
    const { branch } = useContext(AuthContext);
    const { getPrescriptionsByBranch } = usePrescription();
    const [prescriptions, setPrescriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !patientPhone || !branch) return;

        const fetchPast = async () => {
            setIsLoading(true);
            try {
                // Utilizing the exact search schema endpoint hook inside your current codebase 
                const res = await getPrescriptionsByBranch(branch, { search: patientPhone, limit: 100 });
                if (res?.success) {
                    setPrescriptions(res.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch past prescriptions", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPast();
    }, [isOpen, patientPhone, branch, getPrescriptionsByBranch]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 border-l-[6px] border-l-sporty-blue">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-gray-100 flex items-center gap-2">
                        <ICONS.History size={20} className="text-sporty-blue" />
                        Past Prescriptions for <span className="text-sporty-blue">{patientName || patientPhone}</span> 
                        {patientName && patientPhone && patientName !== patientPhone ? <span className="text-sm font-normal text-gray-500">({patientPhone})</span> : ''}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <ICONS.Close size={24} className="text-gray-500" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50 dark:bg-gray-800">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <span className="loading loading-spinner text-sporty-blue loading-lg"></span>
                        </div>
                    ) : prescriptions.length === 0 ? (
                        <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            <ICONS.History size={48} className="text-gray-300 mx-auto mb-3" />
                            <div className="text-gray-500 font-medium">No historical prescriptions found for this patient.</div>
                            <div className="text-xs text-gray-400 mt-1">If this is a new patient, there won't be any history.</div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {prescriptions.map((p) => (
                                <div 
                                    key={p._id} 
                                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-sporty-blue dark:hover:border-sporty-blue transition-all bg-white dark:bg-gray-900 shadow-sm cursor-pointer group" 
                                    onClick={() => onSelectPrescription(p)}
                                >
                                    <div>
                                        <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                            {dayjs(p.createdAt).format('DD MMM YYYY')}
                                            <span className="text-xs font-normal text-gray-500 tracking-wide px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                                {dayjs(p.createdAt).format('hh:mm A')}
                                            </span>
                                        </div>
                                        <div className="text-sm font-medium text-slate-500 mt-2">
                                            <span className="font-bold text-slate-700 dark:text-gray-300 mr-2">{p.patient?.name || 'Unknown Patient'}</span>
                                            <span className="mx-1 opacity-50 block sm:inline">|</span>
                                            Dr. {p.doctorId?.name || 'Assigned'} 
                                            <span className="mx-2">•</span> 
                                            {p.prescriptionId || 'No ID'}
                                        </div>
                                    </div>
                                    <button 
                                        className="px-5 py-2.5 bg-sporty-blue/10 dark:bg-sporty-blue/20 group-hover:bg-sporty-blue group-hover:text-concrete text-sporty-blue dark:text-sporty-blue border border-sporty-blue/30 rounded-xl font-bold text-sm transition-all shadow-sm"
                                        onClick={(e) => { e.stopPropagation(); onSelectPrescription(p); }}
                                    >
                                        View
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
