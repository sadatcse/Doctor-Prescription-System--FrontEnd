import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import useDoctorProfile from '../../Hook/useDoctorProfile';
import useLocationData from '../../Hook/useLocationData';
import ImageUpload from '../../config/ImageUploadcpanel';
import SectionTitle from '../../components/common/SectionTitle'; // <-- Update this path to where your SectionTitle is saved
import OfflineWarning from '../../components/common/offlineComponent';
// Import React Icons
import { 
  HiOutlineUser, 
  HiOutlineAcademicCap, 
  HiOutlineIdentification, 
  HiOutlinePencilSquare,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiChevronUpDown
} from 'react-icons/hi2';
import { CgSpinner } from 'react-icons/cg';

const Profile = () => {
  const { branch } = useContext(AuthContext);
  const { getProfilesByBranch, updateProfile, loading, error } = useDoctorProfile();

  const [profileId, setProfileId] = useState(null);
  const [fetching, setFetching] = useState(true);
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

  const [formData, setFormData] = useState({
    name: '',
    bmdcRegistrationNumber: '',
    degree: '',
    designation: '',
    institution: '',
    phone: '',
    email: '',
    nid: '',
    address: '',
    division: '',
    district: '',
    signature: '',
    doctorPicture: '',
    branch: branch || '',
  });

  const { divisions, availableDistricts } = useLocationData(formData.division);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!branch) return;
      try {
        setFetching(true);
        const response = await getProfilesByBranch(branch);
        if (response?.data && response.data.length > 0) {
          const profile = response.data[0];
          setProfileId(profile._id);

          setFormData({
            name: profile.name || '',
            bmdcRegistrationNumber: profile.bmdcRegistrationNumber || '',
            degree: profile.degree || '',
            designation: profile.designation || '',
            institution: profile.institution || '',
            phone: profile.phone || '',
            email: profile.email || '',
            nid: profile.nid || '',
            address: profile.address || '',
            division: profile.division || '',
            district: profile.district || '',
            signature: profile.signature || '',
            doctorPicture: profile.doctorPicture || '',
            branch: branch || '',
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [branch, getProfilesByBranch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'division') {
        newData.district = '';
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileId) {
      alert("No profile ID found. Cannot update.");
      return;
    }
    try {
      await updateProfile(profileId, formData);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update profile.");
    }
  };


      if (!isOnline) {

    return <OfflineWarning />;

  }

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-100 dark:bg-casual-black transition-colors">
        <div className="flex flex-col items-center gap-4">
          <CgSpinner className="w-10 h-10 text-sporty-blue animate-spin" />
          <p className="text-casual-black/70 dark:text-concrete/70 font-medium text-sm tracking-wide">Loading Profile Data...</p>
        </div>
      </div>
    );
  }

  // Reusable classes
  const inputBaseClasses = "w-full bg-base-100 dark:bg-casual-black border border-casual-black/20 dark:border-concrete/20 rounded-xl px-4 py-3 text-sm text-casual-black dark:text-concrete placeholder-casual-black/50 dark:placeholder-concrete/50 focus:outline-none focus:border-sporty-blue focus:ring-1 focus:ring-sporty-blue transition-colors duration-200";
  const labelClasses = "block text-xs font-semibold text-casual-black/70 dark:text-concrete/70 uppercase tracking-wider mb-2";

  return (
    <div className="min-h-screen bg-base-100 dark:bg-casual-black font-sans text-casual-black dark:text-concrete p-6 sm:p-10 selection:bg-sporty-blue/20 selection:text-sporty-blue transition-colors">
      <div className="mx-auto">
        
        {/* 🌟 Implemented SectionTitle Here 🌟 */}
        <SectionTitle 
          title="Edit Professional Profile"
          subtitle="Manage your public presence and medical credentials for patients to see."
        />

        {error && (
          <div className="mb-6 text-sm text-fascinating-magenta bg-fascinating-magenta/10 px-4 py-3 rounded-xl border border-fascinating-magenta/20 flex items-center gap-2 transition-colors">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-concrete dark:bg-white/5 rounded-2xl shadow-sm border border-casual-black/5 dark:border-white/10 overflow-hidden transition-all duration-300 hover:shadow-md">
          
          {/* Section 1: Basic Information */}
          <div className="p-8 border-b border-casual-black/5 dark:border-white/10 transition-colors">
            <h2 className="text-base font-bold flex items-center gap-2.5 mb-8 text-casual-black dark:text-concrete transition-colors">
              <HiOutlineUser className="w-6 h-6 text-sporty-blue" />
              Basic Information
            </h2>

            {/* Profile Photo Upload */}
            <div className="flex items-center gap-6 mb-8 bg-casual-black/5 dark:bg-white/5 p-6 rounded-2xl border border-casual-black/5 dark:border-white/10 transition-colors">
              <div className="w-24 h-24 rounded-full bg-casual-black/10 dark:bg-white/10 overflow-hidden shadow-sm flex-shrink-0 border-4 border-concrete dark:border-casual-black ring-1 ring-casual-black/10 dark:ring-white/10 relative transition-colors">
                <img
                  src={formData.doctorPicture || "https://ui-avatars.com/api/?name=Doctor&background=0D8ABC&color=fff"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-casual-black dark:text-concrete transition-colors">Profile Photo</h3>
                <p className="text-xs text-casual-black/70 dark:text-concrete/70 mt-1 mb-4">Upload a professional headshot. PNG or JPG, max 5MB.</p>
                <div className="flex items-center gap-4">
                  <div className="relative inline-block overflow-hidden bg-base-100 dark:bg-casual-black border border-casual-black/20 dark:border-concrete/20 hover:border-sporty-blue hover:text-sporty-blue transition-all duration-200 rounded-lg text-casual-black dark:text-concrete font-medium text-xs px-5 py-2.5 cursor-pointer shadow-sm">
                     <span className="relative z-10 pointer-events-none">Update Photo</span>
                     <div className="absolute inset-0 opacity-0 cursor-pointer">
                        <ImageUpload setImageUrl={(url) => setFormData(prev => ({ ...prev, doctorPicture: url }))} />
                     </div>
                  </div>
                  <button type="button" className="text-xs text-casual-black/50 dark:text-concrete/50 hover:text-fascinating-magenta font-medium transition-colors" onClick={() => setFormData(prev => ({ ...prev, doctorPicture: '' }))}>
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className={labelClasses}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputBaseClasses} placeholder="e.g. James Smith, MD" />
              </div>
              <div className="group">
                <label className={labelClasses}>Designation</label>
                <input type="text" name="designation" value={formData.designation} onChange={handleChange} required className={inputBaseClasses} placeholder="e.g. General Surgeon" />
              </div>
            </div>
          </div>

          {/* Section 2: Professional Qualifications */}
          <div className="p-8 border-b border-casual-black/5 dark:border-white/10 transition-colors">
            <h2 className="text-base font-bold flex items-center gap-2.5 mb-8 text-casual-black dark:text-concrete transition-colors">
              <HiOutlineAcademicCap className="w-6 h-6 text-sporty-blue" />
              Professional Qualifications
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className={labelClasses}>Institution</label>
                <input type="text" name="institution" value={formData.institution} onChange={handleChange} required className={inputBaseClasses} placeholder="e.g. Harvard Medical School" />
              </div>
              <div className="group">
                <label className={labelClasses}>Degree</label>
                <input type="text" name="degree" value={formData.degree} onChange={handleChange} required className={inputBaseClasses} placeholder="e.g. MBBS, FCPS" />
              </div>
              <div className="md:col-span-2 group">
                <label className={labelClasses}>BMDC Registration Number</label>
                <input type="text" name="bmdcRegistrationNumber" value={formData.bmdcRegistrationNumber} onChange={handleChange} required className={inputBaseClasses} placeholder="e.g. A-12345" />
              </div>
            </div>
          </div>

          {/* Section 3: Contact Details */}
          <div className="p-8 border-b border-casual-black/5 dark:border-white/10 transition-colors">
            <h2 className="text-base font-bold flex items-center gap-2.5 mb-8 text-casual-black dark:text-concrete transition-colors">
              <HiOutlineIdentification className="w-6 h-6 text-sporty-blue" />
              Contact Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className={labelClasses}>Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiOutlineEnvelope className="h-5 w-5 text-casual-black/50 dark:text-concrete/50 group-focus-within:text-sporty-blue transition-colors" />
                  </div>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={`pl-11 ${inputBaseClasses}`} placeholder="doctor@hospital.com" />
                </div>
              </div>
              <div className="group">
                <label className={labelClasses}>Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <HiOutlinePhone className="h-5 w-5 text-casual-black/50 dark:text-concrete/50 group-focus-within:text-sporty-blue transition-colors" />
                  </div>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`pl-11 ${inputBaseClasses}`} placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              <div className="md:col-span-2 group">
                <label className={labelClasses}>Office Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiOutlineMapPin className="h-5 w-5 text-casual-black/50 dark:text-concrete/50 group-focus-within:text-sporty-blue transition-colors" />
                  </div>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className={`pl-11 ${inputBaseClasses}`} placeholder="123 Health St, Medical District" />
                </div>
              </div>

              {/* Division Dropdown */}
              <div className="group relative">
                <label className={labelClasses}>Division</label>
                <select 
                  name="division" 
                  value={formData.division} 
                  onChange={handleChange} 
                  className={`appearance-none cursor-pointer ${inputBaseClasses}`}
                >
                  <option value="" disabled>Select Division</option>
                  {divisions.map((div) => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 pointer-events-none">
                   <HiChevronUpDown className="h-5 w-5 text-casual-black/50 dark:text-concrete/50" />
                </div>
              </div>

              {/* District Dropdown */}
              <div className="group relative">
                <label className={labelClasses}>District</label>
                <select 
                  name="district" 
                  value={formData.district} 
                  onChange={handleChange} 
                  disabled={!formData.division} 
                  className={`appearance-none cursor-pointer disabled:bg-casual-black/5 disabled:dark:bg-white/5 disabled:text-casual-black/40 disabled:dark:text-concrete/40 disabled:cursor-not-allowed ${inputBaseClasses}`}
                >
                  <option value="" disabled>Select District</option>
                  {availableDistricts.map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 pointer-events-none">
                   <HiChevronUpDown className="h-5 w-5 text-casual-black/50 dark:text-concrete/50" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: E-Signature */}
          <div className="p-8">
            <h2 className="text-base font-bold flex items-center gap-2.5 mb-6 text-casual-black dark:text-concrete transition-colors">
               <HiOutlinePencilSquare className="w-6 h-6 text-sporty-blue" />
              E-Signature
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-casual-black/5 dark:bg-white/5 p-6 rounded-2xl border border-casual-black/5 dark:border-white/10 transition-colors">
              <div className="relative overflow-hidden bg-base-100 dark:bg-casual-black border border-casual-black/20 dark:border-concrete/20 hover:border-sporty-blue hover:text-sporty-blue transition-all duration-200 rounded-lg text-casual-black dark:text-concrete font-medium text-xs px-5 py-2.5 cursor-pointer shadow-sm w-full sm:w-auto text-center">
                  <span className="relative z-10 pointer-events-none">Upload Signature</span>
                  <div className="absolute inset-0 opacity-0 cursor-pointer">
                    <ImageUpload setImageUrl={(url) => setFormData(prev => ({ ...prev, signature: url }))} />
                  </div>
              </div>
              {formData.signature && (
                <div className="h-16 w-auto border border-casual-black/20 dark:border-concrete/20 rounded-lg p-2 bg-base-100 dark:bg-casual-black shadow-sm flex items-center justify-center transition-colors">
                  <img src={formData.signature} alt="Signature preview" className="h-full w-auto object-contain dark:invert-[.8]" />
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-8 py-6 bg-casual-black/5 dark:bg-white/5 border-t border-casual-black/5 dark:border-white/10 flex items-center justify-end gap-4 transition-colors">
            <button type="button" className="px-6 py-2.5 text-sm font-semibold text-casual-black/70 dark:text-concrete/70 hover:text-casual-black dark:hover:text-concrete hover:bg-casual-black/10 dark:hover:bg-white/10 rounded-xl transition-all duration-200">
              Cancel Changes
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-2.5 text-sm font-bold text-concrete bg-sporty-blue hover:bg-sporty-blue/90 hover:shadow-lg hover:shadow-sporty-blue/20 rounded-xl transition-all duration-200 flex items-center justify-center min-w-[150px] active:scale-95"
            >
              {loading ? (
                <CgSpinner className="w-5 h-5 animate-spin text-concrete" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>

        {/* Delete Profile Section */}
        <div className="mt-8 bg-fascinating-magenta/5 dark:bg-fascinating-magenta/10 border border-fascinating-magenta/20 hover:border-fascinating-magenta/40 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors duration-300">
          <div>
            <h3 className="text-base font-bold text-fascinating-magenta">Delete Profile</h3>
            <p className="text-sm text-fascinating-magenta/80 mt-1">This will permanently remove your medical profile from the system.</p>
          </div>
          <button type="button" className="px-6 py-2.5 text-sm font-bold text-fascinating-magenta border-2 border-fascinating-magenta/20 bg-concrete dark:bg-casual-black hover:bg-fascinating-magenta hover:text-concrete hover:border-fascinating-magenta rounded-xl transition-all duration-200 whitespace-nowrap active:scale-95 shadow-sm">
            Deactivate Account
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;