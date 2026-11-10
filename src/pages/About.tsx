import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';
import { MagneticButton } from '../components/ui/MagneticButton';
import LeadershipSection from '../components/sections/LeadershipSection';
import aboutHeroBg from '../assets/images/global_kenya_techstartup.webp';
import { 
  ArrowRight, Globe, Brain, Zap, Cpu, Network, ShieldCheck, Server as LucideServer,
  Lightbulb, Rocket, Activity, Target, Layers, BarChart3, Database, Fingerprint, Linkedin, Twitter,
  Building, GraduationCap, Users, Briefcase
} from 'lucide-react';

const africaNodes = [
  { id: 'morocco', left: '26%', top: '22%', label: 'Rabat' },
  { id: 'egypt', left: '60%', top: '24%', label: 'Cairo' },
  { id: 'senegal', left: '12%', top: '42%', label: 'Dakar' },
  { id: 'nigeria', left: '42%', top: '50%', label: 'Lagos' },
  { id: 'somalia', left: '80%', top: '48%', label: 'Mogadishu' },
  { id: 'kenya', left: '68%', top: '58%', label: 'Nairobi' },
  { id: 'congo', left: '50%', top: '65%', label: 'Kinshasa' },
  { id: 'angola', left: '48%', top: '78%', label: 'Luanda' },
  { id: 'south_africa', left: '55%', top: '92%', label: 'Cape Town' },
  { id: 'madagascar', left: '85%', top: '82%', label: 'Antananarivo' },
];

const africaConnections = [
  ['morocco', 'egypt'],
  ['morocco', 'senegal'],
  ['senegal', 'nigeria'],
  ['egypt', 'nigeria'],
  ['egypt', 'somalia'],
  ['nigeria', 'congo'],
  ['somalia', 'kenya'],
  ['kenya', 'congo'],
  ['congo', 'angola'],
  ['kenya', 'south_africa'],
  ['angola', 'south_africa'],
  ['south_africa', 'madagascar'],
  ['kenya', 'madagascar'],
];

function SystemStatusWidget({ className = 'top-6 right-6' }: { className?: string }) {
  const states = ['Optimized', 'Syncing', 'Operational'];
  const colors = [
    'text-green-400 bg-green-500/10 border-green-500/30', 
    'text-electric-blue bg-electric-blue/10 border-electric-blue/30', 
    'text-ai-cyan bg-ai-cyan/10 border-ai-cyan/30'
  ];
  const dots = [
    'bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.8)]', 
    'bg-electric-blue shadow-[0_0_10px_rgba(37,99,235,0.8)]', 
    'bg-ai-cyan shadow-[0_0_10px_rgba(0,229,255,0.8)]'
  ];
  
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % states.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`absolute z-50 flex items-center gap-2.5 px-4 py-2 rounded-full border backdrop-blur-xl transition-all duration-700 ${colors[index]} ${className}`}>
       <span className={`w-2 h-2 rounded-full transition-all duration-700 ${dots[index]} animate-pulse`} />
       <span className="text-[10px] font-mono uppercase tracking-wider font-bold">{states[index]}</span>
    </div>
  );
}

