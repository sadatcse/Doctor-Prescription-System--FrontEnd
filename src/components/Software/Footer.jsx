import { Lock, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white pt-32 pb-12 border-t border-concrete font-secondary">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-20 mb-24">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-10">
              <Link to="/">
                <img src="/data-it-rx-logo.svg" alt="DataITRx Logo" className="h-10 w-auto" referrerPolicy="no-referrer" />
              </Link>
            </div>
            <p className="text-casual-black/50 text-xl font-medium max-w-md mb-12 leading-relaxed">
              The most trusted healthcare management platform for modern doctors and clinics. Building the digital infrastructure of tomorrow.
            </p>
            <div className="flex items-center gap-4 p-4 bg-concrete rounded-2xl w-fit">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-sporty-blue shadow-sm">
                <Lock size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-casual-black">HIPAA Compliant</p>
                <p className="text-xs text-casual-black/40 font-bold">Secure Data Encryption</p>
              </div>
            </div>
          </div>

          {[
            {
              title: "Product",
              links: [
                { name: "Features", path: "/#features" }, 
                { name: "Pricing", path: "/#pricing" }, 
                { name: "Mobile App", path: "/#modules" }, 
                { name: "Updates", path: "/#contact" }
              ]
            },
            {
              title: "Company",
              links: [
                { name: "About Us", path: "/#services" }, 
                { name: "Careers", path: "/#contact" }, 
                { name: "Contact", path: "/#contact" }
              ]
            },
            {
              title: "Legal",
              links: [
                { name: "Privacy Policy", path: "/privacy-policy" }, 
                { name: "Terms of Service", path: "/terms-of-service" }, 
                { name: "Cookie Policy", path: "/cookie-policy" }, 
                { name: "Refund Policy", path: "/refund-policy" }
              ]
            }
          ].map((column, i) => (
            <div key={i}>
              <h5 className="font-black text-casual-black text-lg mb-10 font-primary tracking-tight uppercase tracking-widest">{column.title}</h5>
              <ul className="space-y-5 text-lg font-bold text-casual-black/40">
                {column.links.map((link, j) => (
                  <li key={j}>
                    {link.path.startsWith('/#') ? (
                       <a href={link.path} className="hover:text-sporty-blue transition-colors">{link.name}</a>
                    ) : (
                       <Link to={link.path} className="hover:text-sporty-blue transition-colors">{link.name}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-12 border-t border-concrete flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-sm font-bold text-casual-black/30">
            © {new Date().getFullYear()} Data IT RX. All rights reserved. Designed with precision.
          </p>
          <div className="flex items-center gap-10">
            <button className="text-sm font-black text-casual-black/30 hover:text-sporty-blue flex items-center gap-2 transition-colors">
              <Globe size={18} /> English (US)
            </button>
            <div className="flex gap-6">
              <Link to="/privacy-policy" className="text-sm font-black text-casual-black/30 hover:text-sporty-blue transition-colors">Privacy</Link>
              <Link to="/terms-of-service" className="text-sm font-black text-casual-black/30 hover:text-sporty-blue transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
