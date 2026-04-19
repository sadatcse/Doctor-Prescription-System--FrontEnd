import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CreditCard, RefreshCw, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const RefundPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Helmet>
                <title>Refund Policy | Dr. Quazi Abdullah Al Masum</title>
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
                            <span className="text-teal-600 font-medium">Refund Policy</span>
                        </nav>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight border-b pb-6 border-slate-200">
                            Refund Policy
                        </h1>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 text-slate-600 space-y-8 leading-relaxed">
                        <div className="flex items-center gap-4 bg-teal-50 p-6 rounded-2xl border border-teal-100">
                            <CreditCard className="text-teal-600 shrink-0" size={32} />
                            <p className="font-medium text-slate-800">
                                Our refund policy ensures clear financial resolution parameters regarding online appointments and clinical processing via this portal.
                            </p>
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">1. Cancellations</h2>
                            <p>
                                Appointments can be canceled for a full refund up to 24 hours prior to the scheduled visit. Consultations canceled within 24 hours of the appointment might be subject to a cancellation fee.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">2. Processing a Refund</h2>
                            <div className="flex items-start gap-4 text-slate-600 bg-slate-100 p-6 rounded-2xl">
                                <RefreshCw className="text-teal-600 mt-1" size={24} />
                                <p>
                                    Approved refunds will be processed via the original payment source. The transfer could typically take between 5-10 business days to reflect in your account, conditional to the individual banking processor guidelines.
                                </p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">3. Non-refundable Circumstances</h2>
                            <ul className="list-disc pl-6 space-y-2 text-slate-600">
                                <li className="flex items-center gap-3"><AlertTriangle className="text-orange-500" size={16} /> Failure to attend without prior notification (No-shows).</li>
                                <li className="flex items-center gap-3"><AlertTriangle className="text-orange-500" size={16} /> After medical consultations are completely processed.</li>
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

export default RefundPolicy;
