import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EmailNotificationRecord, getStoredEmailNotifications, 
  dispatchSendGridEmail, sendCourseEnrollmentNotification, sendCertificateReadyNotification 
} from '../../services/emailNotificationService';
import { 
  Mail, X, CheckCircle, RefreshCw, Send, ExternalLink, 
  Eye, Clock, ShieldCheck, Award, BookOpen, AlertCircle, Copy, Check
} from 'lucide-react';

interface EmailNotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { uid?: string; id?: string; email?: string; displayName?: string } | null;
}

export default function EmailNotificationCenterModal({
  isOpen,
  onClose,
  currentUser
}: EmailNotificationCenterModalProps) {
  const [notifications, setNotifications] = useState<EmailNotificationRecord[]>(() => 
    getStoredEmailNotifications(currentUser?.uid || currentUser?.email)
  );
  const [selectedNotification, setSelectedNotification] = useState<EmailNotificationRecord | null>(
    notifications[0] || null
  );
  const [activeViewMode, setActiveViewMode] = useState<'html' | 'text'>('html');
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Test send state
  const [testEmailAddress, setTestEmailAddress] = useState(currentUser?.email || 'learner@neurogrowthlabs.co.za');
  const [isSendingTest, setIsSendingTest] = useState(false);

  if (!isOpen) return null;

  const refreshList = () => {
    const list = getStoredEmailNotifications(currentUser?.uid || currentUser?.email);
    setNotifications(list);
    if (!selectedNotification && list.length > 0) {
      setSelectedNotification(list[0]);
    }
  };

  const handleResend = async (notif: EmailNotificationRecord) => {
    setIsResending(true);
    setResendStatus(null);
    try {
      const resent = await dispatchSendGridEmail({
        toEmail: notif.userEmail,
        toName: notif.userName,
        subject: notif.subject,
        htmlContent: notif.htmlContent,
        textContent: notif.textContent,
        type: notif.type,
        courseId: notif.courseId,
        courseCode: notif.courseCode,
        courseTitle: notif.courseTitle,
        certificateId: notif.certificateId,
        verificationCode: notif.verificationCode,
        userId: notif.userId
      });
      refreshList();
      setSelectedNotification(resent);
      setResendStatus(`Email successfully re-dispatched to ${notif.userEmail}!`);
      setTimeout(() => setResendStatus(null), 4000);
    } catch (err: any) {
      setResendStatus(`Error sending email: ${err?.message || 'Failed'}`);
    } finally {
      setIsResending(false);
    }
  };

  const handleSendTestEnrollment = async () => {
    if (!testEmailAddress.trim()) return;
    setIsSendingTest(true);
    try {
      const sent = await sendCourseEnrollmentNotification({
        user: {
          email: testEmailAddress.trim(),
          displayName: currentUser?.displayName || 'Dr. Alex Vance',
          uid: currentUser?.uid || 'test-user-id'
        },
        course: {
          id: 'cyber-ai-101',
          code: 'CYBER-AI 101',
          title: 'Defensive AI & Autonomous Threat Detection in African Enterprise Networks',
          track: 'Defensive AI',
          difficultyLevel: 'Intermediate',
          duration: '6 Weeks (Self-Paced)'
        }
      });
      refreshList();
      setSelectedNotification(sent);
      setResendStatus(`Test enrollment email sent to ${testEmailAddress}!`);
      setTimeout(() => setResendStatus(null), 4000);
    } catch (err: any) {
      setResendStatus(`Failed: ${err?.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendTestCertificate = async () => {
    if (!testEmailAddress.trim()) return;
    setIsSendingTest(true);
    try {
      const randomCode = Math.random().toString(16).substring(2, 10).toUpperCase();
      const sent = await sendCertificateReadyNotification({
        user: {
          email: testEmailAddress.trim(),
          displayName: currentUser?.displayName || 'Dr. Alex Vance',
          uid: currentUser?.uid || 'test-user-id'
        },
        course: {
          id: 'cyber-ai-204',
          code: 'CYBER-AI 204',
          title: 'Adversarial Machine Learning, Evasion Attacks & Certified Robustness'
        },
        certificateId: `NGL-CERT-204-2026-${randomCode.slice(0, 5)}`,
        verificationCode: randomCode,
        issuedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        grade: 'Pass with Honors (88% Capstone)'
      });
      refreshList();
      setSelectedNotification(sent);
      setResendStatus(`Test certificate email sent to ${testEmailAddress}!`);
      setTimeout(() => setResendStatus(null), 4000);
    } catch (err: any) {
      setResendStatus(`Failed: ${err?.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-5xl bg-[#0d121c] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-10 my-4 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[#090d15] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ai-cyan/15 border border-ai-cyan/30 flex items-center justify-center text-ai-cyan shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="text-ai-cyan font-bold">SENDGRID v3 MAIL DISPATCH</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-semibold">Active Integration</span>
                </div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Transactional Email Alerts & Delivery Logs
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader banner info */}
          <div className="px-5 py-2.5 bg-gradient-to-r from-ai-cyan/10 via-transparent to-amber-500/10 border-b border-white/10 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Automated alerts dispatched when users <strong>enroll in courses</strong> or when <strong>certificates are ready</strong>.
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-400">
              Sender: <span className="text-white">academy@neurogrowthlabs.co.za</span>
            </div>
          </div>

          {/* Content Split: Left List / Right Preview */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
            {/* Left: Notifications List + Test Dispatcher */}
            <div className="md:col-span-5 border-r border-white/10 bg-[#090d15] flex flex-col max-h-[580px] overflow-hidden">
              <div className="p-3 border-b border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono font-semibold uppercase">
                  Sent Emails ({notifications.length})
                </span>
                <button
                  onClick={refreshList}
                  className="p-1 hover:text-white transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Emails List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-12 px-4 text-center text-slate-500 text-xs">
                    <Mail className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p>No email notifications dispatched yet.</p>
                    <p className="mt-1 text-slate-400">
                      Enroll in any course or complete a final exam to trigger automatic SendGrid alerts, or use the test tools below.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isSelected = selectedNotification?.id === notif.id;
                    const isCert = notif.type === 'certificate';
                    return (
                      <button
                        key={notif.id}
                        onClick={() => setSelectedNotification(notif)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-white/10 border-ai-cyan shadow-sm'
                            : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                              isCert
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-ai-cyan/20 text-ai-cyan border border-ai-cyan/30'
                            }`}
                          >
                            {isCert ? <Award className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                            <span>{isCert ? 'Certificate' : 'Enrollment'}</span>
                          </span>

                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(notif.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-white truncate mb-1">
                          {notif.subject}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span className="truncate max-w-[160px]">{notif.userEmail}</span>
                          <span className="text-emerald-400 text-[10px] flex items-center gap-0.5">
                            <CheckCircle className="w-3 h-3" />
                            <span>{notif.status === 'delivered' ? 'SendGrid 202' : 'Dispatched'}</span>
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Quick Test Sender Box */}
              <div className="p-3 bg-white/[0.03] border-t border-white/10 space-y-2">
                <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>SendGrid Test Delivery</span>
                  <span className="font-mono text-[10px] text-ai-cyan">Live Trigger</span>
                </div>
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-ai-cyan"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleSendTestEnrollment}
                    disabled={isSendingTest}
                    className="px-2 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <BookOpen className="w-3 h-3 text-ai-cyan" />
                    <span>Send Enroll Alert</span>
                  </button>
                  <button
                    onClick={handleSendTestCertificate}
                    disabled={isSendingTest}
                    className="px-2 py-1.5 rounded-md bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#c5a059] border border-[#c5a059]/40 text-[11px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <Award className="w-3 h-3" />
                    <span>Send Cert Alert</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Detailed Email Preview Viewer */}
            <div className="md:col-span-7 flex flex-col bg-[#0b0f17] max-h-[580px] overflow-hidden">
              {selectedNotification ? (
                <>
                  {/* Email Viewer Header */}
                  <div className="p-4 bg-[#090d15] border-b border-white/10 space-y-2">
                    {resendStatus && (
                      <div className="p-2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{resendStatus}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs font-mono text-slate-400">
                        To: <strong className="text-white">{selectedNotification.userName}</strong> &lt;{selectedNotification.userEmail}&gt;
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle view mode */}
                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-md p-0.5 text-xs">
                          <button
                            onClick={() => setActiveViewMode('html')}
                            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                              activeViewMode === 'html' ? 'bg-ai-cyan text-midnight-black font-bold' : 'text-slate-400'
                            }`}
                          >
                            HTML Preview
                          </button>
                          <button
                            onClick={() => setActiveViewMode('text')}
                            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                              activeViewMode === 'text' ? 'bg-ai-cyan text-midnight-black font-bold' : 'text-slate-400'
                            }`}
                          >
                            Plain Text
                          </button>
                        </div>

                        {/* Re-send button */}
                        <button
                          onClick={() => handleResend(selectedNotification)}
                          disabled={isResending}
                          className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          <Send className="w-3 h-3" />
                          <span>{isResending ? 'Sending...' : 'Resend'}</span>
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {selectedNotification.subject}
                    </h3>
                  </div>

                  {/* Rendered View */}
                  <div className="flex-1 overflow-y-auto p-4 bg-[#080b11]">
                    {activeViewMode === 'html' ? (
                      <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0d121c] shadow-lg">
                        <iframe
                          title="Email Preview"
                          srcDoc={selectedNotification.htmlContent}
                          className="w-full h-[410px] border-none bg-[#080b11]"
                          sandbox="allow-same-origin allow-popups"
                        />
                      </div>
                    ) : (
                      <pre className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed h-[410px] overflow-y-auto">
                        {selectedNotification.textContent}
                      </pre>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <Mail className="w-12 h-12 mb-3 text-slate-600" />
                  <p className="text-sm font-medium text-slate-400">Select an email to view its rendered template</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Emails are generated dynamically with responsive HTML layouts, SendGrid delivery headers, and verified links.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
