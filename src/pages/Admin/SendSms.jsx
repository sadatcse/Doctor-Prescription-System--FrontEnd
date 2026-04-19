import React from 'react';
import { useState, useEffect } from 'react';
import OfflineWarning from '../../components/common/offlineComponent';


const SendSms = () => {


  const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
    // Functions to update the state
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listen for changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup listeners when the component unmounts
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


    if (!isOnline) {
    return <OfflineWarning />;
  }
  return (
    <div className="p-4 md:p-8 min-h-[80vh] flex flex-col items-center justify-center text-center">
      <div className="bg-slate-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 max-w-md">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100 mb-3">Service Under Construction</h1>
        <p className="text-slate-500 dark:text-gray-400 leading-relaxed font-medium">
          The mass SMS dispatching service is actively undergoing development. Our team is wiring up the telecommunication nodes right now.
        </p>
      </div>
    </div>
  );
};

export default SendSms;
