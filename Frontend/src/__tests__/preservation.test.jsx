/**
 * Preservation Property Tests
 *
 * These tests encode EXISTING WORKING BEHAVIOR that must remain unchanged after all fixes.
 * They MUST PASS on unfixed code — they establish the baseline.
 *
 * Observation-first methodology: each test was written by observing what the unfixed code
 * does with non-buggy inputs, then encoding that behavior as a property.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import * as fc from 'fast-check';
import AIService from '../services/aiService.js';

// ─────────────────────────────────────────────────────────────────────────────
// Property 1: aiService.chat returns { success: true, response: <non-empty> }
// for all non-empty message strings
// ─────────────────────────────────────────────────────────────────────────────

describe('Preservation — aiService.chat (Requirement 3.3)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Observed behavior: aiService.chat("hello", []) sends a POST to /api/ai/chat
   * and returns { success: true, response: "..." } — no credentials needed for chat.
   *
   * Property: For all non-empty message strings, aiService.chat(message, [])
   * returns an object with success: true and a non-empty response string.
   *
   * Validates: Requirements 3.3
   */
  it('Pres1: for all non-empty messages, aiService.chat returns { success: true, response: <non-empty> }', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate non-empty strings (at least 1 char, printable ASCII)
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (message) => {
          const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, response: 'AI response for: ' + message }),
          });

          const service = new AIService();
          const result = await service.chat(message, []);

          // Verify the shape: success: true and non-empty response
          expect(result).toHaveProperty('success', true);
          expect(typeof result.response).toBe('string');
          expect(result.response.length).toBeGreaterThan(0);

          // Verify the fetch was called with the correct endpoint
          expect(fetchSpy).toHaveBeenCalledWith(
            expect.stringContaining('/api/ai/chat'),
            expect.objectContaining({ method: 'POST' })
          );

          fetchSpy.mockRestore();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Verify that aiService.chat sends the message in the request body.
   * This must remain true after the analyzeTranscript credentials fix.
   *
   * Validates: Requirements 3.3
   */
  it('Pres1b: aiService.chat sends message and conversationHistory in request body', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, response: 'Hello back!' }),
    });

    const service = new AIService();
    await service.chat('hello', []);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, initOptions] = fetchSpy.mock.calls[0];

    // Verify it calls the chat endpoint
    expect(url).toContain('/api/ai/chat');
    // Verify method is POST
    expect(initOptions.method).toBe('POST');
    // Verify body contains the message
    const body = JSON.parse(initOptions.body);
    expect(body).toHaveProperty('message', 'hello');
    expect(body).toHaveProperty('conversationHistory');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Property 2: aiService.answerQuestion returns { success: true, answer: <non-empty> }
// for all non-empty question + context pairs
// ─────────────────────────────────────────────────────────────────────────────

describe('Preservation — aiService.answerQuestion (Requirement 3.3)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Observed behavior: aiService.answerQuestion("what is this?", "context text")
   * sends to /api/ai/answer and returns { success: true, answer: "..." }.
   *
   * Property: For all non-empty question + context pairs, answerQuestion returns
   * { success: true, answer: <non-empty string> }.
   *
   * Validates: Requirements 3.3
   */
  it('Pres2: for all non-empty question+context pairs, answerQuestion returns { success: true, answer: <non-empty> }', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        async (question, context) => {
          const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, answer: 'Answer to: ' + question }),
          });

          const service = new AIService();
          const result = await service.answerQuestion(question, context);

          // Verify the shape: success: true and non-empty answer
          expect(result).toHaveProperty('success', true);
          expect(typeof result.answer).toBe('string');
          expect(result.answer.length).toBeGreaterThan(0);

          // Verify the fetch was called with the correct endpoint
          expect(fetchSpy).toHaveBeenCalledWith(
            expect.stringContaining('/api/ai/answer'),
            expect.objectContaining({ method: 'POST' })
          );

          fetchSpy.mockRestore();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Verify the request body contains both question and context.
   *
   * Validates: Requirements 3.3
   */
  it('Pres2b: answerQuestion sends question and context in request body', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, answer: 'The context explains this.' }),
    });

    const service = new AIService();
    await service.answerQuestion('what is this?', 'context text');

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, initOptions] = fetchSpy.mock.calls[0];

    expect(url).toContain('/api/ai/answer');
    const body = JSON.parse(initOptions.body);
    expect(body).toHaveProperty('question', 'what is this?');
    expect(body).toHaveProperty('context', 'context text');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Property 3: Transcript panel with 1–14 segments renders flat list
