import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';
import { Brain, Sparkles, ChevronRight, UploadCloud, CheckCircle2, ShieldCheck, Activity, Terminal, ArrowRight, User, Briefcase, Code } from 'lucide-react';
import { MagneticButton } from '../components/ui/MagneticButton';

type Phase = 'intro' | 'assessment' | 'analyzing' | 'selection' | 'documents' | 'submitting' | 'success';

interface Message {
  role: 'ai' | 'user';
  text: string;
  delay?: number;
}

const assessmentQuestions = [
  "Welcome to NeuroGrowth Labs. I am the AI Talent Assessment Agent. To begin, please state your full name and the role you are applying for.",
  "Excellent. Could you describe your primary area of expertise and arguably your most significant technical or strategic achievement?",
  "At NeuroGrowth, we value extreme innovation and resilience. Tell me about a time you had to pivot a major project due to unforeseen constraints. How did you adapt?",
  "How do you perceive the future of AI in the African digital economy, and what unique perspective do you bring to that vision?",
  "Thank you. This concludes the initial cognitive and cultural alignment scan."
];

export default function Careers() {
  const [phase, setPhase] = useState<Phase>('intro');

  return (
    <div className="bg-midnight-black text-slate-300 min-h-screen font-sans selection:bg-electric-blue/30 selection:text-white pb-20">
      <Navbar />

      <main className="pt-32 px-6 min-h-[90vh] flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
           <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-electric-blue/5 blur-[120px] rounded-full pointer-events-none" />
           <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-glow/5 blur-[120px] rounded-full pointer-events-none" />
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {phase === 'intro' && <IntroPhase onStart={() => setPhase('assessment')} key="intro" />}
            {phase === 'assessment' && <AssessmentPhase onComplete={() => setPhase('analyzing')} key="assessment" />}
            {phase === 'analyzing' && <AnalyzingPhase onComplete={() => setPhase('selection')} key="analyzing" />}
            {phase === 'selection' && <SelectionPhase onComplete={() => setPhase('documents')} key="selection" />}
            {phase === 'documents' && <DocumentsPhase onComplete={() => setPhase('submitting')} key="documents" />}
            {phase === 'submitting' && <SubmittingPhase onComplete={() => setPhase('success')} key="submitting" />}
            {phase === 'success' && <SuccessPhase key="success" />}
          </AnimatePresence>
        </div>
      </main>
      <Footer />

    </div>
  );
}

function IntroPhase({ onStart }: { onStart: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="text-center"
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ai-cyan/10 border border-ai-cyan/20 text-ai-cyan text-sm tracking-widest font-mono uppercase mb-8">
        <Sparkles className="w-4 h-4" /> AI Recruitment OS
      </div>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 text-white">
        Join the Intelligence Layer of <br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-violet-glow">The Modern Economy</span>
      </h1>
      <p className="text-lg md:text-xl text-quantum-silver mb-12 max-w-2xl mx-auto leading-relaxed font-light">
        NeuroGrowth Labs does not use traditional application forms. Our AI Talent Assessment Agent will evaluate your alignment, skills, and potential through an interactive conversational protocol.
      </p>

      <MagneticButton onClick={onStart} className="relative group mx-auto rounded-full p-[1px]">
        <span className="absolute inset-0 bg-gradient-to-r from-ai-cyan to-electric-blue opacity-70 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-md" />
        <div className="relative flex items-center gap-2 px-8 py-4 bg-midnight-black rounded-full border border-white/10">
          <span className="text-white font-medium">Initialize AI Assessment</span>
          <ArrowRight className="w-4 h-4 text-ai-cyan" />
        </div>
      </MagneticButton>
    </motion.div>
  );
}

