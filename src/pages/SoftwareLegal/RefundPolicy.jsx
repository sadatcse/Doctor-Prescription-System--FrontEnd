import Navbar from '../../components/Software/Navbar';
import Footer from '../../components/Software/Footer';
import { motion } from 'framer-motion';

export default function SoftwareRefundPolicy() {
  return (
    <div className="min-h-screen bg-concrete/30 selection:bg-sporty-blue/20 selection:text-sporty-blue font-primary" data-theme="mytheme">
      <Navbar />
      <main className="pt-40 pb-24 container-custom relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-white p-8 md:p-16 rounded-[3rem] shadow-2xl shadow-casual-black/5 border border-casual-black/5"
        >
          <div className="mb-12 border-b border-concrete pb-8">
            <h1 className="text-4xl md:text-5xl font-black text-casual-black tracking-tight mb-4">Refund Policy</h1>
            <p className="text-sporty-blue font-black tracking-widest uppercase text-sm">Last Updated: October 24, 2026</p>
          </div>
          
          <div className="space-y-8 text-casual-black/80 font-medium font-secondary leading-relaxed text-lg">
            <section>
              <h2 className="text-2xl font-black text-casual-black font-primary mb-4">1. Subscription Billing</h2>
              <p>Data IT RX operates on a software-as-a-service (SaaS) monthly or annual recurring billing model. Subscription fees are charged automatically at the beginning of each billing cycle based on the plan you've selected.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-casual-black font-primary mb-4">2. 14-Day Money-Back Guarantee</h2>
              <p>We believe in the power of our medical OS. For any newly registered clinic or doctor, if you are not fully satisfied within the first 14 days of your initial paid subscription, you may request a full refund to your original payment method, no questions asked.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-casual-black font-primary mb-4">3. Monthly Service Cancelations</h2>
              <p>You may cancel your monthly subscription at any time within your portal settings. Cancelation will immediately restrict auto-renewing for the following month. We do not provide prorated refunds for partial months used. Your clinical access will remain active until the end of the current billing cycle.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-casual-black font-primary mb-4">4. Annual Contract Downgrades</h2>
              <p>If you signed an annual Enterprise agreement and wish to terminate the contract early, specific penalities defined in your Enterprise SLA may apply. Standard yearly individual doctor subscriptions are eligible for partial prorated refunds exclusively if requested within the first 30 days of the annual cycle.</p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
