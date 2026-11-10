import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function SEO() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Core Meta Definitions
    let title = "NeuroGrowth Labs | Sovereign AI Infrastructure & Enterprise Solutions";
    let description = "Premier sovereign AI infrastructure and enterprise applied intelligence ecosystem in Africa. We build robust, secure, and customizable machine learning platforms.";
    let keywords = "Sovereign AI, Africa AI, NeuroGrowth Labs, AI Infrastructure, Enterprise Machine Learning, Secure LLMs, National Data Infrastructure, Applied Intelligence";
    let type = "website";
    const pageImage = "https://neurogrowthlabs.com/favicon.svg";

    const baseUrl = "https://neurogrowthlabs.com";
    const canonicalUrl = `${baseUrl}${pathname === '/' ? '' : pathname}`;

    // Schema arrays
    const schemas: any[] = [];

    // Core organization schema (included on all pages for robust local & brand search ranking)
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "GovernmentBenefitsService",
      "additionalType": "ProfessionalService",
      "@id": `${baseUrl}/#organization`,
      "name": "NeuroGrowth Labs",
      "url": baseUrl,
      "logo": pageImage,
      "image": pageImage,
      "description": "Sovereign AI infrastructure and applied intelligence ecosystem powering digital transformation.",
      "sameAs": [
        "https://www.linkedin.com/company/neurogrowthlabs/",
        "https://x.com/neurogrowthlabs",
        "https://www.youtube.com/@neurogrowthlabs"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "partners@neurogrowthlabs.com",
        "availableLanguage": ["en"]
      }
    };
    schemas.push(orgSchema);

    // Route-specific customizations for titles, metas, and schemas
    switch (pathname) {
      case '/':
        title = "NeuroGrowth Labs | Sovereign AI Infrastructure & Enterprise Solutions";
        description = "Premier sovereign AI infrastructure and enterprise applied intelligence ecosystem in Africa. We build robust, secure, and customizable machine learning platforms.";
        keywords = "Sovereign AI Africa, NeuroGrowth Labs, Enterprise AI Platforms, Autonomous Agent Systems, National AI Strategy, Deep Learning Solutions";
        
        // FAQ Schema aligned with actual FAQ section elements on Home screen
        const faqSchema = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is NeuroGrowth Labs?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "NeuroGrowth Labs is a premier AI infrastructure and applied intelligence ecosystem. We specialize in developing sovereign AI platforms, enterprise machine learning solutions, and secure data infrastructures."
              }
            },
            {
              "@type": "Question",
              "name": "How can I partner with NeuroGrowth Labs?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We partner with governments, enterprises, and institutions globally. You can reach out to us via our Contact page or Partnership Portal to initiate discussions."
              }
            },
            {
              "@type": "Question",
              "name": "Are your AI solutions customizable?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our enterprise AI architectures and autonomous agents are highly customizable and designed to integrate seamlessly into your existing workflows and secure environments."
              }
            },
            {
              "@type": "Question",
              "name": "Where are you located?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We operate globally with a strong focus on empowering digital transformation across Africa. We deploy cloud-native and edge-based infrastructures scalable worldwide."
              }
            }
          ]
        };
        schemas.push(faqSchema);
        break;

      case '/about':
        title = "About NeuroGrowth Labs | Our Mission & AI Leadership";
        description = "Learn about our mission to democratize sovereign AI infrastructure in Africa. Meet our leadership team, explore our research, and discover our core technology principles.";
        keywords = "NeuroGrowth Labs Team, AI Leadership Africa, Francis Matsoso, Sovereign Computing Mission, Applied Research Africa";
        break;

      case '/platforms':
        title = "Enterprise AI Platforms & Sovereign Solutions | NeuroGrowth Labs";
        description = "Explore our state-of-the-art sovereign AI computing platforms, secure multi-tenant data storage, and scalable high-performance LLM deployment engines.";
        keywords = "AI Compute Engines, Sovereign Data Storage, Custom LLM Deployments, Secure Multi-tenant cloud, NeuroGrowth Infrastructure";
        
        // Software application schema for better search placement
        const softwareSchema = {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "NeuroGrowth Sovereign AI Platform",
          "operatingSystem": "Linux, Cloud, Edge",
          "applicationCategory": "BusinessApplication, AIPlatform",
          "offers": {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD"
          }
        };
        schemas.push(softwareSchema);
        break;

      case '/partner':
        title = "Partner with NeuroGrowth Labs | Join the Africa AI Ecosystem";
        description = "Accelerate digital transformation by partnering with NeuroGrowth Labs. We collaborate with national governments, global enterprises, and elite research hubs.";
        keywords = "AI Partnerships Africa, Joint Ventures AI, National Infrastructure Collaborations, Sovereign Tech Integration";
        break;

      case '/careers':
        title = "Careers at NeuroGrowth Labs | Shape the Future of AI";
        description = "Join a team of elite AI researchers, deep learning engineers, and software architects designing high-impact sovereign machine learning infrastructure.";
        keywords = "AI Jobs Africa, Deep Learning Careers, Neural Network Research Jobs, Machine Learning Infrastructure Engineering";
        break;

      case '/contact':
        title = "Contact NeuroGrowth Labs | Secure AI Consultation";
        description = "Get in touch with our enterprise advisory team. Request a demo, discuss secure on-premises AI deployment, or schedule custom integration workshops.";
        keywords = "Contact NeuroGrowth Labs, AI Advisory Consultation, Request Enterprise Demo, Secure AI Workshops";
        break;

      case '/privacy-policy':
        title = "Privacy Policy | NeuroGrowth Labs";
        description = "Our privacy commitments, user data protection protocols, and secure storage compliance details.";
        break;

      case '/terms-of-service':
        title = "Terms of Service | NeuroGrowth Labs";
        description = "Terms, conditions, and standard business governance guidelines for using NeuroGrowth Labs services.";
        break;

      case '/ai-ethics':
        title = "AI Ethics & Responsible Innovation | NeuroGrowth Labs";
        description = "Our foundational principles on responsible artificial intelligence, model bias mitigation, data sovereignty, and secure deployment frameworks.";
        break;

      case '/cookie-policy':
        title = "Cookie Policy | NeuroGrowth Labs";
        description = "How we utilize browser storage, session cookies, and persistent cookies for securing and optimizing user experiences.";
        break;

      case '/dpa':
        title = "Data Processing Addendum (DPA) | NeuroGrowth Labs";
        description = "Our enterprise-grade data processing specifications, compliance agreements, and security operations commitments.";
        break;

      case '/security-policy':
        title = "Security Policy | NeuroGrowth Labs";
        description = "Discover our multi-layered cybersecurity architectures, secure container deployments, and zero-trust data storage rules.";
        break;

      case '/webinar':
        title = "Sovereign AI Infrastructure Webinars & Programs | NeuroGrowth Labs";
        description = "Join NeuroGrowth Labs' exclusive live virtual webinars on high-performance sovereign AI compute, liquidity bridge protocols, and secure LLM distribution.";
        keywords = "Sovereign AI Webinars, AI Infrastructure Seminars, Enterprise Machine Learning Programs, National Computing Stacks, Pan-African Tech Summit";
        
        // Structured JSON-LD Event Schema for search-discoverable webinars
        const webinarEventSchema = {
          "@context": "https://schema.org",
          "@type": "Event",
          "name": "Sovereign AI Infrastructure Masterclass Series",
          "description": "Unlock high-fidelity national compute architectures and secure multi-tenant model distribution frameworks. Led by NeuroGrowth Labs systems architects.",
          "startDate": "2026-07-15T15:00:00+02:00",
          "endDate": "2026-07-15T16:30:00+02:00",
          "eventStatus": "https://schema.org/EventScheduled",
          "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
          "location": {
            "@type": "VirtualLocation",
            "url": "https://neurogrowthlabs.com/webinar"
          },
          "image": [
            "https://neurogrowthlabs.com/favicon.svg"
          ],
          "offers": {
            "@type": "Offer",
            "url": "https://neurogrowthlabs.com/webinar",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "validFrom": "2026-07-01T00:00:00Z"
          },
          "performer": {
            "@type": "Organization",
            "name": "NeuroGrowth Labs Research Division"
          },
          "organizer": {
            "@type": "Organization",
            "name": "NeuroGrowth Labs",
            "url": "https://neurogrowthlabs.com"
          }
        };
        schemas.push(webinarEventSchema);
        break;

      case '/academy':
      case '/courses':
      case '/research':
        title = "Cybersecurity & AI Academy | 5 Free Courses & Research Papers | NeuroGrowth Labs";
        description = "Enroll in 5 tuition-free courses on Cybersecurity & Defensive AI with autogenerated Certificates of Completion, plus 5 downloadable peer-reviewed research papers on AI in Africa.";
        keywords = "Cybersecurity Courses Africa, Free AI Courses, Certificate of Completion, Defensive AI, AI in Africa Research, Sovereign AI Academy, Neurogrowth Labs Academy";
        
        const academyCourseSchema = {
          "@context": "https://schema.org",
          "@type": "Course",
          "name": "Pan-African Cybersecurity and Defensive AI Academy",
          "description": "Tuition-free accredited courses on Defensive AI, Zero Trust Architecture, Adversarial Machine Learning, Cyber Threat Intelligence, and Ethical AI Governance in Africa.",
          "provider": {
            "@type": "Organization",
            "name": "Neurogrowth Labs",
            "sameAs": "https://neurogrowthlabs.com"
          },
          "offers": {
            "@type": "Offer",
            "category": "Free",
            "price": "0.00",
            "priceCurrency": "USD"
          },
          "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "Online",
            "courseWorkload": "PT4H"
          }
        };
        schemas.push(academyCourseSchema);
        break;

      default:
        break;
    }

    // 2. DOM Updates
    document.title = title;

    // Helper to find or create meta tag
    const setMetaTag = (attributeName: string, attributeValue: string, contentValue: string) => {
      let meta = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attributeName, attributeValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', contentValue);
    };

    // Meta Standard tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);

    // OpenGraph Protocol tags (Highly essential for Rich Social Media Link Previews)
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', pageImage);
    setMetaTag('property', 'og:site_name', 'NeuroGrowth Labs');

    // Twitter Cards tags (Rich preview optimization on Twitter/X)
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', pageImage);

    // Robots Tag (instruct search engines to aggressively crawl and feature media cards)
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // Canonical link setup
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // 3. Inject Structured Schema JSON-LD blocks
    // Clear out any old dynamic scripts to avoid stacking scripts on SPA route traversal
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"].seo-jsonld');
    existingScripts.forEach(script => script.remove());

    // Populate head with fresh page-specific schema structures
    schemas.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.className = 'seo-jsonld';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });

  }, [pathname]);

  return null;
}
