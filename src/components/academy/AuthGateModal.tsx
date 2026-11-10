import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { 
  X, Lock, UserPlus, LogIn, ShieldCheck, Mail, Key, User, 
  ArrowRight, Sparkles, CheckCircle2, AlertCircle, BookOpen, Download,
  Hexagon, Globe
} from 'lucide-react';

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  contextType?: 'course' | 'paper' | 'general';
  itemTitle?: string;
  itemCode?: string;
}

export default function AuthGateModal({
  isOpen,
  onClose,
  onSuccess,
  contextType = 'general',
  itemTitle,
  itemCode
}: AuthGateModalProps) {
  const { loginWithEmail, registerWithEmail } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('South Africa');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'register') {
        const studentName = fullName.trim() || cleanEmail.split('@')[0];
        await registerWithEmail(cleanEmail, password, studentName);
        setSuccessMsg('Account created successfully. Redirecting...');
      } else {
        await loginWithEmail(cleanEmail, password);
        setSuccessMsg('Signed in successfully. Redirecting...');
      }

      setTimeout(() => {
        setLoading(false);
        onSuccess({ email: cleanEmail, displayName: fullName.trim() || cleanEmail.split('@')[0] });
        onClose();
      }, 650);

    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMsg(err?.message || 'Authentication failed. Please verify your credentials.');
      setLoading(false);
    }
  };

  const handleQuickLearnerAccess = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const demoEmail = 'learner.africa@neurogrowthlabs.co.za';
      const demoName = 'African Intelligence Scholar';
      await registerWithEmail(demoEmail, 'LearnerPass2026@', demoName);
      setSuccessMsg('Signed in with Verified Scholar credentials.');
      setTimeout(() => {
        setLoading(false);
        onSuccess({ email: demoEmail, displayName: demoName });
        onClose();
      }, 500);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Quick access encountered an issue.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window: Microsoft Entra ID / Microsoft Academy Clean Architecture */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 10 }}
          className="relative w-full max-w-md bg-[#0e131f] border border-white/15 rounded-xl shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Top Brand Accent Bar */}
          <div className="h-1 bg-gradient-to-r from-ai-cyan via-electric-blue to-[#c5a059]" />

          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 sm:p-7">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-2 mb-4">
              <Hexagon className="w-6 h-6 text-ai-cyan" />
              <span className="text-sm font-bold tracking-tight text-white font-sans">
                Neurogrowth Labs
              </span>
              <span className="text-xs text-slate-400">/ Sovereign ID</span>
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight">
              {activeTab === 'register' ? 'Create a Learner Account' : 'Sign In to Sovereign Academy'}
            </h2>
            
            <p className="text-xs text-slate-400 mt-1">
              {contextType === 'course' ? (
                <span>You are accessing: <strong className="text-ai-cyan">{itemCode || 'Course'}</strong> - {itemTitle || 'this free cybersecurity learning path'}.</span>
              ) : contextType === 'paper' ? (
                <span>You are downloading: <strong className="text-ai-cyan">{itemTitle || 'this research paper'}</strong>.</span>
              ) : (
                <span>Access courses, module checkpoints, and autogenerated certificates.</span>
              )}
            </p>

            {/* Segmented Tab Switch (Microsoft Style) */}
            <div className="grid grid-cols-2 p-1 bg-white/[0.04] rounded-lg border border-white/10 my-5">
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setErrorMsg(null); }}
                className={`py-1.5 px-3 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'register'
                    ? 'bg-ai-cyan text-midnight-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMsg(null); }}
                className={`py-1.5 px-3 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'login'
                    ? 'bg-ai-cyan text-midnight-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Status alerts */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-xs text-green-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {activeTab === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Name <span className="text-slate-500 font-normal">(Printed on Certificate)</span>
                  </label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Amina Diallo" 
                    required={activeTab === 'register'}
                    className="w-full bg-[#080b11] border border-white/15 focus:border-ai-cyan rounded-lg px-3 py-2 text-xs text-white focus:outline-none transition-colors placeholder:text-slate-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com or university" 
                  required
                  className="w-full bg-[#080b11] border border-white/15 focus:border-ai-cyan rounded-lg px-3 py-2 text-xs text-white focus:outline-none transition-colors placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••" 
                  required
                  minLength={6}
                  className="w-full bg-[#080b11] border border-white/15 focus:border-ai-cyan rounded-lg px-3 py-2 text-xs text-white focus:outline-none transition-colors placeholder:text-slate-500"
                />
              </div>

              {activeTab === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Country / Regional Center
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#080b11] border border-white/15 focus:border-ai-cyan rounded-lg px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                  >
                    <option value="South Africa">South Africa</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Egypt">Egypt</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Senegal">Senegal</option>
                    <option value="Angola">Angola</option>
                    <option value="Other African Nation">Other African Nation</option>
                    <option value="International">International</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-lg font-bold text-xs bg-ai-cyan hover:bg-white text-midnight-black transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{activeTab === 'register' ? 'Create Free Account & Proceed' : 'Sign In & Proceed'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Access for Evaluation */}
            <div className="mt-5 pt-4 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={handleQuickLearnerAccess}
                disabled={loading}
                className="w-full py-2 px-3 rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-ai-cyan" />
                <span>1-Click Verified Scholar Access (Demo Profile)</span>
              </button>
            </div>

            {/* Trust statement */}
            <div className="mt-4 text-center text-[11px] text-slate-500">
              <span>Sovereign Identity · 100% Free Tuition · POPIA / NDPR Compliant</span>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
