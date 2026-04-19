import Navbar from '../../components/Software/Navbar';
import Footer from '../../components/Software/Footer';
import { motion } from 'framer-motion';

export default function SoftwareCookiePolicy() {
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
            <h1 className="text-4xl md:text-5xl font-black text-casual-black tracking-tight mb-4">Cookie Policy</h1>
            <p className="text-sporty-blue font-black tracking-widest uppercase text-sm">Last Updated: October 24, 2026</p>
          </div>
          
          <div className="space-y-8 text-casual-black/80 font-medium font-secondary leading-relaxed text-lg">
            <section>
              <h2 className="text-2xl font-black text-casual-black font-primary mb-4">1. What are Cookies?</h2>
              <p>Cookies are small text files stored on your local device by your web browser. Data IT RX uses them to maintain secure session states, remember your clinical preferences, and understand how you interact with our platform to improve overall performance.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-casual-black font-primary mb-4">2. Essential Operational Cookies</h2>
              <p>Because Data IT RX is a secure medical module, certain cookies are strictly necessary for the application to function. These include cryptographic session tokens that authenticate your login securely and prevent Cross-Site Request Forgery (CSRF) tracking.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-casual-black font-primary mb-4">3. Analytical Tracking</h2>
              <p>We may use internal tracking cookies strictly for the purpose of analyzing system latency and optimizing database queries for faster prescription load times. We do not use third-party marketing trackers inside the secured portal.</p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
