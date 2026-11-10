import React from 'react';
import Navbar from '../components/sections/Navbar';
import Hero from '../components/sections/Hero';
import SocialProof from '../components/sections/SocialProof';
import About from '../components/sections/About';
import Products from '../components/sections/Products';
import AILab from '../components/sections/AILab';
import Services from '../components/sections/Services';
import FAQ from '../components/sections/FAQ';
import CTA from '../components/sections/CTA';
import Footer from '../components/sections/Footer';

export default function Landing() {
  return (
    <div className="bg-midnight-black min-h-screen text-slate-300 font-sans selection:bg-electric-blue/30 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <About />
        <Products />
        <AILab />
        <Services />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
