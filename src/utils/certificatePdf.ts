import { jsPDF } from 'jspdf';

export interface CertificateRenderData {
  verificationId: string;
  studentName: string;
  studentEmail?: string;
  studentCountry?: string;
  registeredDate?: string;
  courseCode: string;
  courseTitle: string;
  courseTrack: string;
  difficultyLevel: string;
  issuedDate: string;
  examScore?: number | null;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawHexagon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  strokeColor: string,
  lineWidth: number
) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const px = cx + radius * Math.cos(angle);
    const py = cy + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
}

function drawShieldCheckIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const w = size * 0.8;
  const h = size * 0.92;
  const top = cy - h / 2;

  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.lineTo(cx + w / 2, top + h * 0.22);
  ctx.lineTo(cx + w / 2, top + h * 0.56);
  ctx.quadraticCurveTo(cx + w / 2, top + h * 0.84, cx, top + h);
  ctx.quadraticCurveTo(cx - w / 2, top + h * 0.84, cx - w / 2, top + h * 0.56);
  ctx.lineTo(cx - w / 2, top + h * 0.22);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - w * 0.2, cy + h * 0.04);
  ctx.lineTo(cx - w * 0.04, cy + h * 0.19);
  ctx.lineTo(cx + w * 0.24, cy - h * 0.11);
  ctx.stroke();
  ctx.restore();
}

function drawSparkleIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(cx, cy - radius);
  ctx.quadraticCurveTo(cx, cy, cx + radius, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + radius);
  ctx.quadraticCurveTo(cx, cy, cx - radius, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - radius);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function wrapCenteredLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function renderCertificateCanvas(
  data: CertificateRenderData
): Promise<HTMLCanvasElement> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Proceed cleanly with fallback serif/sans/mono system metrics
    }
  }

  // A4 Landscape ratio: 297 / 210 = 1.41428 -> 2240 x 1584 high-DPI canvas
  const width = 2240;
  const height = 1584;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable for PDF generation.');
  }

  // Outer backdrop matching #080b11 frame
  ctx.fillStyle = '#070a10';
  ctx.fillRect(0, 0, width, height);

  // Main Certificate Card matching Sample (#111726 -> #0c101b -> #070a10)
  const pad = 44;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;
  drawRoundedRectPath(ctx, pad, pad, cardW, cardH, 42);

  const bgGrad = ctx.createLinearGradient(0, pad, 0, pad + cardH);
  bgGrad.addColorStop(0, '#111726');
  bgGrad.addColorStop(0.5, '#0c101b');
  bgGrad.addColorStop(1, '#070a10');
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Subtle gold hairline border around the sample card
  ctx.strokeStyle = 'rgba(197, 160, 89, 0.28)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Inner subtle cyan frame line
  drawRoundedRectPath(ctx, pad + 18, pad + 18, cardW - 36, cardH - 36, 30);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Centered Hexagon Watermark (opacity 0.09)
  drawHexagon(ctx, width / 2, height / 2 - 20, 440, 'rgba(0, 229, 255, 0.08)', 3);

  const cx = width / 2;

  // 1. Top Branding Header
  const orgLabel = 'NEUROGROWTH LABS · SOVEREIGN INTELLIGENCE ACADEMY';
  ctx.font = '600 22px "JetBrains Mono", "Courier New", monospace';
  const orgWidth = ctx.measureText(orgLabel).width;
  const iconSpace = 36;
  const startX = cx - (orgWidth + iconSpace) / 2;
  drawShieldCheckIcon(ctx, startX + 12, 166, 28, '#c5a059');

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#c5a059';
  ctx.fillText(orgLabel, startX + iconSpace, 168);

  // Main Certificate Title
  ctx.textAlign = 'center';
  ctx.font = '800 84px "Source Serif 4", Georgia, serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('CERTIFICATE OF COMPLETION', cx, 255);

  // Subtitle
  ctx.font = '400 25px "JetBrains Mono", "Courier New", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Accredited Advanced Pan-African Technical Certification', cx, 320);

  // 2. Recipient Section
  ctx.font = '500 21px "JetBrains Mono", "Courier New", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('THIS IS TO FORMALLY CERTIFY THAT', cx, 435);

  // Recipient Name (from registration)
  const cleanName = (data.studentName || 'Verified Scholar').trim();
  let nameFontSize = 86;
  ctx.font = `800 ${nameFontSize}px "Source Serif 4", Georgia, serif`;
  while (ctx.measureText(cleanName).width > cardW - 280 && nameFontSize > 48) {
    nameFontSize -= 4;
    ctx.font = `800 ${nameFontSize}px "Source Serif 4", Georgia, serif`;
  }
  ctx.fillStyle = '#00e5ff';
  ctx.fillText(cleanName, cx, 530);

  // Registered Scholar Email & Jurisdiction captured from registration flow
  const regParts: string[] = [];
  if (data.studentEmail) regParts.push(data.studentEmail);
  if (data.studentCountry) regParts.push(`Jurisdiction: ${data.studentCountry}`);
  if (regParts.length > 0) {
    ctx.font = '500 21px "JetBrains Mono", "Courier New", monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(regParts.join('  ·  '), cx, 598);
  }

  // Gold Gradient Rule
  const lineW = 420;
  const ruleGrad = ctx.createLinearGradient(cx - lineW / 2, 0, cx + lineW / 2, 0);
  ruleGrad.addColorStop(0, 'rgba(197, 160, 89, 0)');
  ruleGrad.addColorStop(0.5, '#c5a059');
  ruleGrad.addColorStop(1, 'rgba(197, 160, 89, 0)');
  ctx.fillStyle = ruleGrad;
  ctx.fillRect(cx - lineW / 2, 642, lineW, 3);

  // 3. Course Details Section
  ctx.font = '400 26px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(
    'has completed all lecture masterclasses, verified practical laboratories, and attained passing capstone marks in:',
    cx,
    720
  );

  // Course Title
  const fullCourseTitle = `${data.courseCode}: ${data.courseTitle}`;
  ctx.font = '700 46px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  const titleLines = wrapCenteredLines(ctx, fullCourseTitle, cardW - 360).slice(0, 2);
  const titleStartY = titleLines.length > 1 ? 805 : 825;
  titleLines.forEach((line, idx) => {
    ctx.fillText(line, cx, titleStartY + idx * 58);
  });

  // Track & Operational Level (+ Exam score if recorded)
  const trackParts = [
    `Track: ${data.courseTrack}`,
    `Operational Level: ${data.difficultyLevel}`,
  ];
  if (typeof data.examScore === 'number' && data.examScore >= 70) {
    trackParts.push(`Capstone Score: ${data.examScore}%`);
  }
  ctx.font = '500 22px "JetBrains Mono", "Courier New", monospace';
  ctx.fillStyle = '#94a3b8';
  const trackY = titleLines.length > 1 ? 928 : 905;
  ctx.fillText(trackParts.join(' · '), cx, trackY);

  // 4. Footer Divider & 3-Column Insignia + Verification Bar
  const footerRuleY = 1140;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(pad + 100, footerRuleY, cardW - 200, 2);

  const colLeftX = pad + 100;
  const colRightX = width - pad - 100;
  const footerTopY = 1235;

  // Left Column: Academic Directorate
  ctx.textAlign = 'left';
  ctx.font = '700 23px "JetBrains Mono", "Courier New", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Academic Directorate', colLeftX, footerTopY);

  ctx.font = '400 20px "JetBrains Mono", "Courier New", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Cape Town & Luanda Research Centers', colLeftX, footerTopY + 42);

  ctx.fillStyle = '#64748b';
  ctx.fillText(`Issued: ${data.issuedDate}`, colLeftX, footerTopY + 82);

  // Center Column: Gold Verified Mastery Seal
  const sealCy = footerTopY + 44;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, sealCy, 86, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(197, 160, 89, 0.12)';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#c5a059';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, sealCy, 74, 0, Math.PI * 2);
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = 'rgba(197, 160, 89, 0.55)';
  ctx.stroke();
  ctx.restore();

  drawSparkleIcon(ctx, cx, sealCy - 30, 18, '#c5a059');
  ctx.textAlign = 'center';
  ctx.font = '700 17px "JetBrains Mono", "Courier New", monospace';
  ctx.fillStyle = '#c5a059';
  ctx.fillText('VERIFIED', cx, sealCy + 10);
  ctx.fillText('MASTERY', cx, sealCy + 34);

  // Right Column: Cryptographic Verification
  ctx.textAlign = 'right';
  ctx.font = '700 23px "JetBrains Mono", "Courier New", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Cryptographic Verification', colRightX, footerTopY);

  ctx.font = '600 20px "JetBrains Mono", "Courier New", monospace';
  ctx.fillStyle = '#00e5ff';
  ctx.fillText(data.verificationId, colRightX, footerTopY + 42);

  ctx.font = '400 19px "JetBrains Mono", "Courier New", monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Status: Formally Accredited ✓', colRightX, footerTopY + 82);

  return canvas;
}

export async function downloadCertificatePdf(data: CertificateRenderData): Promise<void> {
  const canvas = await renderCertificateCanvas(data);
  const imgData = canvas.toDataURL('image/png');

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');

  const safeCode = data.courseCode.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeName = (data.studentName || 'Scholar').trim().replace(/[^a-zA-Z0-9_-]+/g, '_');
  doc.save(`Certificate_${safeCode}_${safeName}.pdf`);
}
