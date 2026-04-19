import React, { useState } from 'react';
import { ICONS } from './Icons'; // Adjust path
import { checkInteractions } from '../../services/gemini'; // Adjust path

export default function InteractionsPanel({ data, t }) {
  const [interactionResult, setInteractionResult] = useState('');
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(false);

  const handleCheckInteractions = async () => {
    setIsLoadingInteractions(true);
    setInteractionResult('');
    const result = await checkInteractions(data.medicines, data.patient);
    setInteractionResult(result);
    setIsLoadingInteractions(false);
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-lg p-4 mb-6 transition-colors">
        <div className="flex items-start gap-3">
          <ICONS.Info className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-500 mb-1">Drug Interaction Checker</h4>
            <p className="text-xs text-amber-700 dark:text-amber-200/70 leading-relaxed">
              This AI-powered tool checks for potential interactions between prescribed medicines and patient's existing conditions.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        <div>
          <h3 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Prescription Medicines ({data.medicines.length})</h3>
          {data.medicines.length === 0 ? (
            <div className="text-xs text-slate-400 dark:text-gray-500 italic p-4 border border-dashed border-slate-200 dark:border-gray-700 rounded-lg text-center">
              {t.noMeds}
            </div>
          ) : (
            <ul className="space-y-1">
              {data.medicines.map((m, i) => (
                <li key={i} className="text-sm text-slate-700 dark:text-gray-300 flex items-center gap-2">
                  <ICONS.Pill size={14} className="text-slate-400 dark:text-gray-500" />
                  {m.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {interactionResult && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg shadow-sm transition-colors">
            <h3 className="text-xs font-bold text-slate-800 dark:text-gray-100 uppercase tracking-wider mb-2 flex items-center gap-2">
              <ICONS.ShieldAlert size={14} className="text-amber-500" />
              Analysis Result
            </h3>
            <div className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {interactionResult}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleCheckInteractions}
        disabled={isLoadingInteractions || data.medicines.length === 0}
        className={`w-full py-3 rounded-lg font-semibold transition-all shadow-sm flex items-center justify-center gap-2 mt-auto ${isLoadingInteractions || data.medicines.length === 0
          ? 'bg-slate-100 dark:bg-gray-700 text-slate-400 dark:text-gray-500 cursor-not-allowed'
          : 'bg-amber-500 hover:bg-amber-600 text-white'
          }`}
      >
        {isLoadingInteractions ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {t.checking}
          </>
        ) : (
          <>
            <ICONS.ShieldAlert size={18} />
            {t.check}
          </>
        )}
      </button>
    </div>
  );
}