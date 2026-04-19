import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, FileText, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const TermsOfUse = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Helmet>
                <title>Terms of Use | Dr. Quazi Abdullah Al Masum</title>
            </Helmet>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-32 pb-20 min-h-screen bg-slate-50"
            >
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12">
                        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                            <Link to="/" className="hover:text-teal-600">Home</Link>
                            <ChevronRight size={14} />
                            <span className="text-teal-600 font-medium">Terms of Use</span>
                        </nav>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight border-b pb-6 border-slate-200">
                            Terms of Use
                        </h1>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 text-slate-600 space-y-8 leading-relaxed">
                        <div className="flex items-center gap-4 bg-teal-50 p-6 rounded-2xl border border-teal-100">
                            <FileText className="text-teal-600 shrink-0" size={32} />
                            <p className="font-medium text-slate-800">
                                Welcome to our hospital's portal. By continuing to use this website to evaluate or schedule services with Dr. Quazi Abdullah Al Masum, you agree to the conditions listed below.
                            </p>
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">1. Acceptance of Terms</h2>
                            <p>
                                By accessing this portal, you confirm your understanding and agreement to these terms and any future modifications. If you do not agree, please do not use our services or website.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">2. Medical Disclaimer</h2>
                            <div className="flex items-start gap-4 text-orange-700 bg-orange-50 p-6 rounded-2xl border border-orange-100">
                                <ClipboardList className="mt-1" size={24} />
                                <p className="font-medium">
                                    The content provided on this website is intended for informational purposes only and is not a substitute for professional medical consultation, diagnosis, or treatment. Always seek the advice of a qualified physician regarding any medical conditions.
                                </p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">3. Appointment Bookings</h2>
                            <p>
                                Booking an appointment through the system does not guarantee medical treatment until clinically assessed. The provider reserves the right to postpone or cancel appointments based on clinical urgency or unexpected events.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">4. User Obligations</h2>
                            <p>When utilizing our platforms, users must:</p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600">
                                <li>Submit completely accurate and current patient data</li>
                                <li>Not exploit the platform for spam or unauthorized solicitations</li>
                                <li>Respect the privacy and policies corresponding to medical data exchange</li>
                            </ul>
                        </section>

                        <div className="pt-8 border-t border-slate-100 mt-12 text-sm text-slate-400">
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default TermsOfUse;
