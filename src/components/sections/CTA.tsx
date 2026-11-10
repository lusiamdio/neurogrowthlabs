import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MagneticButton } from '../ui/MagneticButton';

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-32 px-6 bg-deep-charcoal relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-midnight-black pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="p-12 md:p-20 rounded-3xl bg-glass-surface border border-glass-border relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/10 via-transparent to-violet-glow/10" />
          
          <Sparkles className="w-10 h-10 text-ai-cyan mx-auto mb-8" />
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to Build the Future?
          </h2>
          <p className="text-lg text-quantum-silver mb-10 max-w-2xl mx-auto">
            Join the organizations accelerating their digital transformation with NeuroGrowth Labs. 
            Deploy sovereign AI, intelligent infrastructure, and world-class enterprise systems today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-20">
            <MagneticButton 
              onClick={() => {
                navigate('/platforms');
                window.scrollTo(0, 0);
              }}
              className="relative group w-full sm:w-auto overflow-hidden rounded-full p-[1px] transform-gpu"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-ai-cyan via-violet-glow to-electric-blue opacity-70 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500 rounded-full" />
              <div className="relative flex items-center justify-center gap-2 px-8 py-4 bg-midnight-black/40 backdrop-blur-xl rounded-full border border-white/10 group-hover:bg-midnight-black/60 transition-all duration-300">
                <span className="relative z-10 text-white font-medium tracking-wide">Explore Our Platforms</span>
                <ArrowRight className="relative z-10 w-4 h-4 text-ai-cyan group-hover:translate-x-1 transition-transform duration-300" />
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none rounded-full" />
              </div>
            </MagneticButton>

            <MagneticButton 
              onClick={() => {
                navigate('/partner');
                window.scrollTo(0, 0);
              }}
              className="relative group w-full sm:w-auto overflow-hidden rounded-full p-[1px] transform-gpu"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/5 rounded-full group-hover:opacity-100 opacity-50 transition-opacity duration-300 pointer-events-none" />
              <div className="relative flex items-center justify-center gap-2 px-8 py-4 bg-glass-surface backdrop-blur-lg rounded-full border border-glass-border group-hover:bg-white/10 transition-all duration-300">
                <span className="relative z-10 text-white font-medium tracking-wide">Partner With Us</span>
                <ChevronRight className="relative z-10 w-4 h-4 text-quantum-silver group-hover:text-white transition-colors duration-300" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)_inset]" />
              </div>
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
