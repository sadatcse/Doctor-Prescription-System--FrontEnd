import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/#home" },
    { name: "Features", href: "/#features" },
    { name: "Modules", href: "/#modules" },
    { name: "Services", href: "/#services" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Contact", href: "/#contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? "bg-white/80 backdrop-blur-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] py-4"
        : "bg-transparent py-8"
      }`}>
      <div className="container-custom">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src="/data-it-rx-logo.svg" alt="DataITRx Logo" className="h-10 w-auto" referrerPolicy="no-referrer" />
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link, i) => (
              <motion.a
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={link.name}
                href={link.href}
                className="text-sm font-secondary font-bold text-casual-black/60 hover:text-sporty-blue transition-all tracking-widest uppercase"
              >
                {link.name}
              </motion.a>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 ml-4"
            >
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 rounded-xl text-sm font-secondary font-black text-casual-black hover:bg-concrete transition-all border border-casual-black/5"
              >
                Login
              </button>
              <button className="px-6 py-2.5 rounded-xl text-sm font-secondary font-black bg-sporty-blue text-white shadow-lg shadow-sporty-blue/20 hover:bg-psychedelic-violet transition-all">
                Get Started
              </button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-3 bg-concrete rounded-2xl text-casual-black hover:text-sporty-blue transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 w-full bg-white shadow-2xl border-t border-concrete overflow-hidden"
          >
            <div className="px-6 py-10 space-y-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-2xl font-primary font-black text-casual-black hover:text-sporty-blue transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-8 flex flex-col gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-4 text-casual-black font-secondary font-black border border-concrete rounded-2xl hover:bg-concrete transition-colors"
                >
                  Login
                </button>
                <button className="w-full py-4 bg-sporty-blue text-white font-secondary font-black rounded-2xl shadow-lg shadow-sporty-blue/20">
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
