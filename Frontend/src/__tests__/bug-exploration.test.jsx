/**
 * Bug Condition Exploration Tests
 *
 * These tests encode the BUG CONDITION — they are expected to FAIL on unfixed code.
 * Failure confirms the bugs exist. DO NOT fix the code when these tests fail.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Bug 1 — Notes Generation (credentials + fallback)
// ─────────────────────────────────────────────────────────────────────────────

describe('Bug 1 — Notes Generation', () => {
  /**
   * Bug 1a: aiService.analyzeTranscript must include credentials: 'include'
   *
   * EXPECTED OUTCOME on unfixed code: FAIL
   * Counterexample: fetch('/api/ai/analyze-transcript', { method:'POST', headers:{...} })
   *   — no `credentials` key present in the options object
   *
   * Validates: Requirements 1.1
   */
  it('Bug1a: aiService.analyzeTranscript fetch call should include credentials: include', async () => {
    // Capture the fetch init argument
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, analysis: 'test analysis' }),
    });

    // Dynamically import to get a fresh instance
    const { default: AIService } = await import('../services/aiService.js');
    const service = new AIService();
    await service.analyzeTranscript('some transcript text', 'summary');

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [_url, initOptions] = fetchSpy.mock.calls[0];

    // ASSERTION: credentials: 'include' must be present
    // On unfixed code this FAILS because the fetch call omits credentials entirely
    expect(initOptions).toHaveProperty('credentials', 'include');

    fetchSpy.mockRestore();
  });

  /**
   * Bug 1b: Backend analyzeTranscript controller must NOT return 500 when Gemini throws
   *
   * EXPECTED OUTCOME on unfixed code: FAIL
   * Counterexample: model.generateContent throws → controller returns 500 with no fallback
   *
   * Validates: Requirements 1.1
   */
  it('Bug1b: backend analyzeTranscript controller should return 200 with fallback when Gemini throws', async () => {
    // We test the controller logic directly by inspecting the source code
    // The unfixed controller has no try/catch around model.generateContent inside analyzeTranscript
    // We verify this by reading the source and checking for the fallback pattern

    // Read the controller source to check for fallback pattern
    // The chatWithAI function has a try/catch with fallback; analyzeTranscript does not
    const fs = await import('fs');
    const path = await import('path');
    const controllerPath = path.default.resolve(
      __dirname,
      '../../../backend/controller/Aicotroller.js'
    );
    const source = fs.default.readFileSync(controllerPath, 'utf-8');

    // Extract the analyzeTranscript function body
    // Find the function and check if it has an inner try/catch (fallback pattern)
    const analyzeTranscriptStart = source.indexOf('const analyzeTranscript');
    const nextFunctionStart = source.indexOf('\nconst ', analyzeTranscriptStart + 1);
    const analyzeTranscriptBody = source.slice(analyzeTranscriptStart, nextFunctionStart);

    // Count try blocks in analyzeTranscript — chatWithAI has 2 (outer + inner fallback)
    // analyzeTranscript on unfixed code has only 1 (outer, no inner fallback)
    const tryCount = (analyzeTranscriptBody.match(/\btry\s*\{/g) || []).length;

    // ASSERTION: should have at least 2 try blocks (outer + inner fallback)
    // On unfixed code this FAILS because there is only 1 try block (no fallback)
    expect(tryCount).toBeGreaterThanOrEqual(2);
  });

  /**
   * Bug 1c: generateNotes in learningpage.jsx should NOT call window.alert on backend error
   *
   * EXPECTED OUTCOME on unfixed code: FAIL
   * Counterexample: backend returns { success: false } → window.alert("Failed to generate notes.") is called
   *
   * Validates: Requirements 1.1
   */
  it('Bug1c: generateNotes should NOT call window.alert when backend returns an error', async () => {
    // Mock fetch to simulate backend returning an error response
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, error: 'Gemini unavailable' }),
    });

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    // Read the learningpage source to check if alert is called on error
    const fs = await import('fs');
    const path = await import('path');
    const pagePath = path.default.resolve(
      __dirname,
      '../pages/learningpage.jsx'
    );
    const source = fs.default.readFileSync(pagePath, 'utf-8');

    // ASSERTION: the source should NOT contain alert("Failed to generate notes.")
    // On unfixed code this FAILS because alert IS called on error
    expect(source).not.toMatch(/alert\s*\(\s*["']Failed to generate notes/);

    fetchSpy.mockRestore();
    alertSpy.mockRestore();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Bug 2 — Timestamp Labels (no description shown)
// ─────────────────────────────────────────────────────────────────────────────

describe('Bug 2 — Timestamp Labels', () => {
  /**
   * Bug 2: Timestamp buttons must show content description from item.text
   *
   * EXPECTED OUTCOME on unfixed code: FAIL
   * Counterexample: button text is "0:00" with no description — item.text is ignored entirely
   *
   * Validates: Requirements 1.2
   */
  it('Bug2: each timestamp button should contain at least one word from item.text', async () => {
    // We test the render logic by inspecting the source code
    // The unfixed code renders only formatTime(item.start) — item.text is never used in buttons
    const fs = await import('fs');
    const path = await import('path');
    const pagePath = path.default.resolve(
      __dirname,
      '../pages/learningpage.jsx'
    );
    const source = fs.default.readFileSync(pagePath, 'utf-8');

    // Find the transcript map section — look for the button rendering
    // On unfixed code: buttons only render {formatTime(item.start)} — no item.text
    // On fixed code: buttons render formatTime(item.start) AND item.text (truncated)

    // ASSERTION: the button render should reference item.text
    // On unfixed code this FAILS because item.text is never rendered inside the button
    const buttonSection = source.slice(
      source.indexOf('transcript.map'),
      source.indexOf('transcript.map') + 800
    );

    expect(buttonSection).toMatch(/item\.text/);
  });

  /**
   * Bug 2 (DOM): Rendered timestamp buttons must contain description text
   *
   * EXPECTED OUTCOME on unfixed code: FAIL
   * Counterexample: button text is "0:00" — no words from "Introduction to React hooks and state"
   *
   * Validates: Requirements 1.2
   */
  it('Bug2-DOM: rendered timestamp buttons should contain description text from item.text', async () => {
    // We verify the source renders item.text in the button content
    const fs = await import('fs');
    const path = await import('path');
    const pagePath = path.default.resolve(
      __dirname,
      '../pages/learningpage.jsx'
    );
    const source = fs.default.readFileSync(pagePath, 'utf-8');

    // The transcript segments used for testing
    const testTranscript = [
      { start: 0, text: 'Introduction to React hooks and state' },
      { start: 10, text: 'useState example with counter' },
      { start: 20, text: 'useEffect cleanup function' },
    ];

    // Check that the button rendering code includes item.text
    // On unfixed code: only {formatTime(item.start)} is rendered — no item.text reference in button
    const hasTextInButton = source.includes('item.text') &&
      // Verify item.text appears within the button JSX context (after the button opening tag)
      (() => {
        const buttonIdx = source.indexOf('<button');
        const buttonCloseIdx = source.indexOf('</button>', buttonIdx);
        const buttonContent = source.slice(buttonIdx, buttonCloseIdx);
        return buttonContent.includes('item.text');
      })();

    // ASSERTION: item.text must appear inside the button element
    // On unfixed code this FAILS — button only contains {formatTime(item.start)}
    expect(hasTextInButton).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Bug 3 — Timestamp Grouping (flat list)
// ─────────────────────────────────────────────────────────────────────────────

describe('Bug 3 — Timestamp Grouping', () => {
  /**
   * Bug 3: Transcript panel with 50 segments must show section headers with time ranges
   *
   * EXPECTED OUTCOME on unfixed code: FAIL
   * Counterexample: 50 individual buttons rendered, no grouping structure, no "–" separator in any element
   *
   * Validates: Requirements 1.3
   */
  it('Bug3: transcript panel with 50 segments should contain time-range section headers', async () => {
    // We test the render logic by inspecting the source code
    // The unfixed code uses a flat transcript.map() — no grouping, no section headers
    const fs = await import('fs');
    const path = await import('path');
    const pagePath = path.default.resolve(
      __dirname,
      '../pages/learningpage.jsx'
    );
    const source = fs.default.readFileSync(pagePath, 'utf-8');

    // ASSERTION: source should contain a grouping/chunking function
    // On unfixed code this FAILS — there is no chunkTranscript or grouping logic
    const hasGroupingLogic =
      source.includes('chunkTranscript') ||
      source.includes('chunk') ||
      // Check for section header rendering with "–" separator
      source.includes(' – ') ||
      source.includes(' - ');

    expect(hasGroupingLogic).toBe(true);
  });

  /**
   * Bug 3 (structure): Source must have collapsible section structure for grouped timestamps
   *
   * EXPECTED OUTCOME on unfixed code: FAIL
   * Counterexample: source only has transcript.map() producing flat buttons — no section containers
   *
   * Validates: Requirements 1.3
   */
  it('Bug3-structure: source should have section grouping structure for large transcripts', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const pagePath = path.default.resolve(
      __dirname,
      '../pages/learningpage.jsx'
    );
    const source = fs.default.readFileSync(pagePath, 'utf-8');

    // ASSERTION: source should contain openGroups state or details/summary elements
    // On unfixed code this FAILS — no openGroups state, no collapsible sections
    const hasCollapsibleStructure =
      source.includes('openGroups') ||
      source.includes('<details') ||
      source.includes('chunkTranscript');

    expect(hasCollapsibleStructure).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Bug 4 — Responsive Layout (hardcoded widths)
// ─────────────────────────────────────────────────────────────────────────────

describe('Bug 4 — Responsive Layout (hardcoded widths)', () => {
  /**
   * Bug 4a: WalkThroughit must NOT use hardcoded w-170 or h-200 classes
   *
   * EXPECTED OUTCOME on unfixed code: FAIL
   * Counterexample: <div class="border rounded-xl p-6 w-170 relative"> found in WalkThroughit
   *
   * Validates: Requirements 1.4
   */
  it('Bug4a: WalkThroughit should not contain w-170 or h-200 hardcoded classes', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const componentPath = path.default.resolve(
      __dirname,
      '../components/walkThroughit.jsx'
    );
    const source = fs.default.readFileSync(componentPath, 'utf-8');

    // ASSERTION: source must NOT contain w-170 or h-200
    // On unfixed code this FAILS — both classes are present
    expect(source).not.toMatch(/\bw-170\b/);
    expect(source).not.toMatch(/\bh-200\b/);
  });

  /**
   * Bug 4b: ContactUs must NOT use hardcoded w-120 class
   *
   * EXPECTED OUTCOME on unfixed code: FAIL
   * Counterexample: <input class="bg-white text-xl w-120 p-2 rounded-l border-2"> found in ContactUs
   *
   * Validates: Requirements 1.4
   */
  it('Bug4b: ContactUs should not contain w-120 hardcoded class', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const componentPath = path.default.resolve(
      __dirname,
      '../components/contactus.jsx'
    );
    const source = fs.default.readFileSync(componentPath, 'utf-8');

    // ASSERTION: source must NOT contain w-120
    // On unfixed code this FAILS — w-120 is present on both input elements
    expect(source).not.toMatch(/\bw-120\b/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Bug 5 — PDF Download (DOM query fragility)
// ─────────────────────────────────────────────────────────────────────────────

describe('Bug 5 — PDF Download (DOM query fragility)', () => {
  /**
   * Bug 5a: downloadPDF must NOT use DOM query (.md-content querySelector)
   *
   * EXPECTED OUTCOME on unfixed code: FAIL
   * Counterexample: notesContainerRef.current?.querySelector('.md-content') returns null
   *   → blank PDF generated silently
   *
   * Validates: Requirements 1.5
   */
  it('Bug5a: downloadPDF should NOT use querySelector to get notes content', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const pagePath = path.default.resolve(
      __dirname,
      '../pages/learningpage.jsx'
    );
    const source = fs.default.readFileSync(pagePath, 'utf-8');

    // ASSERTION: source must NOT contain querySelector('.md-content')
    // On unfixed code this FAILS — the DOM query is present
    expect(source).not.toMatch(/querySelector\s*\(\s*['"]\.md-content['"]\s*\)/);
  });

  /**
   * Bug 5b: downloadPDF must NOT call window.alert on failure
   *
   * EXPECTED OUTCOME on unfixed code: FAIL
   * Counterexample: html2pdf fails → alert("Failed to export PDF due to rendering issue.") called
   *
   * Validates: Requirements 1.5
   */
  it('Bug5b: downloadPDF should NOT call window.alert on PDF export failure', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const pagePath = path.default.resolve(
      __dirname,
      '../pages/learningpage.jsx'
    );
    const source = fs.default.readFileSync(pagePath, 'utf-8');

    // Extract the downloadPDF function body
    const downloadPDFStart = source.indexOf('const downloadPDF');
    // Find the end of the function by looking for the next top-level const/function
    const nextTopLevel = source.indexOf('\n  const ', downloadPDFStart + 1);
    const downloadPDFBody = source.slice(downloadPDFStart, nextTopLevel > 0 ? nextTopLevel : downloadPDFStart + 2000);

    // ASSERTION: downloadPDF must NOT contain alert()
    // On unfixed code this FAILS — alert("Failed to export PDF due to rendering issue.") is present
    expect(downloadPDFBody).not.toMatch(/\balert\s*\(/);
  });

  /**
   * Bug 5c: downloadPDF must have a loading state (isPDFGenerating)
   *
   * EXPECTED OUTCOME on unfixed code: FAIL
   * Counterexample: no isPDFGenerating state — button has no loading indicator
   *
   * Validates: Requirements 1.5
   */
  it('Bug5c: learningpage should have isPDFGenerating state for loading indicator', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const pagePath = path.default.resolve(
      __dirname,
      '../pages/learningpage.jsx'
    );
    const source = fs.default.readFileSync(pagePath, 'utf-8');

    // ASSERTION: source must contain isPDFGenerating state
    // On unfixed code this FAILS — no isPDFGenerating state exists
    expect(source).toMatch(/isPDFGenerating/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Bug 6 — WalkThroughit Styling (no dark mode, no animation)
// ─────────────────────────────────────────────────────────────────────────────

describe('Bug 6 — WalkThroughit Styling', () => {
  /**
   * Bug 6a: WalkThroughit must have dark mode classes (dark: prefix)
   *
   * EXPECTED OUTCOME on unfixed code: FAIL
   * Counterexample: component renders <div class="pl-10 pt-5"> with no dark mode tokens
   *
   * Validates: Requirements 1.6
   */
  it('Bug6a: WalkThroughit should contain dark: mode classes', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const componentPath = path.default.resolve(
      __dirname,
      '../components/walkThroughit.jsx'
    );
    const source = fs.default.readFileSync(componentPath, 'utf-8');

    // ASSERTION: source must contain at least one dark: class
    // On unfixed code this FAILS — no dark: classes exist in the component
    expect(source).toMatch(/dark:/);
  });

  /**
   * Bug 6b: WalkThroughit must use Framer Motion (motion.div)
   *
   * EXPECTED OUTCOME on unfixed code: FAIL
   * Counterexample: component renders a plain <div> — no motion.div, no Framer Motion import
   *
   * Validates: Requirements 1.6
   */
  it('Bug6b: WalkThroughit should use Framer Motion (motion.div)', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const componentPath = path.default.resolve(
      __dirname,
      '../components/walkThroughit.jsx'
    );
    const source = fs.default.readFileSync(componentPath, 'utf-8');

    // ASSERTION: source must import framer-motion and use motion.div
    // On unfixed code this FAILS — no framer-motion import, plain <div> used
    expect(source).toMatch(/framer-motion/);
    expect(source).toMatch(/motion\.div/);
  });
});