function AssessmentPhase({ onComplete }: { onComplete: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [qIndex, setQIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (qIndex < assessmentQuestions.length) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: assessmentQuestions[qIndex] }]);
        setIsTyping(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => onComplete(), 2000);
    }
  }, [qIndex]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setQIndex(prev => prev + 1);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full">
       <div className="bg-graphite-grey/40 backdrop-blur-xl border border-glass-border rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
          
          <div className="h-16 border-b border-glass-border flex items-center px-6 gap-4 bg-white/5">
             <div className="w-10 h-10 rounded-full bg-midnight-black border border-glass-border flex items-center justify-center p-1">
               <div className="w-full h-full rounded-full bg-gradient-to-tr from-ai-cyan to-electric-blue flex items-center justify-center">
                 <Brain className="w-4 h-4 text-midnight-black" />
               </div>
             </div>
             <div>
               <div className="text-white font-medium text-sm">AI Job Assessor Agent</div>
               <div className="text-xs text-ai-cyan font-mono flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-ai-cyan animate-pulse" /> ACTIVE SESSION</div>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
             {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-electric-blue text-white rounded-br-none' 
                      : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-none'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
             ))}
             {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-none px-5 py-4 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-ai-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-ai-cyan animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-ai-cyan animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
             )}
             <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 bg-midnight-black/50 border-t border-glass-border">
             <div className="flex relative items-center">
               <input 
                 type="text" 
                 disabled={isTyping || qIndex >= assessmentQuestions.length}
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-4 pr-14 text-sm text-white placeholder-quantum-silver outline-none focus:border-ai-cyan/50 transition-colors disabled:opacity-50"
                 placeholder="Communicate your response..."
               />
               <button 
                 type="submit" 
                 disabled={isTyping || !input.trim()}
                 className="absolute right-2 w-10 h-10 bg-electric-blue rounded-lg flex items-center justify-center text-white disabled:opacity-50 disabled:bg-white/10 transition-colors"
               >
                 <ArrowRight className="w-4 h-4" />
               </button>
             </div>
          </form>

       </div>
    </motion.div>
  );
}

function AnalyzingPhase({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative w-32 h-32 mb-8">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 border-2 border-dashed border-ai-cyan/40 rounded-full" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="absolute inset-2 border-2 border-electric-blue/40 rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Activity className="w-10 h-10 text-ai-cyan animate-pulse" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Synthesizing Candidate Profile</h3>
      <p className="text-quantum-silver font-mono text-sm max-w-sm">
        Analyzing cognitive patterns, leadership potential, and culture alignment across neural pathways...
      </p>
    </motion.div>
  );
}

function SelectionPhase({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
      <div className="bg-graphite-grey/40 backdrop-blur-xl border border-glass-border rounded-3xl overflow-hidden shadow-2xl p-8 md:p-12 text-center relative">
         <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-ai-cyan via-electric-blue to-violet-glow" />
         
         <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
           <ShieldCheck className="w-10 h-10 text-green-400" />
         </div>

         <h2 className="text-3xl font-bold text-white mb-4">Assessment Cleared</h2>
         <p className="text-quantum-silver mb-8 max-w-lg mx-auto">
           "Your assessment results indicate strong compatibility with our innovation ecosystem. I have classified your profile as <span className="text-ai-cyan font-medium">HIGH PRIORITY</span>. I will now collect your professional documents to finalize your application package."
         </p>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-2xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">94%</div>
              <div className="text-[10px] text-quantum-silver uppercase tracking-wider">Cognitive Match</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">A+</div>
              <div className="text-[10px] text-quantum-silver uppercase tracking-wider">Culture Fit</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">98%</div>
              <div className="text-[10px] text-quantum-silver uppercase tracking-wider">Innovation</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">Top 5%</div>
              <div className="text-[10px] text-quantum-silver uppercase tracking-wider">Candidate Tier</div>
            </div>
         </div>

         <MagneticButton onClick={onComplete} className="px-8 py-4 rounded-full bg-white text-midnight-black font-semibold hover:bg-electric-blue hover:text-white transition-all">
            Proceed to Document Upload
         </MagneticButton>
      </div>
    </motion.div>
  );
}

