import React from 'react';
import { Link } from 'react-router-dom';

const TodaysAppointments = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen flex flex-col font-sans">
      <header className="bg-[#149B92] sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#149B92]">
              <span className="material-symbols-outlined">stethoscope</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-white leading-tight">Doctor Serial</h1>
              <p className="text-xs text-teal-50">Dr. Quazi Abdullah Al Masum</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/" className="text-white hover:text-teal-100 transition-colors">Home</Link>
            <a href="#" className="text-white hover:text-teal-100 transition-colors">About Doctor</a>
            <Link to="/select-chamber" className="text-white hover:text-teal-100 transition-colors">Get Appointment</Link>
            <a href="#" className="text-teal-200 border-b-2 border-teal-200 pb-1">Today's Serial</a>
            <a href="#" className="text-white hover:text-teal-100 transition-colors">Contact</a>
            <Link to="/select-chamber" className="bg-white text-[#149B92] px-5 py-2.5 rounded-full hover:bg-teal-50 transition-colors font-semibold shadow-sm">Get Serial</Link>
          </nav>
          
          <button className="md:hidden text-white">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#149B92] mb-2">Today's Appointments</h2>
          <p className="text-slate-500 dark:text-slate-400">Thursday, February 26, 2026</p>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">Dr. Quazi Abdullah Al Masum • Cardiology Specialist</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center hover:-translate-y-0.5 transition-transform duration-300">
            <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#149B92]">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <div className="text-2xl font-bold mb-1">0</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Bookings</div>
          </div>
          
          <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-100 dark:border-teal-900/30 shadow-sm text-center hover:-translate-y-0.5 transition-transform duration-300">
            <div className="w-12 h-12 bg-[#149B92] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
              <span className="material-symbols-outlined">hourglass_empty</span>
            </div>
            <div className="text-2xl font-bold mb-1 text-[#149B92]">0</div>
            <div className="text-sm text-[#149B92] font-medium">Currently Serving</div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center hover:-translate-y-0.5 transition-transform duration-300">
            <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#149B92]">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div className="text-2xl font-bold mb-1">0</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Completed</div>
          </div>
        </div>

        <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-[#149B92]">search</span>
            <h3 className="text-lg font-semibold">Search My Booking</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Enter Booking ID (e.g., BK-20260130-001) or Phone Number</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input 
                type="text" 
                placeholder="Booking ID or Phone Number" 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#149B92] focus:border-[#149B92] dark:text-white outline-none transition-all"
              />
            </div>
            <button className="bg-[#149B92] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#0D7A73] transition-colors shadow-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">search</span>
              Search
            </button>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">Serial List</h3>
            </div>
            <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#149B92] transition-colors">
              <span className="material-symbols-outlined text-sm">refresh</span>
              Refresh
            </button>
          </div>
          <div className="py-16 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-slate-300 text-4xl">event_busy</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-2 font-medium">No appointments scheduled for today</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">Auto-refreshes every 30 seconds</p>
          </div>
        </section>
      </main>

      <footer className="bg-[#149B92] text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#149B92]">
                  <span className="material-symbols-outlined text-sm">stethoscope</span>
                </div>
                <h4 className="font-bold text-lg">Doctor Serial</h4>
              </div>
              <p className="text-sm text-teal-50 leading-relaxed">
                Personal professional website for Dr. Quazi Abdullah Al Masum. Providing seamless online appointment booking for patients.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3 text-sm text-teal-50">
                <li><Link to="/" className="hover:text-teal-200 transition-colors">Home</Link></li>
                <li><a href="#" className="hover:text-teal-200 transition-colors">About Doctor</a></li>
                <li><Link to="/select-chamber" className="hover:text-teal-200 transition-colors">Get Appointment</Link></li>
                <li><a href="#" className="hover:text-teal-200 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-teal-200 transition-colors">Admin Panel</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Contact</h4>
              <ul className="space-y-4 text-sm text-teal-50">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-teal-200 text-lg">call</span>
                  <span>01712345678</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-teal-200 text-lg">location_on</span>
                  <span>62/A, Gulshan Avenue, Dhaka-1212</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-teal-800/30 text-center">
            <p className="text-xs text-teal-100/70">
              © 2026 Dr. Quazi Abdullah Al Masum. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TodaysAppointments;