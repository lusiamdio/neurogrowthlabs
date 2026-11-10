import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Linkedin, Twitter, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import simaoImg from '../../assets/images/27936_396d20036af0e5d9256efcb4dafc14bd-2026_02_11, 11_12_22.jpg';
import hoangImg from '../../assets/images/ChatGPT Image Aug 24, 2026, 01_44_50 PM.png';
import linfordImg from '../../assets/images/ChatGPT Image Aug 24, 2026, 01_45_47 PM.png';
import ismantoImg from '../../assets/images/ChatGPT Image Aug 24, 2026, 01_42_35 PM.png';
import matsosoImg from '../../assets/images/ChatGPT Image Aug 24, 2026, 01_40_40 PM.png';

// Custom GitHub icon (lucide Github is deprecated and buggy)
const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const leadershipData = [
  {
    name: "Mr. Lusimanadio Soki Simao, MBA",
    role: "Founder & Chief Executive Officer",
    desc: "Visionary entrepreneur building AI platforms designed to accelerate global economic transformation.",
    image: simaoImg,
    linkedin: "#",
    twitter: "#",
    longBio: [
      "Mr. Lusimanadio Soki Simao, MBA is widely recognized for founding and scaling impact-driven institutions that align innovation, policy, and inclusive economic growth across Africa.",
      "As an executive at the intersection of tech, environmental policy, and trade, his career is defined by strategic leadership, AI-driven innovation, and continental trade development to shape future-ready African institutions and globally competitive enterprises."
    ],
    honors: "Africa Business Professionals and Entrepreneurs Award",
    credentials: [
      { title: "Associate Member", issuer: "CIM Chartered Managers Canada" },
      { title: "Oil and Gas Safety Management", issuer: "OSHAcademy Occupational Safety & Health Training" },
      { title: "Introduction to OSHAcademy", issuer: "OSHAcademy Occupational Safety & Health Training" },
      { title: "ISO 14001:2015 Environmental Management System Awareness", issuer: "The Knights of Safety" },
      { title: "ISO 9001:2015 Quality Management System Foundations", issuer: "The Knights of Safety" },
      { title: "Data Analytics Essentials", issuer: "Cisco Networking Academy" },
      { title: "Designing for Greater Efficiency", issuer: "IFC (World Bank)" },
      { title: "Introduction to Critical Infrastructure Protection", issuer: "OPSWAT Academy" },
      { title: "Certified Lean Six Sigma Black Belt", issuer: "Six Sigma Academy Amsterdam" },
      { title: "Certified John Maxwell Leadership Team Member", issuer: "John Maxwell Leadership Academy" }
    ]
  },
  {
    name: "Nguyen Van Hoang",
    role: "Chief AI & ML Engineer",
    desc: "AI engineer and full-stack architect building intelligent systems that bridge research and production.",
    image: hoangImg,
    linkedin: "https://www.linkedin.com/in/hoangnguyen0402/",
    twitter: "https://x.com/HoangNguyen0299",
    github: "https://github.com/hoangnv170752",
    longBio: [
      "Nguyen Van Hoang is a Software Engineer with over 5 years of hands-on experience in Artificial Intelligence, IoT systems, cloud-native architecture, and full-stack development. His work centers on taking cutting-edge AI research in Large Language Models, Computer Vision, and distributed computing and shipping it as production-grade software.",
      "Hoang's engineering philosophy is rooted in building systems that scale. From designing event-driven microservices to orchestrating containerized deployments on Kubernetes, he treats infrastructure as a first-class citizen of any AI product. His portfolio spans enterprise-grade platforms, real-time data pipelines, and embedded IoT solutions that run reliably under load.",
      "Before joining NeuroGrowth Labs, Hoang contributed to multiple high-impact projects across Southeast Asia, including intelligent document processing systems, automated quality inspection pipelines using computer vision, and conversational AI platforms powered by LLMs. Each project reinforced his approach: solve real problems, measure the outcomes, and iterate fast.",
      "At NeuroGrowth Labs, Hoang leads the AI and ML engineering vertical architecting model inference pipelines, integrating vector databases for semantic search, and building the tooling that enables the team to ship AI features with confidence. He is responsible for ensuring that every AI capability the company delivers is not just technically sound but also maintainable, observable, and ready for production traffic.",
      "Outside of work, Hoang actively contributes to open-source projects, shares technical insights with the developer community, and continuously explores emerging technologies in the AI/ML space. He believes that the best engineers are perpetual learners who stay close to the craft."
    ],
    expertise: [
      { field: "Artificial Intelligence & ML", tech: "LLMs, RAG Systems, Computer Vision, Deep Learning, PyTorch, TensorFlow, Hugging Face" },
      { field: "Software Architecture", tech: "Microservices, Event-Driven Design, Domain-Driven Design, API Gateway, System Design" },
      { field: "Full-Stack Engineering", tech: "TypeScript, React, Next.js, Node.js, Python, FastAPI, Go" },
      { field: "Cloud & DevOps", tech: "Docker, Kubernetes, AWS, GCP, Terraform, CI/CD, GitOps" },
      { field: "IoT & Edge Computing", tech: "Embedded Systems, Edge AI, MQTT, Sensor Networks, Raspberry Pi, ESP32" },
      { field: "Data Engineering", tech: "PostgreSQL, MongoDB, Redis, Pinecone, Kafka, Apache Spark, Data Pipelines" }
    ]
  },
  {
    name: "Linford Musiyambodza",
    role: "Chief AI Product Architecture Development Officer",
    desc: "Self-taught software and AI engineer building purpose-led solutions from Strand, Cape Town.",
    image: linfordImg,
    linkedin: "#",
    twitter: "#",
    longBio: [
      "Linford Musiyambodza is a self-taught software and AI engineer building from Strand, Cape Town. He founded Linfy Tech Solutions to turn AI into tools people can actually use, protecting wildlife, digitizing the informal economy, and making security accessible.",
      "His work runs from computer vision and multi-agent systems to full-stack products shipped end to end. He cares about craft, but more about impact: software that reaches communities that usually get built for last, not first.",
      "Faith sits at the center of it. Every project he ships carries the same signature: El Roi, the God who sees the work."
    ],
    keyPillars: [
      { title: "Self-taught engineer", description: "From first lines of code to production AI systems." },
      { title: "AI & agentic builder", description: "Multi-agent orchestration, LLM apps, computer vision." },
      { title: "Founder", description: "Linfy Tech Solutions and NeuroGrowth Labs." },
      { title: "Christian", description: "Purpose-led work, grounded in faith." },
      { title: "Africa-first", description: "Solving problems where he lives, for people he knows." }
    ],
    expertise: [
      { field: "AI & Agentic", tech: "Agentic AI, LLMs, Prompt Engineering, RAG, Multi-agent (A2A), Computer Vision" },
      { field: "Frontend", tech: "React, Next.js, TypeScript, Tailwind" },
      { field: "Backend", tech: "Python, FastAPI, Node.js, REST APIs" },
      { field: "Databases", tech: "Supabase, PostgreSQL, Firebase" },
      { field: "Cloud & Delivery", tech: "Vercel, Render, Railway, GitHub" },
      { field: "Cybersecurity", tech: "Threat Analysis, Phishing Detection, Secure Auth, Linux / Kali" }
    ]
  },
  {
    name: "Muhammad Nur Ismanto",
    role: "Chief Technology Officer",
    desc: "Technology leader focused on deep AI innovation and intelligent enterprise platforms.",
    image: ismantoImg,
    linkedin: "#",
    twitter: "#",
    longBio: [
      "Muhamad Ismanto is a seasoned tech innovator and educator with over a decade of experience in web and application development, system architecture, and digital transformation. With a deep technical foundation in languages such as Java, JavaScript, Python, PHP, SQL, HTML, and CSS, he has led and contributed to numerous enterprise and startup projects across Southeast Asia.",
      "As a passionate system architect, he has built scalable SaaS, PaaS, and IaaS platforms, and continues to drive innovation in automation, IoT, and microcontroller systems. His projects include an award-winning childcare service app recognized by UNICEF, clinical monitoring apps for maternal health in Malaysia, and enterprise systems for Korean companies. These experiences showcase his ability to deliver purpose-driven digital solutions that address real-world needs.",
      "Muhamad's journey began in vocational high school with a focus on multimedia and web technologies. Upon graduating in 2010, he advanced his technical skills with a degree in Electrical and Electronics Engineering at a private Malaysian university, diving deeper into automation, IoT, and microcontroller systems. He actively participated in training and workshops, expanding his hands-on capabilities in both hardware and software development.",
      "He has also served as the former Chief Technology Officer (CTO) in a joint venture between FixApa (Malaysia) and Fellas (Indonesia)—a cross-border initiative aimed at building scalable system architecture to support a brighter digital future for the region. In this role, he led strategic development of technology platforms tailored to the needs of diverse markets across Southeast Asia.",
      "His commitment to technology goes beyond engineering. As an AI trainer in collaboration with a leading Malaysian education provider, he empowers both students and professionals to embrace AI and future technologies. He has also conducted training programs on IoT, automation, and software development for internal teams, corporate staff, and the public.",
      "Now, he is focused on leveraging his skills to develop impactful tech solutions that support community growth and sustainable development across the region, motivated by a strong vision of inclusive tech empowerment."
    ],
    expertise: [
      { field: "Electronics Engineering Developer", tech: "PLC, Arduino, ATmega, Microcontroller, ESP, Raspberry, etc." },
      { field: "Website Developer", tech: "JS, PHP, Bootstrap, .Net, Java, React, Node.js, etc." },
      { field: "System Analyst & Architect", tech: "Enterprise Apps, QMS, SAP, PaaS, IaaS, SaaS, etc." },
      { field: "Product Owner", tech: "Product Study, Market Strategy, Roadmapping, Problem Solving" },
      { field: "Software Developer", tech: "Java, Python, C++, SpringBoot, C#, etc." },
      { field: "Mobile Apps Developer", tech: "Android Studio, iOS, Huawei Mobile Services, WebView" },
      { field: "Python & AI Trainer", tech: "Machine Learning, Deep Learning, OpenCV, Data Pipelines" },
      { field: "UI/UX Designer", tech: "Figma, Layout Architecture, Interactive Prototyping" },
      { field: "Data Analyst", tech: "Tableau, Python, Pandas, Power BI, Excel Charts" },
      { field: "Cloud Engineer", tech: "AWS Cloud, Oracle Cloud, Alibaba, Microsoft Azure" },
      { field: "AI/ML Engineer", tech: "Deep Learning, LLM Integration, Planning & Evaluation" }
    ]
  },
  {
    name: "Francis Matsoso",
    role: "Chief Security & Compliance Officer (CSCO)",
    desc: "Leading the design, development, and governance, AI research initiatives and cybersecurity architecture.",
    image: matsosoImg,
    linkedin: "#",
    twitter: "#",
    longBio: [
      "Francis Matsoso is a premier cybersecurity researcher and developer specializing in advanced penetration testing, threat intelligence, and AI-powered security automation systems. He leads security architecture across an 18+ application AI infrastructure portfolio.",
      "Recognized as a hackathon champion and former cybersecurity lead, Francis bridges offensive security research with full-stack development to build systems that are secure by design. By integrating advanced threat mitigation directly into software pipelines, he ensures that all NeuroGrowth Labs systems and autonomous computing environments remain highly secure and resilient against sophisticated cyber threats."
    ],
    expertise: [
      { field: "Security Architecture & DevSecOps", tech: "Security automation, secure container deployments, CI/CD security integration, IAM" },
      { field: "Offensive Security & Pen-Testing", tech: "Penetration testing, vulnerability assessments, exploit development, reverse engineering" },
      { field: "Threat Intelligence & Automation", tech: "AI-powered threat detection, automated log analysis, SIEM, intrusion detection" },
      { field: "Full-Stack Security Engineering", tech: "Secure coding practices (OWASP Top 10), crypto-implementation, secure authentication protocols" },
      { field: "Regulatory Compliance & Audit", tech: "ISO 27001, GDPR, DPA compliance, SOC 2 alignment, security governance frameworks" },
      { field: "Infrastructure Protection & Defense", tech: "Zero-trust network architectures, Web Application Firewalls (WAF), secure multi-tenant isolation" }
    ]
  }
];

