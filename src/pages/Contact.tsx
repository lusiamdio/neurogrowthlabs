import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { supabase } from '../supabase';
import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';
import { MagneticButton } from '../components/ui/MagneticButton';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageSquare, Building2, FlaskConical, Briefcase, Handshake, 
  MapPin, Mail, Clock, ArrowRight, Sparkles, Send, Bot, Globe,
  Twitter, Linkedin, Youtube, Hexagon
} from 'lucide-react';

const contactCards = [
  {
    icon: MessageSquare,
    title: "General Inquiries",
    desc: "Business inquiries, partnerships, collaborations, and ecosystem questions.",
    cta: "Contact Team",
    color: "from-blue-500/20 to-transparent",
    iconColor: "text-blue-400"
  },
  {
    icon: Building2,
    title: "Enterprise Solutions",
    desc: "AI infrastructure, enterprise software, fintech systems, and large-scale transformation.",
    cta: "Schedule Enterprise Consultation",
    color: "from-electric-blue/20 to-transparent",
    iconColor: "text-electric-blue"
  },
  {
    icon: FlaskConical,
    title: "AI Innovation Lab",
    desc: "Research collaborations, AI systems, intelligent automation, and future technologies.",
    cta: "Collaborate With Our Lab",
    color: "from-violet-glow/20 to-transparent",
    iconColor: "text-violet-glow"
  },
  {
    icon: Briefcase,
    title: "Careers",
    desc: "Join NeuroGrowth Labs and help engineer Africa’s intelligent future.",
    cta: "Explore Careers",
    color: "from-ai-cyan/20 to-transparent",
    iconColor: "text-ai-cyan"
  },
  {
    icon: Handshake,
    title: "Partnerships",
    desc: "Strategic partnerships, ecosystem alliances, investment collaborations.",
    cta: "Become a Partner",
    color: "from-green-500/20 to-transparent",
    iconColor: "text-green-400"
  }
];

