import Navbar from '../../components/Software/Navbar';
import Footer from '../../components/Software/Footer';
import { motion } from 'framer-motion';

export default function SoftwareTerms() {
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
            <h1 className="text-4xl md:text-5xl font-black text-casual-black tracking-tight mb-4">Terms of Service</h1>
            <p className="text-sporty-blue font-black tracking-widest uppercase text-sm">Last Updated: October 24, 2026</p>
          </div>
          
          <div className="space-y-8 text-casual-black/80 font-medium font-secondary leading-relaxed text-lg">
            <section>
              <h2 className="text-2xl font-black text-casual-black font-primary mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using the Data IT RX platform ("Service"), which includes scheduling, prescription generation, and clinic management modules, you ("User" or "Healthcare Provider") agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access the Service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-casual-black font-primary mb-4">2. Description of Service</h2>
              <p>Data IT RX provides a cloud-based healthcare management operating system. The Service allows medical practitioners to digitize chamber operations, issue barcoded prescriptions, manage appointments, and maintain patient histories.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-casual-black font-primary mb-4">3. HIPAA and Data Privacy Obligations</h2>
              <p>As a healthcare provider, you acknowledge that you are a "Covered Entity" under the Health Insurance Portability and Accountability Act (HIPAA) and applicable sovereign laws. Data IT RX acts as a "Business Associate." Both parties agree to strictly safeguard Protected Health Information (PHI) entered into the system. You are solely responsible for acquiring patient consent before logging PHI into Data IT RX.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-casual-black font-primary mb-4">4. Account Security</h2>
              <p>You are responsible for safeguarding your login credentials and for all activities that occur under your account. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of our platform.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-casual-black font-primary mb-4">5. Service Availability</h2>
              <p>While we strive for 99.9% uptime, we do not guarantee that the Service will be uninterrupted or error-free. Data IT RX features an offline-working capability, but data synchronization requires periodic active internet connectivity. We are not liable for business interruptions caused by local network failures.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-casual-black font-primary mb-4">6. Intellectual Property</h2>
              <p>The Service and its original content, UI modules, algorithms, and functionality remain the exclusive property of Data IT RX and its licensors. The medical data and patient records inputted belong exclusively to you and your patients.</p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