const LeadershipCard = ({ member, isExpanded, onExpand, onClose }: any) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // EXPANDED MODAL VIEW
  if (isExpanded) {
    return (
      <motion.div
        layout
        className="w-[90vw] md:w-[550px] lg:w-[600px] h-[80vh] rounded-2xl bg-midnight-black border border-glass-border overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-midnight-black border-b border-glass-border p-5">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              {member.image && (
                <img src={member.image} alt={member.name} className="w-14 h-14 rounded-full object-cover border-2 border-ai-cyan/30" referrerPolicy="no-referrer" />
              )}
              <div>
                <h3 className="text-xl font-bold text-white">{member.name}</h3>
                <p className="text-ai-cyan font-mono text-xs uppercase tracking-wider">{member.role}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 border border-glass-border flex items-center justify-center text-quantum-silver hover:text-red-400 hover:border-red-400 transition-all flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {member.longBio && (
            <div className="space-y-3">
              {member.longBio.map((para: string, idx: number) => (
                <p key={idx} className="text-quantum-silver text-sm leading-relaxed">{para}</p>
              ))}
            </div>
          )}

          {member.keyPillars && (
            <div className="pt-4 border-t border-glass-border">
              <h4 className="text-ai-cyan font-mono text-xs uppercase tracking-wider mb-3">Core Pillars</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {member.keyPillars.map((pillar: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-white/5 border border-glass-border">
                    <div className="font-medium text-white text-sm mb-1">{pillar.title}</div>
                    <div className="text-quantum-silver text-xs">{pillar.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {member.expertise && (
            <div className="pt-4 border-t border-glass-border">
              <h4 className="text-ai-cyan font-mono text-xs uppercase tracking-wider mb-3">Expertise</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {member.expertise.map((exp: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-white/5 border border-glass-border">
                    <div className="font-medium text-white text-sm mb-1">{exp.field}</div>
                    <div className="text-quantum-silver text-xs">{exp.tech}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {member.honors && (
            <div className="pt-4 border-t border-glass-border">
              <h4 className="text-ai-cyan font-mono text-xs uppercase tracking-wider mb-3">Honors</h4>
              <div className="p-3 rounded-lg bg-ai-cyan/10 border border-ai-cyan/20">
                <p className="text-white text-sm">{member.honors}</p>
              </div>
            </div>
          )}

          {member.credentials && (
            <div className="pt-4 border-t border-glass-border">
              <h4 className="text-ai-cyan font-mono text-xs uppercase tracking-wider mb-3">Credentials</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {member.credentials.map((cred: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-white/5 border border-glass-border">
                    <div className="font-medium text-white text-sm mb-1">{cred.title}</div>
                    <div className="text-quantum-silver text-xs">{cred.issuer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-midnight-black border-t border-glass-border p-4">
          <div className="flex gap-3">
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/5 border border-glass-border flex items-center justify-center text-quantum-silver hover:text-white hover:border-blue-500 transition-all">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/5 border border-glass-border flex items-center justify-center text-quantum-silver hover:text-white hover:border-gray-300 transition-all">
              <Twitter className="w-4 h-4" />
            </a>
            {member.github && (
              <a href={member.github} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/5 border border-glass-border flex items-center justify-center text-quantum-silver hover:text-white hover:border-purple-500 transition-all">
                <GithubIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // COLLAPSED CARD VIEW
  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      layout
      whileHover={{ scale: 1.02 }}
      onClick={onExpand}
      className="relative p-8 h-[340px] max-w-[340px] shrink-0 cursor-pointer rounded-2xl bg-midnight-black/60 border border-glass-border overflow-hidden group transition-all duration-500 hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
    >
      {member.image && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-2xl">
          <img src={member.image} alt={member.name} className="w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight-black via-midnight-black/60 to-transparent" />
        </div>
      )}

      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-1"
        style={{
          background: useTransform([mouseX, mouseY], ([x, y]) => `radial-gradient(circle at ${x}px ${y}px, rgba(0, 229, 255, 0.15) 0%, transparent 60%)`),
        }}
      />

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="flex justify-end">
          <button
            onClick={(e) => { e.stopPropagation(); onExpand(); }}
            className="w-10 h-10 rounded-full bg-midnight-black/60 border border-glass-border flex items-center justify-center text-quantum-silver hover:text-white hover:border-ai-cyan transition-all opacity-0 group-hover:opacity-100 shadow-lg backdrop-blur-sm"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-auto">
          <h3 className="text-xl mb-1 font-bold text-white">{member.name}</h3>
          <p className="text-ai-cyan font-mono text-xs uppercase tracking-wider mb-4">{member.role}</p>

          <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hidden group-hover:block">
              <p className="text-quantum-silver text-sm leading-relaxed mb-4">{member.desc}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-4 pt-4 border-t border-glass-border opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-glass-border flex items-center justify-center text-quantum-silver hover:text-white hover:border-blue-500 transition-all">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-glass-border flex items-center justify-center text-quantum-silver hover:text-white hover:border-gray-300 transition-all">
              <Twitter className="w-4 h-4" />
            </a>
            {member.github && (
              <a href={member.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-glass-border flex items-center justify-center text-quantum-silver hover:text-white hover:border-purple-500 transition-all">
                <GithubIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="h-[340px] max-w-[340px] shrink-0 p-8 rounded-2xl bg-midnight-black/40 border border-glass-border animate-pulse flex flex-col justify-end">
     <div className="h-6 w-3/4 bg-white/5 rounded mb-3" />
     <div className="h-4 w-1/2 bg-white/5 rounded" />
  </div>
);

export default function LeadershipSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate network request for perceived performance enhancement
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);
  
  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 350;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="leadership-section py-32 px-6 relative z-10 bg-deep-charcoal border-t border-glass-border">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_bottom,rgba(0,229,255,0.1),transparent_70%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">The Executives and Their Track Record</h2>
            <p className="text-xl text-quantum-silver font-light">
              The visionaries and innovators architecting the future of enterprise intelligence.
            </p>
          </div>
          
          <div className="flex gap-4">
            <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full border border-glass-border flex items-center justify-center text-white hover:bg-white/5 transition-colors">
               <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full border border-glass-border flex items-center justify-center text-white hover:bg-white/5 transition-colors bg-white/5">
               <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative w-full">
           <AnimatePresence>
             {expandedIndex !== null && (
                <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   onClick={() => setExpandedIndex(null)}
                   className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-start justify-center pt-20 pb-8 overflow-y-auto"
                >
                   <div onClick={e => e.stopPropagation()}>
                     <LeadershipCard 
                        member={leadershipData[expandedIndex]} 
                        isExpanded={true} 
                        onClose={() => setExpandedIndex(null)} 
                     />
                   </div>
                </motion.div>
             )}
           </AnimatePresence>

           <div 
             ref={carouselRef}
             className="flex gap-6 overflow-x-auto pb-8 snap-x hide-scrollbar"
             style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
           >
             {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                   <div key={`skeleton-${i}`} className="snap-start"><SkeletonCard /></div>
                ))
             ) : (
                leadershipData.map((member, idx) => (
                   <div key={idx} className="snap-start shadow-xl">
                     <LeadershipCard 
                        member={member} 
                        isExpanded={false}
                        onExpand={() => setExpandedIndex(idx)} 
                     />
                   </div>
                ))
             )}
           </div>
        </div>
      </div>
    </section>
  );
}
