import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/sections/Footer';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function SecurityPolicy() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Enterprise AI Security Policy</h1>
          
          <div className="prose prose-invert prose-lg max-w-none text-quantum-silver">
            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Overview</h2>
            <p>Neurogrowth Labs maintains a comprehensive security framework designed to protect AI infrastructure, data systems, and enterprise platforms.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Security Principles</h2>
            <p>Our security strategy is based on:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>confidentiality</li>
              <li>integrity</li>
              <li>availability</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Infrastructure Security</h2>
            <p>Our systems are built on secure cloud infrastructure with:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>network isolation</li>
              <li>firewalls</li>
              <li>intrusion detection systems</li>
              <li>distributed security monitoring</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Access Control</h2>
            <p>Access to systems is restricted through:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>multi-factor authentication</li>
              <li>role-based access control</li>
              <li>identity verification</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Encryption</h2>
            <p>Sensitive data is protected through encryption:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>in transit (TLS)</li>
              <li>at rest</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Monitoring and Threat Detection</h2>
            <p>We continuously monitor infrastructure to detect potential threats.</p>
            <p>Security tools include:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>anomaly detection systems</li>
              <li>automated alerts</li>
              <li>security incident response protocols</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Security Testing</h2>
            <p>Neurogrowth Labs conducts regular:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>vulnerability assessments</li>
              <li>penetration testing</li>
              <li>security audits</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Incident Response</h2>
            <p>If a security incident occurs, we activate a structured response process including:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>investigation</li>
              <li>containment</li>
              <li>remediation</li>
              <li>reporting</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Employee Security Training</h2>
            <p>All staff members receive ongoing training in:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>cybersecurity awareness</li>
              <li>secure data handling</li>
              <li>responsible AI development</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Continuous Improvement</h2>
            <p>Security policies are reviewed regularly to adapt to evolving threats and technological advancements.</p>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
