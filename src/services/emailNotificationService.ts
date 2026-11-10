/**
 * Neurogrowth Labs Academy - Transactional Email Notification Service
 * Integrates with SendGrid v3 Mail Send API for real-time alerts on:
 * 1. Course Enrollment Confirmations
 * 2. Certificate of Completion Issuance & Verification
 */

import { db, auth } from '../firebase';
import { collection, doc, setDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

export interface EmailNotificationRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: 'enrollment' | 'certificate';
  subject: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  certificateId?: string;
  verificationCode?: string;
  sentAt: string;
  status: 'delivered' | 'simulated' | 'failed';
  provider: 'SendGrid v3';
  htmlContent: string;
  textContent: string;
  read: boolean;
}

const STORAGE_KEY = 'ngl_email_notifications';
const SENDER_EMAIL = 'academy@neurogrowthlabs.co.za';
const SENDER_NAME = 'Neurogrowth Labs Sovereign Academy';

// Read all stored notifications from localStorage
export function getStoredEmailNotifications(userId?: string): EmailNotificationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: EmailNotificationRecord[] = JSON.parse(raw);
    if (userId) {
      return list.filter(n => n.userId === userId || n.userEmail === userId);
    }
    return list;
  } catch (err) {
    console.warn('Failed to parse email notifications from storage:', err);
    return [];
  }
}

