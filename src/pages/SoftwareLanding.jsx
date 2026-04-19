import { useState, useEffect } from "react";
import {
  Stethoscope,
  Calendar,
  FileText,
  Users,
  Shield,
  Smartphone,
  CheckCircle2,
  Menu,
  X,
  ArrowRight,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronRight,
  Globe,
  Zap,
  Lock,
  Barcode,
  WifiOff,
  Database,
  Building2,
  Smile,
  Clock,
  ClipboardList,
  CalendarCheck,
  Pill,
  Microscope,
  CreditCard,
  Activity,
  UserCog,
  PenTool,
  BarChart3,
  Brain,
  Package,
  Video,
  Quote,
  Bell,
  Mouse,
  Star,
  PlayCircle,
  LogIn
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DoctorImage from '../assets/landingpage/Doctor.jpeg';
import ClinicImage from '../assets/landingpage/Clinic.jpeg';
import DiagnosticImage from '../assets/landingpage/Diagnostic.jpeg';
import HeroImage from '../assets/landingpage/hero.png';
import Navbar from '../components/Software/Navbar';
import Footer from '../components/Software/Footer';

const Hero = () => {

  const navigate = useNavigate();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <>
      <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden min-h-screen flex flex-col justify-center">
        {/* Immersive Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Animated Mesh Blobs */}
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-sporty-blue/15 rounded-full blur-[140px] animate-mesh"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-psychedelic-violet/15 rounded-full blur-[140px] animate-mesh delay-1000"></div>
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-fascinating-magenta/10 rounded-full blur-[100px] animate-mesh delay-2000"></div>

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>

          {/* Light Rays */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-white via-transparent to-white pointer-events-none"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/40 backdrop-blur-md border border-sporty-blue/20 text-sporty-blue text-xs font-black uppercase tracking-[0.25em] mb-10 shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-sporty-blue animate-ping"></div>
                <span>Next-Gen Healthcare OS</span>
              </motion.div>

              <h1 className="text-5xl lg:text-[4.5rem] font-primary font-black text-casual-black leading-[1.05] mb-8 tracking-tighter text-balance">
                The Ultimate <br />
                <span className="relative inline-block">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-sporty-blue via-psychedelic-violet to-fascinating-magenta">Healthcare Hub</span>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="absolute -bottom-1 left-0 h-3 bg-earls-green/50 rounded-full -z-10"
                  ></motion.div>
                </span>
                <br /> For Modern Doctors.
              </h1>

              <p className="text-lg lg:text-xl text-casual-black/70 mb-10 leading-relaxed max-w-xl font-secondary font-medium">
                Data IT RX empowers modern practitioners with a high-performance, intelligent platform for scheduling, digital prescriptions, and secure patient histories.
              </p>

              <div className="flex flex-wrap gap-6 mb-16">
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <LogIn size={22} className="group-hover:scale-110 transition-transform" />
                    Demo Login
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
                <button
                  onClick={() => setIsVideoOpen(true)}
                  className="btn-secondary group gap-3"
                >
                  <Video size={20} className="text-sporty-blue group-hover:scale-110 transition-transform" />
                  Watch Software Demo
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                <div className="flex items-center gap-4 p-5 glass-card rounded-3xl shadow-2xl shadow-sporty-blue/5 border-white/40">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <img
                        key={i}
                        src={`https://i.pravatar.cc/100?img=${i + 20}`}
                        alt="Doctor"
                        className="w-12 h-12 rounded-full border-4 border-white shadow-md hover:scale-110 transition-transform cursor-pointer"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                  <div className="font-secondary pl-2">
                    <p className="font-black text-casual-black text-lg lg:text-xl leading-none mb-1">1,200+ Practices</p>
                    <p className="text-casual-black/50 text-[10px] font-bold uppercase tracking-widest">Powered by Data IT RX</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-6 py-4 rounded-3xl bg-concrete/50 border border-casual-black/5">
                  <div className="flex gap-1 text-yellow-500">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <span className="text-sm font-black text-casual-black">4.9/5 Rating</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative lg:ml-10"
            >
              {/* Main Mockup Container */}
              <div className="relative z-10 p-5 rounded-[4rem] bg-white/70 backdrop-blur-3xl border-2 border-white/80 shadow-[0_40px_100px_-10px_rgba(20,123,255,0.2)]">
                <div className="rounded-[3rem] overflow-hidden border-4 border-concrete shadow-inner relative group bg-concrete">
                  <img
                    src={HeroImage}
                    alt="DataITRx Dashboard"
                    className="w-full h-auto opacity-90 group-hover:scale-[1.03] group-hover:opacity-100 transition-all duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-sporty-blue/20 via-transparent to-psychedelic-violet/10 pointer-events-none mix-blend-overlay group-hover:opacity-0 transition-opacity"></div>
                </div>
              </div>

              {/* Floating Bento Widgets */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute -top-12 -right-12 z-20 glass-card p-6 rounded-[2.5rem] hidden xl:flex items-center gap-4 animate-float shadow-2xl shadow-sporty-blue/10"
              >
                <div className="w-16 h-16 bg-sporty-blue text-white rounded-2xl flex items-center justify-center shadow-xl shadow-sporty-blue/30">
                  <Calendar size={32} />
                </div>
                <div className="font-secondary">
                  <p className="text-[10px] text-casual-black/40 font-black uppercase tracking-[0.2em] mb-1">Next Patient</p>
                  <p className="text-xl font-black text-casual-black">Sarah Jenkins</p>
                  <p className="text-xs font-bold text-sporty-blue flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sporty-blue animate-pulse"></span>
                    In 5 minutes
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute -bottom-16 -left-16 z-20 glass-card p-6 rounded-[2.5rem] hidden xl:flex items-center gap-4 animate-float-delayed shadow-2xl shadow-earls-green/10"
              >
                <div className="w-16 h-16 bg-earls-green text-casual-black rounded-2xl flex items-center justify-center shadow-xl shadow-earls-green/30">
                  <FileText size={32} />
                </div>
                <div className="font-secondary">
                  <p className="text-[10px] text-casual-black/40 font-black uppercase tracking-[0.2em] mb-1">Prescription</p>
                  <p className="text-xl font-black text-casual-black">Digital Rx Sent</p>
                  <div className="text-xs font-bold text-blue-green flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-green"></div>
                    Success • 10:45 AM
                  </div>
                </div>
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-sporty-blue/5 rounded-full blur-[120px] -z-10"></div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-casual-black/30">Scroll to Explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sporty-blue/40"
          >
            <Mouse size={24} />
          </motion.div>
        </motion.div>
      </section>

      {/* Video Modal Overlay */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-casual-black/80 backdrop-blur-sm p-4 lg:p-10"
            onClick={() => setIsVideoOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="relative w-full max-w-5xl bg-casual-black rounded-[2rem] overflow-hidden shadow-2xl shadow-sporty-blue/20 ring-4 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsVideoOpen(false)}
                className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
              >
                <X size={24} />
              </button>

              {/* Replace the src below with the actual internal video path / Youtube URL */}
              <div className="aspect-video w-full bg-casual-black flex items-center justify-center">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"
                  title="Software Demo Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Barcode size={32} />,
      title: "Barcoded Prescription",
      description: "Secure, verifiable prescriptions with unique barcode tracking for pharmacy verification.",
      color: "bg-sporty-blue",
      size: "md:col-span-2 md:row-span-2"
    },
    {
      icon: <WifiOff size={32} />,
      title: "Offline Working",
      description: "Continue your practice even without internet. Data syncs automatically when you're back online.",
      color: "bg-earls-green",
      size: "md:col-span-2"
    },
    {
      icon: <Calendar size={32} />,
      title: "Smart Scheduling",
      description: "AI-powered appointment management that optimizes your daily workflow and reduces wait times.",
      color: "bg-blue-green",
      size: "md:col-span-1"
    },
    {
      icon: <FileText size={32} />,
      title: "Digital Rx",
      description: "Cloud-based prescriptions with instant patient delivery via SMS or Email.",
      color: "bg-fascinating-magenta",
      size: "md:col-span-1"
    },
    {
      icon: <Database size={32} />,
      title: "Record All Data",
      description: "Comprehensive patient history, investigation reports, and treatment plans in one secure place.",
      color: "bg-psychedelic-violet",
      size: "md:col-span-2"
    },
    {
      icon: <Building2 size={32} />,
      title: "Chamber Information",
      description: "Manage multiple chamber locations, timings, and staff from a single dashboard.",
      color: "bg-sporty-blue",
      size: "md:col-span-1"
    },
    {
      icon: <Smile size={32} />,
      title: "Nice & Easy",
      description: "Intuitive interface designed for speed and simplicity, requiring minimal training.",
      color: "bg-earls-green",
      size: "md:col-span-1"
    },
    {
      icon: <Clock size={32} />,
      title: "Appointment Schedule",
      description: "Real-time booking system with automated reminders to reduce no-shows.",
      color: "bg-blue-green",
      size: "md:col-span-2"
    },
    {
      icon: <Bell size={32} />,
      title: "Auto Alerts & Email Rx",
      description: "Automated email prescriptions and smart alerts for upcoming patient appointments.",
      color: "bg-psychedelic-violet",
      size: "md:col-span-2"
    }
  ];

  return (
    <section id="features" className="section-padding bg-concrete relative overflow-hidden">
      <div className="container-custom">
        <div className="text-center max-w-4xl mx-auto mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sporty-blue font-black text-sm uppercase tracking-[0.3em] mb-4"
          >
            Core Capabilities
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-primary font-black text-casual-black tracking-tight"
          >
            Everything you need to <span className="bg-clip-text text-transparent bg-gradient-to-r from-sporty-blue to-psychedelic-violet">Scale Your Practice</span>.
          </motion.h3>
        </div>

        <div className="bento-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`bento-item group ${feature.size}`}
            >
              <div className={`w-16 h-16 ${feature.color} text-white rounded-[1.5rem] flex items-center justify-center mb-8 shadow-lg transition-transform group-hover:scale-110 duration-500`}>
                {feature.icon}
              </div>
              <h4 className="text-2xl font-black text-casual-black mb-4 font-primary">{feature.title}</h4>
              <p className="text-casual-black/50 text-lg leading-relaxed font-secondary font-medium">{feature.description}</p>

              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-casual-black/[0.02] -z-10"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Modules = () => {
  const modules = [
    { title: "Doctor Prescription Management", icon: <ClipboardList size={24} /> },
    { title: "Appointment Management", icon: <CalendarCheck size={24} /> },
    { title: "Patient Management", icon: <Users size={24} /> },
    { title: "Doctor Chamber Management", icon: <Stethoscope size={24} /> },
    { title: "Medicine Database", icon: <Pill size={24} /> },
    { title: "Investigation / Test Management", icon: <Microscope size={24} /> },
    { title: "Payment & Financial System", icon: <CreditCard size={24} /> },
    { title: "Pre-Checkup System", icon: <Activity size={24} /> },
    { title: "SMS Notification System", icon: <MessageSquare size={24} /> },
    { title: "Software User Management", icon: <UserCog size={24} /> },
    { title: "Blog Management", icon: <PenTool size={24} /> },
    { title: "Reports & Analytics", icon: <BarChart3 size={24} /> },
    { title: "Website / Marketing Features", icon: <Globe size={24} /> },
    { title: "AI Drug Interaction Checker", icon: <Brain size={24} /> },
    { title: "Email Full Prescription", icon: <Mail size={24} /> },
    { title: "Next Appointment Auto Alert", icon: <Bell size={24} /> },
  ];

  return (
    <section id="modules" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sporty-blue font-black text-sm uppercase tracking-[0.3em] mb-4"
          >
            System Modules
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-primary font-black text-casual-black tracking-tight"
          >
            A Complete <span className="gradient-text">Ecosystem</span>.
          </motion.h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="p-6 rounded-2xl bg-concrete border border-casual-black/5 hover:border-sporty-blue/30 hover:shadow-xl hover:shadow-sporty-blue/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-sporty-blue shadow-sm group-hover:bg-sporty-blue group-hover:text-white transition-all duration-300">
                  {module.icon}
                </div>
                <h4 className="text-lg font-black text-casual-black font-primary leading-tight">{module.title}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  const services = [
    {
      title: "Individual Doctors",
      description: "Perfect for private practitioners who want to digitize their chamber operations with a personal touch.",
      image: DoctorImage,
      tag: "Solo Practice"
    },
    {
      title: "Clinics & Hospitals",
      description: "Multi-doctor support with centralized billing and patient record management for large scale operations.",
      image: ClinicImage,
      tag: "Enterprise"
    },
    {
      title: "Diagnostic Centers",
      description: "Manage lab reports, test scheduling, and digital report delivery to patients with high precision.",
      image: DiagnosticImage,
      tag: "Diagnostics"
    }
  ];

  return (
    <section id="services" className="section-padding relative overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-sporty-blue font-black text-sm uppercase tracking-[0.3em] mb-4"
            >
              Our Solutions
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-primary font-black text-casual-black tracking-tight"
            >
              Tailored for every <span className="gradient-text">Provider</span>.
            </motion.h3>
          </div>
          <motion.button
            whileHover={{ x: 5 }}
            className="text-sporty-blue font-black flex items-center gap-3 transition-all font-secondary text-lg"
          >
            Explore All Services <ChevronRight size={24} />
          </motion.button>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative h-[450px] rounded-[3rem] overflow-hidden mb-8 shadow-2xl shadow-casual-black/10">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-casual-black via-casual-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                <div className="absolute bottom-0 left-0 p-10 w-full">
                  <div className="inline-block px-4 py-1 rounded-full bg-sporty-blue text-white text-[10px] font-black uppercase tracking-widest mb-4">
                    {service.tag}
                  </div>
                  <h4 className="text-3xl font-black text-white mb-4 font-primary">{service.title}</h4>
                  <p className="text-white/70 text-lg font-secondary font-medium leading-relaxed mb-6 line-clamp-2">
                    {service.description}
                  </p>
                  <button className="flex items-center gap-3 text-white font-black text-sm uppercase tracking-widest group/btn">
                    Learn More
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:bg-sporty-blue transition-colors">
                      <ArrowRight size={16} />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      name: "Dr. Sarah Rahman",
      chamber: "Care Medical Center, Dhaka",
      message: "DataITRx has completely transformed how I manage my prescriptions. The AI drug interaction checker is a lifesaver, and the interface is incredibly intuitive.",
      photo: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200&h=200"
    },
    {
      name: "Dr. Ahmed Faisal",
      chamber: "City Hospital, Chittagong",
      message: "The appointment management system is seamless. My patients love the SMS notifications, and I love how organized my daily schedule has become.",
      photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"
    },
    {
      name: "Dr. Nusrat Jahan",
      chamber: "Labaid Specialized Hospital",
      message: "As a specialist, I need detailed patient records. DataITRx provides exactly that with its robust reporting and analytics modules. Highly recommended!",
      photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200"
    }
  ];

  return (
    <section id="testimonials" className="section-padding bg-concrete/30">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sporty-blue font-black text-sm uppercase tracking-[0.3em] mb-4"
          >
            Testimonials
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-primary font-black text-casual-black tracking-tight"
          >
            Trusted by <span className="gradient-text">Leading Doctors</span>.
          </motion.h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-casual-black/5 border border-concrete relative group hover:-translate-y-2 transition-all duration-500"
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-sporty-blue text-white rounded-2xl flex items-center justify-center shadow-lg shadow-sporty-blue/30 rotate-12 group-hover:rotate-0 transition-transform">
                <Quote size={24} />
              </div>

              <p className="text-casual-black/70 italic mb-8 leading-relaxed font-medium">
                "{t.message}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-sporty-blue/10">
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-black text-casual-black text-lg leading-tight">{t.name}</h4>
                  <p className="text-sporty-blue font-bold text-sm">{t.chamber}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  const plans = [
    {
      name: "Demo Plan",
      price: "0",
      period: "",
      description: "For Trial Use Only",
      features: ["20 patients/month", "Basic Prescription System", "Limited Features Access", "Trial Use Only"],
      button: "Start Trial",
      popular: false,
      accent: "border-green-500/20",
      iconColor: "text-green-500"
    },
    {
      name: "Monthly Plan",
      price: "1,500",
      period: "/mo",
      description: "Full Clinical Management",
      features: ["Unlimited Patients", "Full Prescription Management", "Patient Records & History", "Basic Reports", "Secure Data Storage"],
      button: "Get Started",
      popular: false,
      accent: "border-sporty-blue/20",
      iconColor: "text-sporty-blue"
    },
    {
      name: "Yearly Plan",
      price: "10,000",
      period: "/yr",
      description: "Advanced Analytics & Support",
      features: ["All Monthly Features", "Email Rx & Auto Alerts", "Advanced Reports & Analytics", "Priority Support", "Data Backup System"],
      button: "Choose Yearly",
      popular: true,
      accent: "border-psychedelic-violet/20",
      iconColor: "text-psychedelic-violet"
    },
    {
      name: "Yearly Pro Plan",
      price: "20,000",
      period: "/yr",
      description: "With Personal Doctor Website",
      features: ["Personal Doctor Website", "Free Custom Domain + Hosting", "Email Rx & Auto Alerts", "Fully Custom Design", "Advanced Prescription System", "Full Analytics Dashboard", "High Security & Backup"],
      button: "Go Pro",
      popular: false,
      accent: "border-yellow-500/20",
      iconColor: "text-yellow-500"
    }
  ];

  return (
    <section id="pricing" className="section-padding bg-casual-black text-white relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sporty-blue/10 rounded-full blur-[150px] -mr-80 -mt-80"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-psychedelic-violet/10 rounded-full blur-[150px] -ml-80 -mb-80"></div>

      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sporty-blue font-black text-sm uppercase tracking-[0.3em] mb-4"
          >
            Investment
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-primary font-black mb-8 tracking-tight"
          >
            Simple, <span className="gradient-text">Transparent</span> Plans.
          </motion.h3>
          <p className="text-concrete/40 text-xl font-secondary font-medium">
            Scale your practice with confidence. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-[2.5rem] border transition-all duration-500 hover:scale-[1.02] flex flex-col ${plan.popular
                  ? "bg-white text-casual-black border-sporty-blue shadow-[0_40px_80px_-15px_rgba(0,102,255,0.3)]"
                  : `bg-white/5 ${plan.accent} text-white backdrop-blur-sm`
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-sporty-blue text-white text-xs font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl">
                  Most Popular
                </div>
              )}
              <h4 className="text-xl font-black mb-4 font-primary">{plan.name}</h4>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black font-primary tracking-tighter">{plan.price}৳</span>
                <span className={`${plan.popular ? "text-casual-black/40" : "text-white/30"} text-sm font-secondary font-bold`}>{plan.period}</span>
              </div>
              <p className={`${plan.popular ? "text-casual-black/60" : "text-white/40"} mb-8 text-sm font-secondary font-medium leading-relaxed`}>
                {plan.description}
              </p>

              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, fIndex) => (
                  <div key={fIndex} className="flex items-start gap-3 text-sm font-secondary font-semibold">
                    <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? "bg-sporty-blue/10 text-sporty-blue" : "bg-white/10 " + plan.iconColor}`}>
                      <CheckCircle2 size={12} strokeWidth={3} />
                    </div>
                    <span className="leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-4 rounded-xl font-black text-base transition-all active:scale-95 font-secondary ${plan.popular
                  ? "bg-sporty-blue text-white shadow-xl shadow-sporty-blue/30 hover:bg-psychedelic-violet"
                  : "bg-white/10 text-white hover:bg-white/20"
                }`}>
                {plan.button}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  return (
    <section id="contact" className="section-padding relative overflow-hidden">
      <div className="container-custom">
        <div className="bg-concrete rounded-[4rem] p-10 lg:p-24 overflow-hidden relative border border-casual-black/5 shadow-2xl shadow-casual-black/5">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sporty-blue/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-psychedelic-violet/5 rounded-full blur-[120px] -ml-48 -mb-48"></div>

          <div className="grid lg:grid-cols-2 gap-24 relative z-10">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-sporty-blue font-black text-sm uppercase tracking-[0.3em] mb-4"
              >
                Connect
              </motion.h2>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-5xl font-primary font-black text-casual-black mb-12 tracking-tight"
              >
                Let's build the <span className="gradient-text">Future</span> together.
              </motion.h3>

              <div className="space-y-10">
                {[
                  { icon: <Mail size={28} />, label: "Email us", value: "support@dataitrx.com" },
                  { icon: <Phone size={28} />, label: "Call us", value: "+880 1234 567890" },
                  { icon: <MapPin size={28} />, label: "Visit us", value: "Gulshan-2, Dhaka, Bangladesh" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-6 group"
                  >
                    <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-sporty-blue shadow-lg group-hover:bg-sporty-blue group-hover:text-white transition-all duration-500">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs text-casual-black/40 font-black uppercase tracking-widest mb-1 font-secondary">{item.label}</p>
                      <p className="text-xl font-black text-casual-black font-primary">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-16 flex items-center gap-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-casual-black hover:text-sporty-blue shadow-lg transition-all"
                  >
                    <Icon size={24} />
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-casual-black/5 border border-casual-black/5"
            >
              <form className="space-y-8">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-casual-black/40 uppercase tracking-widest font-secondary">Full Name</label>
                    <input type="text" placeholder="John Doe" className="w-full px-6 py-4 rounded-2xl bg-concrete border-none focus:ring-4 focus:ring-sporty-blue/10 transition-all font-secondary font-bold text-casual-black placeholder:text-casual-black/20" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-casual-black/40 uppercase tracking-widest font-secondary">Email Address</label>
                    <input type="email" placeholder="john@example.com" className="w-full px-6 py-4 rounded-2xl bg-concrete border-none focus:ring-4 focus:ring-sporty-blue/10 transition-all font-secondary font-bold text-casual-black placeholder:text-casual-black/20" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-casual-black/40 uppercase tracking-widest font-secondary">Subject</label>
                  <input type="text" placeholder="How can we help?" className="w-full px-6 py-4 rounded-2xl bg-concrete border-none focus:ring-4 focus:ring-sporty-blue/10 transition-all font-secondary font-bold text-casual-black placeholder:text-casual-black/20" />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-casual-black/40 uppercase tracking-widest font-secondary">Message</label>
                  <textarea rows={4} placeholder="Your message here..." className="w-full px-6 py-4 rounded-2xl bg-concrete border-none focus:ring-4 focus:ring-sporty-blue/10 transition-all resize-none font-secondary font-bold text-casual-black placeholder:text-casual-black/20"></textarea>
                </div>
                <button className="btn-primary w-full group">
                  Send Message
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function SoftwareLanding() {
  return (
    <div className="min-h-screen selection:bg-sporty-blue/20 selection:text-sporty-blue font-primary" data-theme="mytheme">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Modules />
        <Services />
        <Testimonials />
        <Pricing />
        <Contact />
      </main>
      <Footer />

      {/* Floating Chat Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-sporty-blue text-white rounded-full shadow-2xl shadow-sporty-blue/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group">
        <MessageSquare size={24} />
        <span className="absolute right-full mr-4 bg-casual-black text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-secondary">
          Need help? Chat with us
        </span>
      </button>
    </div>
  );
}

