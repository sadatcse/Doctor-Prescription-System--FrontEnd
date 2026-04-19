import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import useDoctorWebsite from '../../Hook/useDoctorWebsite';

const Header = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const Branch = "sadat";
  const { getWebsiteByBranch } = useDoctorWebsite();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getWebsiteByBranch(Branch);
        if (data) {
          setProfileData(data);
        }
      } catch (err) {
        console.error("Error fetching doctor profile for header:", err);
      }
    };

    fetchProfile();
  }, [Branch, getWebsiteByBranch]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Updated website routes based on your list
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/expertise', label: 'Expertise' },
    { path: '/blog', label: 'Blog' },
    { path: '/contact', label: 'Contact' },
  ];

  // --- Dynamic Data Mapping with Fallbacks ---
  const headerName = profileData?.info?.shortName || profileData?.info?.fullName || "Dr. Masum";
  const headerDesignation = profileData?.info?.designation || profileData?.info?.specialization || "Gastroenterologist";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-white py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-teal-600 p-1.5 rounded-lg text-white">
              <Stethoscope size={24} />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-xl tracking-tight text-slate-900 block leading-none mb-1">
                {headerName}
              </span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-teal-600 leading-none">
                {headerDesignation}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-semibold transition-colors hover:text-teal-600 ${location.pathname === item.path ? 'text-teal-600' : 'text-slate-600'
                  }`}
              >
                {item.label}
              </Link>
            ))}

            <Link
              to="/select-chamber"
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-teal-600/20"
            >
              Book Now
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-left text-lg font-semibold py-2 ${location.pathname === item.path ? 'text-teal-600' : 'text-slate-600'
                    }`}
                >
                  {item.label}
                </Link>
              ))}

              <Link
                to="/select-chamber"
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-teal-600 text-white py-4 rounded-xl font-bold mt-2 text-center"
              >
                Book Appointment
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;