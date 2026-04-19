import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from './Icons';
import { FileText } from 'lucide-react';
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import { HiXMark } from 'react-icons/hi2';
import Swal from 'sweetalert2';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  language, 
  onSave, 
  onPrint, 
  onExportPdf,
  prescriptionData = {}, 
  doctorProfile = {}, 
  selectedChamber = {} 
}) {
  const dict = {
    EN: {
      patient: 'Patient', vitals: 'Vital Signs', complaints: 'Chief Complaints',
      history: 'History Of', examination: 'On Examination', diagnosis: 'Diagnosis',
      investigations: 'Investigations', medicines: 'Medicines (Rx)', advice: 'Advice & Follow-up',
      interactions: 'Interactions', save: 'Save', print: 'Print', share: 'Share', template: 'Template', pdf: 'PDF'
    },
    BN: {
      patient: 'রোগী', vitals: 'শারীরিক লক্ষণ', complaints: 'প্রধান সমস্যা',
      history: 'পূর্বের ইতিহাস', examination: 'শারীরিক পরীক্ষা', diagnosis: 'রোগ নির্ণয়',
      investigations: 'পরীক্ষা-নির-ীক্ষা', medicines: 'ওষুধ (Rx)', advice: 'পরামর্শ ও ফলোআপ',
      interactions: 'ড্রাগ ইন্টারেকশন', save: 'সেভ করুন', print: 'প্রিন্ট', share: 'শেয়ার', template: 'টেমপ্লেট', pdf: 'পিডিএফ'
    }
  };

  const t = dict[language] || dict.EN;

  const menuItems = [
    { id: 'patient', label: t.patient, icon: ICONS.Patient },
    { id: 'vitals', label: t.vitals, icon: ICONS.Vitals },
    { id: 'complaints', label: t.complaints, icon: ICONS.Complaints },
    { id: 'history', label: t.history, icon: ICONS.History },
    { id: 'examination', label: t.examination, icon: ICONS.Examination },
    { id: 'diagnosis', label: t.diagnosis, icon: ICONS.Diagnosis },
    { id: 'investigations', label: t.investigations, icon: ICONS.Investigations },
    { id: 'medicines', label: t.medicines, icon: ICONS.Medicines },
    { id: 'advice', label: t.advice, icon: ICONS.Advice },
  ];

  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const shareMenuRef = useRef(null);
  const [shareModal, setShareModal] = useState({ type: null, data: null });

  useEffect(() => {
    function handleClickOutside(event) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setIsShareMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getShareDetails = () => {
    // 1. Extract and clean the phone number from the dynamic prescription state
    let cleanPhone = prescriptionData?.patient?.phone ? prescriptionData.patient.phone.replace(/\D/g, '') : '';
    
    // 2. Format the number dynamically (Auto-add country code if it's a local 11-digit BD number)
    if (cleanPhone.length === 11 && cleanPhone.startsWith('01')) {
      cleanPhone = '88' + cleanPhone;
    }

    const publicLink = prescriptionData?.prescriptionId ? `${window.location.origin}/prescription/${prescriptionData.prescriptionId}` : null;

    return {
      patientName: prescriptionData?.patient?.name || 'Patient',
      patientPhone: cleanPhone, 
      patientEmail: prescriptionData?.patient?.email || '', 
      doctorName: doctorProfile?.name || 'Doctor',
      clinicName: selectedChamber?.chamberName || 'Our Clinic',
      publicLink: publicLink
    };
  };

  const openWhatsAppModal = () => {
    const { patientName, patientPhone, doctorName, clinicName, publicLink } = getShareDetails();
    const linkAppendix = publicLink ? `\n\nView or download your digital prescription securely here:\n${publicLink}` : '';
    const text = `Hello ${patientName},\nThis is ${doctorName} from ${clinicName}.\n\nYour prescription is ready. Please follow the instructions carefully.${linkAppendix}\n\nThank you!`;
    
    setShareModal({
      type: 'whatsapp',
      data: { phone: patientPhone, message: text }
    });
    setIsShareMenuOpen(false);
  };

  const openEmailModal = () => {
    const { patientName, patientEmail, doctorName, publicLink } = getShareDetails();
    const subject = `Your Prescription from ${doctorName}`;
    const linkAppendix = publicLink ? `\n\nYou can view, print, or download your prescription securely online using this link:\n${publicLink}` : '';
    const body = `Dear ${patientName},\n\nI hope you are doing well.\n\nPlease find your digital prescription attached.${linkAppendix}\n\nRegards,\n${doctorName}`;

    setShareModal({
      type: 'email',
      data: { email: patientEmail, subject: subject, message: body }
    });
    setIsShareMenuOpen(false);
  };

  const triggerNativeShare = async () => {
    const { publicLink, patientName } = getShareDetails();
    
    if (!publicLink) {
        Swal.fire({
            icon: 'warning',
            title: 'Not Saved',
            text: 'Save the prescription first to generate a shareable public link!',
            timer: 3000,
            showConfirmButton: false
        });
        return;
    }

    if (navigator.share) {
        try {
            await navigator.share({
                title: `Prescription for ${patientName}`,
                text: `View your digital prescription securely:`,
                url: publicLink,
            });
        } catch (err) {
            console.error('Error sharing:', err);
        }
    } else {
        // Fallback for browsers without Web Share API
        navigator.clipboard.writeText(publicLink).then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Link Copied',
                text: 'Public prescription link copied to clipboard!',
                timer: 2000,
                showConfirmButton: false
            });
        });
    }
    setIsShareMenuOpen(false);
  };

  const executeWhatsAppShare = () => {
    const { phone, message } = shareModal.data;
    // Final safety check to strip spaces if the doctor edited the number manually in the modal
    const finalPhone = phone ? phone.replace(/\D/g, '') : '';
    
    const url = finalPhone
      ? `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      
    window.open(url, '_blank');
    setShareModal({ type: null, data: null });
  };

  const executeEmailShare = () => {
    const { email, subject, message } = shareModal.data;
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.open(mailtoUrl, '_blank');
    setShareModal({ type: null, data: null });
  };

  const handleModalChange = (field, value) => {
    setShareModal(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value }
    }));
  };

  // Check if clinical data is completely empty
  const isPrescriptionEmpty = () => {
    const d = prescriptionData;
    if (!d) return true;
    return (
      (!d.complaints || d.complaints.length === 0) &&
      (!d.history || d.history.length === 0) &&
      (!d.examination || d.examination.length === 0) &&
      (!d.diagnosis || d.diagnosis.length === 0) &&
      (!d.investigations || d.investigations.length === 0) &&
      (!d.medicines || d.medicines.length === 0) &&
      (!d.advice || d.advice.length === 0) &&
      (!d.vitals || (!d.vitals.bp && !d.vitals.weight && !d.vitals.pulse && !d.vitals.temp && !d.vitals.height && !d.vitals.spo2)) &&
      !d.followUp
    );
  };

  const handleAction = (action, actionName) => {
    if (isPrescriptionEmpty()) {
      Swal.fire({
        icon: 'warning',
        title: 'Empty Prescription',
        text: `Prescription is fully empty! Cannot ${actionName.toLowerCase()}. Please add some clinical details.`,
        timer: 15000,
        timerProgressBar: true
      });
      return;
    }
    if (typeof action === 'function') action();
  };

  return (
    <>
      <aside className="w-full xl:w-64 bg-white dark:bg-gray-800 border-b xl:border-r border-slate-200 dark:border-gray-700 flex flex-col shrink-0 transition-colors duration-300 print:hidden relative z-40 shadow-sm">
        <div className="flex-none xl:flex-1 overflow-x-auto xl:overflow-y-auto py-2 custom-scrollbar">
          <nav className="flex xl:flex-col space-x-2 xl:space-x-0 xl:space-y-1 px-2 min-w-max xl:min-w-0">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-none xl:w-full flex items-center gap-2 xl:gap-3 px-3 py-2 xl:py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                    : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700'
                    }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </button>
              );
            })}

            <div className="mt-0 xl:mt-4 px-1 flex-none xl:flex-auto">
              <button
                onClick={() => setActiveTab('interactions')}
                className={`flex items-center justify-between gap-1 xl:gap-2 px-3 py-2 rounded-lg border transition-colors ${activeTab === 'interactions'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <ICONS.Interactions size={18} />
                  <span className="text-sm font-semibold">{t.interactions}</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${activeTab === 'interactions' ? 'bg-white text-amber-600' : 'bg-amber-500 text-white'
                  }`}>AI</span>
              </button>
            </div>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-gray-700 space-y-3 bg-white dark:bg-gray-800 transition-colors duration-300">
          <button
            onClick={() => handleAction(onSave, t.save)}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all shadow-sm"
          >
            <ICONS.Save size={18} />
            {t.save}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAction(onPrint, t.print)}
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-lg text-slate-700 dark:text-gray-300 transition-colors"
            >
              <ICONS.Print size={16} /> {t.print}
            </button>

            <button
              onClick={() => handleAction(onExportPdf, t.pdf)}
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-lg text-slate-700 dark:text-gray-300 transition-colors"
            >
              <FileText size={16} /> {t.pdf}
            </button>

            <div className="relative" ref={shareMenuRef}>
              <button 
                onClick={() => handleAction(() => setIsShareMenuOpen(!isShareMenuOpen), t.share)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-lg text-slate-700 dark:text-gray-300 transition-colors"
              >
                <ICONS.Share size={16} /> {t.share}
              </button>

              {isShareMenuOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-48 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
                  <button 
                    onClick={openWhatsAppModal}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm font-medium text-slate-700 dark:text-gray-200"
                  >
                    <FaWhatsapp className="text-green-500 text-lg" /> WhatsApp Patient
                  </button>
                  <button 
                    onClick={openEmailModal}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-medium text-slate-700 dark:text-gray-200 border-t border-slate-100 dark:border-gray-700"
                  >
                    <FaEnvelope className="text-blue-500 text-lg" /> Email Patient
                  </button>
                  <button 
                    onClick={triggerNativeShare}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700/20 text-sm font-bold text-slate-800 dark:text-gray-100 border-t border-slate-200 dark:border-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    More Apps (FB, X, SMS...)
                  </button>
                </div>
              )}
            </div>

            <button className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold border border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-lg text-slate-700 dark:text-gray-300 transition-colors">
              <ICONS.Template size={16} /> {t.template}
            </button>
          </div>
        </div>
      </aside>

      {shareModal.type && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 dark:border-gray-700 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-gray-700">
              <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800 dark:text-gray-100">
                {shareModal.type === 'whatsapp' ? <FaWhatsapp className="text-green-500" /> : <FaEnvelope className="text-blue-500" />}
                {shareModal.type === 'whatsapp' ? 'Review WhatsApp Message' : 'Review Email Message'}
              </h3>
              <button onClick={() => setShareModal({ type: null, data: null })} className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-300">
                <HiXMark size={24} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {shareModal.type === 'whatsapp' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase">Patient WhatsApp Number</label>
                  <input 
                    type="text" 
                    value={shareModal.data.phone || ''} 
                    onChange={(e) => handleModalChange('phone', e.target.value)}
                    placeholder="e.g. 8801700000000"
                    className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              )}

              {shareModal.type === 'email' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase">Patient Email Address</label>
                    <input 
                      type="email" 
                      value={shareModal.data.email || ''} 
                      onChange={(e) => handleModalChange('email', e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase">Subject</label>
                    <input 
                      type="text" 
                      value={shareModal.data.subject || ''} 
                      onChange={(e) => handleModalChange('subject', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase">Message Content</label>
                <textarea 
                  rows={6}
                  value={shareModal.data.message || ''} 
                  onChange={(e) => handleModalChange('message', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-gray-900 border-t border-slate-100 dark:border-gray-700">
              <button 
                onClick={() => setShareModal({ type: null, data: null })}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={shareModal.type === 'whatsapp' ? executeWhatsAppShare : executeEmailShare}
                className={`px-5 py-2 text-sm font-bold text-white rounded-lg transition-colors shadow-sm ${shareModal.type === 'whatsapp' ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'}`}
              >
                {shareModal.type === 'whatsapp' ? 'Open WhatsApp' : 'Open Email App'}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}