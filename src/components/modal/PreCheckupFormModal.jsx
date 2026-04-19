import React, { useState, useEffect } from 'react';
import { HiXMark, HiMagnifyingGlass, HiUser } from "react-icons/hi2";
import useAppointment from '../../Hook/useAppointment';
import usePreCheckup from '../../Hook/usePreCheckup';
import useChamber from '../../Hook/useChamber';
import usePatient from '../../Hook/usePatient';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

const PreCheckupFormModal = ({ isOpen, onClose, preCheckup, onSuccess, branch }) => {
    // Stage Management: 1 = Lookup, 2 = Form Entry
    const [stage, setStage] = useState(1);
    const [lookupMode, setLookupMode] = useState('appId'); // appId, phone, chamberDate

    // Walk-in Flow States
    const [workflowMode, setWorkflowMode] = useState('appointment'); // 'appointment', 'walkin'
    const [walkInPatient, setWalkInPatient] = useState(null);
    const [walkInNewPatient, setWalkInNewPatient] = useState({ fullName: '', phone: '', age: '', gender: 'Male' });
    const [patientLookupResults, setPatientLookupResults] = useState([]);

    // Lookup States
    const [searchAppId, setSearchAppId] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [searchChamber, setSearchChamber] = useState('');
    const [searchDate, setSearchDate] = useState(dayjs().format('YYYY-MM-DD'));

    const [lookupResults, setLookupResults] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // Form States (Clinical)
    const [vitals, setVitals] = useState({ bp: '', weight: '', height: '', pulse: '', temperature: '' });
    const [conditions, setConditions] = useState({ hypertension: false, thyroid: false, copd: false, asthma: false, cardiac: false, renal: false });
    const [chiefComplaints, setChiefComplaints] = useState([{ complaint: '', duration: '' }]);
    const [caseSummary, setCaseSummary] = useState('');
    const [history, setHistory] = useState({
        presentIllness: '', pastHistory: '', medicalHistory: '', familyHistory: '', drugHistory: '', allergyHistory: '',
        socialHistory: { smoking: false, alcoholic: false }
    });
    const [examinationFields, setExaminationFields] = useState({
        general: '',
        systemic: { cardiovascular: '', respiratory: '', abdominal: '', neurological: '' }
    });
    const [drugAllergy, setDrugAllergy] = useState(false);
    const [diagnosis, setDiagnosis] = useState('');
    const [counsellorComment, setCounsellorComment] = useState('');
    const [doctorComment, setDoctorComment] = useState('');

    const { getAppointmentsByBranch, loading: checkingAppt } = useAppointment();
    const { createPreCheckup, updatePreCheckup, createPatientWithPreCheckup, loading: renderingForm } = usePreCheckup();
    const { getChambersByBranch } = useChamber();
    const { getPatientsByBranch, loading: checkingPatient } = usePatient();
    const [chambers, setChambers] = useState([]);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            getChambersByBranch(branch).then(res => {
                if (res?.success) setChambers(res.data || []);
            });
            if (preCheckup) {
                // Edit Mode
                setStage(2);
                if (preCheckup.appointmentId) {
                    setWorkflowMode('appointment');
                    setSelectedAppointment({
                        _id: preCheckup.appointmentId?._id,
                        appointmentId: preCheckup.appointmentId?.appointmentId,
                        patientId: preCheckup.patient,
                        chamberId: preCheckup.appointmentId?.chamberId
                    });
                    setWalkInPatient(null);
                } else {
                    setWorkflowMode('walk-in');
                    setWalkInPatient(preCheckup.patient);
                    setSelectedAppointment(null);
                }
                setVitals(preCheckup.examination?.vitals || { bp: '', weight: '', height: '', pulse: '', temperature: '' });
                setConditions(preCheckup.conditions || { hypertension: false, thyroid: false, copd: false, asthma: false, cardiac: false, renal: false });
                setChiefComplaints(preCheckup.chiefComplaints?.length ? preCheckup.chiefComplaints : [{ complaint: '', duration: '' }]);
                setCaseSummary(preCheckup.caseSummary || '');
                setHistory(preCheckup.history || { presentIllness: '', pastHistory: '', medicalHistory: '', familyHistory: '', drugHistory: '', allergyHistory: '', socialHistory: { smoking: false, alcoholic: false } });
                setExaminationFields({
                    general: preCheckup.examination?.general || '',
                    systemic: preCheckup.examination?.systemic || { cardiovascular: '', respiratory: '', abdominal: '', neurological: '' }
                });
                setDrugAllergy(preCheckup.drugAllergy || false);
                setDiagnosis(preCheckup.diagnosis || '');
                setCounsellorComment(preCheckup.counsellorComment || '');
                setDoctorComment(preCheckup.doctorComment || '');
            } else {
                // Add Mode
                setStage(1);
                setWorkflowMode('appointment');
                setWalkInPatient(null);
                setWalkInNewPatient({ fullName: '', phone: '', age: '', gender: 'Male' });
                setPatientLookupResults([]);
                setLookupResults([]);
                setSelectedAppointment(null);
                setSearchAppId('');
                setSearchPhone('');
                setSearchChamber('');
                setVitals({ bp: '', weight: '', height: '', pulse: '', temperature: '' });
                setConditions({ hypertension: false, thyroid: false, copd: false, asthma: false, cardiac: false, renal: false });
                setChiefComplaints([{ complaint: '', duration: '' }]);
                setCaseSummary('');
                setHistory({ presentIllness: '', pastHistory: '', medicalHistory: '', familyHistory: '', drugHistory: '', allergyHistory: '', socialHistory: { smoking: false, alcoholic: false } });
                setExaminationFields({ general: '', systemic: { cardiovascular: '', respiratory: '', abdominal: '', neurological: '' } });
                setDrugAllergy(false);
                setDiagnosis('');
                setCounsellorComment('');
                setDoctorComment('');
            }
        }
    }, [isOpen, preCheckup, getChambersByBranch, branch]);

    const handleLookup = async () => {
        let params = { limit: 50 }; // Broad limit for search options

        if (lookupMode === 'appId') {
            if (!searchAppId) return Swal.fire('Error', 'Please enter an Appointment ID', 'warning');
            params.search = searchAppId;
        } else if (lookupMode === 'phone') {
            if (!searchPhone) return Swal.fire('Error', 'Please enter a Patient Phone', 'warning');
            params.search = searchPhone;
        } else if (lookupMode === 'chamberDate') {
            if (!searchChamber || !searchDate) return Swal.fire('Error', 'Please select Chamber and Date', 'warning');
            params.chamberId = searchChamber;
            params.date = searchDate;
        }

        try {
            const resp = await getAppointmentsByBranch(branch, params);
            if (resp.success && resp.data.length > 0) {
                setLookupResults(resp.data);
            } else {
                setLookupResults([]);
                Swal.fire('No Results', 'Could not find any matching appointments.', 'info');
            }
        } catch (err) {
            Swal.fire('Error', 'Failed to fetch lookup data', 'error');
        }
    };

    const handlePatientLookup = async () => {
        if (!searchPhone) return Swal.fire('Error', 'Please enter a Patient Phone', 'warning');

        try {
            const resp = await getPatientsByBranch(branch, { search: searchPhone, limit: 10 });
            if (resp.success && resp.data.length > 0) {
                setPatientLookupResults(resp.data);
            } else {
                setPatientLookupResults([]);
                Swal.fire('Not Found', 'No patient found with this phone number. You can register them below as a New Patient.', 'info');
            }
        } catch (err) {
            Swal.fire('Error', 'Failed to search patients.', 'error');
        }
    };

    const confirmSelection = (appt) => {
        setSelectedAppointment(appt);
        setWalkInPatient(null);
        setStage(2); // Move to form
    };

    const confirmPatientSelection = (patient) => {
        setWalkInPatient(patient);
        setSelectedAppointment(null);
        setStage(2);
    };

    const confirmNewWalkIn = () => {
        if (!walkInNewPatient.fullName || !walkInNewPatient.phone) {
            return Swal.fire('Error', 'Full Name and Phone are required.', 'warning');
        }
        setWalkInPatient(null);
        setSelectedAppointment(null);
        setStage(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ensure we have some sort of patient selected/created
        if (!selectedAppointment && !walkInPatient && !walkInNewPatient.fullName) return;

        // Clean complaints specifically to remove empty ones
        const validComplaints = chiefComplaints.filter(c => c.complaint.trim() !== '');

        const basePayload = {
            branch,
            chiefComplaints: validComplaints,
            examination: { vitals, general: examinationFields.general, systemic: examinationFields.systemic },
            conditions,
            history,
            drugAllergy,
            caseSummary,
            diagnosis,
            counsellorComment,
            doctorComment
        };

        try {
            if (preCheckup?._id) {
                // UPDATE
                await updatePreCheckup(preCheckup._id, basePayload);
                Swal.fire('Success', 'PreCheckup updated!', 'success');
            } else if (workflowMode === 'appointment' && selectedAppointment) {
                // CREATE WITH APPOINTMENT
                const payload = { ...basePayload, appointmentId: selectedAppointment._id, patient: selectedAppointment.patientId._id || selectedAppointment.patientId };
                await createPreCheckup(payload);
                Swal.fire('Success', 'PreCheckup recorded!', 'success');
            } else if (workflowMode === 'walk-in') {
                if (walkInPatient) {
                    // CREATE FOR EXISTING PATIENT WITHOUT APPOINTMENT
                    const payload = { ...basePayload, patient: walkInPatient._id };
                    await createPreCheckup(payload);
                    Swal.fire('Success', 'Walk-in PreCheckup recorded!', 'success');
                } else if (walkInNewPatient.fullName && walkInNewPatient.phone) {
                    // CREATE FULL (NEW PATIENT + PRECHECKUP)
                    const fullData = {
                        patient: { ...walkInNewPatient, branch },
                        preCheckup: basePayload
                    };
                    await createPatientWithPreCheckup(fullData);
                    Swal.fire('Success', 'New Patient & PreCheckup recorded!', 'success');
                }
            }
            onSuccess();
            onClose();
        } catch (err) {
            Swal.fire('Error', `Error saving: ${err}`, 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-casual-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-base-100 dark:bg-casual-black w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl relative border border-casual-black/10 dark:border-white/10">

                {/* Header */}
                <div className="sticky top-0 z-10 bg-base-100 dark:bg-casual-black border-b border-casual-black/10 dark:border-white/10 p-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold text-sporty-blue font-secondary">
                            {preCheckup ? 'Edit Pre-Checkup' : 'New Pre-Checkup'}
                        </h3>
                        {stage === 2 && (
                            <div className="text-sm text-casual-black/60 dark:text-concrete/60 mt-1">
                                {workflowMode === 'appointment' && selectedAppointment && (
                                    <>Recording for: <span className="font-bold text-fascinating-magenta">{selectedAppointment.patientId?.fullName || 'Patient'}</span> (Appt ID: {selectedAppointment.appointmentId})</>
                                )}
                                {workflowMode === 'walk-in' && walkInPatient && (
                                    <>Walk-in Recording for: <span className="font-bold text-[#008080]">{walkInPatient.fullName}</span></>
                                )}
                                {workflowMode === 'walk-in' && !walkInPatient && walkInNewPatient.fullName && (
                                    <>New Walk-in Recording for: <span className="font-bold text-[#008080]">{walkInNewPatient.fullName}</span></>
                                )}
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost text-casual-black/50 hover:text-fascinating-magenta transition-colors">
                        <HiXMark className="text-xl" />
                    </button>
                </div>

                <div className="p-6">
                    {/* STAGE 1: LOOKUP */}
                    {stage === 1 && (
                        <div className="animate-in slide-in-from-right-4 duration-300">
                            <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-xl border border-gray-100 dark:border-white/5 mb-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                    <h4 className="font-semibold text-casual-black dark:text-concrete">Step 1: Patient Selection</h4>
                                    <div className="join">
                                        <button type="button" onClick={() => setWorkflowMode('appointment')} className={`join-item btn btn-sm ${workflowMode === 'appointment' ? 'btn-active bg-sporty-blue text-white' : ''}`}>With Appointment</button>
                                        <button type="button" onClick={() => setWorkflowMode('walk-in')} className={`join-item btn btn-sm ${workflowMode === 'walk-in' ? 'btn-active bg-[#008080] text-white' : ''}`}>Walk-In (No Appt)</button>
                                    </div>
                                </div>

                                {workflowMode === 'appointment' && (
                                    <>
                                        <div className="join w-full grid grid-cols-3 mb-6">
                                            <button type="button" onClick={() => setLookupMode('appId')} className={`join-item btn btn-sm ${lookupMode === 'appId' ? 'btn-active bg-sporty-blue text-white' : ''}`}>By Appt ID</button>
                                            <button type="button" onClick={() => setLookupMode('phone')} className={`join-item btn btn-sm ${lookupMode === 'phone' ? 'btn-active bg-sporty-blue text-white' : ''}`}>By Mobile</button>
                                            <button type="button" onClick={() => setLookupMode('chamberDate')} className={`join-item btn btn-sm ${lookupMode === 'chamberDate' ? 'btn-active bg-sporty-blue text-white' : ''}`}>By Chamber & Date</button>
                                        </div>

                                        <div className="flex gap-4 items-end">
                                            {lookupMode === 'appId' && (
                                                <div className="form-control flex-1">
                                                    <label className="label"><span className="label-text">Appointment ID / Serial</span></label>
                                                    <input type="text" value={searchAppId} onChange={(e) => setSearchAppId(e.target.value)} className="input input-sm input-bordered w-full" placeholder="e.g. 26032811" />
                                                </div>
                                            )}
                                            {lookupMode === 'phone' && (
                                                <div className="form-control flex-1">
                                                    <label className="label"><span className="label-text">Patient Mobile Number</span></label>
                                                    <input type="text" value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} className="input input-sm input-bordered w-full" placeholder="+8801xxx" />
                                                </div>
                                            )}
                                            {lookupMode === 'chamberDate' && (
                                                <>
                                                    <div className="form-control flex-1">
                                                        <label className="label"><span className="label-text">Chamber</span></label>
                                                        <select className="select select-sm select-bordered w-full" value={searchChamber} onChange={(e) => setSearchChamber(e.target.value)}>
                                                            <option value="">Select Chamber...</option>
                                                            {chambers.map(ch => <option key={ch._id} value={ch._id}>{ch.chamberName}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="form-control flex-1">
                                                        <label className="label"><span className="label-text">Date</span></label>
                                                        <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className="input input-sm input-bordered w-full" />
                                                    </div>
                                                </>
                                            )}
                                            <button type="button" onClick={handleLookup} disabled={checkingAppt} className="btn btn-sm bg-fascinating-magenta hover:bg-fascinating-magenta/90 text-white flex items-center gap-2">
                                                {checkingAppt ? <span className="loading loading-spinner loading-xs"></span> : <HiMagnifyingGlass />}
                                                Search
                                            </button>
                                        </div>
                                    </>
                                )}

                                {workflowMode === 'walk-in' && (
                                    <>
                                        <div className="flex gap-4 items-end mb-6">
                                            <div className="form-control flex-1">
                                                <label className="label"><span className="label-text font-bold text-casual-black">Search Existing Patient (By Mobile Number)</span></label>
                                                <input type="text" value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} className="input input-sm input-bordered border-[#008080]/50 w-full" placeholder="+8801xxx" />
                                            </div>
                                            <button type="button" onClick={handlePatientLookup} disabled={checkingPatient} className="btn btn-sm bg-[#008080] hover:bg-[#006666] text-white flex items-center gap-2">
                                                {checkingPatient ? <span className="loading loading-spinner loading-xs"></span> : <HiMagnifyingGlass />}
                                                Search Patient
                                            </button>
                                        </div>

                                        <div className="divider">OR REGISTER NEW PATIENT</div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 bg-white/50 dark:bg-black/20 p-4 rounded border border-gray-100 dark:border-white/5">
                                            <div className="form-control">
                                                <label className="label"><span className="label-text">Full Name*</span></label>
                                                <input type="text" className="input input-sm input-bordered w-full" value={walkInNewPatient.fullName} onChange={e => setWalkInNewPatient({ ...walkInNewPatient, fullName: e.target.value })} placeholder="Patient Name" />
                                            </div>
                                            <div className="form-control">
                                                <label className="label"><span className="label-text">Phone*</span></label>
                                                <input type="text" className="input input-sm input-bordered w-full" value={walkInNewPatient.phone} onChange={e => setWalkInNewPatient({ ...walkInNewPatient, phone: e.target.value })} placeholder="+8801xxx" />
                                            </div>
                                            <div className="form-control">
                                                <label className="label"><span className="label-text">Age</span></label>
                                                <input type="number" className="input input-sm input-bordered w-full" value={walkInNewPatient.age} onChange={e => setWalkInNewPatient({ ...walkInNewPatient, age: e.target.value })} placeholder="Years" />
                                            </div>
                                            <div className="form-control">
                                                <label className="label"><span className="label-text">Gender</span></label>
                                                <select className="select select-sm select-bordered w-full" value={walkInNewPatient.gender} onChange={e => setWalkInNewPatient({ ...walkInNewPatient, gender: e.target.value })}>
                                                    <option>Male</option>
                                                    <option>Female</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2 md:col-span-4 flex justify-end">
                                                <button type="button" onClick={confirmNewWalkIn} className="btn btn-sm bg-[#008080] hover:bg-[#006666] text-white">Create & Start Pre-Checkup</button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Appointment Lookup Results */}
                            {workflowMode === 'appointment' && lookupResults.length > 0 && (
                                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden">
                                    <table className="table w-full relative z-0">
                                        <thead className="bg-casual-black/5 dark:bg-white/5">
                                            <tr>
                                                <th>Serial/ID</th>
                                                <th>Patient Name</th>
                                                <th>Phone</th>
                                                <th>Appointment Date</th>
                                                <th>Select</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lookupResults.map(appt => (
                                                <tr key={appt._id} className="hover:bg-casual-black/5 dark:hover:bg-white/5">
                                                    <td className="font-bold text-sporty-blue">#{appt.serial} ({appt.appointmentId})</td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <HiUser className="text-gray-400" />
                                                            {appt.patientId?.fullName || 'Unknown'}
                                                        </div>
                                                    </td>
                                                    <td>{appt.patientId?.phone || '-'}</td>
                                                    <td className="text-xs">{dayjs(appt.appointmentDate).format('YYYY-MM-DD')}</td>
                                                    <td>
                                                        <button disabled={appt.preCheckupId && appt.preCheckupId !== preCheckup?._id} onClick={() => confirmSelection(appt)} className="btn btn-xs outline outline-1 outline-sporty-blue text-sporty-blue bg-transparent hover:bg-sporty-blue hover:text-white">
                                                            {appt.preCheckupId && appt.preCheckupId !== preCheckup?._id ? 'Already Done' : 'Select'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Patient Lookup Results (Walk-in) */}
                            {workflowMode === 'walk-in' && patientLookupResults.length > 0 && (
                                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden">
                                    <table className="table w-full relative z-0">
                                        <thead className="bg-casual-black/5 dark:bg-white/5">
                                            <tr>
                                                <th>Patient Name</th>
                                                <th>Phone</th>
                                                <th>Age/Gender</th>
                                                <th>Select</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {patientLookupResults.map(pt => (
                                                <tr key={pt._id} className="hover:bg-casual-black/5 dark:hover:bg-white/5">
                                                    <td>
                                                        <div className="flex items-center gap-2 font-bold text-[#008080]">
                                                            <HiUser className="text-gray-400" />
                                                            {pt.fullName}
                                                        </div>
                                                    </td>
                                                    <td>{pt.phone}</td>
                                                    <td>{pt.age || '-'} / {pt.gender}</td>
                                                    <td>
                                                        <button type="button" onClick={() => confirmPatientSelection(pt)} className="btn btn-xs outline outline-1 outline-[#008080] text-[#008080] bg-transparent hover:bg-[#008080] hover:text-white">
                                                            Select to Start
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STAGE 2: FORM ENTRY */}
                    {stage === 2 && (
                        <form onSubmit={handleSubmit} className="animate-in slide-in-from-right-4 duration-300">
                            {/* Return to lookup button for 'Add' mode */}
                            {!preCheckup && (
                                <button type="button" onClick={() => setStage(1)} className="text-xs text-sporty-blue hover:underline mb-4 font-medium flex items-center">
                                    &larr; Back to lookup / Change Patient
                                </button>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                {/* Base Vitals */}
                                <div className="space-y-4">
                                    <h4 className="font-bold border-b border-gray-100 dark:border-white/10 pb-2 text-casual-black dark:text-concrete">Vitals</h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label"><span className="label-text">BP (mmHg)</span></label>
                                            <input type="text" placeholder="e.g. 120/80" className="input input-bordered input-sm w-full" value={vitals.bp} onChange={(e) => setVitals({ ...vitals, bp: e.target.value })} />
                                        </div>
                                        <div className="form-control">
                                            <label className="label"><span className="label-text">Weight (kg)</span></label>
                                            <input type="number" step="0.1" placeholder="65.5" className="input input-bordered input-sm w-full" value={vitals.weight} onChange={(e) => setVitals({ ...vitals, weight: e.target.value })} />
                                        </div>
                                        <div className="form-control">
                                            <label className="label"><span className="label-text">Height (cm)</span></label>
                                            <input type="number" step="0.1" placeholder="170" className="input input-bordered input-sm w-full" value={vitals.height} onChange={(e) => setVitals({ ...vitals, height: e.target.value })} />
                                        </div>
                                        <div className="form-control">
                                            <label className="label"><span className="label-text">Pulse (bpm)</span></label>
                                            <input type="number" placeholder="72" className="input input-bordered input-sm w-full" value={vitals.pulse} onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })} />
                                        </div>
                                        <div className="form-control col-span-2">
                                            <label className="label"><span className="label-text">Temperature (°F)</span></label>
                                            <input type="number" step="0.1" placeholder="98.6" className="input input-bordered input-sm w-full" value={vitals.temperature} onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                {/* Conditions */}
                                <div className="space-y-4 shadow-sm bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                    <h4 className="font-bold border-b border-gray-200 dark:border-white/10 pb-2 text-casual-black dark:text-concrete">Conditions</h4>

                                    <div className="grid grid-cols-2 gap-y-3">
                                        {Object.keys(conditions).map(cond => (
                                            <label key={cond} className="cursor-pointer label justify-start gap-3">
                                                <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={conditions[cond]} onChange={(e) => setConditions({ ...conditions, [cond]: e.target.checked })} />
                                                <span className="label-text capitalize">{cond}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Chief Complaints Array */}
                                <div className="md:col-span-2 space-y-4">
                                    <h4 className="font-bold border-b border-gray-100 dark:border-white/10 pb-2 text-casual-black dark:text-concrete flex justify-between items-center">
                                        Chief Complaints
                                        <button type="button" onClick={() => setChiefComplaints([...chiefComplaints, { complaint: '', duration: '' }])} className="btn btn-xs bg-sporty-blue hover:bg-sporty-blue/90 text-white border-none">
                                            + Add More
                                        </button>
                                    </h4>

                                    <div className="space-y-2">
                                        {chiefComplaints.map((item, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input required type="text" placeholder="Complaint..." className="input input-sm input-bordered flex-2 w-2/3" value={item.complaint} onChange={(e) => {
                                                    const newComplaints = [...chiefComplaints];
                                                    newComplaints[index].complaint = e.target.value;
                                                    setChiefComplaints(newComplaints);
                                                }} />
                                                <input placeholder="Duration (e.g. 2 days)" type="text" className="input input-sm input-bordered flex-1 w-1/3" value={item.duration} onChange={(e) => {
                                                    const newComplaints = [...chiefComplaints];
                                                    newComplaints[index].duration = e.target.value;
                                                    setChiefComplaints(newComplaints);
                                                }} />
                                                <button type="button" onClick={() => {
                                                    if (chiefComplaints.length > 1) {
                                                        const newArr = chiefComplaints.filter((_, i) => i !== index);
                                                        setChiefComplaints(newArr);
                                                    }
                                                }} className="btn btn-sm btn-square btn-ghost text-red-500 hover:bg-red-50">
                                                    <HiXMark />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Extended Data Options */}
                                <div className="md:col-span-2 space-y-4 shadow-sm bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 mt-2">
                                    <h4 className="font-bold border-b border-gray-200 dark:border-white/10 pb-2 text-casual-black dark:text-concrete">Patient History</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-control"><label className="label"><span className="label-text">Present Illness</span></label><textarea className="textarea textarea-bordered textarea-sm w-full" value={history.presentIllness} onChange={e => setHistory({ ...history, presentIllness: e.target.value })}></textarea></div>
                                        <div className="form-control"><label className="label"><span className="label-text">Past History</span></label><textarea className="textarea textarea-bordered textarea-sm w-full" value={history.pastHistory} onChange={e => setHistory({ ...history, pastHistory: e.target.value })}></textarea></div>
                                        <div className="form-control"><label className="label"><span className="label-text">Medical History</span></label><textarea className="textarea textarea-bordered textarea-sm w-full" value={history.medicalHistory} onChange={e => setHistory({ ...history, medicalHistory: e.target.value })}></textarea></div>
                                        <div className="form-control"><label className="label"><span className="label-text">Family History</span></label><textarea className="textarea textarea-bordered textarea-sm w-full" value={history.familyHistory} onChange={e => setHistory({ ...history, familyHistory: e.target.value })}></textarea></div>
                                        <div className="form-control"><label className="label"><span className="label-text">Drug History</span></label><textarea className="textarea textarea-bordered textarea-sm w-full" value={history.drugHistory} onChange={e => setHistory({ ...history, drugHistory: e.target.value })}></textarea></div>
                                        <div className="form-control"><label className="label"><span className="label-text">Allergy History</span></label><textarea className="textarea textarea-bordered textarea-sm w-full" value={history.allergyHistory} onChange={e => setHistory({ ...history, allergyHistory: e.target.value })}></textarea></div>
                                        <div className="form-control md:col-span-2 flex flex-row gap-6 mt-2">
                                            <label className="cursor-pointer label justify-start gap-3"><input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={history.socialHistory.smoking} onChange={e => setHistory({ ...history, socialHistory: { ...history.socialHistory, smoking: e.target.checked } })} /><span className="label-text">Smoking</span></label>
                                            <label className="cursor-pointer label justify-start gap-3"><input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={history.socialHistory.alcoholic} onChange={e => setHistory({ ...history, socialHistory: { ...history.socialHistory, alcoholic: e.target.checked } })} /><span className="label-text">Alcoholic</span></label>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-4 shadow-sm bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                    <h4 className="font-bold border-b border-gray-200 dark:border-white/10 pb-2 text-casual-black dark:text-concrete">Extended Examination</h4>
                                    <div className="form-control"><label className="label"><span className="label-text">General Examination</span></label><textarea className="textarea textarea-bordered textarea-sm w-full" value={examinationFields.general} onChange={e => setExaminationFields({ ...examinationFields, general: e.target.value })}></textarea></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        <div className="form-control"><label className="label"><span className="label-text">Cardiovascular</span></label><input type="text" className="input input-bordered input-sm w-full" value={examinationFields.systemic.cardiovascular} onChange={e => setExaminationFields({ ...examinationFields, systemic: { ...examinationFields.systemic, cardiovascular: e.target.value } })} /></div>
                                        <div className="form-control"><label className="label"><span className="label-text">Respiratory</span></label><input type="text" className="input input-bordered input-sm w-full" value={examinationFields.systemic.respiratory} onChange={e => setExaminationFields({ ...examinationFields, systemic: { ...examinationFields.systemic, respiratory: e.target.value } })} /></div>
                                        <div className="form-control"><label className="label"><span className="label-text">Abdominal</span></label><input type="text" className="input input-bordered input-sm w-full" value={examinationFields.systemic.abdominal} onChange={e => setExaminationFields({ ...examinationFields, systemic: { ...examinationFields.systemic, abdominal: e.target.value } })} /></div>
                                        <div className="form-control"><label className="label"><span className="label-text">Neurological</span></label><input type="text" className="input input-bordered input-sm w-full" value={examinationFields.systemic.neurological} onChange={e => setExaminationFields({ ...examinationFields, systemic: { ...examinationFields.systemic, neurological: e.target.value } })} /></div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 -mb-2 mt-4">
                                    <div className="form-control"><label className="label"><span className="label-text">Diagnosis</span></label><textarea className="textarea textarea-bordered h-20 w-full" value={diagnosis} onChange={e => setDiagnosis(e.target.value)}></textarea></div>
                                    <div className="form-control"><label className="label"><span className="label-text">Case Summary Snippet</span></label><textarea className="textarea textarea-bordered h-20 w-full" value={caseSummary} onChange={e => setCaseSummary(e.target.value)}></textarea></div>
                                    <div className="form-control"><label className="label"><span className="label-text">Counsellor Comment</span></label><textarea className="textarea textarea-bordered h-20 w-full" value={counsellorComment} onChange={e => setCounsellorComment(e.target.value)}></textarea></div>
                                    <div className="form-control"><label className="label"><span className="label-text">Doctor Comment</span></label><textarea className="textarea textarea-bordered h-20 w-full" value={doctorComment} onChange={e => setDoctorComment(e.target.value)}></textarea></div>
                                </div>

                                <div className="md:col-span-2 form-control mt-2">
                                    <label className="cursor-pointer label justify-start gap-3"><input type="checkbox" className="checkbox checkbox-error" checked={drugAllergy} onChange={e => setDrugAllergy(e.target.checked)} /><span className="label-text font-bold text-red-500">Patient Has Known Drug Allergy</span></label>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-casual-black/10 dark:border-white/10">
                                <button type="button" onClick={onClose} className="btn btn-outline border-casual-black/20 text-casual-black hover:bg-casual-black/10 dark:text-concrete dark:border-concrete/20 dark:hover:bg-white/10 font-secondary">Cancel</button>
                                <button type="submit" disabled={renderingForm} className="btn bg-fascinating-magenta hover:bg-fascinating-magenta/90 text-white border-none font-secondary">
                                    {renderingForm ? <span className="loading loading-spinner"></span> : preCheckup ? 'Update Pre-Checkup' : 'Save Pre-Checkup'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PreCheckupFormModal;
