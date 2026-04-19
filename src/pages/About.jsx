import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight, Award, Clock, ShieldCheck, Heart,
  Globe, Activity, Loader2, BookOpen, CheckCircle,
  Languages, FileText, Users, Briefcase,
  Stethoscope
} from 'lucide-react';
import useDoctorWebsite from '../Hook/useDoctorWebsite'; // Adjust import path as needed

const About = () => {
  const Branch = "sadat";
  const { getWebsiteByBranch, loading, error } = useDoctorWebsite();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getWebsiteByBranch(Branch);
        if (data) {
          setProfileData(data);
        }
      } catch (err) {
        console.error("Error fetching doctor profile for About page:", err);
      }
    };
    fetchProfile();
  }, [Branch, getWebsiteByBranch]);

  // --- Data Mapping with Fallbacks ---

  // Basic Info & Branding
  const fullName = profileData?.info?.fullName || "Dr. Quazi Abdullah Al Masum";
  const shortName = profileData?.info?.shortName || "Dr. Masum";
  const designation = profileData?.info?.designation || "Senior Consultant";
  const specialization = profileData?.info?.specialization || "Gastroenterology & Hepatology";
  const profileImage = profileData?.logoBranding?.picture || "https://lh3.googleusercontent.com/aida-public/AB6AXuDsfhDX2mP3TJb1xjXPD2VbwMHMv5vNI5I5i_eQOP1B1yEb65jJ_C4pVp2eJbxPE6yH7PZ0v-4aQeYn8_9aUeEaaAb6oYVpXJ5a2CV64KuUVQ-S-H8S9ZpsOsq0hTf-EIF0Tw43KKTqEM6QugKIBCOPqArqDN_qnhFiuE7utR9d8AIC0iACaTtsvebkAUaTfS2uSKY7goj0D7Q39eGDmtGEIiyxiEMU9UKb2iMgQOEu3IikJBqP38Yfr6CPVjeFuocXjRGVzgAt3KA";
  const quote = profileData?.logoBranding?.shortDescription || "Providing compassionate care through advanced medical expertise.";

  // Credentials & Stats
  const credentialsString = profileData?.info?.primaryCredentials || "MBBS, FCPS, MD";
  const credentialsList = credentialsString.split(',').map(c => c.trim()).filter(Boolean);
  const yearsOfExperience = profileData?.statisticsDisplay?.yearsOfExperience || 27;
  const happyPatientsCount = profileData?.statisticsDisplay?.happyPatientsCount || 5000;

  // Qualifications
  const bmdcReg = profileData?.qualifications?.bmdcRegistrationNumber || "Not Specified";
  const spokenLanguages = profileData?.qualifications?.spokenLanguages || "Bengali, English";
  const educationDegrees = profileData?.qualifications?.educationDegrees || "";
  const certifications = profileData?.qualifications?.professionalCertification || "";

  // About Me Sections
  const professionalBackground = profileData?.aboutMe?.professionalBackground || "A distinguished professional with decades of experience in clinical excellence and patient care.";
  const medicalExpertise = profileData?.aboutMe?.medicalExpertise || "";
  const clinicalExcellence = profileData?.aboutMe?.clinicalExcellence || "";
  const professionalApproach = profileData?.aboutMe?.professionalApproach || "";
  const commitmentToCare = profileData?.aboutMe?.commitmentToCare || "";
  const memberships = profileData?.aboutMe?.professionalMemberships || profileData?.aboutMe?.memberships || "Bangladesh Gastroenterology Society";

  // Helper to render text with line breaks
  const renderText = (text) => {
    if (!text) return null;
    return text.split('\n').map((paragraph, index) => (
      paragraph.trim() && <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
    ));
  };

  if (loading && !profileData) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen w-full flex items-center justify-center text-teal-600 pt-20">
        <Loader2 className="animate-spin w-10 h-10" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-20 bg-slate-50/50 min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-12">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <span>Home</span>
            <ChevronRight size={14} />
            <span className="text-teal-600 font-medium">About Profile</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            {profileData?.aboutMe?.sectionTitle || `About ${shortName}`}
          </h1>
          <div className="h-1.5 w-24 bg-teal-600 rounded-full"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">

          {/* LEFT SIDEBAR: Quick Profile Card */}
          <div className="lg:w-4/12">
            <div className="sticky top-32 space-y-6">

              {/* Main Profile Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 text-center">
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 border-4 border-teal-50 shadow-inner">
                  <img
                    src={profileImage}
                    alt={fullName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-1">{fullName}</h2>
                <p className="text-teal-600 font-bold mb-1">{designation}</p>
                <p className="text-slate-500 text-sm mb-6">{specialization}</p>

                {/* Credentials Tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {credentialsList.map(cred => (
                    <span key={cred} className="px-3 py-1 bg-slate-100 rounded-full text-slate-700 font-bold text-xs">
                      {cred}
                    </span>
                  ))}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                  <div>
                    <div className="text-2xl font-black text-slate-900">{yearsOfExperience}+</div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Years Exp.</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">{happyPatientsCount}+</div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Patients</div>
                  </div>
                </div>
              </div>

              {/* Quote Card */}
              <div className="bg-teal-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10">
                  <Heart size={100} />
                </div>
                <p className="relative z-10 text-lg font-medium italic leading-relaxed">
                  "{quote}"
                </p>
              </div>

            </div>
          </div>

          {/* RIGHT CONTENT: Detailed Sections */}
          <div className="lg:w-8/12 space-y-10">

            {/* Core Narrative Sections */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-sm space-y-12">

              {/* Professional Background */}
              {professionalBackground && (
                <section>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><Briefcase size={20} /></div>
                    Professional Background
                  </h3>
                  <div className="text-slate-600 text-lg leading-relaxed">
                    {renderText(professionalBackground)}
                  </div>
                </section>
              )}

              {/* Medical Expertise */}
              {medicalExpertise && (
                <section>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><Stethoscope size={20} /></div>
                    Medical Expertise
                  </h3>
                  <div className="text-slate-600 text-lg leading-relaxed">
                    {renderText(medicalExpertise)}
                  </div>
                </section>
              )}

              {/* Clinical Excellence */}
              {clinicalExcellence && (
                <section>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><ShieldCheck size={20} /></div>
                    Clinical Excellence
                  </h3>
                  <div className="text-slate-600 text-lg leading-relaxed">
                    {renderText(clinicalExcellence)}
                  </div>
                </section>
              )}

              {/* Approach & Commitment */}
              {(professionalApproach || commitmentToCare) && (
                <section className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                    <Heart className="text-teal-600" size={24} />
                    Patient Care & Approach
                  </h3>
                  <div className="text-slate-600 leading-relaxed space-y-4">
                    {renderText(professionalApproach)}
                    {renderText(commitmentToCare)}
                  </div>
                </section>
              )}
            </div>

            {/* Formal Qualifications Grid */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Education & Certs */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <BookOpen className="text-teal-600" size={20} /> Formal Education
                </h3>
                <div className="space-y-4">
                  {educationDegrees && (
                    <div className="flex gap-3">
                      <CheckCircle className="text-teal-500 shrink-0 mt-1" size={16} />
                      <p className="text-slate-600 text-sm">{educationDegrees}</p>
                    </div>
                  )}
                  {certifications && (
                    <div className="flex gap-3">
                      <Award className="text-teal-500 shrink-0 mt-1" size={16} />
                      <p className="text-slate-600 text-sm">{certifications}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Registrations & Details */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText size={14} /> BMDC Registration
                  </h3>
                  <p className="text-slate-900 font-medium">{bmdcReg}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Languages size={14} /> Languages Spoken
                  </h3>
                  <p className="text-slate-900 font-medium">{spokenLanguages}</p>
                </div>
              </div>
            </div>

            {/* Memberships */}
            {memberships && (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex items-center gap-6">
                <div className="hidden sm:flex w-16 h-16 bg-teal-50 rounded-2xl items-center justify-center text-teal-600 shrink-0">
                  <Globe size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Professional Memberships</h3>
                  <div className="text-slate-600 leading-relaxed">
                    {renderText(memberships)}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default About;