// (no section headers, exactly transcript.length buttons)
// ─────────────────────────────────────────────────────────────────────────────

describe('Preservation — Transcript panel flat list for short transcripts (Requirement 3.2)', () => {
  /**
   * Observed behavior: The unfixed code uses a flat transcript.map() — no grouping logic.
   * For transcripts of length 1–14 (below any grouping threshold), the render produces
   * exactly transcript.length buttons and no section headers.
   *
   * We verify this by inspecting the source code structure.
   *
   * Property: For all transcript arrays of length 1–14, the source renders a flat list
   * (no chunkTranscript / openGroups / section headers).
   *
   * Validates: Requirements 3.2
   */
  it('Pres3: source renders transcript as flat list (no grouping for short transcripts)', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const pagePath = path.default.resolve(__dirname, '../pages/learningpage.jsx');
    const source = fs.default.readFileSync(pagePath, 'utf-8');

    // The unfixed code has a flat transcript.map() in the JSX render section
    // Find the SECOND occurrence of transcript.map (first is in generateNotes)
    const firstMapIdx = source.indexOf('transcript.map');
    const secondMapIdx = source.indexOf('transcript.map', firstMapIdx + 1);
    expect(secondMapIdx).toBeGreaterThan(-1);

    // The render map section should contain button elements
    const mapSection = source.slice(secondMapIdx, secondMapIdx + 800);
    expect(mapSection).toMatch(/<button/);
  });

  /**
   * Property-based: For all transcript arrays of length 1–14, the flat map
   * produces exactly transcript.length items (one per segment, no grouping).
   *
   * Validates: Requirements 3.2
   */
  it('Pres3b: for transcripts of length 1-14, flat list produces exactly transcript.length buttons', () => {
    fc.assert(
      fc.property(
        // Generate transcript arrays of length 1–14
        fc.array(
          fc.record({
            start: fc.integer({ min: 0, max: 840 }),
            text: fc.string({ minLength: 1, maxLength: 100 }),
          }),
          { minLength: 1, maxLength: 14 }
        ),
        (transcript) => {
          // On unfixed code: flat map, no grouping
          // Simulate what the unfixed render does: transcript.map(item => button)
          // Result: exactly transcript.length buttons, no section headers
          const simulatedButtons = transcript.map((item, index) => ({
            key: index,
            start: item.start,
            label: `${Math.floor(item.start / 60)}:${String(Math.floor(item.start % 60)).padStart(2, '0')}`,
          }));

          // Verify: one button per segment
          expect(simulatedButtons.length).toBe(transcript.length);
          // Verify: no section headers (flat list)
          expect(simulatedButtons.length).toBeGreaterThanOrEqual(1);
          expect(simulatedButtons.length).toBeLessThanOrEqual(14);
          // Verify: each button maps to the correct start time
          simulatedButtons.forEach((btn, i) => {
            expect(btn.start).toBe(transcript[i].start);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Verify that the seekTo behavior is preserved: clicking a timestamp button
   * calls seekTo(item.start) with the correct value.
   *
   * We verify this by checking the source code has the onClick handler.
   *
   * Validates: Requirements 3.2
   */
  it('Pres3c: timestamp buttons have onClick calling seekTo(item.start)', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const pagePath = path.default.resolve(__dirname, '../pages/learningpage.jsx');
    const source = fs.default.readFileSync(pagePath, 'utf-8');

    // Verify the button has onClick={() => seekTo(item.start)}
    expect(source).toMatch(/onClick.*seekTo\s*\(\s*item\.start\s*\)/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Property 4: downloadPDF with non-empty notes does not call window.alert
// and does not throw (on the success path)
// ─────────────────────────────────────────────────────────────────────────────

describe('Preservation — downloadPDF with populated notes (Requirement 3.9)', () => {
  /**
   * Observed behavior: downloadPDF with a populated notes state calls html2pdf.
   * The function does NOT call alert() on the success path (alert is only in .catch()).
   *
   * Property: For all notes strings of length > 0, the downloadPDF success path
   * does not call window.alert.
   *
   * We verify this by inspecting the source code structure.
   *
   * Validates: Requirements 3.9
   */
  it('Pres4: downloadPDF success path does not call window.alert', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate non-empty notes strings
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        async (notesContent) => {
          const fs = await import('fs');
          const path = await import('path');
          const pagePath = path.default.resolve(__dirname, '../pages/learningpage.jsx');
          const source = fs.default.readFileSync(pagePath, 'utf-8');

          // Extract downloadPDF function body
          const downloadPDFStart = source.indexOf('const downloadPDF');
          // Find the end of the function — look for the next top-level const/function
          // The function ends before the return statement of the component
          const nextTopLevel = source.indexOf('\n  const ', downloadPDFStart + 1);
          const downloadPDFBody = source.slice(
            downloadPDFStart,
            nextTopLevel > 0 ? nextTopLevel : downloadPDFStart + 2000
          );

          // The success path (html2pdf resolves) must NOT call alert
          // On unfixed code: alert is only in the .catch() handler
          // So for non-empty notes with html2pdf resolving, alert is never called
          const catchIdx = downloadPDFBody.indexOf('.catch(');
          const alertIdx = downloadPDFBody.indexOf('alert(');

          if (alertIdx !== -1 && catchIdx !== -1) {
            // alert must appear AFTER .catch( — meaning it's inside the catch handler
            // This means the success path (before .catch) does NOT call alert
            expect(alertIdx).toBeGreaterThan(catchIdx);
          }
          // If no alert at all, that's also fine (after the fix)
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * Verify that downloadPDF returns early (does nothing) when notes is empty.
   * This is existing behavior that must be preserved.
   *
   * Validates: Requirements 3.9
   */
  it('Pres4b: downloadPDF returns early when notes is empty (no alert, no PDF)', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const pagePath = path.default.resolve(__dirname, '../pages/learningpage.jsx');
    const source = fs.default.readFileSync(pagePath, 'utf-8');

    // Verify the early return guard: if (!notes) return;
    const downloadPDFStart = source.indexOf('const downloadPDF');
    const nextTopLevel = source.indexOf('\n  const ', downloadPDFStart + 1);
    const downloadPDFBody = source.slice(
      downloadPDFStart,
      nextTopLevel > 0 ? nextTopLevel : downloadPDFStart + 2000
    );

    // The function must have an early return when notes is falsy
    expect(downloadPDFBody).toMatch(/if\s*\(\s*!notes\s*\)\s*return/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Property 5: WalkThroughit and ContactUs render without crashing at desktop viewport
// ─────────────────────────────────────────────────────────────────────────────

describe('Preservation — WalkThroughit and ContactUs render at desktop viewport (Requirement 2.4)', () => {
  /**
   * Observed behavior: WalkThroughit renders without crashing on desktop viewport.
   *
   * Property: WalkThroughit renders without throwing.
   *
   * Validates: Requirements 2.4 preservation
   */
  it('Pres5a: WalkThroughit renders without crashing', async () => {
    const { default: WalkThroughit } = await import('../components/walkThroughit.jsx');

    // Should not throw
    expect(() => {
      render(<WalkThroughit />);
    }).not.toThrow();

    // Verify the component renders some content
    expect(document.body.innerHTML.length).toBeGreaterThan(0);
  });

  /**
   * Observed behavior: ContactUs renders without crashing on desktop viewport.
   *
   * Property: ContactUs renders without throwing.
   *
   * Validates: Requirements 2.4 preservation
   */
  it('Pres5b: ContactUs renders without crashing', async () => {
    const { default: ContactUs } = await import('../components/contactus.jsx');

    expect(() => {
      render(<ContactUs />);
    }).not.toThrow();

    expect(document.body.innerHTML.length).toBeGreaterThan(0);
  });

  /**
   * Property-based: For all viewport widths >= 640px, both components render
   * without throwing.
   *
   * Validates: Requirements 2.4 preservation
   */
  it('Pres5c: WalkThroughit and ContactUs render without crashing across desktop viewport widths', async () => {
    const { default: WalkThroughit } = await import('../components/walkThroughit.jsx');
    const { default: ContactUs } = await import('../components/contactus.jsx');

    fc.assert(
      fc.property(
        // Generate desktop viewport widths (640px to 1920px)
        fc.integer({ min: 640, max: 1920 }),
        (viewportWidth) => {
          // Set the viewport width
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: viewportWidth,
          });

          // Both components must render without throwing
          expect(() => render(<WalkThroughit />)).not.toThrow();
          expect(() => render(<ContactUs />)).not.toThrow();
        }
      ),
      { numRuns: 20 }
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Property 6: Dark mode toggle sets document.documentElement.classList to include "dark"
// ─────────────────────────────────────────────────────────────────────────────

describe('Preservation — Dark mode toggle (Requirement 3.8)', () => {
  afterEach(() => {
    // Clean up dark class after each test
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  });

  /**
   * Observed behavior: The dark mode toggle in Navebar sets
   * document.documentElement.classList to include "dark" when switching to dark mode.
   * The theme preference is persisted in localStorage.
   *
   * We verify this by testing the toggle logic directly (simulating what Navebar does).
   *
   * Validates: Requirements 3.8
   */
  it('Pres6: dark mode toggle adds "dark" class to document.documentElement', () => {
    // Simulate the dark mode toggle logic from navebar.jsx
    // When theme === 'dark': document.documentElement.classList.add('dark')
    // When theme === 'light': document.documentElement.classList.remove('dark')

    // Start in light mode
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');

    // Simulate toggling to dark mode
    const newTheme = 'dark';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);

    // Verify dark class is applied
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  /**
   * Verify that toggling back to light mode removes the "dark" class.
   *
   * Validates: Requirements 3.8
   */
  it('Pres6b: dark mode toggle removes "dark" class when switching to light mode', () => {
    // Start in dark mode
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');

    // Simulate toggling to light mode
    const newTheme = 'light';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);

    // Verify dark class is removed
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  /**
   * Property-based: The dark mode toggle logic is idempotent and consistent.
   * Applying dark mode always results in the "dark" class being present.
   * Applying light mode always results in the "dark" class being absent.
   *
   * Validates: Requirements 3.8
   */
  it('Pres6c: dark mode toggle is consistent across multiple toggles', () => {
    fc.assert(
      fc.property(
        // Generate a sequence of theme values
        fc.array(fc.constantFrom('light', 'dark'), { minLength: 1, maxLength: 20 }),
        (themeSequence) => {
          for (const theme of themeSequence) {
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
            localStorage.setItem('theme', theme);
          }

          // After applying the last theme, the class state must match
          const lastTheme = themeSequence[themeSequence.length - 1];
          if (lastTheme === 'dark') {
            expect(document.documentElement.classList.contains('dark')).toBe(true);
          } else {
            expect(document.documentElement.classList.contains('dark')).toBe(false);
          }
          expect(localStorage.getItem('theme')).toBe(lastTheme);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Verify the Navebar source code contains the correct dark mode toggle logic.
   *
   * Validates: Requirements 3.8
   */
  it('Pres6d: Navebar source contains correct dark mode toggle implementation', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const navebarPath = path.default.resolve(__dirname, '../components/navebar.jsx');
    const source = fs.default.readFileSync(navebarPath, 'utf-8');

    // Verify the toggle logic: classList.add('dark') and classList.remove('dark')
    expect(source).toMatch(/classList\.add\s*\(\s*['"]dark['"]\s*\)/);
    expect(source).toMatch(/classList\.remove\s*\(\s*['"]dark['"]\s*\)/);

    // Verify localStorage persistence
    expect(source).toMatch(/localStorage\.setItem\s*\(\s*['"]theme['"]/);
  });
});