// Save notification to storage and dispatch event
function saveNotification(record: EmailNotificationRecord) {
  try {
    const list = getStoredEmailNotifications();
    const updated = [record, ...list.filter(n => n.id !== record.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('ngl_email_sent', { detail: record }));
  } catch (err) {
    console.warn('Could not save notification to localStorage:', err);
  }

  // Sync to Firestore if authenticated & db is available
  try {
    if (auth.currentUser && db) {
      const colRef = collection(db, 'email_notifications');
      const docRef = doc(colRef, record.id);
      setDoc(docRef, {
        ...record,
        syncedAt: new Date().toISOString()
      }).catch(err => {
        // Tolerant of Firestore offline mode
        console.info('Firestore notification sync deferred (offline/cached):', err?.message);
      });
    }
  } catch (err) {
    // Non-blocking
  }
}

/**
 * Generate Responsive HTML Email for Course Enrollment
 */
export function buildEnrollmentEmailHtml(params: {
  userName: string;
  userEmail: string;
  courseCode: string;
  courseTitle: string;
  track: string;
  difficultyLevel: string;
  duration: string;
  courseUrl: string;
}): string {
  const { userName, courseCode, courseTitle, track, difficultyLevel, duration, courseUrl } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enrollment Confirmed: ${courseCode}</title>
</head>
<body style="margin:0;padding:0;background-color:#080b11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f1f5f9;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#080b11;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#0d121c;border:1px solid rgba(255,255,255,0.12);border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.6);">
          <!-- Header Bar -->
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(135deg,#0c1322 0%,#111c30 100%);border-bottom:1px solid rgba(0,229,255,0.2);">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-family:monospace;font-size:11px;letter-spacing:2px;color:#00e5ff;text-transform:uppercase;font-weight:700;">
                      NEUROGROWTH LABS · SOVEREIGN ACADEMY
                    </div>
                    <h1 style="margin:8px 0 0;font-size:22px;color:#ffffff;font-weight:700;letter-spacing:-0.5px;">
                      🎓 Course Enrollment Confirmed
                    </h1>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;padding:4px 10px;background:rgba(0,229,255,0.12);border:1px solid rgba(0,229,255,0.3);border-radius:20px;color:#00e5ff;font-size:11px;font-family:monospace;font-weight:600;">
                      100% FREE
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:24px;color:#cbd5e1;">
                Dear <strong style="color:#ffffff;">${userName}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:14px;line-height:22px;color:#94a3b8;">
                Welcome to your new masterclass track. Your enrollment has been successfully recorded in the Sovereign Academy catalog. You now have full lifetime access to interactive sandbox modules, video masterclasses, and the accredited Capstone Exam.
              </p>

              <!-- Course Overview Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#090d15;border:1px solid rgba(255,255,255,0.08);border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px;">
                    <div style="font-family:monospace;font-size:12px;color:#00e5ff;font-weight:700;margin-bottom:6px;">
                      ${courseCode} · ${track} · ${difficultyLevel}
                    </div>
                    <div style="font-size:17px;font-weight:700;color:#ffffff;line-height:24px;margin-bottom:12px;">
                      ${courseTitle}
                    </div>
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size:12px;color:#94a3b8;">
                      <tr>
                        <td style="padding:4px 0;"><strong>Estimated Effort:</strong> ${duration}</td>
                        <td style="padding:4px 0;"><strong>Accreditation:</strong> Verified Certificate</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;"><strong>Faculty Lead:</strong> Mr. Lusimanadio Soki Simao, MBA</td>
                        <td style="padding:4px 0;"><strong>Passing Threshold:</strong> 70% Capstone Mark</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Roadmap Steps -->
              <div style="margin-bottom:28px;">
                <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">
                  Your Learning Pathway
                </h3>
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size:13px;color:#cbd5e1;line-height:20px;">
                  <tr>
                    <td style="padding:6px 0;width:24px;color:#00e5ff;font-weight:700;">1.</td>
                    <td style="padding:6px 0;"><strong>Complete 4 Interactive Modules:</strong> Architecture analysis, eBPF telemetry, and attack tree simulations.</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;width:24px;color:#00e5ff;font-weight:700;">2.</td>
                    <td style="padding:6px 0;"><strong>Watch 5 Curated Video Masterclasses:</strong> Keynote lectures from MIT, Stanford, SANS, and Black Hat.</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;width:24px;color:#00e5ff;font-weight:700;">3.</td>
                    <td style="padding:6px 0;"><strong>Pass the Final Capstone Exam:</strong> Achieve 70% or higher to automatically mint your official Certificate.</td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:28px 0;">
                <tr>
                  <td align="center" style="border-radius:10px;background:#00e5ff;">
                    <a href="${courseUrl}" target="_blank" style="font-size:14px;font-weight:700;color:#080b11;text-decoration:none;padding:14px 28px;display:inline-block;letter-spacing:0.3px;border-radius:10px;">
                      Launch Course Workspace &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:12px;line-height:18px;color:#64748b;border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;">
                Neurogrowth Labs · Cyber-Physical Intelligence & AI Systems Directorate<br>
                For questions or verification support, contact academy@neurogrowthlabs.co.za
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generate Responsive HTML Email for Certificate Issuance
 */
export function buildCertificateReadyEmailHtml(params: {
  userName: string;
  userEmail: string;
  courseCode: string;
  courseTitle: string;
  certificateId: string;
  verificationCode: string;
  issuedDate: string;
  grade: string;
  certificateUrl: string;
}): string {
  const { userName, courseCode, courseTitle, certificateId, verificationCode, issuedDate, grade, certificateUrl } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate Ready: ${courseCode}</title>
</head>
<body style="margin:0;padding:0;background-color:#080b11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f1f5f9;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#080b11;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#0d121c;border:1px solid rgba(197,160,89,0.3);border-radius:16px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.7);">
          <!-- Gold Guilloche Banner -->
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(135deg,#131926 0%,#1c1822 50%,#151922 100%);border-bottom:2px solid #c5a059;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-family:monospace;font-size:11px;letter-spacing:2px;color:#c5a059;text-transform:uppercase;font-weight:700;">
                      OFFICIAL ACCREDITATION · NEUROGROWTH LABS
                    </div>
                    <h1 style="margin:8px 0 0;font-size:24px;color:#ffffff;font-weight:700;letter-spacing:-0.5px;">
                      🏆 Certificate of Completion Ready
                    </h1>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;width:48px;height:48px;line-height:48px;border:2px solid #c5a059;border-radius:50%;text-align:center;font-size:22px;background:rgba(197,160,89,0.1);">
                      🥇
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:24px;color:#cbd5e1;">
                Congratulations, <strong style="color:#ffffff;">${userName}</strong>!
              </p>
              <p style="margin:0 0 24px;font-size:14px;line-height:22px;color:#94a3b8;">
                You have successfully met all curriculum requirements and achieved a passing score on the rigorous Capstone Assessment. Your official Sovereign Credential has been issued and cryptographically verified on the Neurogrowth Labs Academic Registry.
              </p>

              <!-- Certificate Credential Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#090d15;border:1px solid #c5a059;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px;">
                    <div style="font-family:monospace;font-size:11px;color:#c5a059;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px;">
                      SOVEREIGN CREDENTIAL RECIPIENT
                    </div>
                    <div style="font-size:20px;font-weight:700;color:#ffffff;font-family:'Georgia',serif;margin-bottom:12px;">
                      ${userName}
                    </div>
                    <div style="font-size:15px;color:#00e5ff;font-weight:600;margin-bottom:16px;">
                      ${courseCode}: ${courseTitle}
                    </div>

                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top:1px dashed rgba(255,255,255,0.15);padding-top:16px;font-family:monospace;font-size:11px;color:#94a3b8;">
                      <tr>
                        <td style="padding:4px 0;"><strong>Certificate ID:</strong></td>
                        <td style="padding:4px 0;color:#ffffff;text-align:right;">${certificateId}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;"><strong>Verification Hash:</strong></td>
                        <td style="padding:4px 0;color:#c5a059;text-align:right;">${verificationCode}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;"><strong>Date of Issuance:</strong></td>
                        <td style="padding:4px 0;color:#ffffff;text-align:right;">${issuedDate}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;"><strong>Assessment Grade:</strong></td>
                        <td style="padding:4px 0;color:#4ade80;text-align:right;">${grade}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Signatures Preview -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:28px;font-size:12px;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:16px;">
                <tr>
                  <td>
                    <div style="font-style:italic;font-size:16px;color:#00e5ff;font-family:'Georgia',serif;">L. S. Simao</div>
                    <strong style="color:#ffffff;">Mr. Lusimanadio Soki Simao, MBA</strong><br>
                    <span>Founder & Chief AI Strategist</span>
                  </td>
                  <td align="right">
                    <div style="font-style:italic;font-size:16px;color:#c5a059;font-family:'Georgia',serif;">Academic Directorate</div>
                    <strong style="color:#ffffff;">Cyber-Physical Systems Review Board</strong><br>
                    <span>Neurogrowth Labs</span>
                  </td>
                </tr>
              </table>

              <!-- CTA Buttons -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:20px 0;">
                <tr>
                  <td align="center" style="border-radius:10px;background:#c5a059;">
                    <a href="${certificateUrl}" target="_blank" style="font-size:14px;font-weight:700;color:#080b11;text-decoration:none;padding:14px 28px;display:inline-block;letter-spacing:0.3px;border-radius:10px;">
                      View & Download Credential &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:12px;line-height:18px;color:#64748b;">
                Share your certificate on LinkedIn or add it to your CV using the official verification link. This credential can be publicly audited at any time.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Dispatch Email via SendGrid v3 API or Simulated Delivery
 */
export async function dispatchSendGridEmail(payload: {
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  type: 'enrollment' | 'certificate';
  courseId: string;
  courseCode: string;
  courseTitle: string;
  certificateId?: string;
  verificationCode?: string;
  userId: string;
}): Promise<EmailNotificationRecord> {
  const { toEmail, toName, subject, htmlContent, textContent, type, courseId, courseCode, courseTitle, certificateId, verificationCode, userId } = payload;

  const recordId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const sentAt = new Date().toISOString();

  // Check if SendGrid API Key is configured in environment
  const apiKey = (import.meta as any).env?.VITE_SENDGRID_API_KEY || (typeof process !== 'undefined' && process.env?.SENDGRID_API_KEY);

  let deliveryStatus: 'delivered' | 'simulated' | 'failed' = 'simulated';

  if (apiKey && apiKey.startsWith('SG.')) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: toEmail, name: toName }],
              subject: subject
            }
          ],
          from: {
            email: SENDER_EMAIL,
            name: SENDER_NAME
          },
          content: [
            { type: 'text/plain', value: textContent },
            { type: 'text/html', value: htmlContent }
          ]
        })
      });

      if (response.status === 202 || response.ok) {
        deliveryStatus = 'delivered';
        console.log(`[SendGrid API] Dispatched ${type} email successfully to ${toEmail}`);
      } else {
        const errorText = await response.text();
        console.warn(`[SendGrid API] Returned status ${response.status}:`, errorText);
        deliveryStatus = 'simulated';
      }
    } catch (apiErr: any) {
      console.warn(`[SendGrid API] Network or CORS handled gracefully:`, apiErr?.message);
      deliveryStatus = 'simulated';
    }
  } else {
    // Simulated delivery mode with high-fidelity logging
    console.info(`[SendGrid Dispatcher] Simulated delivery to ${toEmail} (${subject}). SendGrid v3 payload synthesized.`);
    deliveryStatus = 'simulated';
  }

  const notificationRecord: EmailNotificationRecord = {
    id: recordId,
    userId,
    userEmail: toEmail,
    userName: toName,
    type,
    subject,
    courseId,
    courseCode,
    courseTitle,
    certificateId,
    verificationCode,
    sentAt,
    status: deliveryStatus,
    provider: 'SendGrid v3',
    htmlContent,
    textContent,
    read: false
  };

  saveNotification(notificationRecord);
  return notificationRecord;
}

