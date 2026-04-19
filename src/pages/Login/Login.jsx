import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Sun, Moon, ArrowRight, ShieldCheck, MapPin, Building2 } from "lucide-react";
import useAuth from "../../Hook/useAuth";
import useChamber from "../../Hook/useChamber"; // Ensure this path is correct

// Import your Data IT Rx assets
import medicalHeroImage from "../../assets/Background/MedicalLogin.jpg";
import Logo from "../../assets/Logo/data-it-rx-logo.svg";
import logo_dark from "../../assets/Logo/data-it-rx-dark.svg";
import { AuthContext } from "../../providers/AuthProvider";

const Login = () => {
  // App themes: 'mytheme' (your custom config) or 'dark'
  const [theme, setTheme] = useState("mytheme");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // --- CHAMBER SELECTION STATE ---
  const [showChamberModal, setShowChamberModal] = useState(false);
  const [availableChambers, setAvailableChambers] = useState([]);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const { setChamber } = useContext(AuthContext); // Get setChamber from context
  const { getChambersByBranch } = useChamber(); // Get the hook functions

  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");
    const savedTheme = localStorage.getItem("theme") || "mytheme";

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }

    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleThemeToggle = () => {
    const newTheme = theme === "mytheme" ? "dark" : "mytheme";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    let valid = true;
    if (!validateEmail(email)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }
    if (!valid) return;

    setLoading(true);
    try {
      // 1. Authenticate user
      const loggedInUser = await loginUser(email, password);

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem("email", email);
        localStorage.setItem("password", password);
      } else {
        localStorage.removeItem("email");
        localStorage.removeItem("password");
      }

      // 2. Fetch Chambers
      const chamberRes = await getChambersByBranch(loggedInUser.branch, { limit: 100 });
      const chambers = chamberRes.data;

      // 3. Routing Logic based on Chamber Count
      if (chambers.length === 1) {
        setChamber(chambers[0]);
        localStorage.setItem("authChamber", JSON.stringify(chambers[0]));
        setLoading(false);
        toast.success("Login Successful! Accessing Clinical Dashboard...");
        navigate("/dashboard/");
      } else if (chambers.length > 1) {
        setAvailableChambers(chambers);
        setLoading(false);
        setShowChamberModal(true); // Open the selection modal
      } else {
        setLoading(false);
        toast.success("Login Successful! Accessing Clinical Dashboard...");
        navigate("/dashboard/");
      }

    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Invalid email or password. Please try again.',
        confirmButtonColor: '#1877F2',
        background: theme === 'dark' ? '#1f2937' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000',
      });
    }
  };

  const handleSelectChamber = (selectedChamber) => {
    setChamber(selectedChamber);
    localStorage.setItem("authChamber", JSON.stringify(selectedChamber));
    setShowChamberModal(false);
    toast.success(`Welcome to ${selectedChamber.chamberName}!`);
    navigate("/dashboard/");
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    setShowForgotModal(false);
    Swal.fire({
      icon: 'success',
      title: 'Request Sent',
      text: 'If an account exists, a secure reset link will be sent to your email.',
      confirmButtonColor: '#1877F2',
      background: theme === 'dark' ? '#1f2937' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#000000',
    });
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  return (
    <>
      <Helmet>
        <title>Provider Login | Data IT Rx</title>
      </Helmet>

      {/* Theme switcher */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="fixed top-6 right-8 z-50 font-primary"
      >
        <button
          onClick={handleThemeToggle}
          className="btn btn-outline btn-sm rounded-full shadow-lg bg-base-100/60 backdrop-blur-xl border-base-content/20 hover:bg-base-200 hover:border-base-content/40 transition-all hover:scale-105 flex items-center gap-2"
        >
          {theme === "dark" ? (
            <><Sun size={14} className="text-amber-400" /> <span className="text-xs font-bold tracking-wide">Light Mode</span></>
          ) : (
            <><Moon size={14} className="text-indigo-600" /> <span className="text-xs font-bold tracking-wide">Dark Mode</span></>
          )}
        </button>
      </motion.div>

      {/* Main Full-Screen Container */}
      <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 font-primary overflow-hidden">

        {/* Full Screen Animated Background Image */}
        <motion.div
          initial={{ scale: 1.1, filter: "blur(10px)", opacity: 0 }}
          animate={{ scale: 1, filter: "blur(4px)", opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${medicalHeroImage})` }}
        />

        {/* Dynamic Gradient Overlay */}
        <div className={`absolute inset-0 z-0 transition-colors duration-700 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-blue-900/60' : 'bg-gradient-to-br from-blue-50/70 via-white/40 to-blue-200/50 backdrop-blur-sm'}`}></div>

        {/* Floating Particles or Shapes */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl mix-blend-multiply filter opacity-50 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl mix-blend-multiply filter opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl mix-blend-multiply filter opacity-50 animate-blob animation-delay-4000"></div>
        </div>

        {/* Centered Login Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
          className="card w-full max-w-md bg-base-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-10 border border-white/20 backdrop-blur-xl rounded-3xl"
        >
          <div className="card-body p-8 sm:p-10">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col h-full"
            >
              {/* Logo Area */}
              <motion.div variants={itemVariants} className="flex justify-center mb-6 relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-0 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                <img
                  src={theme === "dark" ? logo_dark : Logo}
                  alt="Data IT Rx Logo"
                  className="w-48 h-auto relative drop-shadow-md transition-transform duration-300 hover:scale-105 select-none"
                  draggable="false"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="mb-8 text-center">
                <h2 className="text-[32px] font-extrabold font-secondary text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mb-2 tracking-tight">
                  Welcome Back
                </h2>
                <div className="flex items-center justify-center gap-2 text-base-content/60">
                  <ShieldCheck size={16} />
                  <p className="text-sm font-medium">Secure Clinical Authentication</p>
                </div>
              </motion.div>

              <form onSubmit={handleLogin} noValidate className="space-y-5">
                {/* Email Input */}
                <motion.div variants={itemVariants} className="form-control w-full relative group">
                  <label className="label py-1" htmlFor="loginEmail">
                    <span className="label-text font-bold text-base-content/80 text-xs uppercase tracking-wider">Work Email</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-base-content/40 group-focus-within:text-blue-500 transition-colors z-10">
                      <Mail size={18} />
                    </div>
                    <input
                      id="loginEmail"
                      type="email"
                      placeholder="provider@clinic.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`input w-full pl-12 pr-4 h-12 bg-base-200/50 backdrop-blur-sm border-base-content/10 focus:bg-base-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all rounded-xl outline-none shadow-sm ${emailError ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                      required
                    />
                  </div>
                  {emailError && (
                    <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-error text-xs mt-1.5 ml-1 font-semibold flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-error"></span> {emailError}
                    </motion.span>
                  )}
                </motion.div>

                {/* Password Input */}
                <motion.div variants={itemVariants} className="form-control w-full relative group">
                  <label className="label py-1" htmlFor="loginPassword">
                    <span className="label-text font-bold text-base-content/80 text-xs uppercase tracking-wider">Password</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-base-content/40 group-focus-within:text-blue-500 transition-colors z-10">
                      <Lock size={18} />
                    </div>
                    <input
                      id="loginPassword"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`input w-full pl-12 pr-4 h-12 bg-base-200/50 backdrop-blur-sm border-base-content/10 focus:bg-base-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all rounded-xl outline-none shadow-sm ${passwordError ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                      required
                    />
                  </div>
                  {passwordError && (
                    <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-error text-xs mt-1.5 ml-1 font-semibold flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-error"></span> {passwordError}
                    </motion.span>
                  )}
                </motion.div>

                {/* Remember Me & Forgot Password */}
                <motion.div variants={itemVariants} className="flex items-center justify-between pt-2 pb-2">
                  <label className="cursor-pointer flex items-center gap-2 group/check hover:opacity-80 transition-opacity">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="peer appearance-none w-5 h-5 border-2 border-base-content/20 rounded-md checked:bg-blue-600 checked:border-blue-600 transition-colors cursor-pointer"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="font-semibold text-base-content/70 text-sm group-hover/check:text-base-content transition-colors">Remember Me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-500 font-bold transition-colors relative after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:w-0 after:h-[2px] after:bg-blue-500 hover:after:w-full after:transition-all after:duration-300"
                  >
                    Forgot Password?
                  </button>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants} className="form-control mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="relative w-full overflow-hidden rounded-xl h-12 flex justify-center items-center group shadow-lg shadow-blue-500/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 transition-transform duration-500 group-hover:scale-[1.05]"></div>
                    <span className="relative text-white font-secondary text-lg font-bold flex items-center justify-center gap-2 z-10">
                      {loading ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral/80 z-[60] flex justify-center items-center p-4 font-primary backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="card bg-base-100 shadow-2xl max-w-sm w-full relative border border-base-content/10 rounded-3xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
              <div className="card-body text-center p-8">
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-base-content/50 hover:text-base-content hover:bg-base-200 transition-colors"
                >
                  ✕
                </button>

                <div className="mb-6 mt-2 relative mx-auto w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-ping opacity-70"></div>
                  <div className="relative bg-blue-100 dark:bg-blue-900/50 rounded-full p-3 text-blue-600 dark:text-blue-400">
                    <ShieldCheck size={32} />
                  </div>
                </div>

                <h3 className="card-title justify-center font-secondary text-2xl mb-2 text-base-content font-extrabold">Reset Password</h3>
                <p className="text-base-content/60 text-sm mb-6 font-medium">
                  Enter your registered email to receive a secure reset link.
                </p>

                <form onSubmit={handlePasswordReset}>
                  <div className="form-control w-full mb-6 relative">
                    <div className="absolute left-4 top-3.5 text-base-content/40 z-10">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      placeholder="provider@clinic.com"
                      className="input w-full pl-12 h-12 bg-base-200/50 border-base-content/10 focus:bg-base-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all rounded-xl outline-none"
                      required
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn border-none w-full font-secondary text-white rounded-xl h-12 shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                  >
                    Send Reset Link
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAMBER SELECTION MODAL */}
      <AnimatePresence>
        {showChamberModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral/80 z-[60] flex justify-center items-center p-4 font-primary backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="card bg-base-100 shadow-2xl max-w-md w-full relative border border-base-content/10 rounded-3xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
              <div className="card-body p-8">

                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                    <Building2 size={24} />
                  </div>
                  <h3 className="card-title font-secondary text-2xl text-base-content font-extrabold">Select Chamber</h3>
                </div>

                <p className="text-base-content/60 text-sm mb-6 font-medium">
                  Please select which location you are operating from today.
                </p>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {availableChambers.map((ch) => (
                    <motion.button
                      whileHover={{ scale: 1.01, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      key={ch._id}
                      onClick={() => handleSelectChamber(ch)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-base-content/10 bg-base-200/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:border-blue-500/30 transition-all text-left group"
                    >
                      <div className="bg-base-100 p-2 rounded-full shadow-sm text-base-content/40 group-hover:text-blue-500 transition-colors">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <span className="block font-bold text-base-content group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{ch.chamberName}</span>
                        <span className="block text-xs text-base-content/50 mt-0.5 line-clamp-1">{ch.address}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Login;