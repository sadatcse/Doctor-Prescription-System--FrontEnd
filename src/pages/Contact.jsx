import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Globe, MapPin, Phone, Calendar, Send, Loader2 } from 'lucide-react';
import useDoctorWebsite from '../Hook/useDoctorWebsite'; // Adjust import path as needed

const Contact = () => {
  const Branch = "sadat";
  const { getWebsiteByBranch, loading, error } = useDoctorWebsite();
  const [profileData, setProfileData] = useState(null);

  // Fetch the data when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getWebsiteByBranch(Branch);
        if (data) {
          setProfileData(data);
        }
      } catch (err) {
        console.error("Error fetching doctor profile for Contact page:", err);
      }
    };

    fetchProfile();
  }, [Branch, getWebsiteByBranch]);

  // --- Dynamic Data Mapping with Fallbacks ---

  // Appointment/Location Info
  const hospitalAddress = profileData?.appointment?.hospitalNameAddress || "Asgar Ali Hospital, 111/1/A Distillery Road, Gandaria, Dhaka-1204, Bangladesh";
  const mobileNumber = profileData?.appointment?.mobile || "+88 0178 768 3333-35";
  const emergencyNumber = profileData?.appointment?.emergencyNumber || "10602";

  // General Info
  const spokenLanguages = profileData?.qualifications?.spokenLanguages || "Bengali, English";
  const supportAvailability = profileData?.statisticsDisplay?.supportAvailability || "9:00 AM – 5:00 PM";

  // Loading State
  if (loading && !profileData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen w-full flex items-center justify-center text-teal-600 pt-20"
      >
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

        {/* Header */}
        <div className="mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Contact Us</h2>
          <nav className="flex text-sm font-semibold text-slate-500">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="text-teal-600">Contact</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Left Column: Info & Emergency */}
          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <Activity className="text-teal-600" /> Consultation Information
              </h3>
              <div className="space-y-8">
                {[
                  {
                    icon: Clock,
                    title: 'Visiting Hours',
                    text: supportAvailability,
                    sub: 'Closed Friday',
                    subColor: 'text-red-600'
                  },
                  {
                    icon: Globe,
                    title: 'Spoken Languages',
                    text: spokenLanguages
                  },
                  {
                    icon: MapPin,
                    title: 'Hospital Address',
                    text: hospitalAddress
                  }
                ].map((info, i) => (
                  <div key={i} className="flex items-start gap-5">
                    <div className="bg-teal-50 p-4 rounded-2xl text-teal-600 shrink-0">
                      <info.icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">{info.title}</h4>
                      <p className="text-slate-600 mt-1 leading-relaxed whitespace-pre-line">{info.text}</p>
                      {info.sub && (
                        <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 ${info.subColor} text-xs font-bold rounded-full`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {info.sub}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Block */}
            <div className="p-8 bg-slate-900 text-white rounded-3xl shadow-2xl relative group overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-3">Emergency Support</h3>
                <p className="text-slate-400 mb-8 max-w-sm leading-relaxed">
                  For critical gastroenterology emergencies outside of visiting hours, please contact the hospital's emergency wing directly.
                </p>
                <a href={`tel:${emergencyNumber}`} className="inline-flex items-center gap-3 bg-teal-600 px-8 py-4 rounded-2xl font-black hover:bg-teal-700 transition-all transform hover:-translate-y-1">
                  <Phone size={20} /> Call {emergencyNumber}
                </a>
              </div>
              <Activity className="absolute -right-4 -bottom-4 text-white/5 w-40 h-40 rotate-12" />
            </div>
          </div>

          {/* Right Column: Appointment / Contact Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <Calendar className="text-teal-600" /> Appointment
            </h3>

            {/* Phone Numbers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-2">Mobile</span>
                <p className="text-slate-900 font-bold text-lg">{mobileNumber}</p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-2">Emergency</span>
                <p className="text-slate-900 font-bold text-lg">{emergencyNumber}</p>
              </div>
            </div>

            {/* Contact Form */}
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <input type="text" className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                  <input type="email" className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent" placeholder="name@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                <input type="text" className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent" placeholder="How can we help?" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                <textarea rows="4" className="w-full rounded-xl border border-slate-200 p-4 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent" placeholder="Your message..."></textarea>
              </div>
              <button type="submit" className="w-full bg-teal-600 text-white py-4 rounded-2xl font-black hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 flex items-center justify-center gap-2">
                Send Message <Send size={18} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default Contact;