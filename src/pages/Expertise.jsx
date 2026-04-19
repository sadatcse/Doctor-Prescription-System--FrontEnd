import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Microscope, Activity, Stethoscope, CheckCircle2, BookOpen, Loader2 } from 'lucide-react';
import useDoctorWebsite from '../Hook/useDoctorWebsite'; // Adjust import path as needed

const Expertise = () => {
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
        console.error("Error fetching doctor profile for Expertise page:", err);
      }
    };

    fetchProfile();
  }, [Branch, getWebsiteByBranch]);

  // --- Dynamic Data Mapping & Fallbacks ---
  const doctorName = profileData?.info?.shortName || "Dr. Al Masum";
  const designation = profileData?.info?.designation || "Senior Consultant";

  // Fallback Categories (Used if DB is empty)
  const defaultCategories = [
    {
      title: 'Luminal Gastroenterology',
      icon: Microscope,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6m9kr9s0GucUoiIllTYyxKCYsIyK7MTjyOetna1Ok02JdEKz_4V89D1JLkyRnli1kB5ia7DgHITc0dba-f5Ba2oD98m2o25X9L1oXoK96R0ETiu3oFWuoVWnPUwh7rbRuZvuDj85Q1HqSA-qy17qZ8OFiCazvODLgjhhSxlB9BGjfbXNL9P-rzpBVXmmsprJCyfabh3-sJURJtnwbD0Dg4SpwBtXh64EZs8XWr52x-DdETU3XSe2zUQ4dnlNQvgz2YugUppRrZ7c',
      items: [
        { name: 'Acid Peptic Disorders', desc: 'Expert management of GERD, Gastritis, and Peptic Ulcer Disease.' },
        { name: 'Inflammatory Bowel Disease (IBD)', desc: "Advanced treatment for Crohn's Disease and Ulcerative Colitis." },
        { name: 'Motility Disorders', desc: 'Comprehensive IBS management and functional GI disorder care.' }
      ]
    },
    {
      title: 'Hepatology',
      icon: Activity,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0CAJ04uwafkLOPMj5f1Z6euTLn7iAG6aaEEgFExC9eOqlW6JVk8eBm2k0wltzWfn7wg-gNbbkQn46y98aNRlBZ0MmPPmZU27k43vSZMzQQWHTLu0cIH8cVzMCmaNaTl_ZgbLu9rt2JOOzeeq2mlb7xVa6TvOmyV1ynm7I4Vixu4RO-uBW7RSPJxYwgWyqRixsL3yolAerWP7i8g2Wp5L0dSMsyX7JZnG9p177GDdelNfOCg5nNBJWLtlzqep-Rf8xbOPVaxgBXoA',
      items: [
        { name: 'Chronic Viral Hepatitis', desc: 'Evidence-based long-term management of Hepatitis B and C.' },
        { name: 'Fatty Liver Disease (MAFLD)', desc: 'Metabolic associated liver disease diagnostic and lifestyle counseling.' },
        { name: 'Cirrhosis & Complications', desc: 'Portal hypertension, ascites management, and advanced monitoring.' }
      ]
    },
    {
      title: 'Pancreaticobiliary',
      icon: Stethoscope,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdvUka61Ix95HjNBx4qUwBS6NEe3q5odnACEo-hsQS7Ii76VTPp_Y9ZhIM0lCD71D16t4yXDdwoeaI-pBijLvoRTZ-NcLLjPKYxaw-4nZsxnLtOQ33504mAZCQMErTAo08w3rVDTi79ro2RhtUi3o-LoQWXDtE_4h51M8t0yWOXtUkw6euIePKPJ5MKIWor3r1KfBnHkXDqgedu4qGvtB2frLWTf3xMf1yqCdhlJkxkOlukp9LiJ82WZ-OgbaUR1g4eof3RtG5JgU',
      items: [
        { name: 'Gallstone Disease', desc: 'Management of choledocholithiasis and symptomatic biliary colic.' },
        { name: 'Pancreatitis', desc: 'Acute and chronic pancreatitis therapeutic protocols.' },
        { name: 'Biliary Strictures', desc: 'Detailed evaluation of benign and malignant obstructive jaundice.' }
      ]
    }
  ];

  // Map dynamic data if it exists, otherwise use defaults
  let displayCategories = defaultCategories;

  if (profileData?.specializationsExpertise && profileData.specializationsExpertise.length > 0) {
    const iconList = [Microscope, Activity, Stethoscope];

    displayCategories = profileData.specializationsExpertise.map((spec, index) => {
      // Split the DB description string by newlines to create sub-items dynamically
      const descriptionLines = spec.description ? spec.description.split('\n').filter(line => line.trim() !== '') : [];

      const mappedItems = descriptionLines.length > 0
        ? descriptionLines.map(line => {
          // If line has a colon (e.g., "GERD: Expert management..."), split it into title/desc
          const parts = line.split(':');
          return {
            name: parts[0].trim(),
            desc: parts.slice(1).join(':').trim() || ''
          };
        })
        : [{ name: 'Comprehensive Care', desc: spec.description }];

      return {
        title: spec.specialization,
        icon: iconList[index % iconList.length], // Cycle through imported icons
        image: `http://googleusercontent.com/profile/picture/${(index % 3) + 1}`, // Fallback placeholder logic
        items: mappedItems
      };
    });
  }

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

        {/* Header Area */}
        <div className="mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold mb-6">
            SPECIALIZED MEDICAL CARE
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">
            Expertise & <span className="text-teal-600">Specialized Procedures</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Comprehensive care in Gastroenterology & Hepatology by {designation} {doctorName}, utilizing cutting-edge diagnostic and interventional endoscopy techniques.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Mapped Categories */}
          {displayCategories.map((cat, i) => (
            <motion.section
              key={i}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white rounded-3xl border border-slate-100 overflow-hidden flex flex-col hover:border-teal-200 transition-all duration-300 shadow-sm"
            >
              <div className="h-64 w-full relative overflow-hidden bg-slate-200">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent flex items-end p-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-teal-600 p-2 rounded-lg text-white">
                      <cat.icon size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-white leading-tight">{cat.title}</h3>
                  </div>
                </div>
              </div>

              <div className="p-8 flex-1">
                <ul className="space-y-6">
                  {cat.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-4">
                      <CheckCircle2 className="text-teal-600 shrink-0 mt-1" size={20} />
                      <div>
                        <h4 className="font-bold text-slate-900">{item.name}</h4>
                        {item.desc && <p className="text-sm text-slate-500 mt-1">{item.desc}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.section>
          ))}

          {/* Advanced Procedures Highlight Card (Static/Hybrid) */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="group bg-teal-600 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-teal-600/20"
          >
            <div className="h-64 w-full relative overflow-hidden bg-teal-800">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjSFV4CMtyBDZx550UrC8fqCQTyVZ0X73hDEioH_M07F3SALuG9B30IAnkR-SED2W34nvSl-_DQ9i0JBnimDRXsT2cBPSLVOMJFWcmnNPML05qZXzcqLKvdY3xT3vcgWk5XV7LY9piMTKHoWOpzrgPRsUxC50Vj-cs01F6xkICDZHxOuqlUc-_gtSCo3XPueUBgviLY5V7UAWcXCgW7sunoJAuJalovhNO1yujZcT_ui951i3EBT_Pco2QhKOZWe0Db3qeL5hAQhE"
                alt="Advanced Procedures"
                className="w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900 via-teal-900/50 to-transparent flex items-end p-8">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg text-teal-600">
                    <Activity size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Advanced Procedures</h3>
                </div>
              </div>
            </div>

            <div className="p-8 flex-1 bg-teal-600">
              <p className="text-teal-50 mb-8 leading-relaxed font-medium">
                {doctorName} specializes in high-end interventional endoscopic procedures using state-of-the-art technology.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'ERCP', desc: 'Endoscopic Retrograde Cholangiopancreatography' },
                  { name: 'ESD / EMR', desc: 'Submucosal Dissection / Mucosal Resection' },
                  { name: 'EUS', desc: 'Endoscopic Ultrasound' },
                  { name: 'Therapeutic', desc: 'Polypectomy, Stenting, Hemostasis' }
                ].map((proc, k) => (
                  <div key={k} className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                    <span className="text-white font-bold text-lg mb-1 block">{proc.name}</span>
                    <p className="text-[10px] text-teal-50 leading-tight opacity-80 uppercase tracking-tight">{proc.desc}</p>
                  </div>
                ))}
              </div>

              <button className="w-full mt-8 bg-white text-teal-600 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-teal-50 transition-all">
                <BookOpen size={18} /> View Procedure Guide
              </button>
            </div>
          </motion.section>

        </div>
      </div>
    </motion.div>
  );
};

export default Expertise;