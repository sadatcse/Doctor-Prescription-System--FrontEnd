import React, { useState, useEffect, useContext } from 'react';
import Sidebar from './../../components/Prescription/Sidebar';
import PrescriptionPreview from './../../components/Prescription/PrescriptionPreview';
import RightPanel from './../../components/Prescription/RightPanel';
import { ICONS } from './../../components/Prescription/Icons';
import { useLocation, useOutletContext } from 'react-router-dom';
import Swal from 'sweetalert2';

import usePrescription from '../../Hook/usePrescription';
import useChamber from '../../Hook/useChamber';
import useDoctorProfile from '../../Hook/useDoctorProfile';
import { AuthContext } from '../../providers/AuthProvider';

import { generatePrescriptionPdf } from '../../components/utils/generatePrescriptionPdf';
import AppointmentViewModal from '../../components/modal/AppointmentViewModal';
import PastPrescriptionsModal from '../../components/modal/PastPrescriptionsModal';
import PrescriptionViewModal from '../../components/modal/PrescriptionViewModal';

export default function CreatePrescription() {
  const location = useLocation();
  const incomingAppointment = location.state?.appointmentData;
  const editPrescription = location.state?.editPrescription;

  const [activeTab, setActiveTab] = useState('patient');
  const [language, setLanguage] = useState('EN');
  const [isExporting, setIsExporting] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [viewingPrescription, setViewingPrescription] = useState(null);

  const { toggleGlobalSidebar } = useOutletContext() || {};

  const { branch, user } = useContext(AuthContext);
  const { createPrescription, updatePrescription, getPrescriptionsByBranch, loading: isSaving } = usePrescription();
  const { getChambersByBranch } = useChamber();
  const { getProfilesByBranch } = useDoctorProfile();

  const [chambers, setChambers] = useState([]);
  const [selectedChamber, setSelectedChamber] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [pastPrescriptionCount, setPastPrescriptionCount] = useState(null);

  const [prescriptionData, setPrescriptionData] = useState({
    patient: { name: '', age: '', gender: '', phone: '', patientId: '' },
    vitals: { bp: '', weight: '', pulse: '', temp: '', height: '', spo2: '' },
    complaints: [],
    complaintsText: '',
    history: [],
    historyText: '',
    examination: [],
    examinationText: '',
    diagnosis: [],
    diagnosisText: '',
    investigations: [],
    investigationsDiscount: '',
    medicines: [],
    advice: [],
    adviceText: '',
    followUp: '',
    patientType: 'New Patient'
  });

  useEffect(() => {
    const phone = prescriptionData.patient?.phone;
    const name = prescriptionData.patient?.name;
    const searchVal = phone?.length >= 4 ? phone : (name?.length >= 3 ? name : null);

    if (!searchVal || !branch || !getPrescriptionsByBranch) {
      setPastPrescriptionCount(null);
      return;
    }

    const fetchHistoryCount = async () => {
      try {
        const res = await getPrescriptionsByBranch(branch, { search: searchVal, limit: 1 });
        if (res?.success) {
          setPastPrescriptionCount(res.pagination?.totalItems || res.data?.length || 0);
        } else {
          setPastPrescriptionCount(0);
        }
      } catch (err) {
        console.error("Failed to fetch past prescription count", err);
      }
    };

    const timer = setTimeout(fetchHistoryCount, 600);
    return () => clearTimeout(timer);
  }, [prescriptionData.patient?.phone, prescriptionData.patient?.name, branch, getPrescriptionsByBranch]);

  const targetAppointmentId = incomingAppointment?._id;
  const hasPreCheckup = Boolean(incomingAppointment?.preCheckupId);

  useEffect(() => {
    if (incomingAppointment) {
      const pId = incomingAppointment.patientId;
      const checkup = incomingAppointment.preCheckupId;

      setPrescriptionData(prev => ({
        ...prev,
        patient: {
          name: pId?.fullName || '',
          age: pId?.age || '',
          gender: pId?.gender || '',
          phone: pId?.phone || '',
          patientId: pId?._id || ''
        },
        vitals: {
          bp: checkup?.examination?.vitals?.bp || prev.vitals.bp,
          weight: checkup?.examination?.vitals?.weight || prev.vitals.weight,
          pulse: checkup?.examination?.vitals?.pulse || prev.vitals.pulse,
          temp: checkup?.examination?.vitals?.temperature || prev.vitals.temp,
          height: checkup?.examination?.vitals?.height || prev.vitals.height,
          spo2: prev.vitals.spo2
        },
        patientType: incomingAppointment.patientType || prev.patientType,
        complaints: checkup?.chiefComplaints
          ? checkup.chiefComplaints.map(c => c.complaint)
          : prev.complaints
      }));
    } else if (editPrescription) {
      setPrescriptionData({
        _id: editPrescription._id,
        prescriptionId: editPrescription.prescriptionId,
        patient: {
          name: editPrescription.patient?.name || '',
          age: editPrescription.patient?.age || '',
          gender: editPrescription.patient?.gender || '',
          phone: editPrescription.patient?.phone || '',
          patientId: editPrescription.patientId || ''
        },
        vitals: editPrescription.vitals || { bp: '', weight: '', pulse: '', temp: '', height: '', spo2: '' },
        complaints: editPrescription.complaints || [],
        complaintsText: editPrescription.complaintsText || '',
        history: editPrescription.history || [],
        historyText: editPrescription.historyText || '',
        examination: editPrescription.examination || [],
        examinationText: editPrescription.examinationText || '',
        diagnosis: editPrescription.diagnosis || [],
        diagnosisText: editPrescription.diagnosisText || '',
        investigations: editPrescription.investigations || [],
        investigationsDiscount: editPrescription.investigationsDiscount || '',
        medicines: editPrescription.medicines || [],
        advice: editPrescription.advice || [],
        adviceText: editPrescription.adviceText || '',
        followUp: editPrescription.followUp || '',
        patientType: editPrescription.patientType || 'Old Patient'
      });
    }
  }, [incomingAppointment, editPrescription]);

  useEffect(() => {
    const fetchHeaderData = async () => {
      if (!branch) return;
      try {
        const [profileRes, chamberRes] = await Promise.all([
          getProfilesByBranch(branch, { page: 1, limit: 1 }),
          getChambersByBranch(branch, { page: 1, limit: 50 })
        ]);

        if (profileRes?.data && profileRes.data.length > 0) {
          setDoctorProfile(profileRes.data[0]);
        }

        if (chamberRes?.data && chamberRes.data.length > 0) {
          setChambers(chamberRes.data);
          if (editPrescription?.chamberId) {
             const matched = chamberRes.data.find(c => c._id === editPrescription.chamberId);
             setSelectedChamber(matched || chamberRes.data[0]);
          } else {
             setSelectedChamber(chamberRes.data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data for prescription header:", err);
      }
    };

    fetchHeaderData();
  }, [branch, getProfilesByBranch, getChambersByBranch]);

  const updateData = (field, value) => {
    setPrescriptionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (showSuccessAlert = true) => {
    const { patientId } = prescriptionData.patient;
    if (!prescriptionData.patient.name) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Info',
        text: 'Patient name is required!',
        timer: 15000,
        timerProgressBar: true
      });
      return false;
    }

    const finalDoctorId = doctorProfile?._id || user?._id || user?.id;

    if (!branch || !finalDoctorId) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: 'Doctor or Branch information is missing. Please log in again.',
        timer: 15000,
        timerProgressBar: true
      });
      return false;
    }

    try {
      const payload = {
        ...prescriptionData,
        branch: branch,
        patientId: patientId,
        doctorId: finalDoctorId,
        chamberId: selectedChamber?._id || null,
        appointmentId: targetAppointmentId || null,
        status: 'Completed'
      };

      let savedDoc;
      if (prescriptionData._id) {
        savedDoc = await updatePrescription(prescriptionData._id, payload);
      } else {
        savedDoc = await createPrescription(payload);
      }

      if (savedDoc && savedDoc._id) {
        setPrescriptionData(prev => ({
          ...prev,
          _id: savedDoc._id,
          prescriptionId: savedDoc.prescriptionId || prev.prescriptionId
        }));
      }

      if (showSuccessAlert) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Prescription saved successfully! Barcode is now active.',
          timer: 15000,
          timerProgressBar: true
        });
      }
      return true;
    } catch (error) {
      console.error("Error saving prescription:", error);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: error || 'Failed to save prescription.',
        timer: 15000,
        timerProgressBar: true
      });
      return false;
    }
  };

  const handlePrint = async () => {
    const saved = await handleSave(false);
    if (!saved) return;

    // Delay slightly to absolutely ensure React has finished painting the Barcode from state update
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    const saved = await handleSave(false);

    if (!saved) {
      setIsExporting(false);
      return;
    }

    // Rely on the jsPDF direct generator tool for silent automatic download
    setTimeout(async () => {
      await generatePrescriptionPdf('prescription-preview', prescriptionData.patient.name);
      setIsExporting(false);
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-800 rounded-lg shadow border border-slate-200 dark:border-gray-700 overflow-hidden font-sans transition-colors duration-300 print:h-auto print:overflow-visible print:shadow-none print:border-none">

      <header className="h-14 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between px-4 shrink-0 z-20 transition-colors duration-300 print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (toggleGlobalSidebar) toggleGlobalSidebar();
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-full transition-colors text-slate-600 dark:text-gray-300">
            <ICONS.Menu size={20} />
          </button>
          <h1 className="font-bold text-lg text-slate-800 dark:text-gray-100">Create Prescription</h1>
        </div>

        <div className="flex items-center gap-3">
          {pastPrescriptionCount !== null && pastPrescriptionCount > 0 && (
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="mr-2 px-4 py-1.5 bg-sporty-blue hover:bg-sporty-blue/90 text-concrete font-bold text-sm rounded-lg shadow-sm transition-all flex items-center gap-2 whitespace-nowrap hidden sm:flex"
            >
              <ICONS.History size={16} />
              History ({pastPrescriptionCount})
            </button>
          )}

          {hasPreCheckup && (
            <button
              type="button"
              onClick={() => setIsViewModalOpen(true)}
              className="mr-2 px-4 py-1.5 bg-blue-green hover:bg-blue-green/90 text-concrete font-bold text-sm rounded-lg shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              View Pre-Checkup
            </button>
          )}

          {chambers.length > 0 && (
            <select
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-sporty-blue focus:border-sporty-blue block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={selectedChamber?._id || ''}
              onChange={(e) => {
                const selected = chambers.find(c => c._id === e.target.value);
                setSelectedChamber(selected);
              }}
            >
              {chambers.map(chamber => (
                <option key={chamber._id} value={chamber._id}>
                  {chamber.chamberName}
                </option>
              ))}
            </select>
          )}

          <div className="flex bg-slate-100 dark:bg-gray-700 p-1 rounded-lg transition-colors ml-2">
            <button
              onClick={() => setLanguage('EN')}
              className={`px-3 py-1 text-xs font-bold rounded transition-all ${language === 'EN'
                ? 'bg-sporty-blue text-concrete shadow-sm'
                : 'text-slate-500 dark:text-gray-300 hover:text-slate-700 dark:hover:text-white'
                }`}
            >EN</button>
            <button
              onClick={() => setLanguage('BN')}
              className={`px-3 py-1 text-xs font-bold rounded transition-all ${language === 'BN'
                ? 'bg-sporty-blue text-concrete shadow-sm'
                : 'text-slate-500 dark:text-gray-300 hover:text-slate-700 dark:hover:text-white'
                }`}
            >BN</button>
          </div>

          <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-full transition-all">
            <ICONS.Close size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden relative print:h-auto print:overflow-visible">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          language={language}
          onSave={handleSave}
          onPrint={handlePrint}
          onExportPdf={handleExportPdf}
          prescriptionData={prescriptionData}
          doctorProfile={doctorProfile}
          selectedChamber={selectedChamber}
        />

        {isSaving && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-50 flex items-center justify-center backdrop-blur-sm print:hidden">
            <span className="text-sporty-blue font-bold flex items-center gap-2">
              <span className="loading loading-spinner loading-md"></span> Saving Prescription...
            </span>
          </div>
        )}

        {isExporting && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-50 flex items-center justify-center backdrop-blur-sm print:hidden">
            <span className="text-sporty-blue font-bold flex items-center gap-2">
              <span className="loading loading-spinner loading-md"></span> Generating PDF...
            </span>
          </div>
        )}

        {/* ✅ FIX: We are now passing `isExporting` to the preview component */}
        <PrescriptionPreview
          data={prescriptionData}
          language={language}
          doctor={doctorProfile}
          chamber={selectedChamber}
          isExporting={isExporting}
        />

        <RightPanel activeTab={activeTab} data={prescriptionData} updateData={updateData} language={language} />
      </div>

      <AppointmentViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        appointmentId={targetAppointmentId}
      />

      <PastPrescriptionsModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        patientPhone={prescriptionData.patient?.phone || prescriptionData.patient?.name}
        patientName={prescriptionData.patient?.name}
        onSelectPrescription={(p) => {
          setViewingPrescription(p);
          setIsHistoryModalOpen(false);
        }}
      />

      <PrescriptionViewModal
        isOpen={!!viewingPrescription}
        onClose={() => {
          setViewingPrescription(null);
          setIsHistoryModalOpen(true);
        }}
        prescriptionData={viewingPrescription}
        doctorProfile={doctorProfile}
        chamber={selectedChamber}
        onClone={(oldData) => {
          setPrescriptionData(prev => ({
              ...prev,
              vitals: oldData.vitals || prev.vitals,
              complaints: oldData.complaints || [],
              complaintsText: oldData.complaintsText || '',
              history: oldData.history || [],
              historyText: oldData.historyText || '',
              examination: oldData.examination || [],
              examinationText: oldData.examinationText || '',
              diagnosis: oldData.diagnosis || [],
              diagnosisText: oldData.diagnosisText || '',
              investigations: oldData.investigations || [],
              investigationsDiscount: oldData.investigationsDiscount || '',
              medicines: oldData.medicines || [],
              advice: oldData.advice || [],
              adviceText: oldData.adviceText || '',
              followUp: oldData.followUp || ''
          }));
          setViewingPrescription(null);
          Swal.fire({
            icon: 'success',
            title: 'Cloned!',
            text: 'Data imported perfectly. Tweak it and save as a new receipt.',
            timer: 3000,
            timerProgressBar: true
          });
        }}
      />

    </div>
  );
}