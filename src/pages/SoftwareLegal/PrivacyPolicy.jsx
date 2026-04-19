import Navbar from '../../components/Software/Navbar';
import Footer from '../../components/Software/Footer';
import { motion } from 'framer-motion';

export default function SoftwarePrivacyPolicy() {
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
            <h1 className="text-4xl md:text-5xl font-black text-casual-black tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-sporty-blue font-black tracking-widest uppercase text-sm">Last Updated: October 24, 2026</p>
          </div>

          <div className="space-y-8 text-casual-black/80 font-medium font-secondary leading-relaxed text-lg">
            <section>
              <h2 className="text-2xl font-black text-casual-black font-primary mb-4">1. Information We Collect</h2>
              <p>When you register for Data IT RX, we collect identifying information including your name, medical license credentials, chamber addresses, and payment data. Through your use of the Service, the system acts as a processor for Protected Health Information (PHI) regarding your patients.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-casual-black font-primary mb-4">2. How We Use and Process Data</h2>
              <p>Your institutional data is used solely to provide, maintain, and improve the Data IT RX platform. Patient PHI is exclusively processed to supply the requested medical architecture (generating prescriptions, appointment SMS, and test tracking). We never sell, rent, or lease your patient data to third parties.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-casual-black font-primary mb-4">3. Data Security and Encryption</h2>
              <p>We deploy bank-grade AES-256 encryption at rest and TLS 1.3 in transit. Our infrastructure complies with healthcare standards to protect against unauthorized access, alteration, or destruction of sensitive clinical data.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-casual-black font-primary mb-4">4. Third-Party Integrations</h2>
              <p>Data IT RX may integrate with verified third-party communication providers (like Twilio or AWS) for sending SMS and Email notifications to patients. These providers operate under stringent confidentiality sub-agreements restricting data usage exclusively for delivery purposes.</p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