/**
 * High-Level: Send Course Enrollment Email Notification
 */
export async function sendCourseEnrollmentNotification(params: {
  user: { uid?: string; id?: string; email?: string; displayName?: string };
  course: { id: string; code: string; title: string; track: string; difficultyLevel: string; duration: string };
}): Promise<EmailNotificationRecord> {
  const { user, course } = params;
  const toEmail = user.email || 'scholar@neurogrowthlabs.co.za';
  const toName = user.displayName || toEmail.split('@')[0];
  const userId = user.uid || user.id || 'anonymous-learner';
  const courseUrl = `${window.location.origin}/academy#course=${course.id}`;

  const subject = `🎓 Enrollment Confirmed: ${course.code} - ${course.title}`;
  const textContent = `Hello ${toName},\n\nYou have been successfully enrolled in ${course.code}: ${course.title}.\n\nAccess the course workspace and masterclasses here: ${courseUrl}\n\nFaculty Lead: Mr. Lusimanadio Soki Simao, MBA\nNeurogrowth Labs Sovereign Academy`;

  const htmlContent = buildEnrollmentEmailHtml({
    userName: toName,
    userEmail: toEmail,
    courseCode: course.code,
    courseTitle: course.title,
    track: course.track,
    difficultyLevel: course.difficultyLevel,
    duration: course.duration,
    courseUrl
  });

  return dispatchSendGridEmail({
    toEmail,
    toName,
    subject,
    htmlContent,
    textContent,
    type: 'enrollment',
    courseId: course.id,
    courseCode: course.code,
    courseTitle: course.title,
    userId
  });
}

