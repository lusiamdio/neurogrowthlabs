import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/sections/Footer';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-graphite-grey text-white selection:bg-electric-blue/30 selection:text-electric-blue font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-graphite-grey/80 backdrop-blur-md border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-quantum-silver hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Privacy Policy</h1>
          
          <div className="prose prose-invert prose-lg max-w-none text-quantum-silver">
            <p className="font-semibold text-white">Neurogrowth Labs</p>
            <p><strong>Effective Date:</strong> 21st January 2024<br/>
            <strong>Last Updated:</strong> 15th March 2026</p>

            <p>Neurogrowth Labs ("Neurogrowth Labs", "we", "us", or "our") is committed to protecting your privacy and ensuring transparency in how we collect, use, and safeguard your information.</p>

            <p>This Privacy Policy explains how Neurogrowth Labs collects, uses, processes, and protects personal information when you access or use our website, products, services, platforms, research technologies, and applications (collectively, the “Services”).</p>

            <p>By accessing or using our Services, you agree to the practices described in this Privacy Policy.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">1. Information We Collect</h2>
            <p>We collect information to provide, improve, and secure our Services.</p>

            <h3 className="text-xl font-medium text-white mt-8 mb-4">1.1 Information You Provide</h3>
            <p>You may provide information to us when you:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>Create an account</li>
              <li>Contact us</li>
              <li>Subscribe to newsletters</li>
              <li>Apply for partnerships or careers</li>
              <li>Participate in research or programs</li>
              <li>Use our AI tools and services</li>
            </ul>
            <p>This information may include:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Company or organization</li>
              <li>Professional information</li>
              <li>Account credentials</li>
              <li>Communication content</li>
            </ul>

            <h3 className="text-xl font-medium text-white mt-8 mb-4">1.2 Information Collected Automatically</h3>
            <p>When you visit the Neurogrowth Labs website, we may automatically collect technical information including:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>IP address</li>
              <li>Device type</li>
              <li>Browser type</li>
              <li>Operating system</li>
              <li>Pages visited</li>
              <li>Time spent on pages</li>
              <li>Referring URLs</li>
              <li>Interaction with website features</li>
            </ul>
            <p>We may use cookies and similar technologies to collect this information.</p>

            <h3 className="text-xl font-medium text-white mt-8 mb-4">1.3 Information From Third Parties</h3>
            <p>We may receive information from third-party sources, including:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>analytics providers</li>
              <li>cloud service providers</li>
              <li>business partners</li>
              <li>marketing platforms</li>
            </ul>
            <p>This information helps us improve our Services and user experience.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">2. How We Use Your Information</h2>
            <p>Neurogrowth Labs uses collected information to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>Provide and operate our Services</li>
              <li>Improve and develop new technologies</li>
              <li>Personalize user experience</li>
              <li>Conduct research and innovation in artificial intelligence</li>
              <li>Communicate updates and announcements</li>
              <li>Provide customer support</li>
              <li>Detect and prevent fraud or security incidents</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">3. Artificial Intelligence & Research</h2>
            <p>As an AI research and technology organization, Neurogrowth Labs may use certain data to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>train artificial intelligence models</li>
              <li>improve machine learning systems</li>
              <li>conduct technology research</li>
              <li>analyze system performance</li>
            </ul>
            <p>Where possible, we apply data minimization, anonymization, and aggregation techniques to protect user privacy.</p>
            <p>We do not intentionally collect personal data for AI training unless permitted by law or user consent.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">4. Cookies and Tracking Technologies</h2>
            <p>Neurogrowth Labs uses cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>enable core website functionality</li>
              <li>analyze website traffic</li>
              <li>improve performance and security</li>
              <li>personalize user experience</li>
            </ul>
            <p>Types of cookies we may use include:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>essential cookies</li>
              <li>analytics cookies</li>
              <li>functionality cookies</li>
              <li>security cookies</li>
            </ul>
            <p>Users may control cookie preferences through their browser settings.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">5. How We Share Information</h2>
            <p>Neurogrowth Labs does not sell personal data.</p>
            <p>We may share information only in the following situations:</p>
            
            <h3 className="text-xl font-medium text-white mt-8 mb-4">Service Providers</h3>
            <p>We may share data with trusted service providers who assist with:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>cloud hosting</li>
              <li>analytics</li>
              <li>infrastructure management</li>
              <li>customer support</li>
            </ul>
            <p>These providers are required to maintain strict confidentiality.</p>

            <h3 className="text-xl font-medium text-white mt-8 mb-4">Legal Requirements</h3>
            <p>We may disclose information when required to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>comply with legal obligations</li>
              <li>respond to lawful requests</li>
              <li>enforce our terms of service</li>
              <li>protect the safety and rights of users</li>
            </ul>

            <h3 className="text-xl font-medium text-white mt-8 mb-4">Business Transfers</h3>
            <p>If Neurogrowth Labs undergoes a merger, acquisition, restructuring, or asset sale, user information may be transferred as part of the transaction.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">6. Data Security</h2>
            <p>Neurogrowth Labs uses industry-standard security measures to protect information.</p>
            <p>These include:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>encryption technologies</li>
              <li>secure cloud infrastructure</li>
              <li>access control systems</li>
              <li>monitoring and intrusion detection</li>
              <li>secure data storage</li>
            </ul>
            <p>While we implement strong safeguards, no online system can guarantee absolute security.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">7. Data Retention</h2>
            <p>We retain personal information only for as long as necessary to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>provide our Services</li>
              <li>comply with legal obligations</li>
              <li>resolve disputes</li>
              <li>enforce agreements</li>
            </ul>
            <p>Retention periods vary depending on the nature of the data and legal requirements.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">8. International Data Transfers</h2>
            <p>Neurogrowth Labs operates globally.</p>
            <p>Your information may be transferred to and processed in countries outside your jurisdiction.</p>
            <p>Where required, we implement appropriate safeguards to ensure data protection consistent with international privacy standards.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">9. Your Privacy Rights</h2>
            <p>Depending on your location, you may have certain rights regarding your personal data, including the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>access your personal data</li>
              <li>correct inaccurate information</li>
              <li>request deletion of data</li>
              <li>restrict or object to processing</li>
              <li>request data portability</li>
              <li>withdraw consent where applicable</li>
            </ul>
            <p>To exercise these rights, please contact us using the information provided below.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">10. Children's Privacy</h2>
            <p>Neurogrowth Labs Services are not directed to children under the age of 13.</p>
            <p>We do not knowingly collect personal information from children.</p>
            <p>If we become aware that such information has been collected, we will take steps to delete it promptly.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">11. Third-Party Links</h2>
            <p>Our Services may contain links to external websites or services not operated by Neurogrowth Labs.</p>
            <p>We are not responsible for the privacy practices of those third parties.</p>
            <p>Users are encouraged to review the privacy policies of external websites.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">12. Changes to This Privacy Policy</h2>
            <p>Neurogrowth Labs may update this Privacy Policy periodically to reflect changes in:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>legal requirements</li>
              <li>technology practices</li>
              <li>company operations</li>
            </ul>
            <p>When updates occur, we will revise the Last Updated date at the top of this page.</p>
            <p>Users are encouraged to review this policy regularly.</p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">13. Contact Us</h2>
            <p>If you have questions, requests, or concerns about this Privacy Policy or how your information is handled, please contact us:</p>
            <p className="mt-4">
              <strong>Neurogrowth Labs</strong><br/>
              Email: privacy@neurogrowthlabs.com<br/>
              Website: www.neurogrowthlabs.com
            </p>

            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">14. Global Compliance</h2>
            <p>This Privacy Policy is designed to align with major international privacy regulations including:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>General Data Protection Regulation (GDPR)</li>
              <li>California Consumer Privacy Act (CCPA)</li>
              <li>international data protection standards</li>
            </ul>
            <p>Neurogrowth Labs is committed to responsible and ethical data practices.</p>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
