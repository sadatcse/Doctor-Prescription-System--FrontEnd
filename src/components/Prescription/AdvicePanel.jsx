import React, { useState } from 'react';
import { CHIPS_DATA } from '../../data/chips'; // Adjust path
import { HiXMark } from "react-icons/hi2";

export default function AdvicePanel({ data, updateData, t, handleToggle }) {
  // Track which input is active to show quick picks
  const [activeField, setActiveField] = useState(null);

  // NEW: States for the custom text add mechanism
  const [customAdvice, setCustomAdvice] = useState('');
  const [customChips, setCustomChips] = useState([]);

  // Fallback chips just in case CHIPS_DATA.advice is empty/undefined
  const baseAdviceChips = CHIPS_DATA?.advice || [
    'Rest', 'Drink fluids', 'Avoid oily food', 'Light diet', 'Exercise',
    'Monitor BP', 'Avoid cold water', 'Take rest for 3 days',
    'Follow up if symptoms persist', 'Avoid smoking'
  ];

  // Combine original chips with dynamically added ones
  const adviceChips = [...baseAdviceChips, ...customChips];

  // Handler to add custom text as a selected chip
  const handleAddCustomAdvice = (e) => {
    e.preventDefault();
    const newAdvice = customAdvice.trim();
    if (newAdvice) {
      if (!adviceChips.includes(newAdvice)) {
        setCustomChips([...customChips, newAdvice]);
      }
      handleToggle('advice', newAdvice); // Auto-select the newly added item
      setCustomAdvice('');
    }
  };

  return (
    <div className="p-4 flex flex-col h-full overflow-y-auto custom-scrollbar">
      
      {/* Patient Type Section */}
      <div className="mb-6 advice-group">
        <label className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-3">
          Patient Type
        </label>
        <div className="flex flex-wrap gap-2">
          {['New Patient', 'Old Patient', 'Report'].map((type) => (
            <button
               key={type}
               type="button"
               onClick={() => updateData('patientType', type)}
               className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                 data.patientType === type
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-md'
                    : 'bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-gray-600 hover:border-cyan-400 hover:text-cyan-600'
               }`}
            >
               {type}
            </button>
          ))}
        </div>
      </div>

      {/* Advice Section */}
      <div className="mb-6 advice-group">
        <label className="block text-sm font-semibold text-slate-700 dark:text-gray-200 mb-3">
          {t.advice || 'Advice'}
        </label>
        
        {/* Added Advice List */}
        {data.advice && data.advice.length > 0 && (
          <div className="flex flex-col gap-2 mb-4">
            {data.advice.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 px-3 py-2 rounded-lg text-sm">
                <span className="text-slate-700 dark:text-gray-200">{item}</span>
                <button 
                  type="button"
                  onClick={() => handleToggle('advice', item)}
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded transition-colors"
                 >
                   <HiXMark className="w-4 h-4" />
                 </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Custom Text Add Mechanism (Replaces Textarea) */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customAdvice}
            onChange={(e) => setCustomAdvice(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCustomAdvice(e);
            }}
            onFocus={() => setActiveField('advice')}
            onBlur={(e) => {
              // Only close if focus completely leaves the advice section
              if (!e.currentTarget.closest('.advice-group').contains(e.relatedTarget)) {
                setActiveField(null);
              }
            }}
            placeholder={t.typeDetails || "Add custom advice..."}
            className="flex-1 p-3 text-sm border border-slate-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-slate-50 dark:bg-gray-700 text-slate-700 dark:text-white dark:placeholder-gray-400 transition-colors"
          />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()} // Prevent losing focus when clicking button
            onClick={handleAddCustomAdvice}
            className="px-4 py-3 rounded-lg text-sm font-medium bg-slate-100 dark:bg-gray-600 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-gray-500 hover:bg-cyan-50 dark:hover:bg-gray-500 hover:text-cyan-700 hover:border-cyan-200 transition-colors"
          >
            Add
          </button>
        </div>

        {/* Show Chips ONLY when Advice input is active */}
        {activeField === 'advice' && (
          <div className="mt-3">
            <h3 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              {t.quickPick || 'Quick Pick'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {adviceChips.map((item) => {
                const isSelected = data.advice?.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent input blur
                      handleToggle('advice', item);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                        : 'bg-white dark:bg-gray-700 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-gray-600 hover:border-cyan-400 dark:hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Follow-up Section */}
      <div className="border-t border-dashed border-slate-200 dark:border-gray-700 pt-6 transition-colors">
        <label className="block text-sm text-slate-600 dark:text-gray-300 mb-2">
          {t.followUp }
        </label>

        <div className="flex flex-col gap-3">
          
          {/* Follow Up Input */}
          <div
            className={`flex items-center border bg-white dark:bg-gray-700 rounded-xl overflow-hidden transition-all ${
              activeField === 'followUp'
                ? 'border-sky-400 ring-2 ring-sky-100 dark:ring-sky-900'
                : 'border-slate-300 dark:border-gray-600'
            }`}
          >
            <input
              type="number"
              value={data.followUp || ''}
              onFocus={() => setActiveField('followUp')}
              onBlur={() => setActiveField(null)}
              onChange={(e) => updateData('followUp', e.target.value)}
              className="w-full p-2.5 bg-transparent text-sm text-slate-700 dark:text-white outline-none"
              placeholder="Value"
            />

            {/* Unit Selector */}
            <select
              value={data.followUpUnit || 'days'}
              onChange={(e) => updateData('followUpUnit', e.target.value)}
              className="bg-transparent text-sm px-2 outline-none text-slate-600 dark:text-gray-200"
            >
              <option value="days">Days</option>
              <option value="months">Months</option>
            </select>

            {/* Stepper Icons */}
            <div className="flex flex-col justify-center border-l border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-600 px-1.5 py-1 min-h-[40px]">
              <svg className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
              </svg>
              <svg className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Quick Pick Buttons */}
          {activeField === 'followUp' && (
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 3, unit: 'days', label: '3 days' },
                { value: 7, unit: 'days', label: '7 days' },
                { value: 14, unit: 'days', label: '14 days' },
                { value: 30, unit: 'days', label: '30 days' },
                { value: 1, unit: 'months', label: '1 month' },
                { value: 3, unit: 'months', label: '3 months' }
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    updateData('followUp', d.value);
                    updateData('followUpUnit', d.unit);
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-full text-xs text-slate-600 dark:text-gray-300 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}