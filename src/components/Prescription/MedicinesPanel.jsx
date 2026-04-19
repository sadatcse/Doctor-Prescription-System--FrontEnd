import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ICONS } from './Icons';
import { CHIPS_DATA } from '../../data/chips';
import useMedicine from '../../Hook/useMedicine';
import { HiPlus, HiCircleStack } from "react-icons/hi2";

const MED_TYPES = ['Tab', 'Cap', 'Syrup', 'Inj', 'Cream', 'Drops', 'Inhaler'];
const DOSAGES = ['1+0+1', '1+1+1', '0+0+1', '1+0+0', '0+1+0', '1+1+1+1', 'SOS'];
const DURATIONS = ['3 days', '5 days', '7 days', '10 days', '14 days', '1 month', 'Continue'];
const INSTRUCTIONS = ['After meal', 'Before meal', 'Empty stomach', 'At bedtime', 'With water', 'Before sleep', 'If needed'];

export default function MedicinesPanel({ data, updateData, t }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dynamicMeds, setDynamicMeds] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [customDurValue, setCustomDurValue] = useState('');
  const [customDurUnit, setCustomDurUnit] = useState('days');
  const [customDoseValue, setCustomDoseValue] = useState('');
  const [customTypeValue, setCustomTypeValue] = useState('');

  const [medInput, setMedInput] = useState({
    type: 'Tab',
    dosage: '1+1+1',
    duration: 'Continue',
    instruction: 'After meal'
  });

  const { getPaginatedMedicines, createMedicine, loading } = useMedicine();
  const dropdownRef = useRef(null);
  const justSelected = useRef(false);

  const fetchSearchResults = useCallback(async (search) => {
    if (!search.trim() || justSelected.current) {
      setDynamicMeds([]);
      setIsDropdownOpen(false);
      justSelected.current = false;
      return;
    }

    try {
      const response = await getPaginatedMedicines({
        limit: 20,
        search: search,
        status: 'final'
      });

      const results = response?.data?.data || response?.data || response?.medicines || [];
      const validResults = Array.isArray(results) ? results : [];

      const query = search.toLowerCase().trim();
      const sortedResults = [...validResults].sort((a, b) => {
        const nameA = (a.brandName || '').toLowerCase();
        const nameB = (b.brandName || '').toLowerCase();
        if (nameA === query && nameB !== query) return -1;
        if (nameB === query && nameA !== query) return 1;
        const aStarts = nameA.startsWith(query);
        const bStarts = nameB.startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (bStarts && !aStarts) return 1;
        return 0;
      });

      setDynamicMeds(sortedResults);
      if (sortedResults.length > 0) {
        setIsDropdownOpen(true);
      }
    } catch (err) {
      console.error("Failed to fetch medicines:", err);
    }
  }, [getPaginatedMedicines]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSearchResults(searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchSearchResults]);

  const handleSelectFromDropdown = (med) => {
    justSelected.current = true;
    const formattedName = `${med.brandName} ${med.strength ? med.strength : ''}`.trim();
    setSearchTerm(formattedName);
    setMedInput(prev => ({
      ...prev,
      type: MED_TYPES.includes(med.dosageType) ? med.dosageType : prev.type
    }));
    setIsDropdownOpen(false);
  };

  const handleAddNewMedicine = async () => {
    const trimmedName = searchTerm.trim();
    if (!trimmedName) return;
    try {
      await createMedicine({ brandName: trimmedName, status: 'pending' });
      setIsDropdownOpen(false);
      setDynamicMeds([]);
    } catch (err) {
      console.error("Failed to create pending medicine:", err);
    }
  };

  const handleAddMedicineToPrescription = () => {
    const trimmedName = searchTerm.trim();
    if (!trimmedName) return;
    const currentMeds = data.medicines || [];
    updateData('medicines', [...currentMeds, { name: trimmedName, ...medInput }]);
    justSelected.current = true;
    setSearchTerm('');
    setMedInput({ type: 'Tab', dosage: '1+1+1', duration: 'Continue', instruction: 'After meal' });
    setCustomDurValue('');
    setCustomDoseValue('');
    setCustomTypeValue('');
    setIsDropdownOpen(false);
  };

  // Helper to handle custom duration changes
  const handleCustomDuration = (val, unit) => {
    setCustomDurValue(val);
    setCustomDurUnit(unit);
    if (val) {
      setMedInput({ ...medInput, duration: `${val} ${unit}` });
    }
  };

  const handleCustomDose = (val) => {
    setCustomDoseValue(val);
    if (val) {
      setMedInput({ ...medInput, dosage: val });
    }
  };

  const handleCustomType = (val) => {
    setCustomTypeValue(val);
    if (val) {
      setMedInput({ ...medInput, type: val });
    }
  };

  return (
    <div className="p-4 flex flex-col h-full overflow-y-auto custom-scrollbar relative">
      <div className="mb-4 flex items-center gap-2" ref={dropdownRef}>
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => { if (dynamicMeds.length > 0) setIsDropdownOpen(true); }}
            className="w-full p-2.5 pl-9 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-colors"
            placeholder={t.medName || "Search medicine..."}
          />
          <ICONS.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400" />

          {isDropdownOpen && dynamicMeds.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg shadow-xl max-h-72 overflow-y-auto custom-scrollbar">
              <div className="px-3 py-2 bg-slate-100 dark:bg-gray-600 text-xs font-bold text-slate-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 flex items-center gap-2">
                <HiCircleStack className="w-4 h-4" /> PLATFORM DATABASE
              </div>
              <ul className="py-1">
                {dynamicMeds.map((med, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectFromDropdown(med)}
                    className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-gray-600 cursor-pointer border-b border-slate-100 dark:border-gray-600 last:border-0 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800 dark:text-gray-100 text-sm">{med.brandName}</span>
                      <span className="text-[10px] border border-slate-300 dark:border-gray-500 text-slate-500 dark:text-gray-400 rounded px-1.5 py-0.5 whitespace-nowrap">
                        {med.strength || 'Mg'}
                      </span>
                    </div>
                    <div className="text-xs text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                      <i className="truncate max-w-[120px]">{med.genericName || 'Unknown Generic'}</i>
                      <span className="text-slate-300 dark:text-gray-500">|</span>
                      <span className="text-slate-500 dark:text-gray-400 truncate">
                        {med.dosageType}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={handleAddNewMedicine}
          disabled={!searchTerm.trim() || loading}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-slate-400 hover:text-cyan-500 hover:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          title="Add to database"
        >
          {loading ? (
            <span className="loading loading-spinner loading-xs text-cyan-500"></span>
          ) : (
            <HiPlus className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="bg-slate-50 dark:bg-gray-800/50 p-4 rounded-xl border border-slate-200 dark:border-gray-700 mb-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-500 dark:text-gray-400 mb-1">Type</span>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {MED_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setMedInput({ ...medInput, type });
                    setCustomTypeValue('');
                  }}
                  className={`px-3 py-1.5 text-xs rounded border transition-colors ${medInput.type === type && !customTypeValue
                      ? 'bg-cyan-600 border-cyan-600 text-white font-medium'
                      : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:border-cyan-400'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {/* Custom Type Mechanism */}
            <div className="flex flex-col gap-1 pt-2 border-t border-slate-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="Custom (e.g. Sachet)"
                value={customTypeValue}
                onChange={(e) => handleCustomType(e.target.value)}
                className={`w-full p-1.5 text-xs border rounded outline-none focus:ring-1 transition-colors ${
                  customTypeValue 
                  ? 'bg-cyan-600 border-cyan-600 text-white focus:ring-cyan-500 placeholder-teal-100' 
                  : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:ring-cyan-500 text-slate-800 dark:text-white'
                }`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-500 dark:text-gray-400 mb-1">Dose</span>
            <div className="flex flex-col gap-1.5 mb-2">
              {DOSAGES.map(dose => (
                <button
                  key={dose}
                  onClick={() => {
                    setMedInput({ ...medInput, dosage: dose });
                    setCustomDoseValue('');
                  }}
                  className={`px-3 py-1.5 text-xs rounded border text-center transition-colors ${medInput.dosage === dose && !customDoseValue
                      ? 'bg-cyan-600 border-cyan-600 text-white font-medium'
                      : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:border-cyan-400'
                    }`}
                >
                  {dose}
                </button>
              ))}
            </div>
            {/* Custom Dose Mechanism */}
            <div className="flex flex-col gap-1 pt-2 border-t border-slate-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="Custom (2+0+1+0)"
                value={customDoseValue}
                onChange={(e) => handleCustomDose(e.target.value)}
                className={`w-full p-1.5 text-xs border rounded text-center outline-none focus:ring-1 transition-colors ${
                  customDoseValue 
                  ? 'bg-cyan-600 border-cyan-600 text-white focus:ring-cyan-500 placeholder-teal-100' 
                  : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 focus:ring-cyan-500 text-slate-800 dark:text-white'
                }`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-500 dark:text-gray-400 mb-1">Duration</span>
            <div className="flex flex-col gap-1.5 mb-2">
              {DURATIONS.map(dur => (
                <button
                  key={dur}
                  onClick={() => {
                    setMedInput({ ...medInput, duration: dur });
                    setCustomDurValue(''); // Reset custom when selecting default
                  }}
                  className={`px-3 py-1.5 text-xs rounded border text-center transition-colors ${medInput.duration === dur
                      ? 'bg-cyan-600 border-cyan-600 text-white font-medium'
                      : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:border-cyan-400'
                    }`}
                >
                  {dur}
                </button>
              ))}
            </div>
            {/* Custom Duration Mechanism */}
            <div className="flex flex-col gap-1 pt-2 border-t border-slate-200 dark:border-gray-700">
              <input
                type="number"
                placeholder="Custom"
                value={customDurValue}
                onChange={(e) => handleCustomDuration(e.target.value, customDurUnit)}
                className="w-full p-1.5 text-xs bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded text-center outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <div className="flex gap-1">
                {['days', 'month'].map(unit => (
                  <button
                    key={unit}
                    onClick={() => handleCustomDuration(customDurValue, unit)}
                    className={`flex-1 py-1 text-[10px] rounded border uppercase font-bold ${customDurUnit === unit && customDurValue
                        ? 'bg-cyan-600 border-cyan-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-slate-400 border-slate-200 dark:border-gray-600'
                      }`}
                  >
                    {unit === 'days' ? 'Day' : 'Mon'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-500 dark:text-gray-400 mb-2 block">Instructions (optional)</span>
          <div className="flex flex-wrap gap-2">
            {INSTRUCTIONS.map(inst => (
              <button
                key={inst}
                onClick={() => setMedInput({ ...medInput, instruction: inst })}
                className={`px-3 py-1.5 text-xs rounded border transition-colors ${medInput.instruction === inst
                    ? 'bg-cyan-600 border-cyan-600 text-white font-medium'
                    : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:border-cyan-400'
                  }`}
              >
                {inst}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAddMedicineToPrescription}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors mt-2"
        >
          {t.addMed || "+ Add Medicine"}
        </button>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">{t.addedMeds || "Added Medicines"}</h3>
        <span className="text-xs text-slate-400 dark:text-gray-500 bg-slate-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{(data.medicines || []).length}</span>
      </div>

      {!(data.medicines && data.medicines.length > 0) ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-300 dark:text-gray-600 bg-slate-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-slate-200 dark:border-gray-700">
          <ICONS.Pill size={32} className="mb-2 opacity-50" />
          <p className="text-xs">{t.noMeds || "No medicines added yet"}</p>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {data.medicines.map((med, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 border border-slate-100 dark:border-gray-600 rounded-lg shadow-sm group transition-colors">
              <div>
                <div className="font-bold text-slate-800 dark:text-gray-100 text-sm">
                  {med.type && <span className="text-xs font-normal text-slate-500 mr-1">{med.type}.</span>}
                  {med.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-gray-400 mt-1 flex gap-2">
                  <span className="bg-slate-100 dark:bg-gray-600 px-1.5 rounded">{med.dosage}</span>
                  <span className="bg-slate-100 dark:bg-gray-600 px-1.5 rounded">{med.duration}</span>
                  <span className="bg-slate-100 dark:bg-gray-600 px-1.5 rounded">{med.instruction}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  const newMeds = [...data.medicines];
                  newMeds.splice(idx, 1);
                  updateData('medicines', newMeds);
                }}
                /* Removed opacity-0 and group-hover:opacity-100 */
                className="text-red-600 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-all p-2"
              >
                <ICONS.Delete size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}