import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, FileCode2, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const CookiePolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Helmet>
                <title>Cookie Policy | Dr. Quazi Abdullah Al Masum</title>
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
                            <span className="text-teal-600 font-medium">Cookie Policy</span>
                        </nav>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight border-b pb-6 border-slate-200">
                            Cookie Policy
                        </h1>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 text-slate-600 space-y-8 leading-relaxed">
                        <div className="flex items-center gap-4 bg-teal-50 p-6 rounded-2xl border border-teal-100">
                            <FileCode2 className="text-teal-600 shrink-0" size={32} />
                            <p className="font-medium text-slate-800">
                                This Cookie Policy explains how our telemedicine portal and hospital tracking utilize cookies to recognize you when you visit our website.
                            </p>
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">1. What are cookies?</h2>
                            <p>
                                Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide reporting information.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">2. Why do we use cookies?</h2>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600 mt-4">
                                <li className="flex items-center gap-3"><CheckCircle className="text-teal-600" size={16} /> Essential Cookies: Required to provide you with basic secure portal access.</li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-teal-600" size={16} /> Analytics Cookies: To track performance analytics anonymously.</li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-teal-600" size={16} /> Preference Cookies: Remembering your display preferences and settings.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">3. Your Choices</h2>
                            <p className="flex items-start gap-4">
                                <Clock className="text-teal-600 mt-1" size={20} />
                                <span>
                                    You have the right to decide whether to accept or reject non-essential cookies. You can exercise your cookie rights by setting your preferences in the cookie consent manager or modifying your browser settings.
                                </span>
                            </p>
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

export default CookiePolicy;
