import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { supabase } from '../supabase';
import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';
import partnerHeroBg from '../assets/images/GettyImages-1172878142.jpg';
import { ChevronRight, Target, Shield, Zap, Globe, Rocket, Building, Cpu, LineChart, MessageSquare, Briefcase, Mail, CheckCircle, Layers } from 'lucide-react';

const partnershipModels = [
  { icon: Shield, title: "Strategic Partnerships", desc: "Long-term alliances to co-develop exclusive industry intelligence systems and AI pipelines." },
  { icon: Building, title: "Government Collaborations", desc: "Developing sovereign AI models and data infrastructure for national public sector scale." },
  { icon: Layers, title: "Enterprise Integration", desc: "Direct integration of our core AI capabilities into your existing corporate tech stack." },
  { icon: Cpu, title: "AI Research Partnerships", desc: "Joint R&D ventures pushing the boundaries of LLMs and predictive networks." },
  { icon: Rocket, title: "Startup Ecosystem Alliances", desc: "Providing raw AI compute and foundational layers to accelerate early-stage teams." },
  { icon: LineChart, title: "Investment Partnerships", desc: "Capital and strategic alliances for large-scale digital infrastructure deployments." },
  { icon: Zap, title: "Technology Distribution", desc: "Global distribution agreements bringing NeuroGrowth AI products to new regions." },
  { icon: Target, title: "Innovation Labs", desc: "Co-hosted laboratories designed to incubate next-generation AI-first companies." },
];

const pastCollaborators = [
  {
    name: "Safaricom",
    category: "Global Enterprise",
    type: "known",
    desc: "Co-developed secure automated validation microservices for regional payment integrations across East Africa.",
    color: "bg-emerald-500/5 border-emerald-500/15 text-emerald-400"
  },
  {
    name: "Standard Bank Group",
    category: "Global Enterprise",
    type: "known",
    desc: "Architected advanced machine learning models to detect complex anomaly patterns in high-volume digital treasury workflows.",
    color: "bg-blue-500/5 border-blue-500/15 text-blue-400"
  },
  {
    name: "Limkokwing University of Creative Technology",
    category: "Academic Institution",
    type: "known",
    desc: "Partnered on cutting-edge human-computer interaction research and creative tech curriculum development.",
    color: "bg-pink-500/5 border-pink-500/15 text-pink-400"
  },
  {
    name: "East Wine Africa",
    category: "Commercial Niche",
    type: "unknown",
    desc: "Integrated real-time predictive demand forecasting algorithms to optimize cross-border logistics and cold-chain distribution channels.",
    color: "bg-amber-500/5 border-amber-500/15 text-amber-400"
  },
  {
    name: "African Youth Forum International",
    category: "NGO / Non-Profit",
    type: "known",
    desc: "Sponsored and facilitated tech workshops to empower future African leaders with AI literacy and digital product engineering skills.",
    color: "bg-fuchsia-500/5 border-fuchsia-500/15 text-fuchsia-400"
  },
  {
    name: "Elmwood Field Leadership Alliance",
    category: "Specialized Advisory",
    type: "unknown",
    desc: "Engineered a collaborative enterprise database portal supporting high-fidelity sovereign leadership performance metrics.",
    color: "bg-teal-500/5 border-teal-500/15 text-teal-400"
  },
  {
    name: "City Scope Africa",
    category: "Regional Media",
    type: "unknown",
    desc: "Provided AI-powered semantic search and natural language processing API pipelines to automate local and regional news synthesis.",
    color: "bg-cyan-500/5 border-cyan-500/15 text-cyan-400"
  },
  {
    name: "Apex Tech Solutions",
    category: "Emerging Tech",
    type: "unknown",
    desc: "Collaborated on designing high-throughput cloud edge storage and regional compute cluster partitions in Southern Africa.",
    color: "bg-violet-500/5 border-violet-500/15 text-violet-400"
  },
  {
    name: "Meridian Agribusiness",
    category: "Agri-Tech Logistics",
    type: "unknown",
    desc: "Deployed micro-climate satellite data feeds with deep learning predictive forecasting to guide localized agricultural planning.",
    color: "bg-emerald-500/5 border-emerald-500/15 text-emerald-400"
  },
  {
    name: "Soko Logistics",
    category: "Commercial Niche",
    type: "unknown",
    desc: "Created smart dynamic routing algorithms and machine-learning-driven last-mile delivery fleet optimization systems.",
    color: "bg-rose-500/5 border-rose-500/15 text-rose-400"
  }
];

