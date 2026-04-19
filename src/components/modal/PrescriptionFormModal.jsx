import React, { useState, useEffect, useContext } from 'react';
import Sidebar from './../../components/Prescription/Sidebar';
import PrescriptionPreview from './../../components/Prescription/PrescriptionPreview';
import RightPanel from './../../components/Prescription/RightPanel';
import { ICONS } from './../../components/Prescription/Icons';
import { toast } from 'react-toastify';

import usePrescription from '../../Hook/usePrescription';
import useChamber from '../../Hook/useChamber';
import useDoctorProfile from '../../Hook/useDoctorProfile';
import { AuthContext } from '../../providers/AuthProvider';



// function checkingOnlineStatus() {
//   setInterval(() => {
//     if (navigator.onLine) {
//       console.log("You are online");
//     } else {
//       console.log("You are offline");
//     }  }, 5000); // Check every 5 seconds
  
// }

// checkingOnlineStatus();


// Note: Ensure this matches the import in your parent component. 
// If your parent imports "PrescriptionFormModal", you might want to rename this function to PrescriptionFormModal.
export default function CreatePrescription({ isOpen, onClose, onSuccess, prescription = null }) {
  const [activeTab, setActiveTab] = useState('patient');
  const [language, setLanguage] = useState('EN');

  const { branch, user } = useContext(AuthContext);

  const { createPrescription, updatePrescription, loading: isSaving } = usePrescription();
  const { getChambersByBranch } = useChamber();
  const { getProfilesByBranch } = useDoctorProfile();

  const [chambers, setChambers] = useState([]);
  const [selectedChamber, setSelectedChamber] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);

  // 1. Start with a clean, empty state
  const emptyPrescriptionState = {
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
    medicines: [],
    advice: [],
    adviceText: '',
    followUp: ''
  };

  const [prescriptionData, setPrescriptionData] = useState(emptyPrescriptionState);

  // ✨ CRITICAL FIX: Update the state whenever the `prescription` prop changes
  useEffect(() => {
    if (isOpen && prescription) {
      // If we are editing, populate the state with the existing data
      setPrescriptionData({
        patient: {
          name: prescription.patient?.name || '',
          age: prescription.patient?.age || '',
          gender: prescription.patient?.gender || '',
          phone: prescription.patient?.phone || '',
          patientId: prescription.patientId || ''
        },
        vitals: {
          bp: prescription.vitals?.bp || '',
          weight: prescription.vitals?.weight || '',
          pulse: prescription.vitals?.pulse || '',
          temp: prescription.vitals?.temp || '',
          height: prescription.vitals?.height || '',
          spo2: prescription.vitals?.spo2 || ''
        },
        complaints: prescription.complaints || [],
        complaintsText: prescription.complaintsText || '',
        history: prescription.history || [],
        historyText: prescription.historyText || '',
        examination: prescription.examination || [],
        examinationText: prescription.examinationText || '',
        diagnosis: prescription.diagnosis || [],
        diagnosisText: prescription.diagnosisText || '',
        investigations: prescription.investigations || [],
        medicines: prescription.medicines || [],
        advice: prescription.advice || [],
        adviceText: prescription.adviceText || '',
        followUp: prescription.followUp || ''
      });
    } else if (isOpen && !prescription) {
      // If we are creating a NEW prescription, ensure the state is wiped clean
      setPrescriptionData(emptyPrescriptionState);
    }
  }, [isOpen, prescription]);


  // 2. Fetch Chambers and Doctor Profile
  useEffect(() => {
    if (!isOpen || !branch) return;

    const fetchHeaderData = async () => {
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
          // Auto-select chamber based on existing prescription
          if (prescription?.chamberId) {
            const matchedChamber = chamberRes.data.find(c => c._id === prescription.chamberId);
            setSelectedChamber(matchedChamber || chamberRes.data[0]);
          } else {
            setSelectedChamber(chamberRes.data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data for prescription header:", err);
      }
    };

    fetchHeaderData();
  }, [branch, getProfilesByBranch, getChambersByBranch, prescription, isOpen]);

  // Return null if modal is not open
  if (!isOpen) return null;

  // 3. Update Function (Used by your RightPanel components)
  const updateData = (field, value) => {
    setPrescriptionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 4. Save Logic (Handles both Create and Update)
  const handleSave = async () => {
    const { name, patientId } = prescriptionData.patient;
    if (!name) {
      toast.error("Patient name is required!");
      return;
    }

    const finalDoctorId = doctorProfile?._id || user?._id || user?.id;

    if (!branch || !finalDoctorId) {
      toast.error("Doctor or Branch information is missing. Please log in again.");
      return;
    }

    try {
      const payload = {
        ...prescriptionData,
        branch: branch,
        patientId: patientId || null,
        doctorId: finalDoctorId,
        chamberId: selectedChamber?._id || null,
        status: 'Completed'
      };

      if (prescription?._id) {
        // UPDATE EXISTING
        await updatePrescription(prescription._id, payload);
        toast.success("Prescription updated successfully!");
      } else {
        // CREATE NEW
        await createPrescription(payload);
        toast.success("Prescription saved successfully!");
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();

    } catch (error) {
      console.error("Error saving prescription:", error);
      toast.error(error || "Failed to save prescription.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col h-screen w-screen bg-white dark:bg-gray-800 overflow-hidden font-sans transition-colors duration-300">

      {/* Inner Header */}
      <header className="h-14 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between px-4 shrink-0 z-20 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-full transition-colors text-slate-600 dark:text-gray-300">
            <ICONS.Menu size={20} />
          </button>
          {/* ✨ Dynamic Heading based on prescription prop */}
          <h1 className="font-bold text-lg text-slate-800 dark:text-gray-100">
            {prescription ? 'Edit Prescription' : 'Create Prescription'}
          </h1>
        </div>

        <div className="flex items-center gap-3">

          {chambers.length > 0 && (
            <select
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            <button onClick={() => setLanguage('EN')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${language === 'EN' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-500 dark:text-gray-300 hover:text-slate-700 dark:hover:text-white'}`}>EN</button>
            <button onClick={() => setLanguage('BN')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${language === 'BN' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-500 dark:text-gray-300 hover:text-slate-700 dark:hover:text-white'}`}>BN</button>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-full transition-all"
          >
            <ICONS.Close size={20} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          language={language}
          onSave={handleSave}
        />

        {isSaving && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <span className="text-cyan-600 font-bold flex items-center gap-2">
              <span className="loading loading-spinner loading-md"></span>
              {/* ✨ Dynamic Loading Text */}
              {prescription ? 'Updating Prescription...' : 'Saving Prescription...'}
            </span>
          </div>
        )}

        <PrescriptionPreview
          data={prescriptionData}
          language={language}
          doctor={doctorProfile}
          chamber={selectedChamber}
        />

        <RightPanel activeTab={activeTab} data={prescriptionData} updateData={updateData} language={language} />
      </div>
    </div>
  );
}