import React from 'react';
import { motion } from 'framer-motion';
import { Target, Lightbulb, Rocket, ShieldCheck, Activity, Brain } from 'lucide-react';

const stats = [
  { value: "50+", label: "Ecosystem Partners" },
  { value: "12M+", label: "Data Points Processed" },
  { value: "99.9%", label: "System Uptime" }
];

const pillars = [
  { icon: Target, title: "African Innovation", desc: "Engineered specifically for the scale, diversity, and infrastructure of African economies." },
  { icon: Lightbulb, title: "R&D Pioneering", desc: "Pushing boundaries in language models, predictive networks, and quantum-safe algorithms." },
  { icon: ShieldCheck, title: "Enterprise Grade", desc: "Built with zero-trust architecture, high concurrency, and unmatched reliability." }
];

export default function AboutSection() {
  return (
    <section id="about" className="relative py-32 px-6 bg-midnight-black overflow-hidden border-t border-glass-border">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-electric-blue/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-glow/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mb-20"
        >
          <div className="text-electric-blue font-mono text-sm tracking-wider uppercase mb-3 flex items-center gap-2">
            <Rocket className="w-4 h-4" /> An Innovation Powerhouse
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Pioneering Pan-African Digital Transformation
          </h2>
          <p className="text-quantum-silver text-lg leading-relaxed">
            NeuroGrowth Labs operates at the bleeding edge of AI development and infrastructure engineering. 
            From our headquarters in Cape Town, we orchestrate intelligence layers that empower nations, 
            accelerate enterprises, and redefine human potential across the continent and beyond.
          </p>
        </motion.div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Main Mission Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 p-10 rounded-3xl bg-glass-surface border border-glass-border relative overflow-hidden group flex flex-col justify-end min-h-[400px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-glow/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <Brain className="w-12 h-12 text-violet-glow mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-white">Our Mission</h3>
              <p className="text-quantum-silver text-lg leading-relaxed max-w-xl">
                To build the intelligence layer for the modern economy. Through advanced AI systems, 
                enterprise automation, and scalable digital infrastructure, we help organizations 
                unlock unprecedented levels of performance, efficiency, and exponential growth.
              </p>
            </div>

            {/* Glowing orb decorative */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-violet-glow/20 blur-3xl rounded-full" />
          </motion.div>

          {/* Stats Column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="flex-1 p-8 rounded-3xl bg-glass-surface border border-glass-border flex flex-col justify-center items-center text-center hover:border-electric-blue/30 transition-colors">
                <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-ai-cyan to-electric-blue mb-2">{stat.value}</span>
                <span className="text-sm font-medium text-quantum-silver uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Pillars Row */}
          {pillars.map((pillar, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + (idx * 0.1) }}
              className="p-8 rounded-3xl bg-glass-surface border border-glass-border hover:bg-white/5 transition-all group"
            >
              <pillar.icon className="w-8 h-8 text-ai-cyan mb-6 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-bold text-white mb-3">{pillar.title}</h4>
              <p className="text-quantum-silver leading-relaxed text-sm">
                {pillar.desc}
              </p>
            </motion.div>
          ))}
          
        </div>
      </div>
    </section>
  );
}