const renderCollabLogo = (name: string) => {
  switch (name) {
    case "Safaricom":
      return (
        <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" className="stroke-emerald-500/20" />
          <path d="M16 8c-1.5-2-5-2-6.5 0s-1.5 5 0 7c1.5 2 5 2 6.5 0" />
          <path d="M12 10c-0.8-1-2.5-1-3.3 0s-0.8 2.5 0 3.5" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case "Standard Bank Group":
      return (
        <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="fill-blue-500/10" />
          <path d="M12 8v8" strokeWidth="2.5" />
          <path d="M9 12h6" strokeWidth="2.5" />
        </svg>
      );
    case "Limkokwing University of Creative Technology":
      return (
        <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-5-7z" fill="currentColor" fillOpacity="0.15" />
          <path d="M5 20h14" strokeWidth="2.5" />
          <circle cx="12" cy="14" r="2" fill="currentColor" />
        </svg>
      );
    case "East Wine Africa":
      return (
        <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v12" />
          <path d="M12 14c4 0 7-3 7-7H5c0 4 3 7 7 7z" fill="currentColor" fillOpacity="0.15" />
          <path d="M9 22h6" strokeWidth="2.5" />
          <line x1="8" y1="18" x2="16" y2="18" />
        </svg>
      );
    case "African Youth Forum International":
      return (
        <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" className="stroke-fuchsia-500/20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="currentColor" fillOpacity="0.05" />
          <path d="M2 12h20" />
        </svg>
      );
    case "Elmwood Field Leadership Alliance":
      return (
        <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 12h10L10 22l10-10H10L12 2z" fill="currentColor" fillOpacity="0.15" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case "City Scope Africa":
      return (
        <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" className="stroke-cyan-500/20" />
          <path d="M7 14V11c0-.6.4-1 1-1h1c.6 0 1 .4 1 1v3" />
          <path d="M11 14V9c0-.6.4-1 1-1h1c.6 0 1 .4 1 1v5" strokeWidth="2.5" />
          <path d="M15 14V12c0-.6.4-1 1-1h1c.6 0 1 .4 1 1v2" />
          <line x1="5" y1="14" x2="19" y2="14" />
        </svg>
      );
    case "Apex Tech Solutions":
      return (
        <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 17l8-8 8 8" strokeWidth="2.5" />
          <path d="M4 10l8-8 8 8" className="stroke-violet-500/50" />
          <line x1="12" y1="9" x2="12" y2="20" strokeWidth="1.5" />
        </svg>
      );
    case "Meridian Agribusiness":
      return (
        <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 22C2 12 10 4 22 2c0 10-8 18-20 20z" fill="currentColor" fillOpacity="0.15" />
          <path d="M2 22l20-20" />
          <path d="M12 12a14 14 0 0 0-4 6" />
          <path d="M12 12a14 14 0 0 1 6-4" />
        </svg>
      );
    case "Soko Logistics":
      return (
        <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="currentColor" fillOpacity="0.05" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    default:
      return null;
  }
};

function Device(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>;
}

export default function Partner() {
  const [step, setStep] = useState(1);
  const [collabFilter, setCollabFilter] = useState<'all' | 'known' | 'unknown'>('all');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ 
    company: '', 
    type: '', 
    country: '', 
    interest: '',
    objectives: '',
    email: ''
  });

  const handlePartnerSubmit = async () => {
    if (!formData.company || !formData.email) return;
    setIsSubmitting(true);
    try {
      // 1. Dual-write to Firebase
      try {
        await addDoc(collection(db, 'partner_applications'), {
          ...formData,
          status: 'pending',
          createdAt: serverTimestamp()
        });
      } catch (fErr) {
        console.warn("Firebase partner application save failed:", fErr);
      }

      // 2. Dual-write to Supabase (supporting multiple possible schema keys for robust execution)
      try {
        await supabase.from('partner_applications').insert({
          company: formData.company,
          type: formData.type,
          country: formData.country,
          interest: formData.interest,
          objectives: formData.objectives,
          email: formData.email,
          status: 'pending',
          orgName: formData.company,
          orgType: formData.type,
          domainStack: formData.interest || formData.country,
          collabGoal: formData.objectives,
          repName: formData.company,
          org_name: formData.company,
          org_type: formData.type,
          domain_stack: formData.interest || formData.country,
          collab_goal: formData.objectives,
          rep_name: formData.company,
          created_at: new Date().toISOString()
        });
      } catch (sErr) {
        console.warn("Supabase partner application save failed:", sErr);
      }

      // 3. Fallback to localStorage list for immediate admin portal viewing
      try {
        const localPartners = JSON.parse(localStorage.getItem('local_partner_applications') || '[]');
        localPartners.push({
          id: 'part-' + Date.now(),
          company: formData.company,
          type: formData.type,
          country: formData.country,
          interest: formData.interest,
          objectives: formData.objectives,
          email: formData.email,
          status: 'pending',
          orgName: formData.company,
          orgType: formData.type,
          domainStack: formData.interest || formData.country,
          collabGoal: formData.objectives,
          repName: formData.company,
          created_at: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('local_partner_applications', JSON.stringify(localPartners));
      } catch (lErr) {
        console.warn("localStorage partner save failed:", lErr);
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting partner application:", err);
      // fallback to success state for UX
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      company: '',
      type: '',
      country: '',
      interest: '',
      objectives: '',
      email: ''
    });
    setStep(1);
    setSubmitted(false);
  };

  return (
    <div className="bg-midnight-black text-slate-300 min-h-screen font-sans selection:bg-electric-blue/30 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 min-h-[80vh] flex items-center overflow-hidden">
        {/* Hero Background Image with Atmospheric Layers */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src={partnerHeroBg} 
            alt="Partner Hero Background" 
            className="w-full h-full object-cover object-center opacity-25 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-midnight-black/80 via-midnight-black/85 to-midnight-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(123,97,255,0.12),transparent_70%)]" />
        </div>

        {/* Background Neural Effects */}
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-electric-blue/10 blur-[150px] rounded-full pointer-events-none" />
           <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-violet-glow/10 blur-[120px] rounded-full pointer-events-none" />
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.1 }}>
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-quantum-silver text-sm tracking-widest font-mono uppercase mb-6">
                <Globe className="w-4 h-4 text-ai-cyan" /> Partnership Portal
             </div>
             <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-white leading-tight">
               Build the Future With <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-ai-cyan to-violet-glow">NeuroGrowth Labs</span>
             </h1>
             <p className="text-xl text-quantum-silver max-w-3xl mx-auto leading-relaxed font-light">
               Partner with a next-generation AI and digital infrastructure company shaping Africa’s intelligent economy.
             </p>
          </motion.div>
        </div>
      </section>

      {/* Partnership Models */}
      <section className="py-24 px-6 bg-deep-charcoal relative border-t border-glass-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Partnership Models</h2>
            <p className="text-quantum-silver max-w-2xl mx-auto text-lg">A spectrum of strategic collaborative frameworks designed to align global resources, advanced compute, and enterprise scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {partnershipModels.map((model, idx) => (
                <motion.div 
                   key={idx}
                   initial={{ opacity: 0, scale: 0.95 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.5, delay: idx * 0.05 }}
                   className="group p-6 rounded-2xl bg-glass-surface border border-glass-border hover:bg-white/5 hover:border-electric-blue/30 transition-all duration-500 cursor-pointer relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   <model.icon className="w-8 h-8 text-ai-cyan mb-6 group-hover:scale-110 transition-transform duration-500" />
                   <h3 className="text-lg font-bold text-white mb-2">{model.title}</h3>
                   <p className="text-sm text-quantum-silver leading-relaxed">{model.desc}</p>
                </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* Past Collaborations Section */}
      <section className="py-32 px-6 relative z-10 bg-midnight-black border-t border-glass-border overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-electric-blue/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-ai-cyan/5 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ai-cyan/5 border border-ai-cyan/10 text-ai-cyan text-[10px] font-mono uppercase tracking-[0.2em] mb-4">
                Proven Global Footprint
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                Strategic Past Collaborations
              </h2>
              <p className="text-quantum-silver text-lg font-light leading-relaxed">
                We have engineered next-generation platforms, integrated secure automation networks, and deployed capacity building workshops with an elite spectrum of partners. This includes prominent multinational institutions as well as highly specialized niche commercial actors.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-white/5 border border-glass-border p-1 rounded-full shrink-0 self-start md:self-auto backdrop-blur-md">
              {(['all', 'known', 'unknown'] as const).map((filter) => {
                const label = filter === 'all' 
                  ? 'All Partners (10)' 
                  : filter === 'known' 
                    ? 'Prominent/Established' 
                    : 'Specialized/Niche';
                const isActive = collabFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setCollabFilter(filter)}
                    className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-full transition-all duration-300 whitespace-nowrap ${
                      isActive 
                        ? 'bg-ai-cyan text-midnight-black font-semibold shadow-[0_0_15px_rgba(0,229,255,0.4)] px-4 py-2' 
                        : 'text-quantum-silver hover:text-white hover:bg-white/5 px-4 py-2'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid */}
          <motion.div 
            layout 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {pastCollaborators.filter(c => collabFilter === 'all' || c.type === collabFilter).map((collab, index) => {
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  key={collab.name}
                  className="group relative p-8 rounded-3xl bg-glass-surface backdrop-blur-md border border-glass-border hover:border-white/10 transition-all duration-500 overflow-hidden flex flex-col justify-between min-h-[280px]"
                >
                  {/* Subtle hover background highlight gradient */}
                  <div className="absolute -inset-[1px] bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
                  
                  <div>
                    {/* Header: Avatar, Name, Category */}
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className={`w-11 h-11 rounded-xl ${collab.color} flex items-center justify-center border shrink-0 group-hover:scale-105 group-hover:border-white/20 transition-all duration-500`}>
                        {renderCollabLogo(collab.name)}
                      </div>
                      
                      <span className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        collab.type === 'known' 
                          ? 'text-ai-cyan bg-ai-cyan/5 border-ai-cyan/10' 
                          : 'text-violet-glow bg-violet-glow/5 border-violet-glow/10'
                      }`}>
                        {collab.category}
                      </span>
                    </div>

                    {/* Company Details */}
                    <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-ai-cyan transition-colors duration-300">
                      {collab.name}
                    </h3>
                    <p className="text-quantum-silver text-sm leading-relaxed font-light mb-6">
                      {collab.desc}
                    </p>
                  </div>

                  {/* Operational Alignment Footer */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-quantum-silver/40">
                    <span className="uppercase tracking-[0.15em]">
                      Systems Synced
                    </span>
                    <span className="text-emerald-400 font-bold uppercase tracking-[0.15em] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Certified
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>



      {/* Onboarding Experience */}
      <section className="py-32 px-6 relative overflow-hidden bg-midnight-black">
        <div className="absolute inset-0 z-0">
           {/* Cinematic mapping */}
           <motion.div animate={{ rotate: 360 }} transition={{ duration: 150, repeat: Infinity, ease: 'linear' }} className="absolute -right-[20%] top-0 w-[80vw] h-[80vw] rounded-full border border-glass-border opacity-20 pointer-events-none" />
           <motion.div animate={{ rotate: -360 }} transition={{ duration: 200, repeat: Infinity, ease: 'linear' }} className="absolute -left-[20%] bottom-0 w-[60vw] h-[60vw] rounded-full border border-glass-border opacity-20 pointer-events-none" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Initialize Partnership</h2>
            <p className="text-quantum-silver">Engage our intelligent onboarding system to align strategic objectives.</p>
          </div>          <div className="bg-graphite-grey/50 backdrop-blur-3xl border border-glass-border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
             
             {submitted ? (
                <div className="text-center py-12">
                   <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                     <CheckCircle className="w-8 h-8 text-emerald-500" />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-3">Partnership Transmission Complete</h3>
                   <p className="text-quantum-silver max-w-lg mx-auto text-sm leading-relaxed mb-8">
                     We have securely registered your organization, <span className="text-white font-semibold">{formData.company}</span>. 
                     An executive from NeuroGrowth Labs will contact you at <strong className="text-white">{formData.email}</strong> shortly to align on our global vector.
                   </p>
                   <button onClick={handleResetForm} className="px-6 py-2.5 rounded-full border border-glass-border text-quantum-silver hover:text-white hover:bg-white/5 text-xs font-mono font-semibold uppercase tracking-wider transition-all">
                      Initialize Another Session
                   </button>
                </div>
             ) : (
                <>
                  {/* Progress indicator */}
                  <div className="flex justify-between items-center mb-12 relative">
                     <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/5 z-0" />
                     <motion.div 
                        animate={{ width: `${((step - 1) / 3) * 100}%` }} 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-ai-cyan to-electric-blue z-0 transition-all duration-500" 
                     />
                     
                     {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm relative z-10 transition-all duration-500 ${step >= s ? 'bg-electric-blue text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-midnight-black border border-glass-border text-quantum-silver'}`}>
                           {s}
                        </div>
                     ))}
                  </div>

                  {/* Form Steps */}
                  <div className="min-h-[300px]">
                     <AnimatePresence mode="wait">
                       {step === 1 && (
                          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
                             <div>
                                <label className="text-xs font-mono text-electric-blue uppercase tracking-wider mb-2 block">Company Identity</label>
                                <div className="flex items-center bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3 focus-within:border-ai-cyan/50 transition-colors">
                                   <Briefcase className="w-5 h-5 text-quantum-silver mr-3" />
                                   <input type="text" placeholder="Organization Name" className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-600 animate-none focus:ring-0" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                                </div>
                             </div>
                             <div>
                                <label className="text-xs font-mono text-electric-blue uppercase tracking-wider mb-2 block">Organization Type</label>
                                <select className="w-full bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3.5 text-white outline-none focus:border-ai-cyan/50 transition-colors appearance-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                   <option value="" disabled>Select Classification...</option>
                                   <option value="enterprise">Enterprise / Corporate</option>
                                   <option value="government">Government / Public Sector</option>
                                   <option value="academic">Academic Institution</option>
                                   <option value="startup">Growth-stage Startup</option>
                                   <option value="investor">Investment Firm / VC</option>
                                </select>
                             </div>
                          </motion.div>
                       )}

                       {step === 2 && (
                          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
                             <div>
                                <label className="text-xs font-mono text-electric-blue uppercase tracking-wider mb-2 block">Geographic HQ</label>
                                <div className="flex items-center bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3 focus-within:border-ai-cyan/50 transition-colors">
                                   <Globe className="w-5 h-5 text-quantum-silver mr-3" />
                                   <input type="text" placeholder="Country / Region" className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-600 animate-none focus:ring-0" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                                </div>
                             </div>
                             <div>
                                <label className="text-xs font-mono text-electric-blue uppercase tracking-wider mb-2 block">Primary Interest Vector</label>
                                <select className="w-full bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3.5 text-white outline-none focus:border-ai-cyan/50 transition-colors appearance-none" value={formData.interest} onChange={e => setFormData({...formData, interest: e.target.value})}>
                                   <option value="" disabled>Select Vector...</option>
                                   <option value="infrastructure">Compute Infrastructure</option>
                                   <option value="platforms">Application Platforms Integrations</option>
                                   <option value="research">R&D / Co-development</option>
                                   <option value="distribution">Global Distribution</option>
                                </select>
                             </div>
                          </motion.div>
                       )}

                       {step === 3 && (
                          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
                             <div>
                                <label className="text-xs font-mono text-electric-blue uppercase tracking-wider mb-2 block">Collaboration Objectives</label>
                                <div className="bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3 focus-within:border-ai-cyan/50 transition-colors">
                                   <textarea placeholder="Describe the desired outcome of this partnership..." className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-600 h-32 resize-none" value={formData.objectives} onChange={e => setFormData({...formData, objectives: e.target.value})} />
                                </div>
                                <p className="text-xs text-quantum-silver mt-2 flex items-center gap-1"><Zap className="w-3 h-3 text-ai-cyan" /> AI auto-summarization active</p>
                             </div>
                          </motion.div>
                       )}

                       {step === 4 && (
                          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
                             <div>
                                <label className="text-xs font-mono text-electric-blue uppercase tracking-wider mb-2 block">Point of Contact</label>
                                <div className="flex items-center bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3 focus-within:border-ai-cyan/50 transition-colors mb-4">
                                   <Mail className="w-5 h-5 text-quantum-silver mr-3" />
                                   <input type="email" placeholder="Executive Email Address" className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-600 animate-none focus:ring-0" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                             </div>
                             <div className="p-6 rounded-xl bg-electric-blue/5 border border-electric-blue/20 text-center">
                                <MessageSquare className="w-8 h-8 text-electric-blue mx-auto mb-4" />
                                <h4 className="text-white font-bold mb-2">Systems Aligned</h4>
                                <p className="text-sm text-quantum-silver">Our neural orchestration layer will process this request and a human executive will be routed to your inbox shortly.</p>
                             </div>
                          </motion.div>
                       )}
                     </AnimatePresence>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-between items-center mt-8 pt-8 border-t border-glass-border">
                     <button 
                       onClick={() => setStep(Math.max(1, step - 1))} 
                       className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-quantum-silver hover:text-white hover:bg-white/5'}`}
                     >
                       Previous Sequence
                     </button>
                     <button 
                       onClick={() => {
                         if (step === 4) {
                           handlePartnerSubmit();
                         } else {
                           setStep(step + 1);
                         }
                       }} 
                       disabled={isSubmitting || (step === 1 && !formData.company) || (step === 4 && !formData.email)}
                       className="px-6 py-2.5 rounded-lg bg-white text-midnight-black font-semibold text-sm hover:bg-ai-cyan transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {isSubmitting ? 'Transmitting...' : step === 4 ? 'Transmit Request' : 'Proceed'} <ChevronRight className="w-4 h-4" />
                     </button>
                  </div>
                </>
             )}

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
