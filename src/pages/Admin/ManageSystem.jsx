import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import SectionTitle from '../../components/common/SectionTitle';
import useSystemPreference from '../../Hook/useSystemPreference';
import OfflineWarning from '../../components/common/offlineComponent';

// Dynamic Timezone Data from your assets folder
import timezonesData from './../../assets/Json/Timezone.json';

const SystemPreferences = () => {
  const { branch, refreshPreferences } = useContext(AuthContext);
  const { getPreferenceByBranch, upsertPreference } = useSystemPreference();
  const [isSaving, setIsSaving] = useState(false);
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

  // Form State
  const [formData, setFormData] = useState({
    timezone: 'Asia/Dhaka',
    printWithoutHeaderFooter: false,
    autoSendEmail: false,
    autoSendSmsReminder: false,
    prescriptionHeaderSize: 150,
    prescriptionFooterSize: 100,
  });

  useEffect(() => {
    if (branch) {
      getPreferenceByBranch(branch)
        .then(res => {
          if (res?.data) {
            setFormData(prev => ({ ...prev, ...res.data }));
          }
        })
        .catch(err => console.error("Failed to fetch settings:", err));
    }
  }, [branch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!branch) {
      alert("No branch selected. Cannot save preferences.");
      return;
    }
    setIsSaving(true);
    try {
      console.log("Saving preferences:", formData);
      await upsertPreference(branch, formData);
      await refreshPreferences(); // Sync the context and timezone dynamically
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

    if (!isOnline) {
    return <OfflineWarning />;
  }


  return (
    <div className="p-4 md:p-6 bg-base-100 dark:bg-casual-black min-h-screen font-primary text-casual-black dark:text-concrete transition-colors">

      <SectionTitle
        title="Global Preferences"
        subtitle="Manage timezones, prescription layouts, and automation"
      />

      <form onSubmit={handleSubmit} className="max-w-4xl bg-concrete dark:bg-[#1a1a1a] rounded-box shadow-sm border border-casual-black/5 dark:border-white/10 p-6 md:p-8 space-y-8">

        {/* 1. Localization Settings */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-sporty-blue">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            <h3 className="text-lg font-bold text-casual-black dark:text-concrete">Localization</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-casual-black/80 dark:text-concrete/80 font-medium">System Time Zone</span>
              </label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="select select-bordered w-full bg-base-100 dark:bg-casual-black border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue focus:outline-none"
              >
                {timezonesData.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="divider border-casual-black/5 dark:border-white/5"></div>

        {/* 2. Prescription Layout & Printing */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-sporty-blue">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h3 className="text-lg font-bold text-casual-black dark:text-concrete">Prescription Layout</h3>
          </div>

          <div className="space-y-6">
            {/* Print Toggle */}
            <div className="form-control bg-base-100 dark:bg-casual-black/50 p-4 rounded-lg border border-casual-black/5 dark:border-white/5">
              <label className="cursor-pointer label justify-start gap-4 p-0">
                <input
                  type="checkbox"
                  name="printWithoutHeaderFooter"
                  checked={formData.printWithoutHeaderFooter}
                  onChange={handleChange}
                  className="toggle toggle-primary bg-sporty-blue border-sporty-blue hover:bg-sporty-blue/90"
                />
                <div>
                  <span className="label-text block font-medium text-casual-black dark:text-concrete">Print Without Header & Footer</span>
                  <span className="label-text-alt text-casual-black/60 dark:text-concrete/60">Toggle ON to leave blank space for pre-printed hospital pads.</span>
                </div>
              </label>
            </div>

            {/* Layout Dimensions - CONDITIONALLY DISABLED */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300 ${!formData.printWithoutHeaderFooter ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-casual-black/80 dark:text-concrete/80 font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 rotate-90">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                    Blank Header Space (px)
                  </span>
                </label>
                <input
                  type="number"
                  name="prescriptionHeaderSize"
                  value={formData.prescriptionHeaderSize}
                  onChange={handleChange}
                  disabled={!formData.printWithoutHeaderFooter}
                  min="0"
                  max="500"
                  className="input input-bordered w-full bg-base-100 dark:bg-casual-black border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue focus:outline-none disabled:bg-base-200 dark:disabled:bg-casual-black/80 disabled:text-casual-black/50"
                />
                <label className="label">
                  <span className="label-text-alt text-casual-black/50 dark:text-concrete/50">Space to skip at the top of the page.</span>
                </label>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-casual-black/80 dark:text-concrete/80 font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 rotate-90">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                    Blank Footer Space (px)
                  </span>
                </label>
                <input
                  type="number"
                  name="prescriptionFooterSize"
                  value={formData.prescriptionFooterSize}
                  onChange={handleChange}
                  disabled={!formData.printWithoutHeaderFooter}
                  min="0"
                  max="500"
                  className="input input-bordered w-full bg-base-100 dark:bg-casual-black border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue focus:outline-none disabled:bg-base-200 dark:disabled:bg-casual-black/80 disabled:text-casual-black/50"
                />
                <label className="label">
                  <span className="label-text-alt text-casual-black/50 dark:text-concrete/50">Space to skip at the bottom of the page.</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        <div className="divider border-casual-black/5 dark:border-white/5"></div>

        {/* 3. Automation Settings */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-sporty-blue">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <h3 className="text-lg font-bold text-casual-black dark:text-concrete">Automation</h3>
          </div>
          <div className="form-control mb-4">
            <label className="cursor-pointer label justify-start gap-4 p-0">
              <input
                type="checkbox"
                name="autoSendEmail"
                checked={formData.autoSendEmail}
                onChange={handleChange}
                className="toggle toggle-primary bg-sporty-blue border-sporty-blue hover:bg-sporty-blue/90"
              />
              <div>
                <span className="label-text block font-medium text-casual-black dark:text-concrete">Automatic Email Dispatch</span>
                <span className="label-text-alt text-casual-black/60 dark:text-concrete/60">Automatically send the PDF prescription to the patient's email upon saving.</span>
              </div>
            </label>
          </div>

          <div className="form-control">
            <label className="cursor-pointer label justify-start gap-4 p-0">
              <input
                type="checkbox"
                name="autoSendSmsReminder"
                checked={formData.autoSendSmsReminder}
                onChange={handleChange}
                className="toggle toggle-primary bg-sporty-blue border-sporty-blue hover:bg-sporty-blue/90"
              />
              <div>
                <span className="label-text block font-medium text-casual-black dark:text-concrete">Next Appointment SMS Reminder</span>
                <span className="label-text-alt text-casual-black/60 dark:text-concrete/60">Automatically dispatch an SMS reminder to the patient 1 day prior to their next calculated visit.</span>
              </div>
            </label>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4 border-t border-casual-black/5 dark:border-white/10">
          <button
            type="submit"
            disabled={isSaving}
            className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-concrete border-none font-secondary flex items-center gap-2 min-w-[120px]"
          >
            {isSaving ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />
              </svg>
            )}
            Save Preferences
          </button>
        </div>

      </form>
    </div>
  );
};

export default SystemPreferences;