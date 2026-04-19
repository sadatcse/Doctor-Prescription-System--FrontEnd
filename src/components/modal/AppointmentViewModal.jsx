import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import useAppointment from '../../Hook/useAppointment';
import { HiXMark } from "react-icons/hi2";

const AppointmentViewModal = ({ isOpen, onClose, appointmentId }) => {
    const [appointmentData, setAppointmentData] = useState(null);
    const { getAppointmentById, loading } = useAppointment();

    useEffect(() => {
        const fetchDetails = async () => {
            if (isOpen && appointmentId) {
                try {
                    const data = await getAppointmentById(appointmentId);
                    setAppointmentData(data);
                } catch (err) {
                    console.error("Failed to load details", err);
                }
            } else {
                setAppointmentData(null);
            }
        };
        fetchDetails();
    }, [isOpen, appointmentId, getAppointmentById]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-casual-black w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost text-gray-500 hover:text-red-500 z-10">
                    <HiXMark className="text-xl" />
                </button>
                
                <div className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold mb-6 text-sporty-blue">Appointment Details</h2>
                    
                    {loading || !appointmentData ? (
                        <div className="flex justify-center py-20">
                            <span className="loading loading-spinner text-sporty-blue loading-lg"></span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* General & Chamber Info */}
                            <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/10 flex flex-col gap-4">
                                <div>
                                    <h3 className="font-semibold text-lg mb-3 border-b border-gray-200 dark:border-white/10 pb-2">General Information</h3>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        <p><strong className="text-gray-500 dark:text-gray-400">ID:</strong> {appointmentData.appointmentId}</p>
                                        <p><strong className="text-gray-500 dark:text-gray-400">Serial:</strong> {appointmentData.serial}</p>
                                        <p><strong className="text-gray-500 dark:text-gray-400">Date:</strong> {appointmentData.appointmentDate ? dayjs(appointmentData.appointmentDate).format('MMM D, YYYY') : 'N/A'}</p>
                                        <p><strong className="text-gray-500 dark:text-gray-400">Time:</strong> {appointmentData.appointmentTime}</p>
                                        <p><strong className="text-gray-500 dark:text-gray-400">Type:</strong> {appointmentData.patientType}</p>
                                        <p><strong className="text-gray-500 dark:text-gray-400">Payment:</strong> <span className={`${appointmentData.paymentStatus === 'Collect' ? 'text-green-600 font-medium' : ''}`}>{appointmentData.paymentStatus}</span></p>
                                        
                                        <p><strong className="text-gray-500 dark:text-gray-400">Pre-Checkup:</strong> <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${appointmentData.preCheckupId ? 'bg-sporty-blue' : 'bg-gray-400'}`}>{appointmentData.preCheckupId ? 'Completed' : 'Pending'}</span></p>
                                    </div>
                                </div>

                                {appointmentData.chamberId && (
                                    <div className="mt-2 pt-4 border-t border-gray-200 dark:border-white/10">
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Chamber Details</h4>
                                        <div className="text-sm space-y-1">
                                            <p className="font-medium text-sporty-blue">{appointmentData.chamberId.chamberName}</p>
                                            <p className="text-gray-600 dark:text-gray-400 text-xs">{appointmentData.chamberId.address}</p>
                                            <p className="text-gray-600 dark:text-gray-400 text-xs">Phone: {appointmentData.chamberId.mobileNumber}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Patient Info */}
                            {appointmentData.patientId && (
                                <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/10">
                                    <h3 className="font-semibold text-lg mb-4 border-b border-gray-200 dark:border-white/10 pb-2">Patient Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><strong className="text-gray-500 dark:text-gray-400">Name:</strong> <span className="font-medium">{appointmentData.patientId.fullName}</span></p>
                                        <p><strong className="text-gray-500 dark:text-gray-400">Phone:</strong> {appointmentData.patientId.phone}</p>
                                        {appointmentData.patientId.email && <p><strong className="text-gray-500 dark:text-gray-400">Email:</strong> {appointmentData.patientId.email}</p>}
                                        <div className="flex gap-4">
                                            <p><strong className="text-gray-500 dark:text-gray-400">Gender:</strong> {appointmentData.patientId.gender}</p>
                                            {appointmentData.patientId.age && <p><strong className="text-gray-500 dark:text-gray-400">Age:</strong> {appointmentData.patientId.age} yrs</p>}
                                            {appointmentData.patientId.bloodGroup && <p><strong className="text-gray-500 dark:text-gray-400">Blood:</strong> <span className="text-red-500 font-medium">{appointmentData.patientId.bloodGroup}</span></p>}
                                        </div>
                                        {appointmentData.patientId.address && <p><strong className="text-gray-500 dark:text-gray-400">Address:</strong> {appointmentData.patientId.address}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Precheckup info - Spans both columns */}
                            {appointmentData.preCheckupId && (
                                <div className="md:col-span-2 bg-sporty-blue/5 p-6 rounded-2xl border border-sporty-blue/20">
                                    <div className="flex justify-between items-center mb-4 border-b border-sporty-blue/20 pb-3">
                                        <h3 className="font-semibold text-xl text-sporty-blue">Pre-Checkup Report</h3>
                                        {appointmentData.preCheckupId.drugAllergy && (
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                                                🚨 Drug Allergy Alert
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Column 1: Vitals & Conditions */}
                                        <div className="space-y-6">
                                            {appointmentData.preCheckupId.examination?.vitals && (
                                                <div>
                                                    <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200 bg-white/50 dark:bg-black/20 px-2 py-1 rounded">Vitals</h4>
                                                    <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400 px-2">
                                                        {appointmentData.preCheckupId.examination.vitals.weight && <li><strong>Weight:</strong> {appointmentData.preCheckupId.examination.vitals.weight} kg</li>}
                                                        {appointmentData.preCheckupId.examination.vitals.height && <li><strong>Height:</strong> {appointmentData.preCheckupId.examination.vitals.height} cm</li>}
                                                        {appointmentData.preCheckupId.examination.vitals.bp && <li><strong>BP:</strong> {appointmentData.preCheckupId.examination.vitals.bp} mmHg</li>}
                                                        {appointmentData.preCheckupId.examination.vitals.pulse && <li><strong>Pulse:</strong> {appointmentData.preCheckupId.examination.vitals.pulse} bpm</li>}
                                                        {appointmentData.preCheckupId.examination.vitals.temperature && <li><strong>Temp:</strong> {appointmentData.preCheckupId.examination.vitals.temperature} °F</li>}
                                                    </ul>
                                                </div>
                                            )}
                                            
                                            {appointmentData.preCheckupId.conditions && typeof appointmentData.preCheckupId.conditions === 'object' && (
                                                <div>
                                                    <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200 bg-white/50 dark:bg-black/20 px-2 py-1 rounded">Conditions</h4>
                                                    <div className="flex flex-wrap gap-2 px-2">
                                                        {Object.entries(appointmentData.preCheckupId.conditions || {}).map(([key, val]) => (
                                                            val === true && (
                                                                <span key={key} className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 px-2 py-1 rounded-md text-xs capitalize whitespace-nowrap shadow-sm">
                                                                    {key}
                                                                </span>
                                                            )
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Column 2 & 3: History, Exam, Notes */}
                                        <div className="md:col-span-2 space-y-4">
                                            
                                            {/* Patient History Object */}
                                            {appointmentData.preCheckupId.history && (
                                                <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl border border-white/50 dark:border-white/5">
                                                    <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-1">Detailed History</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                                                        {appointmentData.preCheckupId.history.presentIllness && <p><strong>Present Illness:</strong> {appointmentData.preCheckupId.history.presentIllness}</p>}
                                                        {appointmentData.preCheckupId.history.pastHistory && <p><strong>Past History:</strong> {appointmentData.preCheckupId.history.pastHistory}</p>}
                                                        {appointmentData.preCheckupId.history.medicalHistory && <p><strong>Medical History:</strong> {appointmentData.preCheckupId.history.medicalHistory}</p>}
                                                        {appointmentData.preCheckupId.history.familyHistory && <p><strong>Family History:</strong> {appointmentData.preCheckupId.history.familyHistory}</p>}
                                                        {appointmentData.preCheckupId.history.drugHistory && <p><strong>Drug History:</strong> {appointmentData.preCheckupId.history.drugHistory}</p>}
                                                        {appointmentData.preCheckupId.history.allergyHistory && <p className="text-red-500"><strong>Allergies:</strong> {appointmentData.preCheckupId.history.allergyHistory}</p>}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Examinations */}
                                            {appointmentData.preCheckupId.examination && (appointmentData.preCheckupId.examination.general || appointmentData.preCheckupId.examination.systemic) && (
                                                <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl border border-white/50 dark:border-white/5">
                                                    <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-1">Examinations</h4>
                                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                                        
                                                        {appointmentData.preCheckupId.examination.general && (
                                                            <p><strong>General:</strong> {appointmentData.preCheckupId.examination.general}</p>
                                                        )}

                                                        {/* 👇 UPDATED SYSTEMIC RENDERING 👇 */}
                                                        {appointmentData.preCheckupId.examination.systemic && (
                                                            <div>
                                                                <strong>Systemic:</strong>
                                                                {typeof appointmentData.preCheckupId.examination.systemic === 'string' ? (
                                                                    <span className="ml-1">{appointmentData.preCheckupId.examination.systemic}</span>
                                                                ) : (
                                                                    <ul className="mt-1 ml-2 space-y-1">
                                                                        {Object.entries(appointmentData.preCheckupId.examination.systemic).map(([sysKey, sysVal]) => (
                                                                            sysVal && ( // Only show if it has a value
                                                                                <li key={sysKey} className="flex items-start gap-2">
                                                                                    <span className="w-1.5 h-1.5 bg-sporty-blue rounded-full mt-1.5 shrink-0"></span>
                                                                                    <span className="capitalize">
                                                                                        <strong className="text-gray-700 dark:text-gray-300">{sysKey}:</strong> <span className="normal-case">{sysVal}</span>
                                                                                    </span>
                                                                                </li>
                                                                            )
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        )}
                                                        {/* 👆 ---------------------------- 👆 */}

                                                    </div>
                                                </div>
                                            )}

                                            {/* Diagnosis & Summaries */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {appointmentData.preCheckupId.diagnosis && (
                                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1 text-sm">Diagnosis</h4>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">{appointmentData.preCheckupId.diagnosis}</p>
                                                    </div>
                                                )}
                                                {appointmentData.preCheckupId.caseSummary && (
                                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 text-sm">Case Summary</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{appointmentData.preCheckupId.caseSummary}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Comments */}
                                            {(appointmentData.preCheckupId.counsellorComment || appointmentData.preCheckupId.doctorComment) && (
                                                 <div className="space-y-2 text-sm">
                                                     {appointmentData.preCheckupId.counsellorComment && (
                                                         <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                                             <strong className="text-yellow-800 dark:text-yellow-500">Counsellor Comment:</strong>
                                                             <p className="text-gray-700 dark:text-gray-300 mt-1">{appointmentData.preCheckupId.counsellorComment}</p>
                                                         </div>
                                                     )}
                                                     {appointmentData.preCheckupId.doctorComment && (
                                                         <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                                                             <strong className="text-green-800 dark:text-green-500">Doctor Comment:</strong>
                                                             <p className="text-gray-700 dark:text-gray-300 mt-1">{appointmentData.preCheckupId.doctorComment}</p>
                                                         </div>
                                                     )}
                                                 </div>
                                            )}

                                        </div>
                                    </div>
                                    
                                    {/* Chief Complaints (Bottom Row) */}
                                    {appointmentData.preCheckupId.chiefComplaints && appointmentData.preCheckupId.chiefComplaints.length > 0 && (
                                        <div className="mt-6 border-t border-sporty-blue/20 pt-4">
                                            <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Chief Complaints</h4>
                                            <div className="flex flex-wrap gap-3">
                                                {appointmentData.preCheckupId.chiefComplaints.map((c, i) => (
                                                    <div key={i} className="bg-white dark:bg-black/40 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5 text-sm shadow-sm flex items-center gap-2">
                                                        <span className="font-medium text-sporty-blue">{c.complaint}</span>
                                                        {c.duration && (
                                                            <>
                                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                                <span className="text-gray-500 text-xs italic">{c.duration} day</span>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentViewModal;