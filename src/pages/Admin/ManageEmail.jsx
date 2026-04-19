import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { useEmailAccount } from '../../Hook/useEmailAccount';
import SectionTitle from '../../components/common/SectionTitle'; 
import OfflineWarning from '../../components/common/offlineComponent';

// Import React Icons
import { 
  HiOutlineEnvelope, 
  HiOutlineServerStack, 
  HiOutlineShieldCheck
} from 'react-icons/hi2';
import { CgSpinner } from 'react-icons/cg';

const EmailAccount = () => {
  const { branch } = useContext(AuthContext);
  const { getAllEmailAccounts, createEmailAccount, updateEmailAccount, deleteEmailAccount, loading, error } = useEmailAccount();

  const [accountId, setAccountId] = useState(null);
  const [fetching, setFetching] = useState(true);

  const initialFormState = {
    displayName: '',
    email: '',
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

  // Fetch the single email account for this branch
  const fetchProfile = async () => {
    if (!branch) return;
    try {
      setFetching(true);
      const response = await getAllEmailAccounts();
      if (response && response.length > 0) {
        // Find the specific account for this branch
        const branchAccount = response.find(acc => acc.branch === branch);
        
        if (branchAccount) {
          setAccountId(branchAccount._id);
          setFormData({
            displayName: branchAccount.displayName || '',
            email: branchAccount.email || '',
            host: branchAccount.host || '',
            port: branchAccount.port || '',
            username: branchAccount.username || '',
            password: '', // Keep empty unless changing
            adminEmail: branchAccount.adminEmail || '',
            ssl: branchAccount.ssl ?? false,
            useDefaultCredential: branchAccount.useDefaultCredential ?? true,
            active: branchAccount.active ?? true,
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch email account:", err);
    } finally {
      setFetching(false);
    }
  };

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

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    
    const payload = {
      ...formData,
      port: Number(formData.port), 
      branch: branch,
    };

    try {
      if (accountId) {
        await updateEmailAccount(accountId, payload);
        alert("Email configuration updated successfully!");
      } else {
        const newAccount = await createEmailAccount(payload);
        setAccountId(newAccount._id);
        alert("Email configuration created successfully!");
      }
      // Re-fetch to ensure sync (and clear password field)
      fetchProfile(); 
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save email configuration.");
    }
  };

    if (!isOnline) {
    return <OfflineWarning />;
  }


  const handleDelete = async () => {
    if (!accountId) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this email configuration? Outbound emails will stop working.");
    if (confirmed) {
      try {
        await deleteEmailAccount(accountId);
        setAccountId(null);
        setFormData(initialFormState);
        alert("Email configuration deleted.");
      } catch (err) {
        alert("Failed to delete configuration.");
      }
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-100 dark:bg-casual-black transition-colors">
        <div className="flex flex-col items-center gap-4">
          <CgSpinner className="w-10 h-10 text-sporty-blue animate-spin" />
          <p className="text-casual-black/70 dark:text-concrete/70 font-medium text-sm tracking-wide">Loading Configuration...</p>
        </div>
      </div>
    );
  }

  // Reusable classes (Matching your Profile component exactly)
  const inputBaseClasses = "w-full bg-base-100 dark:bg-casual-black border border-casual-black/20 dark:border-concrete/20 rounded-xl px-4 py-3 text-sm text-casual-black dark:text-concrete placeholder-casual-black/50 dark:placeholder-concrete/50 focus:outline-none focus:border-sporty-blue focus:ring-1 focus:ring-sporty-blue transition-colors duration-200";
  const labelClasses = "block text-xs font-semibold text-casual-black/70 dark:text-concrete/70 uppercase tracking-wider mb-2";

  return (
    <div className="min-h-screen bg-base-100 dark:bg-casual-black font-sans text-casual-black dark:text-concrete p-6 sm:p-10 selection:bg-sporty-blue/20 selection:text-sporty-blue transition-colors">
      <div className="mx-auto">
        
        <SectionTitle 
          title="Email Configuration"
          subtitle="Manage the outbound SMTP settings for this branch. Only one configuration is active at a time."
        />

        {error && (
          <div className="mb-6 text-sm text-fascinating-magenta bg-fascinating-magenta/10 px-4 py-3 rounded-xl border border-fascinating-magenta/20 flex items-center gap-2 transition-colors">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-concrete dark:bg-white/5 rounded-2xl shadow-sm border border-casual-black/5 dark:border-white/10 overflow-hidden transition-all duration-300 hover:shadow-md">
          
          {/* Section 1: Sender Information */}
          <div className="p-8 border-b border-casual-black/5 dark:border-white/10 transition-colors">
            <h2 className="text-base font-bold flex items-center gap-2.5 mb-8 text-casual-black dark:text-concrete transition-colors">
              <HiOutlineEnvelope className="w-6 h-6 text-sporty-blue" />
              Sender Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className={labelClasses}>Display Name</label>
                <input type="text" name="displayName" value={formData.displayName} onChange={handleChange} required className={inputBaseClasses} placeholder="e.g. Acme Health Support" />
              </div>
              <div className="group">
                <label className={labelClasses}>Outbound Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputBaseClasses} placeholder="support@acme.com" />
              </div>
              <div className="md:col-span-2 group">
                <label className={labelClasses}>Admin Notification Email (Optional)</label>
                <input type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} className={inputBaseClasses} placeholder="admin@acme.com" />
              </div>
            </div>
          </div>

          {/* Section 2: SMTP Server Details */}
          <div className="p-8 border-b border-casual-black/5 dark:border-white/10 transition-colors">
            <h2 className="text-base font-bold flex items-center gap-2.5 mb-8 text-casual-black dark:text-concrete transition-colors">
              <HiOutlineServerStack className="w-6 h-6 text-sporty-blue" />
              SMTP Server Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className={labelClasses}>SMTP Host</label>
                <input type="text" name="host" value={formData.host} onChange={handleChange} required className={inputBaseClasses} placeholder="e.g. smtp.gmail.com" />
              </div>
              <div className="group">
                <label className={labelClasses}>Port</label>
                <input type="number" name="port" value={formData.port} onChange={handleChange} required className={inputBaseClasses} placeholder="e.g. 587 or 465" />
              </div>
              <div className="group">
                <label className={labelClasses}>Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required className={inputBaseClasses} placeholder="Your SMTP username" />
              </div>
              <div className="group">
                <label className={labelClasses}>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required={!accountId} className={inputBaseClasses} placeholder={accountId ? "Leave blank to keep unchanged" : "Your SMTP password"} />
              </div>
            </div>
          </div>

          {/* Section 3: Security & Status */}
          <div className="p-8 border-b border-casual-black/5 dark:border-white/10 transition-colors">
            <h2 className="text-base font-bold flex items-center gap-2.5 mb-8 text-casual-black dark:text-concrete transition-colors">
              <HiOutlineShieldCheck className="w-6 h-6 text-sporty-blue" />
              Security & Status
            </h2>

            <div className="flex flex-col sm:flex-row gap-6">
              <label className="cursor-pointer flex items-center gap-3 bg-casual-black/5 dark:bg-white/5 p-4 rounded-xl border border-casual-black/10 dark:border-white/10 flex-1 hover:border-sporty-blue/50 transition-colors">
                <input type="checkbox" name="ssl" checked={formData.ssl} onChange={handleChange} className="checkbox checkbox-sm checkbox-primary border-casual-black/30 dark:border-concrete/30" />
                <span className="text-sm font-semibold text-casual-black dark:text-concrete">Use SSL / TLS</span>
              </label>

              <label className="cursor-pointer flex items-center gap-3 bg-casual-black/5 dark:bg-white/5 p-4 rounded-xl border border-casual-black/10 dark:border-white/10 flex-1 hover:border-sporty-blue/50 transition-colors">
                <input type="checkbox" name="useDefaultCredential" checked={formData.useDefaultCredential} onChange={handleChange} className="checkbox checkbox-sm checkbox-primary border-casual-black/30 dark:border-concrete/30" />
                <span className="text-sm font-semibold text-casual-black dark:text-concrete">Use Default Credentials</span>
              </label>

              <label className="cursor-pointer flex items-center gap-3 bg-casual-black/5 dark:bg-white/5 p-4 rounded-xl border border-casual-black/10 dark:border-white/10 flex-1 hover:border-sporty-blue/50 transition-colors">
                <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="checkbox checkbox-sm checkbox-success border-casual-black/30 dark:border-concrete/30" />
                <span className="text-sm font-semibold text-casual-black dark:text-concrete">Configuration Active</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-8 py-6 bg-casual-black/5 dark:bg-white/5 flex items-center justify-end gap-4 transition-colors">
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-2.5 text-sm font-bold text-concrete bg-sporty-blue hover:bg-sporty-blue/90 hover:shadow-lg hover:shadow-sporty-blue/20 rounded-xl transition-all duration-200 flex items-center justify-center min-w-[150px] active:scale-95"
            >
              {loading ? (
                <CgSpinner className="w-5 h-5 animate-spin text-concrete" />
              ) : (
                accountId ? "Update Configuration" : "Save Configuration"
              )}
            </button>
          </div>
        </form>

        {/* Delete Profile Section - Only show if an account actually exists */}
        {accountId && (
          <div className="mt-8 bg-fascinating-magenta/5 dark:bg-fascinating-magenta/10 border border-fascinating-magenta/20 hover:border-fascinating-magenta/40 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors duration-300">
            <div>
              <h3 className="text-base font-bold text-fascinating-magenta">Delete Configuration</h3>
              <p className="text-sm text-fascinating-magenta/80 mt-1">This will permanently remove the SMTP configuration. Outbound emails will immediately stop functioning.</p>
            </div>
            <button 
              type="button" 
              onClick={handleDelete}
              className="px-6 py-2.5 text-sm font-bold text-fascinating-magenta border-2 border-fascinating-magenta/20 bg-concrete dark:bg-casual-black hover:bg-fascinating-magenta hover:text-concrete hover:border-fascinating-magenta rounded-xl transition-all duration-200 whitespace-nowrap active:scale-95 shadow-sm"
            >
              Delete Settings
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default EmailAccount;