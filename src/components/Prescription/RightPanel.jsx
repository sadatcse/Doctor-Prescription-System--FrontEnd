import React, { useState } from 'react';
import { ICONS } from '../../components/Prescription/Icons';
import { CHIPS_DATA } from '../../data/chips';

// Import your newly separated panels (Adjust paths as needed!)
import PatientPanel from './PatientPanel';
import VitalsPanel from './VitalsPanel';
import InvestigationsPanel from './InvestigationsPanel';
import MedicinesPanel from './MedicinesPanel';
import AdvicePanel from './AdvicePanel';
import InteractionsPanel from './InteractionsPanel';

// Shared Component used in the RightPanel (and inside some sub-panels)
export const ChipGroup = ({ items, selected = [], onToggle }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((item) => {
      const isSelected = selected.includes(item);
      return (
        <button
          key={item}
          onClick={() => onToggle(item)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isSelected
            ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
            : 'bg-white dark:bg-gray-700 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-gray-600 hover:border-cyan-400 dark:hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400'
            }`}
        >
          {item}
        </button>
      );
    })}
  </div>
);

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="p-4 border-b border-slate-100 dark:border-gray-700 flex items-center gap-2 text-cyan-700 dark:text-cyan-400 bg-white dark:bg-gray-800 sticky top-0 z-10 transition-colors duration-300">
    <Icon size={20} />
    <h2 className="font-bold text-slate-800 dark:text-gray-100">{title}</h2>
  </div>
);

// ✨ Extracted Component (Text Area Removed)
const TextAndChipPanel = ({ activeTab, data, updateData, t, handleToggle }) => {
  const [customItem, setCustomItem] = useState('');

  const handleAddCustom = (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    const trimmed = customItem.trim();

    if (trimmed) {
      const current = data[activeTab] || [];
      // Only add if it doesn't already exist
      if (!current.includes(trimmed)) {
        updateData(activeTab, [...current, trimmed]);
      }
      setCustomItem(''); // Clear input field
    }
  };

  // Merge default chips with custom selected chips and remove duplicates
  const standardChips = CHIPS_DATA[activeTab] || [];
  const selectedChips = data[activeTab] || [];
  const allChips = Array.from(new Set([...standardChips, ...selectedChips]));

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {/* Removable Bullet Text Section */}
        {selectedChips.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Selected Items
            </h3>
            <ul className="flex flex-col gap-2">
              {selectedChips.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start justify-between bg-cyan-50 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-300 px-3 py-2 rounded-lg border border-cyan-100 dark:border-cyan-800/50 text-sm shadow-sm"
                >
                  <span className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-cyan-500"></span>
                    <span className="leading-snug">{item}</span>
                  </span>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggle(activeTab, item);
                    }}
                    className="ml-3 p-1 shrink-0 text-cyan-600 dark:text-cyan-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all"
                    title="Remove item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <h3 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          {t.quickPick}
        </h3>

        {/* Custom Input Form */}
        <form onSubmit={handleAddCustom} className="flex gap-2 mb-4">
          <input
            type="text"
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
            placeholder="Type and press Enter to add..."
            className="flex-1 p-2 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 dark:bg-gray-600 hover:bg-slate-200 dark:hover:bg-gray-500 text-slate-700 dark:text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Add
          </button>
        </form>

        <ChipGroup
          items={allChips}
          selected={selectedChips}
          onToggle={(item) => handleToggle(activeTab, item)}
        />
      </div>
    </div>
  );
};

export default function RightPanel({ activeTab, data, updateData, language }) {
  // Translation Dictionary
  const dict = {
    EN: {
      fullName: 'Full Name', phone: 'Phone Number', age: 'Age', gender: 'Gender', select: 'Select', male: 'Male', female: 'Female', other: 'Other',
      newPatient: 'Save Patient', recentPatients: 'Recent / Matched Patients', noPatients: 'No recent patients found', searching: 'Searching...', searchResult: 'Search Results',
      weight: 'Weight (kg)', pulse: 'Pulse (bpm)', temp: 'Temp (°F)', height: 'Height (cm)',
      typeDetails: 'Type details...', quickPick: 'Quick Pick', customTest: 'Type custom test...',
      medName: 'Medicine Name (e.g. Napa)', duration: 'Duration', instruction: 'Instruction', addMed: 'Add Medicine',
      addedMeds: 'Added Medicines', noMeds: 'No medicines added yet', suggestions: 'Quick Suggestions',
      followUp: 'Follow Up', check: 'Check Interactions', checking: 'Checking...'
    },
    BN: {
      fullName: 'সম্পূর্ণ নাম', phone: 'ফোন নম্বর', age: 'বয়স', gender: 'লিঙ্গ', select: 'নির্বাচন করুন', male: 'পুরুষ', female: 'মহিলা', other: 'অন্যান্য',
      newPatient: 'রোগী সেভ করুন', recentPatients: 'সাম্প্রতিক / মিলে যাওয়া রোগী', noPatients: 'কোনো সাম্প্রতিক রোগী নেই', searching: 'খোঁজা হচ্ছে...', searchResult: 'অনুসন্ধানের ফলাফল',
      weight: 'ওজন (kg)', pulse: 'নাড়ি (bpm)', temp: 'তাপমাত্রা (°F)', height: 'উচ্চতা (cm)',
      typeDetails: 'বিস্তারিত লিখুন...', quickPick: 'কুইক পিক', customTest: 'টেস্টের নাম লিখুন...',
      medName: 'ওষুধের নাম (যেমন: নাপা)', duration: 'সময়কাল', instruction: 'নির্দেশনা', addMed: 'ওষুধ যোগ করুন',
      addedMeds: 'যোগ করা ওষুধ', noMeds: 'কোনো ওষুধ যোগ করা হয়নি', suggestions: 'পরামর্শ',
      followUp: 'ফলোআপ', check: 'ইন্টারঅ্যাকশন চেক করুন', checking: 'চেক করা হচ্ছে...'
    }
  };
  const t = dict[language] || dict.EN;

  const handleToggle = (field, value) => {
    const current = data[field] || [];
    const updated = current.includes(value)
      ? current.filter(i => i !== value)
      : [...current, value];
    updateData(field, updated);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'patient':
        return <PatientPanel data={data} updateData={updateData} t={t} />;

      case 'vitals':
        return <VitalsPanel data={data} updateData={updateData} t={t} />;

      case 'investigations':
        return <InvestigationsPanel data={data} updateData={updateData} t={t} handleToggle={handleToggle} />;

      case 'medicines':
        return <MedicinesPanel data={data} updateData={updateData} t={t} />;

      case 'advice':
        return <AdvicePanel data={data} updateData={updateData} t={t} handleToggle={handleToggle} />;

      case 'interactions':
        return <InteractionsPanel data={data} t={t} />;

      case 'complaints':
      case 'history':
      case 'examination':
      case 'diagnosis':
        return (
          // ✨ Using the key={activeTab} trick completely resets the custom input state when you switch tabs!
          <TextAndChipPanel
            key={activeTab}
            activeTab={activeTab}
            data={data}
            updateData={updateData}
            t={t}
            handleToggle={handleToggle}
          />
        );

      default:
        return <div className="p-4 text-slate-500">Select a tab</div>;
    }
  };

  const getIcon = () => {
    if (activeTab === 'interactions') return ICONS.Interactions;
    const key = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    return ICONS[key] || ICONS.Patient;
  };

  return (
    // ✨ ADDED print:hidden to the className string below!
    <aside className="w-full xl:w-96 bg-white dark:bg-gray-800 border-t xl:border-l xl:border-t-0 border-slate-200 dark:border-gray-700 flex flex-col xl:h-full shrink-0 shadow-xl shadow-slate-200/50 dark:shadow-none z-10 transition-colors duration-300 print:hidden min-h-[500px]">
      <SectionHeader
        icon={getIcon()}
        title={dict[language][activeTab] || activeTab.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
      />
      <div className="flex-1 overflow-hidden flex flex-col">
        {renderContent()}
      </div>
    </aside>
  );
}