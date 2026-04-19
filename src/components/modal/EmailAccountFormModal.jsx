import React, { useState, useEffect } from 'react';
import { HiXMark } from "react-icons/hi2";
import { useEmailAccount } from '../../Hook/useEmailAccount';

const EmailAccountFormModal = ({ isOpen, onClose, accountData, currentBranch, onSuccess }) => {
  const { createEmailAccount, updateEmailAccount, loading, error } = useEmailAccount();

  // Initial Form State
  const initialFormState = {
    email: '',
    displayName: '',
    host: '',
    port: '',
    username: '',
    password: '',
    adminEmail: '',
    ssl: false,
    useDefaultCredential: true,
    active: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  // Populate form if we are in "Edit" mode
  useEffect(() => {
    if (accountData) {
      setFormData({
        email: accountData.email || '',
        displayName: accountData.displayName || '',
        host: accountData.host || '',
        port: accountData.port || '',
        username: accountData.username || '',
        password: accountData.password || '', // Note: Often passwords aren't returned. You might need to handle empty passwords on edit.
        adminEmail: accountData.adminEmail || '',
        ssl: accountData.ssl ?? false,
        useDefaultCredential: accountData.useDefaultCredential ?? true,
        active: accountData.active ?? true,
      });
    } else {
      setFormData(initialFormState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountData, isOpen]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Attach the current branch to the payload
    const payload = {
      ...formData,
      port: Number(formData.port), // Ensure port is a number for the schema
      branch: currentBranch,
    };

    try {
      if (accountData?._id) {
        await updateEmailAccount(accountData._id, payload);
      } else {
        await createEmailAccount(payload);
      }
      onSuccess(); // Refresh the table
      onClose();   // Close the modal
    } catch (err) {
      console.error("Form submission failed:", err);
      // The hook already sets the error state, which we display below
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-base-100 dark:bg-casual-black w-full max-w-3xl rounded-box shadow-xl border border-casual-black/10 dark:border-white/10 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-casual-black/10 dark:border-white/10">
          <h2 className="text-xl font-bold font-secondary text-casual-black dark:text-concrete">
            {accountData ? 'Edit Email Account' : 'Add New Email Account'}
          </h2>
          <button 
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-casual-black/50 hover:text-casual-black dark:text-concrete/50 dark:hover:text-concrete"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6">
          
          {error && (
            <div className="alert alert-error bg-fascinating-magenta/10 text-fascinating-magenta border border-fascinating-magenta/20 text-sm mb-6">
              {error}
            </div>
          )}

          {/* Form Fields Container (Flex Column) */}
          <div className="flex flex-col gap-4 text-casual-black dark:text-concrete">
            
            {/* Row 1: Display Name & Email */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="form-control w-full flex-1">
                <label className="label"><span className="label-text font-medium dark:text-concrete/80">Display Name *</span></label>
                <input type="text" name="displayName" value={formData.displayName} onChange={handleChange} required className="input input-bordered w-full bg-transparent border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue" placeholder="e.g. Acme Support" />
              </div>
              <div className="form-control w-full flex-1">
                <label className="label"><span className="label-text font-medium dark:text-concrete/80">Email Address *</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input input-bordered w-full bg-transparent border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue" placeholder="support@acme.com" />
              </div>
            </div>

            {/* Row 2: Host & Port */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="form-control w-full flex-[2]">
                <label className="label"><span className="label-text font-medium dark:text-concrete/80">SMTP Host *</span></label>
                <input type="text" name="host" value={formData.host} onChange={handleChange} required className="input input-bordered w-full bg-transparent border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue" placeholder="smtp.gmail.com" />
              </div>
              <div className="form-control w-full flex-1">
                <label className="label"><span className="label-text font-medium dark:text-concrete/80">Port *</span></label>
                <input type="number" name="port" value={formData.port} onChange={handleChange} required className="input input-bordered w-full bg-transparent border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue" placeholder="587" />
              </div>
            </div>

            {/* Row 3: Username & Password */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="form-control w-full flex-1">
                <label className="label"><span className="label-text font-medium dark:text-concrete/80">Username *</span></label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required className="input input-bordered w-full bg-transparent border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue" placeholder="Your SMTP username" />
              </div>
              <div className="form-control w-full flex-1">
                <label className="label"><span className="label-text font-medium dark:text-concrete/80">Password *</span></label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required={!accountData} className="input input-bordered w-full bg-transparent border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue" placeholder={accountData ? "Leave blank to keep unchanged" : "Your SMTP password"} />
              </div>
            </div>

            {/* Row 4: Admin Email (Full Width) */}
            <div className="form-control w-full">
              <label className="label"><span className="label-text font-medium dark:text-concrete/80">Admin Email (Optional)</span></label>
              <input type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} className="input input-bordered w-full bg-transparent border-casual-black/20 dark:border-concrete/20 focus:border-sporty-blue" placeholder="Admin notification email" />
            </div>

            {/* Row 5: Toggles */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <label className="cursor-pointer label justify-start gap-3 bg-casual-black/5 dark:bg-white/5 p-3 rounded-lg border border-casual-black/10 dark:border-white/10 flex-1">
                <input type="checkbox" name="ssl" checked={formData.ssl} onChange={handleChange} className="checkbox checkbox-sm checkbox-primary border-casual-black/30 dark:border-concrete/30" />
                <span className="label-text font-medium dark:text-concrete">Use SSL</span>
              </label>

              <label className="cursor-pointer label justify-start gap-3 bg-casual-black/5 dark:bg-white/5 p-3 rounded-lg border border-casual-black/10 dark:border-white/10 flex-1">
                <input type="checkbox" name="useDefaultCredential" checked={formData.useDefaultCredential} onChange={handleChange} className="checkbox checkbox-sm checkbox-primary border-casual-black/30 dark:border-concrete/30" />
                <span className="label-text font-medium dark:text-concrete text-xs sm:text-sm leading-tight whitespace-nowrap">Default Credentials</span>
              </label>

              <label className="cursor-pointer label justify-start gap-3 bg-casual-black/5 dark:bg-white/5 p-3 rounded-lg border border-casual-black/10 dark:border-white/10 flex-1">
                <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="checkbox checkbox-sm checkbox-success border-casual-black/30 dark:border-concrete/30" />
                <span className="label-text font-medium dark:text-concrete">Account Active</span>
              </label>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-casual-black/10 dark:border-white/10">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="btn btn-ghost text-casual-black hover:bg-casual-black/10 dark:text-concrete dark:hover:bg-white/10 font-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="btn bg-sporty-blue hover:bg-sporty-blue/90 text-concrete border-none font-secondary min-w-[100px]"
            >
              {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Save'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EmailAccountFormModal;