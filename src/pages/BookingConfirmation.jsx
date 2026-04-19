import React from 'react';
import { Link } from 'react-router-dom';

const BookingConfirmation = () => {
  return (
    <div className="bg-[#F0FDFA] text-slate-800 antialiased min-h-screen flex flex-col font-jakarta">
      <header className="bg-white border-b border-teal-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <div className="bg-teal-600 rounded-xl p-2 mr-3 shadow-md shadow-teal-500/20">
                <span className="material-symbols-outlined text-white text-2xl">medical_services</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900 block leading-tight">Dr. Quazi Abdullah Al Masum</span>
                <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Medical Professional</span>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-600 hover:text-teal-600 font-semibold transition">Home</Link>
              <Link to="/appointments" className="text-gray-600 hover:text-teal-600 font-semibold transition">Appointments</Link>
              <a href="#" className="text-gray-600 hover:text-teal-600 font-semibold transition">Blog</a>
              <a href="#" className="text-gray-600 hover:text-teal-600 font-semibold transition">Contact</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="bg-teal-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-teal-500/30 hover:bg-teal-700 transition-all">Login</button>
              <div className="h-10 w-10 rounded-full border-2 border-teal-600/20 overflow-hidden bg-slate-200">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCso0OgHrzjSFtaKeN-ctpaXqtosaKO-igS5DUeQhS094X-dT6PtL-bmBFdy_9v4f3_QWqLosdQXfyjVIBNsph5V4IWhBIcV0HJUv25aFWfRk-pl1YzMdctkfDd-s04wqwQm8nsBNfB3j78M94tOOZX2kqSTNZwawHJMs1IbU-Y_c92GecRjCHqSINHeU36WUmsDRCH_9LsQCpTt6NJgVSRoScgE_EqRplRwzT0nYlbRYWfWKWSyoCNCfjCWQvnw-YbTPZopZGQOAw" alt="User Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 text-sm font-medium text-gray-400 mb-10 bg-white px-6 py-2 rounded-full shadow-sm">
          <span>Step 1</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span>Step 2</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span>Step 3</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-teal-600 font-bold">Confirmation</span>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 bg-teal-200 rounded-full opacity-30 blur-2xl animate-pulse"></div>
          <div className="relative bg-teal-50 h-32 w-32 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-xl">
            <div className="bg-teal-600 h-24 w-24 rounded-full flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-5xl">check_circle</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-10 max-w-2xl px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Booking Successfully Completed!</h1>
          <p className="text-gray-600 text-lg">Your appointment with Dr. Masum has been confirmed. A receipt and instructions have been sent to your registered email.</p>
        </div>

        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl shadow-teal-900/5 overflow-hidden mb-10 border border-teal-50">
          <div className="bg-teal-50/50 px-8 py-5 flex items-center justify-between border-b border-teal-100">
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-teal-600 font-bold">receipt_long</span>
              <h2 className="text-xl font-bold text-gray-800">Booking Summary</h2>
            </div>
            <span className="bg-teal-600/10 text-teal-600 text-xs font-bold px-4 py-1.5 rounded-full border border-teal-600/20 uppercase tracking-widest">Appointment Confirmed</span>
          </div>

          <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Professional</p>
              <h3 className="text-xl font-bold text-gray-900">Dr. Quazi Abdullah Al Masum</h3>
              <p className="text-sm text-gray-500 font-medium">Internal Medicine & Cardiology Specialist</p>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Chamber Location</p>
              <div className="flex items-start space-x-2">
                <span className="material-symbols-outlined text-teal-400 text-xl">location_on</span>
                <h3 className="text-lg font-semibold text-gray-900 leading-snug">Asgar Ali Hospital, Dhaka</h3>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Patient Details</p>
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-gray-400">person</span>
                <h3 className="text-xl font-bold text-gray-900">Mr. Karim</h3>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Schedule</p>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center space-x-3 bg-teal-50/50 px-3 py-2 rounded-xl border border-teal-100">
                  <span className="material-symbols-outlined text-teal-600 text-xl">calendar_month</span>
                  <span className="font-bold text-gray-800">12 October, 2024</span>
                </div>
                <div className="flex items-center space-x-3 bg-teal-50/50 px-3 py-2 rounded-xl border border-teal-100">
                  <span className="material-symbols-outlined text-teal-600 text-xl">schedule</span>
                  <span className="font-bold text-gray-800">04:30 PM (BST)</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 pt-8 border-t border-teal-50 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">Queue Serial Number</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-gray-900 tracking-tighter">#12345</span>
                  <span className="text-xs text-gray-400 font-medium">(Please arrive 15 mins early)</span>
                </div>
              </div>
              <div className="bg-green-50 px-5 py-3 rounded-2xl border border-green-100 flex items-center space-x-3">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-bold text-green-700">Payment Fully Completed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-lg">
          <button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-teal-500/20 flex items-center justify-center transition-all transform hover:-translate-y-1 active:translate-y-0">
            <span className="material-symbols-outlined mr-2">picture_as_pdf</span>
            Download Receipt
          </button>
          <Link to="/" className="flex-1 bg-violet-500 hover:bg-violet-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-purple-500/20 flex items-center justify-center transition-all transform hover:-translate-y-1 active:translate-y-0">
            <span className="material-symbols-outlined mr-2">home</span>
            Back to Home
          </Link>
        </div>

        <div className="mt-16 text-center bg-white/50 px-8 py-4 rounded-full border border-teal-100/50">
          <p className="text-gray-500 text-sm font-medium">
            Need assistance? Our support team is available 24/7 at <a href="tel:+8801700000000" className="text-teal-600 font-bold hover:underline">01700-000000</a>
          </p>
        </div>
      </main>

      <footer className="bg-white border-t border-teal-100 pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center mb-6">
                <div className="bg-teal-600 rounded-xl p-2 mr-3">
                  <span className="material-symbols-outlined text-white">medical_services</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Dr. Masum</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                Providing expert medical consultation and personalized healthcare services for a healthier community.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Quick Links</h4>
              <ul className="space-y-3 text-sm font-semibold text-gray-500">
                <li><a href="#" className="hover:text-teal-600 transition-colors">Find Doctor</a></li>
                <li><a href="#" className="hover:text-teal-600 transition-colors">Services</a></li>
                <li><a href="#" className="hover:text-teal-600 transition-colors">Health Blog</a></li>
                <li><a href="#" className="hover:text-teal-600 transition-colors">Patient Portal</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Connect</h4>
              <ul className="space-y-4 text-sm font-semibold text-gray-500">
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-teal-600 text-xl mr-3">location_on</span>
                  <span>Dhaka, Bangladesh</span>
                </li>
                <li className="flex items-center">
                  <span className="material-symbols-outlined text-teal-600 text-xl mr-3">call</span>
                  <span>+880 1234 567890</span>
                </li>
                <li className="flex items-center">
                  <span className="material-symbols-outlined text-teal-600 text-xl mr-3">mail</span>
                  <span>contact@drmasum.com</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Follow Professional Updates</h4>
              <div className="flex space-x-4">
                <a href="#" className="h-11 w-11 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 hover:bg-teal-600 hover:text-white transition-all shadow-sm">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
                </a>
                <a href="#" className="h-11 w-11 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 hover:bg-teal-600 hover:text-white transition-all shadow-sm">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-teal-50 pt-8 flex flex-col md:flex-row justify-between items-center text-sm font-semibold text-gray-400">
            <p>© 2024 Dr. Quazi Abdullah Al Masum. All rights reserved.</p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-teal-600">Terms & Conditions</a>
              <a href="#" className="hover:text-teal-600">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BookingConfirmation;