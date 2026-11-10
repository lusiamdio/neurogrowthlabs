import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/sections/Footer';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function AIEthics() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">AI Ethics & Responsible AI Policy</h1>
          
          <div className="prose prose-invert prose-lg max-w-none text-quantum-silver">
            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Introduction</h2>
            <p>Neurogrowth Labs is committed to developing artificial intelligence technologies responsibly, ethically, and in a way that benefits society.</p>
            <p>Our Responsible AI Policy establishes principles guiding the design, deployment, and governance of AI systems.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Core Ethical Principles</h2>
            
            <h3 className="text-xl font-medium text-white mt-8 mb-4">1. Human-Centered AI</h3>
            <p>AI systems should enhance human capabilities and support societal well-being.</p>
            <p>Humans must remain responsible for critical decisions involving AI.</p>

            <h3 className="text-xl font-medium text-white mt-8 mb-4">2. Transparency</h3>
            <p>We strive to make AI systems understandable and explainable.</p>
            <p>Users should know when they are interacting with AI.</p>

            <h3 className="text-xl font-medium text-white mt-8 mb-4">3. Safety</h3>
            <p>AI technologies must be designed to minimize harm.</p>
            <p>This includes:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>system testing</li>
              <li>risk assessment</li>
              <li>safeguards against misuse</li>
            </ul>

            <h3 className="text-xl font-medium text-white mt-8 mb-4">4. Fairness and Non-Discrimination</h3>
            <p>Neurogrowth Labs actively works to reduce bias in AI systems.</p>
            <p>We evaluate models for fairness across demographics.</p>

            <h3 className="text-xl font-medium text-white mt-8 mb-4">5. Privacy Protection</h3>
            <p>AI systems must respect privacy and comply with global data protection standards.</p>

            <h3 className="text-xl font-medium text-white mt-8 mb-4">6. Accountability</h3>
            <p>Neurogrowth Labs maintains internal governance mechanisms for responsible AI oversight.</p>
            <p>Teams regularly review AI technologies for ethical compliance.</p>

            <h3 className="text-xl font-medium text-white mt-8 mb-4">7. Security</h3>
            <p>AI technologies must be protected against malicious use and system vulnerabilities.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Continuous Oversight</h2>
            <p>We regularly audit and improve AI systems through:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>internal ethics reviews</li>
              <li>technical audits</li>
              <li>stakeholder feedback</li>
            </ul>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
