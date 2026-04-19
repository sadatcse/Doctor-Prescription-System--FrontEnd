import React from 'react';
import PrescriptionPreview from '../Prescription/PrescriptionPreview';
import { ICONS } from '../Prescription/Icons';
import { HiDocumentDuplicate } from "react-icons/hi2";

export default function PrescriptionViewModal({ isOpen, onClose, prescriptionData, doctorProfile, chamber, onClone }) {
    if (!isOpen || !prescriptionData) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-5xl h-[90vh] rounded-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm z-10">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-gray-100">
                        Prescription Document {prescriptionData.prescriptionId ? `- ${prescriptionData.prescriptionId}` : ''}
                    </h3>
                    <div className="flex items-center gap-3">
                        {onClone && (
                            <button 
                                onClick={() => onClone(prescriptionData)}
                                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                            >
                                <HiDocumentDuplicate className="w-5 h-5" />
                                Clone Prescription
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                            <ICONS.Close size={24} className="text-gray-500" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto bg-slate-100 dark:bg-gray-900 custom-scrollbar flex justify-center py-6">
                    <PrescriptionPreview 
                        data={prescriptionData} 
                        language="EN" 
                        doctor={doctorProfile} 
                        chamber={chamber} 
                    />
                </div>
            </div>
        </div>
    );
}
