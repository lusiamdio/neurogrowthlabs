import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MagneticButton } from '../ui/MagneticButton';
import WorldMap3D from '../three/WorldMap3D';

export default function HeroSection() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);
  const heroOpacity = useTransform(scrollY, [0, 800], [0.6, 0]);

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center pt-20 overflow-hidden">
      {/* 3D Environment */}
      <motion.div 
        style={{ y: heroY, opacity: heroOpacity }}
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
      >
        <WorldMap3D />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 mt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center text-center gap-8 w-full"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-blue/10 border border-electric-blue/20 text-ai-cyan text-sm tracking-wide font-medium backdrop-blur-md">
            <Zap className="w-4 h-4" />
            <span>The Intelligence Layer for the Modern Economy</span>
          </div>

          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter mb-6 leading-[1.05] drop-shadow-2xl text-white">
              Building Africa’s <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ai-cyan via-electric-blue to-violet-glow glow-text">Intelligent Digital Future</span>
            </h1>
            <p className="text-lg md:text-xl text-quantum-silver mb-10 leading-relaxed max-w-2xl mx-auto font-light">
              AI infrastructure, enterprise systems, fintech innovation, and next-generation digital ecosystems engineered for the future.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 shrink-0 w-full relative z-20">
            <MagneticButton 
              onClick={() => {
                navigate('/academy');
                window.scrollTo(0, 0);
              }}
              className="relative group w-full sm:w-auto overflow-hidden rounded-full p-[1px] transform-gpu"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-ai-cyan to-electric-blue rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="relative flex items-center justify-center gap-2 px-8 py-4 bg-midnight-black/90 backdrop-blur-lg rounded-full border border-ai-cyan/40 group-hover:bg-midnight-black transition-all duration-300 shadow-[0_0_25px_rgba(0,229,255,0.25)]">
                <span className="relative z-10 text-white font-semibold tracking-wide">Cybersecurity & AI Academy</span>
                <span className="relative z-10 text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-mono font-bold">5 Free Courses</span>
                <ChevronRight className="relative z-10 w-4 h-4 text-ai-cyan group-hover:text-white transition-colors duration-300" />
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

      {/* Decorative gradient floor */}
      <div className="absolute bottom-0 w-full h-[30vh] bg-gradient-to-t from-midnight-black via-midnight-black/80 to-transparent pointer-events-none z-0" />
    </section>
  );
}
