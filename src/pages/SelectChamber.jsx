import { useState } from 'react';
import { Link } from 'react-router-dom';

const SelectChamber = () => {
  const [selectedChamber, setSelectedChamber] = useState('asgar');

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-200 font-sans">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500 p-2 rounded-xl text-white shadow-md shadow-teal-500/20">
              <span className="material-symbols-outlined text-2xl block">medical_services</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Dr. Quazi Abdullah Al Masum</h1>
              <p className="text-xs text-teal-500 font-semibold tracking-wider uppercase">Chamber Booking System</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-500 font-medium transition-colors">Home</Link>
            <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-500 font-medium transition-colors">About</a>
            <a href="#" className="text-teal-500 font-bold border-b-2 border-teal-500 pb-1">Book Appointment</a>
            <Link to="/appointments" className="text-slate-600 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-500 font-medium transition-colors">Schedule</Link>
            <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-500 font-medium transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="bg-teal-500 text-white px-6 py-2.5 rounded-full font-bold hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20 hidden sm:block">
              Portal Login
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 max-w-2xl">
        <div className="relative flex justify-between items-center mb-12 max-w-md mx-auto">
          {/* Stepper Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>
          
          <div className="flex flex-col items-center relative z-10 bg-slate-50 dark:bg-slate-900 px-2">
            <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold shadow-lg shadow-teal-500/30">1</div>
            <span className="text-xs mt-2 font-bold text-teal-500">Chamber</span>
          </div>
          <div className="flex flex-col items-center relative z-10 bg-slate-50 dark:bg-slate-900 px-2">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center font-bold">2</div>
            <span className="text-xs mt-2 font-medium text-slate-400">Schedule</span>
          </div>
          <div className="flex flex-col items-center relative z-10 bg-slate-50 dark:bg-slate-900 px-2">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center font-bold">3</div>
            <span className="text-xs mt-2 font-medium text-slate-400">Details</span>
          </div>
          <div className="flex flex-col items-center relative z-10 bg-slate-50 dark:bg-slate-900 px-2">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center font-bold">4</div>
            <span className="text-xs mt-2 font-medium text-slate-400">Confirm</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-teal-50 dark:bg-teal-900/30 p-2 rounded-lg">
              <span className="material-symbols-outlined text-teal-500 text-2xl block">location_on</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Select Chamber</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Choose your preferred consultation location</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Option 1 */}
            <label className="relative block group cursor-pointer">
              <input 
                type="radio" 
                name="chamber" 
                className="peer sr-only" 
                checked={selectedChamber === 'asgar'}
                onChange={() => setSelectedChamber('asgar')}
              />
              <div className="p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 peer-checked:border-teal-500 peer-checked:bg-teal-50/30 dark:peer-checked:bg-teal-900/10 transition-all hover:border-teal-200 dark:hover:border-teal-900/50">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                      <span className="material-symbols-outlined text-teal-500">local_hospital</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-teal-500 transition-colors">Asgar Ali Hospital - Dhaka</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gendaria, Dhaka, Bangladesh</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 text-sm font-bold">
                        <span className="material-symbols-outlined text-xs">payments</span>
                        500 BDT
                      </div>
                    </div>
                  </div>
                  <div className="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-teal-500 peer-checked:border-teal-500 flex items-center justify-center transition-colors">
                    <div className="w-2.5 h-2.5 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                  </div>
                </div>
              </div>
            </label>

            {/* Option 2 */}
            <label className="relative block group cursor-pointer">
              <input 
                type="radio" 
                name="chamber" 
                className="peer sr-only" 
                checked={selectedChamber === 'popular'}
                onChange={() => setSelectedChamber('popular')}
              />
              <div className="p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 peer-checked:border-teal-500 peer-checked:bg-teal-50/30 dark:peer-checked:bg-teal-900/10 transition-all hover:border-teal-200 dark:hover:border-teal-900/50">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-teal-500 transition-colors">medical_information</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-teal-500 transition-colors">Popular Diagnostic Center</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Dhanmondi Branch, Dhaka</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40 group-hover:text-teal-500 transition-colors">
                        <span className="material-symbols-outlined text-xs">payments</span>
                        500 BDT
                      </div>
                    </div>
                  </div>
                  <div className="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-teal-500 peer-checked:border-teal-500 flex items-center justify-center transition-colors">
                    <div className="w-2.5 h-2.5 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                  </div>
                </div>
              </div>
            </label>

            {/* Option 3 */}
            <label className="relative block group cursor-pointer">
              <input 
                type="radio" 
                name="chamber" 
                className="peer sr-only" 
                checked={selectedChamber === 'labaid'}
                onChange={() => setSelectedChamber('labaid')}
              />
              <div className="p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 peer-checked:border-teal-500 peer-checked:bg-teal-50/30 dark:peer-checked:bg-teal-900/10 transition-all hover:border-teal-200 dark:hover:border-teal-900/50">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-teal-500 transition-colors">emergency</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-teal-500 transition-colors">Labaid Specialized Hospital</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Science Lab, Dhaka</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40 group-hover:text-teal-500 transition-colors">
                        <span className="material-symbols-outlined text-xs">payments</span>
                        500 BDT
                      </div>
                    </div>
                  </div>
                  <div className="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-600 peer-checked:bg-teal-500 peer-checked:border-teal-500 flex items-center justify-center transition-colors">
                    <div className="w-2.5 h-2.5 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                  </div>
                </div>
              </div>
            </label>
          </div>

          <div className="mt-10">
            <Link to="/confirmation" className="w-full bg-teal-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-teal-600 transition-all shadow-xl shadow-teal-500/30 flex items-center justify-center gap-2">
              Continue to Schedule
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm bg-slate-100 dark:bg-slate-800/50 py-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <p className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-teal-500 text-lg">help</span>
            Need assistance? Call us at <a href="tel:01712345678" className="text-teal-500 font-bold hover:underline">01712345678</a>
          </p>
        </div>
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pt-16 pb-8 transition-colors duration-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-teal-500 p-1.5 rounded-lg text-white">
                  <span className="material-symbols-outlined text-xl block">medical_services</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dr. Masum Serial</h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                Providing expert cardiological care with a commitment to patient-centric treatment. Book your consultation today at any of our convenient chamber locations.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-teal-500 hover:text-white transition-all">
                  <span className="material-symbols-outlined text-xl">share</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-teal-500 hover:text-white transition-all">
                  <span className="material-symbols-outlined text-xl">public</span>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-[0.2em]">Quick Links</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-teal-500 transition-colors text-sm font-medium">Doctor Profile</a></li>
                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-teal-500 transition-colors text-sm font-medium">Booking Guide</a></li>
                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-teal-500 transition-colors text-sm font-medium">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-teal-500 transition-colors text-sm font-medium">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-[0.2em]">Connect</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-teal-500 text-xl">call</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">01712345678</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-teal-500 text-xl">mail</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">contact@drmasum.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-teal-500 text-xl">location_on</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">62/A, Gulshan Avenue, Dhaka-1212</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 dark:text-slate-500 text-sm">
              © 2024 Dr. Quazi Abdullah Al Masum. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-teal-500 transition-colors text-xs uppercase tracking-widest font-bold">Admin</a>
              <a href="#" className="text-slate-400 hover:text-teal-500 transition-colors text-xs uppercase tracking-widest font-bold">Help</a>
            </div>
          </div>
        </div>
      </footer>
      
      <button 
        className="fixed bottom-6 right-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-3.5 rounded-full shadow-2xl z-50 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
        onClick={() => document.documentElement.classList.toggle('dark')}
      >
        <span className="material-symbols-outlined dark:hidden">dark_mode</span>
        <span className="material-symbols-outlined hidden dark:block">light_mode</span>
      </button>
    </div>
  );
};

export default SelectChamber;