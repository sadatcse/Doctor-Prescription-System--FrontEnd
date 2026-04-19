import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Send
} from 'lucide-react';
import useDoctorWebsite from '../../Hook/useDoctorWebsite'; // Adjust import path as needed

const Footer = () => {
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
        console.error("Error fetching doctor profile for footer:", err);
      }
    };

    fetchProfile();
  }, [Branch, getWebsiteByBranch]);

  // --- Dynamic Data Mapping with Fallbacks ---
  const fullName = profileData?.info?.fullName || "Dr. Quazi Abdullah Al Masum";
  const email = profileData?.info?.email || "contact@drmasum.com";
  const mobile = profileData?.appointment?.mobile || "10602";
  const hospitalAddress = profileData?.appointment?.hospitalNameAddress || "Asgar Ali Hospital, Gandaria,\nDhaka-1204, Bangladesh";
  const shortDescription = profileData?.logoBranding?.shortDescription || "Dedicated to providing world-class medical services with over 27 years of clinical excellence.";

  // Social Media Links
  const socialFacebook = profileData?.socialMedia?.facebook || "#";
  const socialTwitter = profileData?.socialMedia?.twitter || "#";
  const socialLinkedin = profileData?.socialMedia?.linkedIn || "#";
  const socialYoutube = profileData?.socialMedia?.youtube || "#";

  return (
    <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 border-t-4 border-teal-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Info & Socials */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-teal-600 p-2 rounded-lg text-white">
                <Stethoscope size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight">{fullName}</span>
            </div>
            <p className="text-sm leading-relaxed">
              {shortDescription}
            </p>
            <div className="flex gap-4">
              <a href={socialFacebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all">
                <Facebook size={18} />
              </a>
              <a href={socialTwitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all">
                <Twitter size={18} />
              </a>
              <a href={socialLinkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all">
                <Linkedin size={18} />
              </a>
              <a href={socialYoutube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links - Made into a 2-column grid to fit everything cleanly */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-8">Quick Links</h4>
            <ul className="grid grid-cols-1 gap-y-4 text-sm">
              {[
                { name: 'Home', path: '/' },
                { name: 'Blog', path: '/blog' },
                { name: 'Contact', path: '/contact' },
                { name: 'Login', path: '/login' }
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="hover:text-teal-600 transition-colors flex items-center gap-2"
                  >
                    <ChevronRight size={14} /> {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-8">Contact Info</h4>
            <ul className="space-y-6 text-sm">
              <li className="flex items-start gap-4">
                <MapPin className="text-teal-600 shrink-0 mt-1" size={20} />
                <span className="whitespace-pre-line">{hospitalAddress}</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="text-teal-600 shrink-0" size={20} />
                <span className="font-bold text-lg text-white">
                  {mobile}
                </span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="text-teal-600 shrink-0" size={20} />
                <span>{email}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-8">Newsletter</h4>
            <p className="text-xs mb-4">Subscribe for the latest health tips and updates.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email"
                className="bg-slate-900 border-none rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-teal-600 text-white"
              />
              <button className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 transition-colors">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar / Policy Links */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 text-xs w-full text-center md:text-left">
          <p>© {new Date().getFullYear()} {fullName}. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link to="/privacy-policy" className="hover:text-teal-600 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-use" className="hover:text-teal-600 transition-colors">Terms of Use</Link>
            <Link to="/cookie-policy" className="hover:text-teal-600 transition-colors">Cookie Policy</Link>
            <Link to="/refund-policy" className="hover:text-teal-600 transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;