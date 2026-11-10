import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/sections/Footer';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function CookiePolicy() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Cookie Policy</h1>
          
          <div className="prose prose-invert prose-lg max-w-none text-quantum-silver">
            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Introduction</h2>
            <p>This Cookie Policy explains how Neurogrowth Labs uses cookies and similar technologies when you visit our website.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">What Are Cookies</h2>
            <p>Cookies are small text files stored on your device that help websites function and improve user experience.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-medium text-white mt-8 mb-4">Essential Cookies</h3>
            <p>Required for core website functionality.</p>
            <p>Examples:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>login authentication</li>
              <li>security verification</li>
            </ul>

            <h3 className="text-xl font-medium text-white mt-8 mb-4">Analytics Cookies</h3>
            <p>Used to understand how visitors interact with the website.</p>
            <p>This helps improve performance and usability.</p>

            <h3 className="text-xl font-medium text-white mt-8 mb-4">Functionality Cookies</h3>
            <p>These remember user preferences such as:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>language</li>
              <li>interface settings</li>
            </ul>

            <h3 className="text-xl font-medium text-white mt-8 mb-4">Security Cookies</h3>
            <p>Help protect the website from malicious activity.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Managing Cookies</h2>
            <p>Users may control cookie settings through their browser preferences.</p>
            <p>Disabling cookies may impact certain website functionality.</p>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
