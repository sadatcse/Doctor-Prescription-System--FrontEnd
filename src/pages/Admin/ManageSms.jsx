import React from 'react';

const ManageSms = () => {
  return (
    <div className="p-4 md:p-8 min-h-[80vh] flex flex-col items-center justify-center text-center">
      <div className="bg-slate-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 max-w-md">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100 mb-3">Gateway Under Construction</h1>
        <p className="text-slate-500 dark:text-gray-400 leading-relaxed font-medium">
          The SMS Configuration module is currently being built. Advanced gateway routing and system integrations will be available soon!
        </p>
      </div>
    </div>
  );
};

export default ManageSms;
