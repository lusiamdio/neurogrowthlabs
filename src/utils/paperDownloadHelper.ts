import { ResearchPaper } from '../data/academyData';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export async function downloadAcademicPaper(paper: ResearchPaper, user: { uid?: string; email?: string; displayName?: string }) {
  // 1. Generate formatted academic text/markdown document
  const content = `================================================================================
NEUROGROWTH LABS SOVEREIGN AI & CYBERSECURITY RESEARCH SERIES
PEER-REVIEWED ACADEMIC WORKING PAPER | ISSN 2959-8812
================================================================================

TITLE:
${paper.title}

SUBTITLE:
${paper.subtitle}

DOI / IDENTIFIER:
https://doi.org/${paper.doi}

PUBLICATION DATE:
${paper.publishDate}

AUTHORS & AFFILIATIONS:
${paper.authors.map(a => `• ${a.name} (${a.affiliation})`).join('\n')}

CORRESPONDING REPOSITORY:
Neurogrowth Labs Intelligence Archive (Cape Town, South Africa)

--------------------------------------------------------------------------------
1. EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
${paper.executiveSummary}

--------------------------------------------------------------------------------
2. ABSTRACT
--------------------------------------------------------------------------------
${paper.abstract}

--------------------------------------------------------------------------------
3. EMPIRICAL METHODOLOGY & SYSTEM ARCHITECTURE
--------------------------------------------------------------------------------
${paper.methodology}

--------------------------------------------------------------------------------
4. KEY EMPIRICAL FINDINGS & BENCHMARKS
--------------------------------------------------------------------------------
${paper.findings.map((f, i) => `[4.${i + 1}] ${f}`).join('\n\n')}

--------------------------------------------------------------------------------
5. POLICY & CONTINENTAL DEPLOYMENT RECOMMENDATIONS
--------------------------------------------------------------------------------
${paper.policyRecommendations.map((r, i) => `[5.${i + 1}] ${r}`).join('\n\n')}

--------------------------------------------------------------------------------
6. BIBTEX CITATION
--------------------------------------------------------------------------------
${paper.bibtex}

================================================================================
VERIFICATION NOTICE:
This document is licensed under Creative Commons BY-NC 4.0 for pan-African academic,
governmental, and enterprise advancement.
Issued to verified scholar: ${user.displayName || user.email || 'Verified Researcher'}
Date of Retrieval: ${new Date().toUTCString()}
Neurogrowth Labs (Pty) Ltd. | Cape Town, ZA.
================================================================================
`;

  // 2. Trigger browser file download (PDF file if available, or structured text)
  if (paper.pdfUrl) {
    const anchor = document.createElement('a');
    anchor.href = paper.pdfUrl;
    anchor.download = `${paper.id}-${paper.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } else {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${paper.id}-${paper.doi.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  // 3. Log to Firebase Firestore
  try {
    if (user.uid) {
      await addDoc(collection(db, 'paper_downloads'), {
        userId: user.uid,
        userEmail: user.email || 'unknown',
        paperId: paper.id,
        paperTitle: paper.title,
        doi: paper.doi,
        downloadedAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.warn("Could not log paper download to Firestore (this is non-blocking):", err);
  }

  // 4. Update local downloaded papers tracker
  try {
    const key = `ngl_downloads_${user.uid || 'guest'}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    if (!existing.includes(paper.id)) {
      existing.push(paper.id);
      localStorage.setItem(key, JSON.stringify(existing));
    }
  } catch (err) {
    console.warn("Could not store download in localStorage:", err);
  }
}
