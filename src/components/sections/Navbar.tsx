import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Hexagon, Moon, Sun, Menu, X, ArrowLeft } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isSubPage = location.pathname !== '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center py-6 px-6 transition-all duration-500 ${
          scrolled ? 'py-4' : 'py-6'
        }`}
      >
        <div 
          className={`flex items-center justify-between w-full max-w-6xl rounded-2xl border px-6 transition-all duration-500 backdrop-blur-xl relative ${
            scrolled 
              ? 'bg-midnight-black/80 border-glass-border shadow-2xl py-3' 
              : 'bg-transparent border-transparent py-4'
          }`}
        >
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <Hexagon className="w-8 h-8 text-electric-blue group-hover:text-violet-glow transition-all duration-300" />
              <span className="text-xl font-bold tracking-tight text-white hidden sm:block">Neurogrowth Labs</span>
            </Link>

            {isSubPage && (
              <Link 
                to="/" 
                className="flex items-center gap-1.5 text-xs font-mono font-bold text-ai-cyan hover:text-white transition-colors bg-ai-cyan/10 hover:bg-ai-cyan/20 border border-ai-cyan/30 px-3 py-1.5 rounded-full"
                id="back-to-home-nav"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </Link>
            )}
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => { navigate('/about'); window.scrollTo(0,0); }} className="text-sm font-medium text-quantum-silver hover:text-white transition-colors">About</button>
            <button onClick={() => { navigate('/academy'); window.scrollTo(0,0); }} className="text-sm font-semibold text-ai-cyan hover:text-white transition-colors flex items-center gap-1">
              <span>Academy</span>
            </button>
            <button onClick={() => { navigate('/'); setTimeout(() => document.getElementById('infrastructure')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-sm font-medium text-quantum-silver hover:text-white transition-colors">Infrastructure</button>
            <button onClick={() => { navigate('/partner'); window.scrollTo(0,0); }} className="text-sm font-medium text-quantum-silver hover:text-white transition-colors">Partner</button>
            <button onClick={() => { navigate('/webinar'); window.scrollTo(0,0); }} className="text-sm font-medium text-quantum-silver hover:text-white transition-colors">Webinar</button>
            <button onClick={() => { navigate('/contact'); window.scrollTo(0,0); }} className="text-sm font-medium text-quantum-silver hover:text-white transition-colors">Contact</button>
            <button onClick={() => { navigate('/portal'); window.scrollTo(0,0); }} className="text-sm font-semibold text-ai-cyan hover:text-white transition-colors border border-ai-cyan/30 px-4 py-1.5 rounded-full bg-ai-cyan/5 hover:bg-ai-cyan/15">Portal</button>
            
            <button onClick={toggleTheme} className="w-8 h-8 rounded-full border border-glass-border flex items-center justify-center text-quantum-silver hover:text-white hover:bg-white/5 transition-colors">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile Navigation controls */}
          <div className="flex md:hidden items-center gap-3">
            <button onClick={toggleTheme} className="w-8 h-8 rounded-full border border-glass-border flex items-center justify-center text-quantum-silver hover:text-white hover:bg-white/5 transition-colors">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-xl border border-glass-border flex items-center justify-center text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle navigation menu"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-24 z-40 mx-6 p-6 rounded-2xl bg-midnight-black/95 backdrop-blur-2xl border border-glass-border shadow-2xl md:hidden flex flex-col gap-4"
            id="mobile-drawer-menu"
          >
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { navigate('/about'); window.scrollTo(0,0); }} 
                className="w-full text-left py-3 px-4 rounded-xl hover:bg-white/5 text-base font-medium text-quantum-silver hover:text-white transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => { navigate('/academy'); window.scrollTo(0,0); }} 
                className="w-full text-left py-3 px-4 rounded-xl hover:bg-white/5 text-base font-semibold text-ai-cyan hover:text-white transition-colors flex items-center justify-between"
              >
                <span>Cybersecurity & AI Academy</span>
              </button>
              <button 
                onClick={() => { navigate('/'); setTimeout(() => document.getElementById('infrastructure')?.scrollIntoView({ behavior: 'smooth' }), 100); }} 
                className="w-full text-left py-3 px-4 rounded-xl hover:bg-white/5 text-base font-medium text-quantum-silver hover:text-white transition-colors"
              >
                Infrastructure
              </button>
              <button 
                onClick={() => { navigate('/partner'); window.scrollTo(0,0); }} 
                className="w-full text-left py-3 px-4 rounded-xl hover:bg-white/5 text-base font-medium text-quantum-silver hover:text-white transition-colors"
              >
                Partner
              </button>
              <button 
                onClick={() => { navigate('/webinar'); window.scrollTo(0,0); }} 
                className="w-full text-left py-3 px-4 rounded-xl hover:bg-white/5 text-base font-medium text-quantum-silver hover:text-white transition-colors"
              >
                Webinar
              </button>
              <button 
                onClick={() => { navigate('/contact'); window.scrollTo(0,0); }} 
                className="w-full text-left py-3 px-4 rounded-xl hover:bg-white/5 text-base font-medium text-quantum-silver hover:text-white transition-colors"
              >
                Contact
              </button>
              <button 
                onClick={() => { navigate('/portal'); window.scrollTo(0,0); }} 
                className="w-full text-center py-3 px-4 rounded-xl bg-ai-cyan/15 hover:bg-ai-cyan/25 text-base font-semibold text-ai-cyan transition-colors border border-ai-cyan/30"
              >
                Enterprise Portal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
