import React, { useState, useEffect } from 'react';

export default function VitalsPanel({ data, updateData, t }) {
  // Track which input is currently focused
  const [activeField, setActiveField] = useState(null);

  // Auto-calculation logic for Advanced Metrics
  const { weight, height, waist, hip } = data.vitals || {};
  const { age, gender } = data.patient || {};

  useEffect(() => {
    let newBmi = '';
    let newWhr = '';
    let newBodyFat = '';

    if (weight && height) {
      const hInMeters = parseFloat(height) / 100;
      if (hInMeters > 0) {
        const bmi = parseFloat(weight) / (hInMeters * hInMeters);
        newBmi = bmi.toFixed(2);

        if (age && gender) {
          const genderVal = gender.toLowerCase() === 'male' ? 1 : 0;
          const fat = (1.20 * bmi) + (0.23 * parseFloat(age)) - (10.8 * genderVal) - 5.4;
          if (fat > 0) newBodyFat = fat.toFixed(2);
        }
      }
    }

    if (waist && hip) {
      const w = parseFloat(waist);
      const h = parseFloat(hip);
      if (h > 0) {
        newWhr = (w / h).toFixed(2);
      }
    }

    if (newBmi !== (data.vitals.bmi || '') || newWhr !== (data.vitals.whr || '') || newBodyFat !== (data.vitals.bodyFat || '')) {
      updateData('vitals', { ...data.vitals, bmi: newBmi, whr: newWhr, bodyFat: newBodyFat });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weight, height, waist, hip, age, gender]);

  // Helper function to render the default value pills
  const renderQuickPicks = (field, options) => {
    if (activeField !== field) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map((val) => (
          <button
            key={val}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault(); // 🔥 Prevents the input from losing focus on click
              updateData('vitals', { ...data.vitals, [field]: val });
            }}
            className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-full hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 transition-colors shadow-sm"
          >
            {val}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-6">
      
      {/* Row 1: BP & Weight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1.5">BP (mmHg)</label>
          <input
            type="text"
            value={data.vitals?.bp || ''}
            onFocus={() => setActiveField('bp')}
            onBlur={() => setActiveField(null)}
            onChange={(e) => updateData('vitals', { ...data.vitals, bp: e.target.value })}
            className="w-full p-2.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-colors"
            placeholder="120/80"
          />
          {renderQuickPicks('bp', ['120/80', '140/90', '90/60'])}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1.5">{t.weight || 'Weight (kg)'}</label>
          <input
            type="number"
            value={data.vitals?.weight || ''}
            onFocus={() => setActiveField('weight')}
            onBlur={() => setActiveField(null)}
            onChange={(e) => updateData('vitals', { ...data.vitals, weight: e.target.value })}
            className="w-full p-2.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-colors"
            placeholder="70"
          />
          {renderQuickPicks('weight', ['40', '50', '55', '60', '65', '70', '75', '80', '85', '90', '100'])}
        </div>
      </div>

      {/* Row 2: Pulse & Temp */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1.5">{t.pulse || 'Pulse (bpm)'}</label>
          <input
            type="number"
            value={data.vitals?.pulse || ''}
            onFocus={() => setActiveField('pulse')}
            onBlur={() => setActiveField(null)}
            onChange={(e) => updateData('vitals', { ...data.vitals, pulse: e.target.value })}
            className="w-full p-2.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-colors"
            placeholder="72"
          />
          {renderQuickPicks('pulse', ['72', '80', '90', '100'])}
        </div>
        
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1.5">{t.temp || 'Temp (F)'}</label>
          <input
            type="number"
            value={data.vitals?.temp || ''}
            onFocus={() => setActiveField('temp')}
            onBlur={() => setActiveField(null)}
            onChange={(e) => updateData('vitals', { ...data.vitals, temp: e.target.value })}
            className="w-full p-2.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-colors"
            placeholder="98.6"
          />
          {renderQuickPicks('temp', ['98.6', '100', '101', '102'])}
        </div>
      </div>

      {/* Dashed divider like the screenshot */}
      <div className="border-t border-dashed border-slate-200 dark:border-gray-700"></div>

      {/* Row 3: Height, Resp Rate, SpO2 (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1.5">{t.height || 'Height (cm)'}</label>
          <input
            type="number"
            value={data.vitals?.height || ''}
            onFocus={() => setActiveField('height')}
            onBlur={() => setActiveField(null)}
            onChange={(e) => updateData('vitals', { ...data.vitals, height: e.target.value })}
            className="w-full p-2.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-colors"
            placeholder="170"
          />
          {renderQuickPicks('height', ['150', '155', '160', '165', '170', '175', '180'])}
        </div>
        
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1.5">Resp. Rate</label>
          <input
            type="number"
            value={data.vitals?.respRate || ''}
            onFocus={() => setActiveField('respRate')}
            onBlur={() => setActiveField(null)}
            onChange={(e) => updateData('vitals', { ...data.vitals, respRate: e.target.value })}
            className="w-full p-2.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-colors"
            placeholder="16"
          />
          {renderQuickPicks('respRate', ['14', '16', '18', '20', '22', '24'])}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1.5">SpO2 (%)</label>
          <input
            type="number"
            value={data.vitals?.spo2 || ''}
            onFocus={() => setActiveField('spo2')}
            onBlur={() => setActiveField(null)}
            onChange={(e) => updateData('vitals', { ...data.vitals, spo2: e.target.value })}
            className="w-full p-2.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-colors"
            placeholder="98"
          />
          {renderQuickPicks('spo2', ['95', '96', '97', '98', '99', '100'])}
        </div>
      </div>
      
      {/* Row 4: Waist, Hip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1.5">Waist (cm)</label>
          <input
            type="number"
            value={data.vitals?.waist || ''}
            onFocus={() => setActiveField('waist')}
            onBlur={() => setActiveField(null)}
            onChange={(e) => updateData('vitals', { ...data.vitals, waist: e.target.value })}
            className="w-full p-2.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-colors"
            placeholder="80"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-gray-400 mb-1.5">Hip (cm)</label>
          <input
            type="number"
            value={data.vitals?.hip || ''}
            onFocus={() => setActiveField('hip')}
            onBlur={() => setActiveField(null)}
            onChange={(e) => updateData('vitals', { ...data.vitals, hip: e.target.value })}
            className="w-full p-2.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-colors"
            placeholder="90"
          />
        </div>
      </div>

      {/* Row 5: Auto-Calculated */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 bg-cyan-50 dark:bg-cyan-900/10 p-4 rounded-xl border border-cyan-100 dark:border-cyan-800/30 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-cyan-700 dark:text-cyan-400 mb-1.5">Auto BMI</label>
          <input type="text" readOnly value={data.vitals?.bmi ? `${data.vitals.bmi} kg/m²` : ''} className="w-full py-1.5 px-0 bg-transparent border-none text-sm font-semibold text-slate-700 dark:text-white outline-none cursor-default" placeholder="Depends on W & H" />
        </div>
        <div>
          <label className="block text-xs font-bold text-cyan-700 dark:text-cyan-400 mb-1.5">Body Fat (Est.)</label>
          <input type="text" readOnly value={data.vitals?.bodyFat ? `${data.vitals.bodyFat} %` : ''} className="w-full py-1.5 px-0 bg-transparent border-none text-sm font-semibold text-slate-700 dark:text-white outline-none cursor-default" placeholder="Requires Age, Gender, W, H" />
        </div>
        <div>
          <label className="block text-xs font-bold text-cyan-700 dark:text-cyan-400 mb-1.5">W/H Ratio</label>
          <input type="text" readOnly value={data.vitals?.whr ? `${data.vitals.whr}` : ''} className="w-full py-1.5 px-0 bg-transparent border-none text-sm font-semibold text-slate-700 dark:text-white outline-none cursor-default" placeholder="Depends on Waist & Hip" />
        </div>
      </div>
      
    </div>
  );
}