function DocumentsPhase({ onComplete }: { onComplete: () => void }) {
  const [uploads, setUploads] = useState({ resume: false, photo: false, id: false });

  const simulateUpload = (type: 'resume' | 'photo' | 'id') => {
    setUploads(prev => ({ ...prev, [type]: true }));
  };

  const allDone = uploads.resume && uploads.photo && uploads.id;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full">
      <div className="bg-graphite-grey/40 backdrop-blur-xl border border-glass-border rounded-3xl p-8 md:p-12 shadow-2xl">
         <h2 className="text-3xl font-bold text-white mb-2">Secure Document Vault</h2>
         <p className="text-quantum-silver mb-8">Please upload the required verification and professional documents. All files are encrypted using quantum-safe AES-256 protocols before AI analysis.</p>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <UploadCard 
              title="Resume / CV" 
              desc="PDF, DOCX" 
              icon={<Briefcase className="w-6 h-6 text-ai-cyan" />} 
              isUploaded={uploads.resume} 
              onUpload={() => simulateUpload('resume')} 
            />
            <UploadCard 
              title="Professional Photo" 
              desc="JPG, PNG" 
              icon={<User className="w-6 h-6 text-violet-glow" />} 
              isUploaded={uploads.photo} 
              onUpload={() => simulateUpload('photo')} 
            />
            <UploadCard 
              title="ID or Passport" 
              desc="Secure Verification" 
              icon={<ShieldCheck className="w-6 h-6 text-electric-blue" />} 
              isUploaded={uploads.id} 
              onUpload={() => simulateUpload('id')} 
            />
         </div>

         <div className="flex justify-end pt-6 border-t border-glass-border">
            <button 
              disabled={!allDone}
              onClick={onComplete}
              className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                allDone ? 'bg-electric-blue text-white hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-white/5 text-quantum-silver cursor-not-allowed'
              }`}
            >
               Submit Application <UploadCloud className="w-4 h-4" />
            </button>
         </div>
      </div>
    </motion.div>
  );
}

function UploadCard({ title, desc, icon, isUploaded, onUpload }: { title: string, desc: string, icon: React.ReactNode, isUploaded: boolean, onUpload: () => void }) {
  return (
    <div 
      onClick={!isUploaded ? onUpload : undefined}
      className={`relative p-6 rounded-2xl border transition-all ${
        isUploaded 
        ? 'bg-green-500/5 border-green-500/20' 
        : 'bg-white/5 border-glass-border hover:border-ai-cyan/50 hover:bg-white/10 cursor-pointer border-dashed'
      }`}
    >
      <div className="mb-4">{icon}</div>
      <h4 className="text-white font-medium mb-1">{title}</h4>
      <p className="text-xs text-quantum-silver">{desc}</p>

      {isUploaded ? (
         <div className="absolute top-4 right-4 text-green-400 flex items-center gap-1 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4" /> Verified
         </div>
      ) : (
         <div className="absolute top-4 right-4 text-quantum-silver">
            <UploadCloud className="w-4 h-4 opacity-50" />
         </div>
      )}
    </div>
  );
}

function SubmittingPhase({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
      <Terminal className="w-10 h-10 text-violet-glow mb-6 animate-pulse" />
      <h3 className="text-2xl font-bold text-white mb-4">Packaging Application</h3>
      <div className="max-w-md w-full bg-midnight-black/50 rounded-xl border border-glass-border p-4 text-left font-mono text-xs text-quantum-silver space-y-2">
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>[1/4] Compiling AI Assessment Notes...</motion.div>
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>[2/4] Encrypting Document Vault...</motion.div>
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>[3/4] Generating Priority Pipeline Tag...</motion.div>
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }} className="text-electric-blue">[4/4] Transmitting to careers@neurogrowthlabs.co.za via SMTP...</motion.div>
      </div>
    </motion.div>
  );
}

function SuccessPhase() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center py-10">
      <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(34,197,94,0.15)] relative">
         <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full border border-green-400/50" />
         <CheckCircle2 className="w-12 h-12 text-green-400" />
      </div>
      
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Application Successfully Submitted</h2>
      <p className="text-xl text-quantum-silver mb-10 max-w-xl mx-auto font-light">
        Your complete AI assessment package and documents have been securely routed to the NeuroGrowth executive recruitment team.
      </p>

      <div className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-quantum-silver font-mono">
         <ShieldCheck className="w-4 h-4 text-ai-cyan" /> Securely Delivered to careers@neurogrowthlabs.co.za
      </div>
    </motion.div>
  );
}
