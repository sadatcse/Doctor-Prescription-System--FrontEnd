import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Helmet>
                <title>Privacy Policy | Dr. Quazi Abdullah Al Masum</title>
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
                            <span className="text-teal-600 font-medium">Privacy Policy</span>
                        </nav>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight border-b pb-6 border-slate-200">
                            Privacy Policy
                        </h1>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 text-slate-600 space-y-8 leading-relaxed">
                        <div className="flex items-center gap-4 bg-teal-50 p-6 rounded-2xl border border-teal-100">
                            <ShieldCheck className="text-teal-600 shrink-0" size={32} />
                            <p className="font-medium text-slate-800">
                                Your privacy is critically important to us. We are committed to protecting your personal information and your right to privacy.
                            </p>
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">1. Information We Collect</h2>
                            <p>
                                We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our services, or otherwise contact us.
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-600">
                                <li><span className="font-semibold text-slate-800">Personal Data:</span> Name, email address, phone number, and physical address.</li>
                                <li><span className="font-semibold text-slate-800">Medical Information:</span> If you book an appointment, details pertaining to your clinical visit configuration.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">2. How We Use Your Information</h2>
                            <p>We use the collected data for various purposes:</p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600">
                                <li>To provide and maintain our medical service portal</li>
                                <li>To notify you about changes to our hospital operations</li>
                                <li>To provide customer care and clinical support</li>
                                <li>To observe and monitor the usage of our clinic service algorithms</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">3. Data Security</h2>
                            <p className="flex items-start gap-4">
                                <Lock className="text-teal-600 mt-1" size={20} />
                                <span>
                                    We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
                                </span>
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">4. Contact Us</h2>
                            <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
                            <div className="flex items-center gap-3 mt-4 text-teal-600 font-medium">
                                <Mail size={20} />
                                <a href="mailto:contact@drmasum.com" className="hover:underline">contact@drmasum.com</a>
                            </div>
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

export default PrivacyPolicy;
