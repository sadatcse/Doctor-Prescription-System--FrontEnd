import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Stethoscope, Heart, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // <-- Imported useNavigate
import useDoctorWebsite from '../Hook/useDoctorWebsite'; // Adjust import path as needed

const Home = () => { // <-- Removed setActiveSection prop
  const navigate = useNavigate(); // <-- Initialize navigation hook
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
        console.error("Error fetching doctor profile:", err);
      }
    };

    fetchProfile();
  }, [Branch, getWebsiteByBranch]);

  // --- Dynamic Data Mapping with Fallbacks ---
  const fullName = profileData?.info?.fullName || "Dr. Quazi Abdullah Al Masum";
  const designation = profileData?.info?.designation || "Senior Consultant";
  const specialization = profileData?.info?.specialization || "Gastroenterology & Hepatology";
  const description = profileData?.logoBranding?.shortDescription ||
    `Specializing in ${specialization}. Providing expert medical care for digestive and liver health for over 27 years.`;
  const profileImage = profileData?.logoBranding?.picture || "https://lh3.googleusercontent.com/aida-public/AB6AXuDsfhDX2mP3TJb1xjXPD2VbwMHMv5vNI5I5i_eQOP1B1yEb65jJ_C4pVp2eJbxPE6yH7PZ0v-4aQeYn8_9aUeEaaAb6oYVpXJ5a2CV64KuUVQ-S-H8S9ZpsOsq0hTf-EIF0Tw43KKTqEM6QugKIBCOPqArqDN_qnhFiuE7utR9d8AIC0iACaTtsvebkAUaTfS2uSKY7goj0D7Q39eGDmtGEIiyxiEMU9UKb2iMgQOEu3IikJBqP38Yfr6CPVjeFuocXjRGVzgAt3KA";
  const yearsOfExperience = profileData?.statisticsDisplay?.yearsOfExperience || 27;

  // Split the name to keep your two-tone colored text styling
  const nameParts = fullName.split(' ');
  const lastName = nameParts.pop();
  const restOfName = nameParts.join(' ');

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
      className="pt-20"
    >
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center rounded-full bg-teal-50 px-4 py-1.5 text-xs font-bold text-teal-600 uppercase tracking-widest mb-6"
            >
              {designation}
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6"
            >
              {restOfName} <br />
              <span className="text-teal-600">{lastName}</span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/select-chamber')} // <-- Routes to select chamber
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-teal-600/20"
              >
                Book Appointment
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/about')} // <-- Routes to about page
                className="border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-full font-bold hover:bg-slate-50 transition-colors"
              >
                Learn More
              </motion.button>
            </motion.div>
          </div>

          <div className="flex-1 relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 20 }}
              className="relative z-10 bg-white p-3 rounded-[2.5rem] shadow-2xl overflow-hidden aspect-[4/5] max-w-md mx-auto"
            >
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
                src={profileImage}
                alt={fullName}
                className="w-full h-full object-cover rounded-[2rem]"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            {/* Floating Background Blobs */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 w-64 h-64 bg-teal-100 rounded-full blur-3xl -z-0"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-100 rounded-full blur-3xl -z-0"
            />
          </div>
        </div>
      </section>

      {/* Stats Summary */}
      <section className="bg-slate-50 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: `${yearsOfExperience}+ Years Experience`,
                desc: 'Extensive clinical background in leading medical institutions.'
              },
              {
                icon: Stethoscope,
                title: 'Expert Consultant',
                desc: `Recognized ${designation} specializing in ${specialization}.`
              },
              {
                icon: Heart,
                title: 'Specialized Care',
                desc: 'A patient-centric approach utilizing the latest medical advancements.'
              }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.2, type: "spring", stiffness: 100 }}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow cursor-default"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i * 0.2) + 0.3, type: "spring" }}
                  className="bg-teal-50 w-14 h-14 rounded-xl flex items-center justify-center text-teal-600 mb-6"
                >
                  <stat.icon size={28} />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{stat.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-20 px-4"
      >
        <div className="max-w-5xl mx-auto bg-teal-600 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-teal-600/20">

          {/* Animated CTA Background Blobs */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 origin-bottom-left"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32 origin-top-right"
          />

          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-5xl font-black text-white mb-6"
            >
              Need expert medical advice?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-teal-50 text-lg mb-10 max-w-2xl mx-auto opacity-90"
            >
              Schedule a consultation today for personalized digestive and liver health care.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: 0.4, type: "spring" }}
              onClick={() => navigate('/select-chamber')} // <-- Routes to select chamber
              className="bg-white text-teal-600 px-10 py-5 rounded-full font-bold text-lg shadow-xl hover:bg-teal-50 transition-colors"
            >
              Book Appointment Now
            </motion.button>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Home;