export default function Contact() {
  const navigate = useNavigate();
  const location = useLocation();
  const [inquiryType, setInquiryType] = useState(location.state?.inquiryType || '');
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Welcome to NeuroGrowth Labs. I am the AI Communication Assistant. I can help route your inquiry to the appropriate innovation, enterprise, or partnership team." }
  ]);
  const [chatInput, setChatInput] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    organization: '',
    email: '',
    teamScale: '10 - 50 Autonomous Agents',
    goal: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;
    setIsSubmitting(true);
    try {
      // 1. Dual-write to Firebase
      try {
        await addDoc(collection(db, 'contact_submissions'), {
          ...formData,
          inquiryType,
          status: 'unread',
          createdAt: serverTimestamp()
        });
      } catch (fErr) {
        console.warn("Firebase contact submission save failed:", fErr);
      }

      // 2. Dual-write to Supabase (supporting multiple key structures for database schema compatibility)
      try {
        await supabase.from('contact_submissions').insert({
          fullName: formData.fullName,
          fullName_custom: formData.fullName,
          organization: formData.organization,
          email: formData.email,
          teamScale: formData.teamScale,
          goal: formData.goal,
          message: formData.message,
          inquiryType: inquiryType,
          status: 'unread',
          full_name: formData.fullName,
          team_scale: formData.teamScale,
          inquiry_type: inquiryType,
          created_at: new Date().toISOString()
        });
      } catch (sErr) {
        console.warn("Supabase contact submission save failed:", sErr);
      }

      // 3. Fallback to localStorage list for immediate admin portal viewing
      try {
        const localContacts = JSON.parse(localStorage.getItem('local_contact_submissions') || '[]');
        localContacts.push({
          id: 'cont-' + Date.now(),
          fullName: formData.fullName,
          organization: formData.organization,
          email: formData.email,
          teamScale: formData.teamScale,
          goal: formData.goal,
          message: formData.message,
          inquiryType: inquiryType,
          status: 'unread',
          created_at: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('local_contact_submissions', JSON.stringify(localContacts));
      } catch (lErr) {
        console.warn("localStorage contact save failed:", lErr);
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Error saving contact transmission:", err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetContact = () => {
    setFormData({
      fullName: '',
      organization: '',
      email: '',
      teamScale: '10 - 50 Autonomous Agents',
      goal: '',
      message: ''
    });
    setInquiryType('');
    setSubmitted(false);
  };

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const element = document.getElementById(location.hash.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.hash]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setChatMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    setChatInput('');
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: "Analyzing intent... I have routed your request to our priority queue. A specialist will engage with you shortly." 
      }]);
    }, 1500);
  };

  return (
    <div className="bg-midnight-black text-slate-300 min-h-screen font-sans selection:bg-electric-blue/30 selection:text-white pb-0">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background neural visuals */}
        <div className="absolute inset-0 z-0">
           <div className="absolute top-1/4 right-[10%] w-[600px] h-[600px] bg-electric-blue/10 blur-[150px] rounded-full pointer-events-none" />
           <div className="absolute bottom-0 left-[10%] w-[500px] h-[500px] bg-violet-glow/10 blur-[150px] rounded-full pointer-events-none" />
           {/* Grid */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]" />
        </div>

        {/* Floating Holographic Elements */}
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute right-[15%] top-[30%] opacity-30 pointer-events-none">
          <Globe className="w-64 h-64 text-ai-cyan" strokeWidth={0.5} />
        </motion.div>

        <div className="relative z-10 w-full max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-ai-cyan/20 bg-ai-cyan/5 text-ai-cyan font-mono text-xs tracking-wider uppercase mb-8 backdrop-blur-md">
               <Sparkles className="w-4 h-4" /> Global Communication Gateway
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter mb-8 text-white leading-[1.1]">
              Connect With the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ai-cyan via-electric-blue to-violet-glow glow-text">Future</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-quantum-silver mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              Partner with NeuroGrowth Labs to build intelligent systems, AI-powered platforms, enterprise infrastructure, and next-generation digital ecosystems.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <MagneticButton onClick={() => document.getElementById('ai-form')?.scrollIntoView({ behavior: 'smooth' })} className="relative group w-full sm:w-auto overflow-hidden rounded-full p-[1px] transform-gpu">
                <span className="absolute inset-0 bg-gradient-to-r from-ai-cyan via-violet-glow to-electric-blue opacity-70 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500 rounded-full" />
                <div className="relative flex items-center justify-center gap-2 px-8 py-4 bg-midnight-black/60 backdrop-blur-xl rounded-full border border-white/10 group-hover:bg-midnight-black/80 transition-all duration-300">
                  <span className="relative z-10 text-white font-medium tracking-wide">Schedule Consultation</span>
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
        </div>
      </section>

      {/* Contact Options Cards */}
      <section id="contact-options" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contactCards.map((card, idx) => (
              <motion.div 
                 key={idx}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: idx * 0.1 }}
                 onClick={() => {
                    if(card.title === 'Careers') { navigate('/careers'); window.scrollTo(0, 0); return; }
                    if(card.title === 'Partnerships') { navigate('/partner'); window.scrollTo(0, 0); return; }
                    document.getElementById('ai-form')?.scrollIntoView({ behavior: 'smooth' });
                    setInquiryType(card.title);
                 }}
                 className="group relative p-8 rounded-3xl bg-glass-surface border border-glass-border hover:border-white/20 transition-all duration-500 overflow-hidden cursor-pointer flex flex-col justify-between min-h-[280px]"
              >
                <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${card.color} opacity-0 group-hover:opacity-100 blur-[50px] transition-opacity duration-700 pointer-events-none`} />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-midnight-black/50 border border-white/5 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{card.title}</h3>
                  <p className="text-quantum-silver text-sm leading-relaxed">{card.desc}</p>
                </div>

                <div className="relative z-10 mt-8 flex items-center gap-2 text-sm font-medium text-quantum-silver group-hover:text-white transition-colors">
                  {card.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-hover:text-ai-cyan transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Powered Contact Form & Chat Section */}
      <section id="ai-form" className="py-24 px-6 relative border-t border-glass-border bg-deep-charcoal">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">
           
           {/* Left: AI Form */}
           <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full lg:w-3/5">
              <div className="mb-10">
                 <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Initialize Connection</h2>
                 <p className="text-quantum-silver text-lg">Our AI routing system will analyze your parameters and connect you with the precise innovation node.</p>
              </div>

              {submitted ? (
                  <div className="p-8 rounded-3xl bg-white/5 border border-glass-border text-center py-12 w-full">
                     <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-8 h-8 text-emerald-500" />
                     </div>
                     <h3 className="text-2xl font-bold text-white mb-3">Transmission Successfully Routed</h3>
                     <p className="text-quantum-silver text-sm leading-relaxed max-w-md mx-auto mb-8">
                        Thank you, <strong className="text-white">{formData.fullName}</strong>. Your parameters for <strong className="text-white">{inquiryType || 'General Inquiries'}</strong> have been securely ingested by our neural routing layer. An associate will establish contact at <strong className="text-white">{formData.email}</strong> shortly.
                     </p>
                     <button type="button" onClick={handleResetContact} className="px-6 py-2.5 rounded-full border border-glass-border text-quantum-silver hover:text-white hover:bg-white/5 text-xs font-mono font-semibold uppercase tracking-wider transition-all">
                        Initialize New Transmission
                     </button>
                  </div>
               ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-6 w-full">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                           <label className="text-xs font-mono text-quantum-silver uppercase tracking-wider mb-2 block group-focus-within:text-ai-cyan transition-colors">Full Name</label>
                           <input type="text" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3.5 text-white outline-none focus:border-ai-cyan/50 transition-colors animate-none" />
                        </div>
                        <div className="group">
                           <label className="text-xs font-mono text-quantum-silver uppercase tracking-wider mb-2 block group-focus-within:text-electric-blue transition-colors">Organization</label>
                           <input type="text" value={formData.organization} onChange={(e) => setFormData({...formData, organization: e.target.value})} className="w-full bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3.5 text-white outline-none focus:border-electric-blue/50 transition-colors animate-none" />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                           <label className="text-xs font-mono text-quantum-silver uppercase tracking-wider mb-2 block group-focus-within:text-ai-cyan transition-colors">Digital Identity (Email)</label>
                           <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3.5 text-white outline-none focus:border-ai-cyan/50 transition-colors animate-none" />
                        </div>
                        <div className="group">
                           <label className="text-xs font-mono text-quantum-silver uppercase tracking-wider mb-2 block group-focus-within:text-electric-blue transition-colors">Inquiry Type</label>
                           <select 
                             required
                             value={inquiryType}
                             onChange={(e) => setInquiryType(e.target.value)}
                             className="w-full bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3.5 text-white outline-none focus:border-electric-blue/50 transition-colors appearance-none"
                           >
                             <option value="">Select Routing Protocol...</option>
                             <option value="General Inquiries">General Collaboration</option>
                             <option value="Enterprise Solutions">Enterprise AI Operations</option>
                             <option value="AI Innovation Lab">R&D Lab Research</option>
                             <option value="Partnerships">Global Partnerships</option>
                           </select>
                        </div>
                     </div>

                     {/* Dynamic Enterprise Fields */}
                     <AnimatePresence>
                       {inquiryType === 'Enterprise Solutions' && (
                         <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="group">
                               <label className="text-xs font-mono text-electric-blue uppercase tracking-wider mb-2 block flex items-center gap-1"><Sparkles className="w-3 h-3" /> Team Scale</label>
                               <select value={formData.teamScale} onChange={(e) => setFormData({...formData, teamScale: e.target.value})} className="w-full bg-electric-blue/5 border border-electric-blue/20 rounded-xl px-4 py-3.5 text-white outline-none focus:border-electric-blue transition-colors appearance-none">
                                  <option>10 - 50 Autonomous Agents</option>
                                  <option>50 - 500 Enterprise Users</option>
                                  <option>500+ Ecosystem Deployment</option>
                               </select>
                            </div>
                            <div className="group">
                               <label className="text-xs font-mono text-electric-blue uppercase tracking-wider mb-2 block flex items-center gap-1"><Sparkles className="w-3 h-3" /> Digital Transformation Goal</label>
                               <input type="text" placeholder="e.g. Predictive Analytics, Trade Systems" value={formData.goal} onChange={(e) => setFormData({...formData, goal: e.target.value})} className="w-full bg-electric-blue/5 border border-electric-blue/20 rounded-xl px-4 py-3.5 text-white outline-none focus:border-electric-blue transition-colors animate-none" />
                            </div>
                         </motion.div>
                       )}
                     </AnimatePresence>

                     <div className="group">
                       <label className="text-xs font-mono text-quantum-silver uppercase tracking-wider mb-2 block group-focus-within:text-violet-glow transition-colors">Transmission Payload</label>
                       <textarea rows={4} required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full bg-midnight-black/40 border border-glass-border rounded-xl px-4 py-3.5 text-white outline-none focus:border-violet-glow/50 transition-colors resize-none" />
                     </div>

                     <MagneticButton type="submit" disabled={isSubmitting} className="px-8 py-4 w-full md:w-auto rounded-xl bg-white text-midnight-black font-semibold hover:bg-electric-blue hover:text-white hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {isSubmitting ? "Transmitting..." : "Transmit Payload"} <Send className="w-4 h-4" />
                     </MagneticButton>
                  </form>
               )}
           </motion.div>

           {/* Right: AI Chat Panel */}
           <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full lg:w-2/5">
              <div className="h-full w-full bg-graphite-grey/50 backdrop-blur-xl border border-glass-border rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
                 
                 <div className="p-4 border-b border-glass-border flex items-center gap-3 bg-white/5">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-midnight-black border border-glass-border flex items-center justify-center relative z-10">
                         <div className="w-full h-full rounded-full bg-gradient-to-tr from-ai-cyan to-electric-blue opacity-20 absolute" />
                         <Bot className="w-5 h-5 text-ai-cyan" />
                      </div>
                      <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-graphite-grey z-20" />
                    </div>
                    <div>
                       <div className="text-sm font-bold text-white">AI Assistant Node</div>
                       <div className="text-[10px] text-ai-cyan font-mono tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-ai-cyan animate-pulse" /> LIVE SYNC
                       </div>
                    </div>
                 </div>

                 <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                    {chatMessages.map((msg, idx) => (
                       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${
                            msg.role === 'user' 
                            ? 'bg-gradient-to-r from-electric-blue to-blue-600 text-white rounded-br-none' 
                            : 'bg-white/5 border border-white/10 text-quantum-silver rounded-bl-none'
                          }`}>
                            {msg.text}
                          </div>
                       </motion.div>
                    ))}
                 </div>

                 <div className="p-4 bg-midnight-black/80 border-t border-glass-border">
                    <form onSubmit={handleChatSubmit} className="flex gap-2">
                       <input 
                         type="text" 
                         value={chatInput}
                         onChange={(e)=>setChatInput(e.target.value)}
                         placeholder="Query the network..." 
                         className="flex-1 bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-ai-cyan/50 transition-colors" 
                       />
                       <button type="submit" className="w-12 h-11 bg-glass-surface border border-glass-border rounded-xl flex items-center justify-center text-ai-cyan hover:bg-ai-cyan hover:text-midnight-black transition-all">
                          <Send className="w-4 h-4" />
                       </button>
                    </form>
                 </div>
              </div>
           </motion.div>

        </div>
      </section>

      {/* Corporate Info & Ecosystem Map */}
      <section className="py-24 px-6 bg-midnight-black relative border-t border-glass-border overflow-hidden">
         {/* Map Background abstraction */}
         <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <Globe className="w-[800px] h-[800px] text-electric-blue" strokeWidth={0.2} />
         </div>

         <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
               
               <div className="p-6 rounded-2xl bg-glass-surface backdrop-blur-md border border-glass-border">
                  <MapPin className="w-6 h-6 text-ai-cyan mb-4" />
                  <h4 className="text-sm border-b border-glass-border pb-2 text-quantum-silver uppercase tracking-wider font-mono mb-4">Global Headquarters</h4>
                  <p className="text-white font-medium mb-1">NeuroGrowth Labs</p>
                  <p className="text-quantum-silver text-sm">V&A Waterfront<br/>Cape Town<br/>South Africa</p>
               </div>

               <div className="p-6 rounded-2xl bg-glass-surface backdrop-blur-md border border-glass-border">
                  <Mail className="w-6 h-6 text-electric-blue mb-4" />
                  <h4 className="text-sm border-b border-glass-border pb-2 text-quantum-silver uppercase tracking-wider font-mono mb-4">Direct Channels</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-white text-sm font-medium">General Inquiries</p>
                      <p className="text-electric-blue text-sm">info@neurogrowthlabs.co.za</p>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Enterprise</p>
                      <p className="text-electric-blue text-sm">enterprise@neurogrowthlabs.co.za</p>
                    </div>
                  </div>
               </div>

               <div className="p-6 rounded-2xl bg-glass-surface backdrop-blur-md border border-glass-border">
                  <Handshake className="w-6 h-6 text-green-400 mb-4" />
                  <h4 className="text-sm border-b border-glass-border pb-2 text-quantum-silver uppercase tracking-wider font-mono mb-4">Ecosystem</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-white text-sm font-medium">Partnerships</p>
                      <p className="text-green-400 text-sm">partners@neurogrowthlabs.co.za</p>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Careers</p>
                      <p className="text-ai-cyan text-sm">careers@neurogrowthlabs.co.za</p>
                    </div>
                  </div>
               </div>

               <div className="p-6 rounded-2xl bg-glass-surface backdrop-blur-md border border-glass-border">
                  <Clock className="w-6 h-6 text-violet-glow mb-4" />
                  <h4 className="text-sm border-b border-glass-border pb-2 text-quantum-silver uppercase tracking-wider font-mono mb-4">Operations</h4>
                  <p className="text-white font-medium mb-1">Business Hours</p>
                  <p className="text-quantum-silver text-sm mb-4">Monday - Friday<br/>09:00 - 17:00 (SAST)</p>
                  <p className="text-white font-medium mb-1">Server Status</p>
                  <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                     <span className="text-green-400 text-sm font-mono uppercase">99.999% Uptime</span>
                  </div>
               </div>

            </div>

            {/* Social Connectors */}
            <div className="flex flex-col items-center justify-center text-center">
               <h4 className="text-lg font-bold text-white mb-6">Connect across the Global Ecosystem</h4>
               <div className="flex flex-wrap items-center justify-center gap-6">
                  {[
                     { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/company/neurogrowthlabs/', color: 'hover:text-blue-500 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]' },
                     { icon: Twitter, label: 'X (Twitter)', href: 'https://x.com/neurogrowthlabs', color: 'hover:text-white hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]' },
                     { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/@neurogrowthlabs', color: 'hover:text-red-500 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]' },
                     { icon: FlaskConical, label: 'Research', href: '#', color: 'hover:text-ai-cyan hover:border-ai-cyan hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]' },
                  ].map((social, i) => (
                     <a key={i} href={social.href} target={social.href !== '#' ? "_blank" : undefined} rel={social.href !== '#' ? "noopener noreferrer" : undefined} className={`group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-glass-border text-quantum-silver transition-all duration-300 ${social.color}`}>
                        <social.icon className="w-4 h-4" />
                        <span className="font-medium text-sm">{social.label}</span>
                     </a>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Massive CTA */}
      <section className="py-32 px-6 bg-deep-charcoal relative overflow-hidden text-center flex flex-col items-center border-t border-glass-border">
         <div className="absolute inset-0 z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric-blue/10 blur-[200px] rounded-full pointer-events-none" />
         </div>

         <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">Let’s Build Africa’s <span className="text-ai-cyan">Intelligent Future</span> Together</h2>
            <p className="text-lg md:text-xl text-quantum-silver mb-12 font-light leading-relaxed max-w-3xl mx-auto">
               From AI infrastructure to enterprise systems and digital transformation, NeuroGrowth Labs is engineering the next generation of intelligent ecosystems.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <MagneticButton onClick={() => document.getElementById('ai-form')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-white text-midnight-black font-semibold rounded-full hover:bg-ai-cyan transition-colors flex items-center gap-2">
                  Launch a Project <ArrowRight className="w-4 h-4" />
               </MagneticButton>
               <button className="px-8 py-4 bg-glass-surface border border-glass-border text-white font-medium rounded-full hover:bg-white/10 transition-colors">
                  Schedule Executive Consultation
               </button>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
}