/**
 * High-Level: Send Certificate of Completion Ready Email Notification
 */
export async function sendCertificateReadyNotification(params: {
  user: { uid?: string; id?: string; email?: string; displayName?: string };
  course: { id: string; code: string; title: string };
  certificateId: string;
  verificationCode: string;
  issuedDate: string;
  grade?: string;
}): Promise<EmailNotificationRecord> {
  const { user, course, certificateId, verificationCode, issuedDate, grade = 'Pass with Honors (70%+)' } = params;
  const toEmail = user.email || 'scholar@neurogrowthlabs.co.za';
  const toName = user.displayName || toEmail.split('@')[0];
  const userId = user.uid || user.id || 'anonymous-learner';
  const certificateUrl = `${window.location.origin}/academy#verify=${certificateId}`;

  const subject = `🏆 Certificate Ready: ${course.code} - ${course.title} (Accredited)`;
  const textContent = `Congratulations ${toName}!\n\nYour Certificate of Completion for ${course.code}: ${course.title} is now ready and cryptographically verified.\n\nCertificate ID: ${certificateId}\nVerification Code: ${verificationCode}\nDate: ${issuedDate}\nGrade: ${grade}\n\nView and download your official credential: ${certificateUrl}\n\nInstructor: Mr. Lusimanadio Soki Simao, MBA\nNeurogrowth Labs Sovereign Academy`;

  const htmlContent = buildCertificateReadyEmailHtml({
    userName: toName,
    userEmail: toEmail,
    courseCode: course.code,
    courseTitle: course.title,
    certificateId,
    verificationCode,
    issuedDate,
    grade,
    certificateUrl
  });

  return dispatchSendGridEmail({
    toEmail,
    toName,
    subject,
    htmlContent,
    textContent,
    type: 'certificate',
    courseId: course.id,
    courseCode: course.code,
    courseTitle: course.title,
    certificateId,
    verificationCode,
    userId
  });
}