function AfricaMapEcosystem() {
  return (
    <div className="absolute inset-0 z-10 w-full h-full p-10 flex items-center justify-center">
      <div className="relative w-full max-w-[400px] aspect-[4/5] mx-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 bg-ai-cyan/10 blur-[60px]" />
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          {africaConnections.map(([a, b], idx) => {
            const nodeA = africaNodes.find(n => n.id === a);
            const nodeB = africaNodes.find(n => n.id === b);
            if (!nodeA || !nodeB) return null;
            return (
              <motion.line 
                key={idx}
                x1={nodeA.left} y1={nodeA.top}
                x2={nodeB.left} y2={nodeB.top}
                className="stroke-ai-cyan/30"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: idx * 0.1, ease: 'easeOut' }}
              />
            );
          })}
        </svg>

        {africaNodes.map((node, i) => (
          <motion.div 
            key={node.id} 
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 + 0.5, type: 'spring' }}
            className="absolute w-3 h-3 bg-ai-cyan rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(0,229,255,0.8)] z-20 group" 
            style={{ left: node.left, top: node.top }}
          >
            <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-60" style={{ animationDuration: '2s' }} />
            <div className="absolute top-0 right-0 p-3 pt-4 pl-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="bg-midnight-black/90 border border-ai-cyan/30 px-3 py-1.5 rounded-md backdrop-blur-md shadow-xl whitespace-nowrap">
                 <span className="text-xs font-mono text-white uppercase tracking-wider">{node.label} Node</span>
                 <div className="flex items-center gap-1 mt-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                   <span className="text-[9px] text-quantum-silver font-mono">12ms • Operational</span>
                 </div>
               </div>
            </div>
            <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-quantum-silver/70 uppercase tracking-widest pointer-events-none transition-colors group-hover:text-ai-cyan">
              {node.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="bg-midnight-black text-slate-300 min-h-screen font-sans selection:bg-electric-blue/30 selection:text-white pb-0 overflow-hidden">
      <Navbar />

      {/* Cinematic Hero Section */}
      <section className="relative pt-40 pb-32 px-6 min-h-[90vh] flex items-center justify-center text-center">
        {/* Cinematic Background with Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src={aboutHeroBg} 
            alt="About Hero Background" 
            className="w-full h-full object-cover object-center opacity-30 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-midnight-black/75 via-midnight-black/85 to-midnight-black" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric-blue/10 blur-[150px] rounded-full pointer-events-none" />
          
          {/* Neural Map Abstraction */}
          <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
             <Globe className="w-[1200px] h-[1200px] text-ai-cyan/30 animate-[spin_240s_linear_infinite]" strokeWidth={0.2} />
          </div>
          {/* Grid Layer */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none [mask-image:radial-gradient(ellipse_80%_80%_at_50%_40%,#000_20%,transparent_100%)]" />
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} className="relative z-10 w-full max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ai-cyan/20 bg-ai-cyan/5 text-ai-cyan font-mono text-xs tracking-wider uppercase mb-8 backdrop-blur-md">
             <Brain className="w-4 h-4" /> Global Intelligence Headquarters
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tighter mb-8 text-white leading-[1.05]">
            Engineering Africa’s <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue via-ai-cyan to-violet-glow glow-text">Intelligent Future</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-quantum-silver mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            NeuroGrowth Labs is building next-generation AI infrastructure, intelligent enterprise systems, fintech ecosystems, and digital transformation technologies shaping the future of Africa and beyond.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <MagneticButton onClick={() => { navigate('/platforms'); window.scrollTo(0,0); }} className="relative group w-full sm:w-auto overflow-hidden rounded-full p-[1px] transform-gpu">
              <span className="absolute inset-0 bg-gradient-to-r from-ai-cyan via-violet-glow to-electric-blue opacity-70 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500 rounded-full" />
              <div className="relative flex items-center justify-center gap-2 px-8 py-4 bg-midnight-black/60 backdrop-blur-xl rounded-full border border-white/10 group-hover:bg-midnight-black/80 transition-all duration-300">
                <span className="relative z-10 text-white font-medium tracking-wide">Explore Our Ecosystem</span>
                <ArrowRight className="relative z-10 w-4 h-4 text-ai-cyan group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </MagneticButton>

            <MagneticButton onClick={() => { navigate('/partner'); window.scrollTo(0,0); }} className="relative group w-full sm:w-auto overflow-hidden rounded-full p-[1px] transform-gpu">
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/5 rounded-full group-hover:opacity-100 opacity-50 transition-opacity duration-300 pointer-events-none" />
              <div className="relative flex items-center justify-center gap-2 px-8 py-4 bg-glass-surface backdrop-blur-lg rounded-full border border-glass-border group-hover:bg-white/10 transition-all duration-300">
                <span className="relative z-10 text-white font-medium tracking-wide">Partner With Us</span>
              </div>
            </MagneticButton>
          </div>
        </motion.div>
      </section>

      {/* Who We Are Section */}
      <section className="py-32 px-6 relative z-10 bg-deep-charcoal border-t border-glass-border overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full lg:w-1/2">
               <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                 Building Intelligent Systems for the Next Generation
               </h2>
               <div className="space-y-6 text-lg text-quantum-silver leading-relaxed font-light">
                 <p>
                   NeuroGrowth Labs is a future-focused African technology company developing AI-powered platforms, enterprise systems, fintech infrastructure, automation technologies, and intelligent digital ecosystems designed to accelerate Africa’s digital transformation.
                 </p>
                 <p>
                   We combine artificial intelligence, enterprise engineering, strategic innovation, and deep data intelligence to create scalable digital systems for governments, enterprises, startups, and emerging economies globally.
                 </p>
               </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full lg:w-1/2 relative">
               <div className="aspect-square w-full max-w-md mx-auto relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-ai-cyan/20 to-electric-blue/20 rounded-full blur-[80px] group-hover:opacity-100 opacity-50 transition-opacity duration-700" />
                  
                  {/* African Technological Advance Visual */}
                  <div className="relative w-full h-full rounded-2xl overflow-hidden border border-glass-border shadow-[0_0_50px_rgba(0,229,255,0.15)] group-hover:shadow-[0_0_60px_rgba(0,229,255,0.25)] transition-all duration-700 bg-gradient-to-br from-graphite-grey to-midnight-black flex items-center justify-center p-8 min-h-[300px]">
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.1)_0%,transparent_100%)]" />
                     {/* Floating nodes */}
                     <div className="relative w-full h-full flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                           <div className="w-10 h-10 rounded-lg bg-electric-blue/10 border border-electric-blue/30 flex items-center justify-center animate-[float_4s_ease-in-out_infinite]">
                              <Cpu className="w-5 h-5 text-electric-blue" />
                           </div>
                           <div className="w-24 h-[1px] bg-gradient-to-r from-electric-blue/50 to-ai-cyan/50 flex-grow mx-4" />
                           <div className="w-10 h-10 rounded-lg bg-ai-cyan/10 border border-ai-cyan/30 flex items-center justify-center animate-[float_5s_ease-in-out_infinite_1s]">
                              <Network className="w-5 h-5 text-ai-cyan" />
                           </div>
                        </div>
                        <div className="flex justify-center my-6">
                           <div className="w-16 h-16 rounded-full bg-violet-glow/10 border border-violet-glow/30 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(123,97,255,0.3)]">
                              <Brain className="w-8 h-8 text-violet-glow" />
                           </div>
                        </div>
                        <div className="flex justify-between items-center">
                           <div className="w-10 h-10 rounded-lg bg-violet-glow/10 border border-violet-glow/30 flex items-center justify-center animate-[float_6s_ease-in-out_infinite_2s]">
                              <Database className="w-5 h-5 text-violet-glow" />
                           </div>
                           <div className="w-24 h-[1px] bg-gradient-to-r from-violet-glow/50 to-electric-blue/50 flex-grow mx-4" />
                           <div className="w-10 h-10 rounded-lg bg-electric-blue/10 border border-electric-blue/30 flex items-center justify-center animate-[float_4s_ease-in-out_infinite_3s]">
                              <ShieldCheck className="w-5 h-5 text-electric-blue" />
                           </div>
                        </div>
                     </div>
                     <div className="absolute inset-0 border border-white/10 rounded-2xl z-10 pointer-events-none" />
                  </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
           
           <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group p-10 md:p-14 rounded-[2.5rem] bg-glass-surface backdrop-blur-xl border border-glass-border hover:border-ai-cyan/30 transition-all duration-700 relative overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-ai-cyan/10 blur-[80px] -z-10 group-hover:bg-ai-cyan/20 transition-colors duration-700" />
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500">
                <Target className="w-8 h-8 text-ai-cyan" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6 tracking-tight relative z-10">Our Vision</h3>
              <p className="text-xl text-quantum-silver leading-relaxed font-light relative z-10">
                "To become Africa’s leading intelligent technology ecosystem powering digital transformation, innovation, and next-generation infrastructure globally."
              </p>
           </motion.div>

           <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="group p-10 md:p-14 rounded-[2.5rem] bg-glass-surface backdrop-blur-xl border border-glass-border hover:border-violet-glow/30 transition-all duration-700 relative overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-glow/10 blur-[80px] -z-10 group-hover:bg-violet-glow/20 transition-colors duration-700" />
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500">
                <Rocket className="w-8 h-8 text-violet-glow" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6 tracking-tight relative z-10">Our Mission</h3>
              <p className="text-xl text-quantum-silver leading-relaxed font-light relative z-10">
                "To engineer intelligent digital systems that empower businesses, governments, and communities through AI, automation, enterprise infrastructure, and scalable innovation ecosystems."
              </p>
           </motion.div>

        </div>
      </section>

      {/* Core Innovation Pillars */}
      <section className="py-32 px-6 relative z-10 bg-midnight-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Innovation Architecture</h2>
            <p className="text-xl text-quantum-silver max-w-3xl mx-auto font-light leading-relaxed">
              The foundational pillars powering our enterprise systems, AI ecosystems, and infrastructure layers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[
               { title: "Artificial Intelligence", desc: "AI agents, intelligent systems, machine learning, and enterprise AI orchestration.", icon: Brain, color: "text-blue-400" },
               { title: "Enterprise Infrastructure", desc: "Scalable enterprise software, cloud systems, automation, and operational intelligence.", icon: LucideServer, color: "text-emerald-400" },
               { title: "Fintech Innovation", desc: "Digital payments, financial infrastructure, intelligent transactions, and AI finance.", icon: Zap, color: "text-amber-400" },
               { title: "Smart Governance", desc: "AI-enabled governance systems, digital public infrastructure, and intelligent civic technology.", icon: ShieldCheck, color: "text-fuchsia-400" },
               { title: "Data Intelligence", desc: "Analytics platforms, predictive systems, business intelligence, and strategic data ecosystems.", icon: Database, color: "text-cyan-400" },
               { title: "Digital Transformation", desc: "Technology modernization, workflow automation, ecosystem engineering, and scalable operations.", icon: Layers, color: "text-indigo-400" }
             ].map((pillar, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group p-8 rounded-3xl bg-glass-surface backdrop-blur-md border border-glass-border hover:border-white/20 hover:bg-white/5 transition-all duration-500 overflow-hidden relative cursor-default"
                >
                  <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
                  <pillar.icon className={`w-8 h-8 mb-6 ${pillar.color} group-hover:scale-110 transition-transform duration-500`} />
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{pillar.title}</h3>
                  <p className="text-sm text-quantum-silver leading-relaxed">{pillar.desc}</p>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* Leadership & Culture Section */}
      <section className="py-32 px-6 relative z-10 bg-midnight-black border-t border-glass-border">
         <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.1),transparent_70%)] pointer-events-none" />
         
         <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
               <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Culture & Execution Matrix</h2>
               <p className="text-xl text-quantum-silver max-w-2xl mx-auto font-light">
                 Our internal operating system driving innovation, execution excellence, and future-focused thinking.
               </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
               {[
                 { title: "Innovation", icon: Lightbulb },
                 { title: "Execution", icon: Activity },
                 { title: "Leadership", icon: Target },
                 { title: "Intelligence", icon: Brain },
                 { title: "Collaboration", icon: Network },
                 { title: "Transformation", icon: Hexagon }
               ].map((val, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="group p-6 md:p-8 rounded-2xl bg-midnight-black/50 border border-glass-border hover:border-ai-cyan/30 text-center flex flex-col items-center justify-center transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,229,255,0.1)] relative overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-gradient-to-b from-ai-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                     <val.icon className="w-8 h-8 text-quantum-silver group-hover:text-ai-cyan mb-4 transition-colors duration-500" />
                     <h4 className="text-lg font-bold text-white">{val.title}</h4>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Executive Leadership */}
      <LeadershipSection />

      {/* Global Impact */}
      <section className="py-32 px-6 relative overflow-hidden bg-midnight-black border-t border-glass-border">
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10 relative">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
               <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Powering Africa’s Digital Transformation</h2>
               <p className="text-xl text-quantum-silver leading-relaxed font-light mb-12">
                 We are aggressively scaling our ecosystem reach, deploying AI systems, intelligent infrastructure, and innovation programs across multiple industries and regions.
               </p>

               <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-4xl font-bold text-ai-cyan mb-2 tracking-tight">18+</div>
                    <div className="text-sm font-mono text-quantum-silver uppercase tracking-wider">Industries Impacted</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-electric-blue mb-2 tracking-tight">40M+</div>
                    <div className="text-sm font-mono text-quantum-silver uppercase tracking-wider">API Requests / Day</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-violet-glow mb-2 tracking-tight">250+</div>
                    <div className="text-sm font-mono text-quantum-silver uppercase tracking-wider">Enterprise Partners</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-2 tracking-tight">Tier 1</div>
                    <div className="text-sm font-mono text-quantum-silver uppercase tracking-wider">Infrastructure Level</div>
                  </div>
               </div>
            </motion.div>

            {/* Abstract visual of map/impact */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative h-[400px] md:h-[500px] w-full bg-graphite-grey/40 rounded-3xl border border-glass-border backdrop-blur-sm overflow-hidden flex items-center justify-center">
               <SystemStatusWidget className="top-6 right-6" />
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.1),transparent_70%)]" />
               
               <AfricaMapEcosystem />
            </motion.div>
         </div>
      </section>

      {/* Massive Final CTA */}
      <section className="py-40 px-6 bg-deep-charcoal relative overflow-hidden text-center flex flex-col items-center border-t border-glass-border">
         <div className="absolute inset-0 z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-electric-blue/10 blur-[250px] rounded-full pointer-events-none" />
         </div>

         <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter leading-[1.1]">Join the Future of <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-ai-cyan to-violet-glow glow-text">Intelligent Innovation</span></h2>
            <p className="text-xl md:text-2xl text-quantum-silver mb-14 font-light leading-relaxed max-w-3xl mx-auto">
               NeuroGrowth Labs is building the next generation of AI-powered digital ecosystems transforming Africa and the world.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <MagneticButton onClick={() => { navigate('/partner'); window.scrollTo(0,0); }} className="px-10 py-5 bg-white text-midnight-black font-semibold rounded-full hover:bg-ai-cyan transition-colors flex items-center justify-center gap-2 text-lg">
                  Partner With Us <ArrowRight className="w-5 h-5" />
               </MagneticButton>
               <button onClick={() => { navigate('/platforms'); window.scrollTo(0,0); }} className="px-10 py-5 bg-glass-surface border border-glass-border text-white font-medium rounded-full hover:bg-white/10 transition-colors text-lg">
                  Explore Platforms
               </button>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
}

// Icon helper since lucide-react doesn't have Server and Hexagon directly imported in this file.
function Server(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>; }
function Hexagon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>; }
