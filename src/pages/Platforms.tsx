import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';
import ProductsSection from '../components/sections/Products';
import ServicesSection from '../components/sections/Services';
import CTASection from '../components/sections/CTA';
import { MagneticButton } from '../components/ui/MagneticButton';

export default function Platforms() {
  const navigate = useNavigate();

  return (
    <div className="bg-midnight-black text-slate-300 min-h-screen font-sans selection:bg-electric-blue/30 selection:text-white">
      <Navbar />

      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-electric-blue/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-glow/10 blur-[150px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-ai-cyan/25 bg-ai-cyan/5 text-ai-cyan font-mono text-xs uppercase tracking-widest mb-6">
              <Layers className="w-4 h-4" /> Neuro AI Development Ecosystem
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 leading-[1.08]">
              Sovereign AI{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ai-cyan via-electric-blue to-violet-glow">
                Platforms &amp; Systems
              </span>
            </h1>
            <p className="text-lg md:text-2xl text-quantum-silver max-w-3xl mx-auto font-light leading-relaxed mb-10">
              Production operating systems, sector intelligence layers, and automated workflows engineered by Neuro AI Development across Africa and global enterprise markets.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton
                type="button"
                onClick={() => navigate('/partner')}
                className="px-8 py-4 rounded-full bg-white text-midnight-black font-semibold text-sm hover:bg-ai-cyan transition-colors flex items-center gap-2"
              >
                Partner on Deployment <ArrowRight className="w-4 h-4" />
              </MagneticButton>
              <button
                type="button"
                onClick={() => navigate('/academy')}
                className="px-8 py-4 rounded-full bg-glass-surface border border-glass-border text-white font-medium text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-ai-cyan" /> Explore Academy
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <ProductsSection />
      <ServicesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
