import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/sections/Footer';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-graphite-grey text-white selection:bg-electric-blue/30 selection:text-electric-blue font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-graphite-grey/80 backdrop-blur-md border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-quantum-silver hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Terms of Service</h1>
          
          <div className="prose prose-invert prose-lg max-w-none text-quantum-silver">
            <p className="font-semibold text-white">Neurogrowth Labs</p>
            <p><strong>Effective Date:</strong> 21st January 2026<br/>
            <strong>Last Updated:</strong> 15th March 2026</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">1. Introduction</h2>
            <p>Welcome to Neurogrowth Labs. These Terms of Service ("Terms") govern your access to and use of the Neurogrowth Labs website, products, artificial intelligence systems, research tools, APIs, and services (collectively, the “Services”).</p>
            <p>By accessing or using our Services, you agree to be bound by these Terms.</p>
            <p>If you do not agree with these Terms, you must not use the Services.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">2. Eligibility</h2>
            <p>You must be at least 18 years old to use our Services.</p>
            <p>By using the Services, you represent that:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>you have legal capacity to enter into a binding agreement</li>
              <li>your use complies with all applicable laws and regulations</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">3. User Accounts</h2>
            <p>Certain Services may require the creation of an account.</p>
            <p>Users agree to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>provide accurate and complete information</li>
              <li>maintain the security of their account credentials</li>
              <li>notify us immediately of unauthorized access</li>
            </ul>
            <p>Users are responsible for all activities conducted through their account.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">4. Acceptable Use</h2>
            <p>Users agree not to use the Services to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>violate any law or regulation</li>
              <li>infringe intellectual property rights</li>
              <li>create harmful, deceptive, or abusive content</li>
              <li>interfere with or disrupt the Services</li>
              <li>attempt unauthorized access to systems</li>
              <li>develop malicious software or automated attacks</li>
            </ul>
            <p>Neurogrowth Labs reserves the right to suspend or terminate accounts that violate these rules.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">5. Artificial Intelligence Services</h2>
            <p>Neurogrowth Labs provides AI technologies that may generate automated outputs.</p>
            <p>Users acknowledge that:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>AI outputs may not always be accurate</li>
              <li>outputs should be independently verified</li>
              <li>the Services should not be used for unlawful or harmful purposes</li>
            </ul>
            <p>Users remain responsible for how they use AI-generated content.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">6. Intellectual Property</h2>
            <p>All content and technology associated with the Services are owned by Neurogrowth Labs or its licensors.</p>
            <p>This includes:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>software</li>
              <li>AI models</li>
              <li>algorithms</li>
              <li>designs</li>
              <li>graphics</li>
              <li>trademarks</li>
            </ul>
            <p>Users may not reproduce, distribute, or create derivative works without written permission.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">7. Third-Party Services</h2>
            <p>The Services may integrate or link to third-party platforms.</p>
            <p>Neurogrowth Labs is not responsible for the availability, accuracy, or practices of third-party services.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">8. Disclaimer of Warranties</h2>
            <p>The Services are provided “as is” and “as available.”</p>
            <p>Neurogrowth Labs makes no warranties regarding:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>accuracy of outputs</li>
              <li>uninterrupted service</li>
              <li>error-free functionality</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Neurogrowth Labs shall not be liable for:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>indirect damages</li>
              <li>lost profits</li>
              <li>data loss</li>
              <li>business interruption</li>
            </ul>
            <p>arising from the use of our Services.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">10. Termination</h2>
            <p>Neurogrowth Labs may suspend or terminate access to the Services at any time if users violate these Terms.</p>
            <p>Users may stop using the Services at any time.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">11. Changes to Terms</h2>
            <p>We may update these Terms periodically.</p>
            <p>Continued use of the Services after updates constitutes acceptance of the revised Terms.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">12. Contact</h2>
            <p>For questions regarding these Terms:</p>
            <p className="mt-4">
              Email: legal@neurogrowthlabs.com
            </p>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
