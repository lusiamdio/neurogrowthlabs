import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/sections/Footer';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function DPA() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Data Processing Agreement (DPA)</h1>
          
          <div className="prose prose-invert prose-lg max-w-none text-quantum-silver">
            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Introduction</h2>
            <p>This Data Processing Agreement ("DPA") governs the processing of personal data by Neurogrowth Labs on behalf of customers using our Services.</p>
            <p>This agreement is designed to comply with international privacy regulations including GDPR.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Roles</h2>
            <p>Customer: Data Controller<br/>
            Neurogrowth Labs: Data Processor</p>
            <p>Neurogrowth Labs processes personal data only according to documented instructions from the customer.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Data Processing Activities</h2>
            <p>Processing may include:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>storage</li>
              <li>transmission</li>
              <li>analysis</li>
              <li>system processing</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Security Measures</h2>
            <p>Neurogrowth Labs implements technical and organizational measures including:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>encryption</li>
              <li>access control</li>
              <li>monitoring systems</li>
              <li>secure cloud infrastructure</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Sub-Processors</h2>
            <p>Neurogrowth Labs may engage trusted sub-processors for infrastructure and operational support.</p>
            <p>All sub-processors are required to maintain equivalent data protection standards.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Data Subject Rights</h2>
            <p>Neurogrowth Labs supports customers in responding to requests from individuals exercising their data rights.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Data Breach Notification</h2>
            <p>In the event of a data breach affecting customer data, Neurogrowth Labs will notify customers without undue delay.</p>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
