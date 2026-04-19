import React, { useContext, useState, useEffect } from 'react';
import { Save, Eye, Globe, Award, Stethoscope, BarChart3, MessageSquare, Share2, Info, Loader2 } from 'lucide-react';
import { AuthContext } from '../../providers/AuthProvider';
import useDoctorWebsite from '../../Hook/useDoctorWebsite';
import ImageUpload from '../../config/ImageUploadcpanel'; // Imported ImageUpload
import OfflineWarning from '../../components/common/offlineComponent';

const WebsiteProfileEditor = () => {
    const [activeTab, setActiveTab] = useState('Hero Info');
    const { branch } = useContext(AuthContext);

    const { getWebsiteByBranch, createWebsite, updateWebsite, loading } = useDoctorWebsite();
    const [existingId, setExistingId] = useState(null);
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

    // Initial State Structure
    const initialState = {
        info: {
            fullName: '', shortName: '', subtitle: '', mobile: '',
            whatsappNumber: '', email: '', designation: '',
            specialization: '', primaryCredentials: ''
        },
        qualifications: {
            spokenLanguages: '', bmdcRegistrationNumber: '', deaNumber: '',
            npiNumber: '', educationDegrees: '', professionalCertification: '',
            professionalMembership: ''
        },
        logoBranding: {
            useProfilePicture: false, picture: '', digitalSignature: '',
            shortDescription: '', currency: ''
        },
        specializationsExpertise: Array(5).fill({ specialization: '', description: '' }),
        statisticsDisplay: {
            happyPatientsCount: 0, yearsOfExperience: 0, patientRating: 0, supportAvailability: ''
        },
        aboutMe: {
            sectionTitle: '', professionalBackground: '', clinicalExcellence: '',
            commitmentToCare: '', memberships: '', medicalExpertise: '',
            professionalApproach: '', professionalMemberships: ''
        },
        appointment: {
            hospitalNameAddress: '', mobile: '', emergencyNumber: ''
        },
        socialMedia: {
            facebook: '', twitter: '', instagram: '', linkedIn: '', youtube: ''
        },
        testimonials: Array(4).fill({ patientName: '', rating: 0, reviewText: '', profileImageUrl: '' }),
        branch: branch || ''
    };

    const [formData, setFormData] = useState(initialState);
    const tabs = ['Hero Info', 'About', 'Qualifications', 'Specializations', 'Stats', 'Contact & Social', 'Reviews'];

    // Auto-fetch data when component mounts or branch changes
    useEffect(() => {
        const fetchExistingData = async () => {
            if (!branch) return;

            // Ensure branch is in formData
            setFormData(prev => ({ ...prev, branch }));

            try {
                const existingData = await getWebsiteByBranch(branch);
                if (existingData) {
                    setExistingId(existingData._id);

                    // Merge existing data with structure to pad arrays if needed
                    setFormData(prev => ({
                        ...prev,
                        ...existingData,
                        // Ensure arrays don't break if DB returns fewer items than slots
                        specializationsExpertise: existingData.specializationsExpertise?.length
                            ? [...existingData.specializationsExpertise, ...Array(5).fill({ specialization: '', description: '' })].slice(0, 5)
                            : prev.specializationsExpertise,
                        testimonials: existingData.testimonials?.length
                            ? [...existingData.testimonials, ...Array(4).fill({ patientName: '', rating: 0, reviewText: '', profileImageUrl: '' })].slice(0, 4)
                            : prev.testimonials
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch website profile:", err);
            }
        };

        fetchExistingData();
    }, [branch, getWebsiteByBranch]);

    const handleInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    const handleArrayChange = (section, index, field, value) => {
        setFormData(prev => {
            const newArray = [...prev[section]];
            newArray[index] = { ...newArray[index], [field]: value };
            return { ...prev, [section]: newArray };
        });
    };

    const handleSave = async () => {
        if (!formData.info.fullName) {
            alert("Full Name is required!");
            return;
        }

        try {
            if (existingId) {
                await updateWebsite(existingId, formData);
                alert("Website profile updated successfully!");
            } else {
                const newProfile = await createWebsite(formData);
                setExistingId(newProfile._id);
                alert("Website profile created successfully!");
            }
        } catch (error) {
            console.error("Save failed:", error);
            alert("Failed to save profile. Check console for details.");
        }
    };

    
    if (!isOnline) {

    return <OfflineWarning />;

  }



    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-24 font-sans">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Landing Page Editor</h1>
                    <p className="text-sm text-gray-500">Customize your public doctor profile page</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-50 transition-colors">
                        <Eye size={18} /> Preview
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-white border rounded-t-lg overflow-x-auto mb-1">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab
                            ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white border rounded-b-lg shadow-sm p-6 space-y-8 relative">
                {/* Overlay loader when fetching/saving */}
                {loading && (
                    <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-b-lg">
                        <div className="flex items-center gap-2 text-blue-600 font-medium bg-white px-4 py-2 rounded-full shadow-md">
                            <Loader2 className="animate-spin" size={20} /> Processing...
                        </div>
                    </div>
                )}

                {/* HERO INFO TAB */}
                {activeTab === 'Hero Info' && (
                    <div className="space-y-8">
                        <section>
                            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Basic Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Full Name *</label>
                                    <input className="w-full p-2 border rounded-md" value={formData.info.fullName} onChange={(e) => handleInputChange('info', 'fullName', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Short Name</label>
                                    <input className="w-full p-2 border rounded-md" value={formData.info.shortName} onChange={(e) => handleInputChange('info', 'shortName', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Designation</label>
                                    <input className="w-full p-2 border rounded-md" value={formData.info.designation} onChange={(e) => handleInputChange('info', 'designation', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Primary Credentials</label>
                                    <input className="w-full p-2 border rounded-md" value={formData.info.primaryCredentials} onChange={(e) => handleInputChange('info', 'primaryCredentials', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Specialization</label>
                                    <input className="w-full p-2 border rounded-md" value={formData.info.specialization} onChange={(e) => handleInputChange('info', 'specialization', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Subtitle</label>
                                    <input className="w-full p-2 border rounded-md" value={formData.info.subtitle} onChange={(e) => handleInputChange('info', 'subtitle', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Mobile Number</label>
                                    <input className="w-full p-2 border rounded-md" value={formData.info.mobile} onChange={(e) => handleInputChange('info', 'mobile', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">WhatsApp Number</label>
                                    <input className="w-full p-2 border rounded-md" value={formData.info.whatsappNumber} onChange={(e) => handleInputChange('info', 'whatsappNumber', e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium mb-1 block">Email</label>
                                    <input type="email" className="w-full p-2 border rounded-md" value={formData.info.email} onChange={(e) => handleInputChange('info', 'email', e.target.value)} />
                                </div>
                            </div>
                        </section>

                        <section className="pt-6 border-t">
                            <h3 className="text-lg font-semibold mb-4">Logo & Branding</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg flex items-center justify-between bg-gray-50 md:col-span-2">
                                    <div>
                                        <p className="font-medium">Use Profile Picture as Logo</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.logoBranding.useProfilePicture}
                                        onChange={(e) => handleInputChange('logoBranding', 'useProfilePicture', e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300"
                                    />
                                </div>

                                {/* Picture Upload Integration */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium mb-1 block">Profile/Logo Picture</label>
                                    <div className="flex items-center gap-4">
                                        {formData.logoBranding.picture && (
                                            <div className="h-14 w-14 rounded-md overflow-hidden bg-gray-100 border flex-shrink-0">
                                                <img src={formData.logoBranding.picture} alt="Profile" className="h-full w-full object-cover" />
                                            </div>
                                        )}
                                        <div className="relative inline-block overflow-hidden bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg text-gray-700 font-medium text-xs px-4 py-2.5 cursor-pointer shadow-sm flex-shrink-0">
                                            <span className="relative z-10 pointer-events-none">Upload Picture</span>
                                            <div className="absolute inset-0 opacity-0 cursor-pointer">
                                                <ImageUpload setImageUrl={(url) => handleInputChange('logoBranding', 'picture', url)} />
                                            </div>
                                        </div>
                                        <input className="flex-1 p-2 border rounded-md text-sm" placeholder="Or paste image URL" value={formData.logoBranding.picture} onChange={(e) => handleInputChange('logoBranding', 'picture', e.target.value)} />
                                    </div>
                                </div>

                                {/* Digital Signature Upload Integration */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium mb-1 block">Digital Signature</label>
                                    <div className="flex items-center gap-4">
                                        {formData.logoBranding.digitalSignature && (
                                            <div className="h-14 w-28 rounded-md overflow-hidden bg-gray-50 border flex items-center justify-center flex-shrink-0 p-1">
                                                <img src={formData.logoBranding.digitalSignature} alt="Signature" className="h-full w-auto object-contain" />
                                            </div>
                                        )}
                                        <div className="relative inline-block overflow-hidden bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg text-gray-700 font-medium text-xs px-4 py-2.5 cursor-pointer shadow-sm flex-shrink-0">
                                            <span className="relative z-10 pointer-events-none">Upload Signature</span>
                                            <div className="absolute inset-0 opacity-0 cursor-pointer">
                                                <ImageUpload setImageUrl={(url) => handleInputChange('logoBranding', 'digitalSignature', url)} />
                                            </div>
                                        </div>
                                        <input className="flex-1 p-2 border rounded-md text-sm" placeholder="Or paste signature URL" value={formData.logoBranding.digitalSignature} onChange={(e) => handleInputChange('logoBranding', 'digitalSignature', e.target.value)} />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Preferred Currency</label>
                                    <input className="w-full p-2 border rounded-md" placeholder="e.g. BDT, USD" value={formData.logoBranding.currency} onChange={(e) => handleInputChange('logoBranding', 'currency', e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium mb-1 block">Short Description (Branding)</label>
                                    <textarea className="w-full p-2 border rounded-md h-20" value={formData.logoBranding.shortDescription} onChange={(e) => handleInputChange('logoBranding', 'shortDescription', e.target.value)} />
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* ABOUT TAB */}
                {activeTab === 'About' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold border-b pb-2">About Me</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium mb-1 block">Section Title</label>
                                <input className="w-full p-2 border rounded-md" value={formData.aboutMe.sectionTitle} onChange={(e) => handleInputChange('aboutMe', 'sectionTitle', e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium mb-1 block">Professional Background</label>
                                <textarea className="w-full p-2 border rounded-md h-20" value={formData.aboutMe.professionalBackground} onChange={(e) => handleInputChange('aboutMe', 'professionalBackground', e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium mb-1 block">Clinical Excellence</label>
                                <textarea className="w-full p-2 border rounded-md h-20" value={formData.aboutMe.clinicalExcellence} onChange={(e) => handleInputChange('aboutMe', 'clinicalExcellence', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Commitment To Care</label>
                                <textarea className="w-full p-2 border rounded-md h-20" value={formData.aboutMe.commitmentToCare} onChange={(e) => handleInputChange('aboutMe', 'commitmentToCare', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Medical Expertise</label>
                                <textarea className="w-full p-2 border rounded-md h-20" value={formData.aboutMe.medicalExpertise} onChange={(e) => handleInputChange('aboutMe', 'medicalExpertise', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Professional Approach</label>
                                <textarea className="w-full p-2 border rounded-md h-20" value={formData.aboutMe.professionalApproach} onChange={(e) => handleInputChange('aboutMe', 'professionalApproach', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Memberships (General)</label>
                                <textarea className="w-full p-2 border rounded-md h-20" value={formData.aboutMe.memberships} onChange={(e) => handleInputChange('aboutMe', 'memberships', e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium mb-1 block">Professional Memberships</label>
                                <textarea className="w-full p-2 border rounded-md h-20" value={formData.aboutMe.professionalMemberships} onChange={(e) => handleInputChange('aboutMe', 'professionalMemberships', e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}

                {/* QUALIFICATIONS TAB */}
                {activeTab === 'Qualifications' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold border-b pb-2">Qualifications & Registrations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">BMDC Registration Number</label>
                                <input className="w-full p-2 border rounded-md" value={formData.qualifications.bmdcRegistrationNumber} onChange={(e) => handleInputChange('qualifications', 'bmdcRegistrationNumber', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">DEA Number</label>
                                <input className="w-full p-2 border rounded-md" value={formData.qualifications.deaNumber} onChange={(e) => handleInputChange('qualifications', 'deaNumber', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">NPI Number</label>
                                <input className="w-full p-2 border rounded-md" value={formData.qualifications.npiNumber} onChange={(e) => handleInputChange('qualifications', 'npiNumber', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Spoken Languages</label>
                                <input className="w-full p-2 border rounded-md" placeholder="e.g. English, Bengali" value={formData.qualifications.spokenLanguages} onChange={(e) => handleInputChange('qualifications', 'spokenLanguages', e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium mb-1 block">Education Degrees</label>
                                <textarea className="w-full p-2 border rounded-md h-20" value={formData.qualifications.educationDegrees} onChange={(e) => handleInputChange('qualifications', 'educationDegrees', e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium mb-1 block">Professional Certifications</label>
                                <textarea className="w-full p-2 border rounded-md h-20" value={formData.qualifications.professionalCertification} onChange={(e) => handleInputChange('qualifications', 'professionalCertification', e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium mb-1 block">Professional Memberships</label>
                                <textarea className="w-full p-2 border rounded-md h-20" value={formData.qualifications.professionalMembership} onChange={(e) => handleInputChange('qualifications', 'professionalMembership', e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}

                {/* SPECIALIZATIONS TAB */}
                {activeTab === 'Specializations' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold border-b pb-2">Specializations & Expertise (Max 5)</h3>
                        <div className="space-y-6">
                            {formData.specializationsExpertise.map((spec, index) => (
                                <div key={`spec-${index}`} className="p-4 border rounded-lg bg-gray-50 space-y-4">
                                    <h4 className="font-medium text-gray-700">Specialization #{index + 1}</h4>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Title</label>
                                        <input
                                            className="w-full p-2 border rounded-md bg-white"
                                            value={spec?.specialization || ''}
                                            onChange={(e) => handleArrayChange('specializationsExpertise', index, 'specialization', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Description</label>
                                        <textarea
                                            className="w-full p-2 border rounded-md h-20 bg-white"
                                            value={spec?.description || ''}
                                            onChange={(e) => handleArrayChange('specializationsExpertise', index, 'description', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STATS TAB */}
                {activeTab === 'Stats' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold border-b pb-2">Statistics Display</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Happy Patients Count (Number)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-md"
                                    value={formData.statisticsDisplay.happyPatientsCount}
                                    onChange={(e) => handleInputChange('statisticsDisplay', 'happyPatientsCount', Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Years of Experience (Number)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-md"
                                    value={formData.statisticsDisplay.yearsOfExperience}
                                    onChange={(e) => handleInputChange('statisticsDisplay', 'yearsOfExperience', Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Patient Rating (Number)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="w-full p-2 border rounded-md"
                                    value={formData.statisticsDisplay.patientRating}
                                    onChange={(e) => handleInputChange('statisticsDisplay', 'patientRating', Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Support Availability (Text)</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md"
                                    placeholder="e.g. 24/7"
                                    value={formData.statisticsDisplay.supportAvailability}
                                    onChange={(e) => handleInputChange('statisticsDisplay', 'supportAvailability', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTACT & SOCIAL TAB */}
                {activeTab === 'Contact & Social' && (
                    <div className="space-y-8">
                        <section>
                            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Appointment Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium mb-1 block">Hospital Name & Address</label>
                                    <textarea className="w-full p-2 border rounded-md h-20" value={formData.appointment.hospitalNameAddress} onChange={(e) => handleInputChange('appointment', 'hospitalNameAddress', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Appointment Mobile</label>
                                    <input className="w-full p-2 border rounded-md" value={formData.appointment.mobile} onChange={(e) => handleInputChange('appointment', 'mobile', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Emergency Number</label>
                                    <input className="w-full p-2 border rounded-md" value={formData.appointment.emergencyNumber} onChange={(e) => handleInputChange('appointment', 'emergencyNumber', e.target.value)} />
                                </div>
                            </div>
                        </section>

                        <section className="pt-6 border-t">
                            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Social Media Links</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Facebook URL</label>
                                    <input className="w-full p-2 border rounded-md" value={formData.socialMedia.facebook} onChange={(e) => handleInputChange('socialMedia', 'facebook', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">LinkedIn URL</label>
                                    <input className="w-full p-2 border rounded-md" value={formData.socialMedia.linkedIn} onChange={(e) => handleInputChange('socialMedia', 'linkedIn', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Twitter (X) URL</label>
                                    <input className="w-full p-2 border rounded-md" value={formData.socialMedia.twitter} onChange={(e) => handleInputChange('socialMedia', 'twitter', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Instagram URL</label>
                                    <input className="w-full p-2 border rounded-md" value={formData.socialMedia.instagram} onChange={(e) => handleInputChange('socialMedia', 'instagram', e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium mb-1 block">YouTube URL</label>
                                    <input className="w-full p-2 border rounded-md" value={formData.socialMedia.youtube} onChange={(e) => handleInputChange('socialMedia', 'youtube', e.target.value)} />
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* REVIEWS TAB */}
                {activeTab === 'Reviews' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold border-b pb-2">Patient Testimonials (Max 4)</h3>
                        <div className="space-y-6">
                            {formData.testimonials.map((testimonial, index) => (
                                <div key={`testimonial-${index}`} className="p-4 border rounded-lg bg-gray-50 space-y-4">
                                    <h4 className="font-medium text-gray-700">Testimonial #{index + 1}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Patient Name</label>
                                            <input
                                                className="w-full p-2 border rounded-md bg-white"
                                                value={testimonial?.patientName || ''}
                                                onChange={(e) => handleArrayChange('testimonials', index, 'patientName', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Rating (1-5)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                className="w-full p-2 border rounded-md bg-white"
                                                value={testimonial?.rating || 0}
                                                onChange={(e) => handleArrayChange('testimonials', index, 'rating', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="text-sm font-medium mb-1 block">Review Text</label>
                                            <textarea
                                                className="w-full p-2 border rounded-md h-20 bg-white"
                                                value={testimonial?.reviewText || ''}
                                                onChange={(e) => handleArrayChange('testimonials', index, 'reviewText', e.target.value)}
                                            />
                                        </div>

                                        {/* Reviewer Profile Image Upload Integration */}
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="text-sm font-medium mb-1 block">Profile Image URL</label>
                                            <div className="flex items-center gap-4">
                                                {testimonial?.profileImageUrl && (
                                                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 border flex-shrink-0">
                                                        <img src={testimonial.profileImageUrl} alt="Reviewer" className="h-full w-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="relative inline-block overflow-hidden bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg text-gray-700 font-medium text-xs px-4 py-2 cursor-pointer shadow-sm flex-shrink-0">
                                                    <span className="relative z-10 pointer-events-none">Upload Image</span>
                                                    <div className="absolute inset-0 opacity-0 cursor-pointer">
                                                        <ImageUpload setImageUrl={(url) => handleArrayChange('testimonials', index, 'profileImageUrl', url)} />
                                                    </div>
                                                </div>
                                                <input
                                                    className="flex-1 p-2 border rounded-md bg-white text-sm"
                                                    placeholder="Or paste image URL"
                                                    value={testimonial?.profileImageUrl || ''}
                                                    onChange={(e) => handleArrayChange('testimonials', index, 'profileImageUrl', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Footer Actions */}
            <div className="fixed z-50 bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-4 justify-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <button className="flex items-center gap-2 px-6 py-2 border rounded-md hover:bg-gray-50 transition-colors font-medium">
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading || !branch}
                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {existingId ? 'Update Website Profile' : 'Save Website Profile'}
                </button>
            </div>
        </div>
    );
};

export default WebsiteProfileEditor;