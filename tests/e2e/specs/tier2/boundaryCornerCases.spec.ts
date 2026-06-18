import { test, expect } from '@playwright/test';
import fs from 'fs';
import pdf from 'pdf-parse';
import { BASELINE_TEST_DATA } from '../../fixtures/testData';
import { ensureSidebarOpen, ensureSidebarClosed } from '../helpers/sidebar';

test.describe('Tier 2: Boundary & Corner Cases', () => {

  test.beforeEach(async ({ page }, testInfo) => {
    // Navigate to the base URL before each test
    await page.goto('/');
    
    // If we are on mobile viewport and NOT in the layout collapse test, open the sidebar
    if (!testInfo.title.includes('T1.2.1.1')) {
      await ensureSidebarOpen(page);
    }
  });

  // ==========================================
  // F1: Navigation & Layout (T1.2.1.1 to T1.2.1.5)
  // ==========================================
  test.describe('F1: Navigation & Layout', () => {
    test('T1.2.1.1: Mobile Width Navigation Collapse', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      const hamburger = page.locator('[data-testid="btn-hamburger"]');
      await expect(hamburger).toBeVisible();
      
      const sidebar = page.locator('aside');
      // Should have offscreen class (-translate-x-full)
      await expect(sidebar).toHaveClass(/.*-translate-x-full.*/);
      
      // Open sidebar
      await hamburger.click();
      await expect(sidebar).toHaveClass(/.*\btranslate-x-0\b.*/);
      await expect(sidebar).not.toHaveClass(/.*-translate-x-full.*/);
      
      // Click backdrop to close
      const backdrop = page.locator('.fixed.inset-0.bg-slate-900\\/50');
      await expect(backdrop).toBeVisible();
      // Click the backdrop with an offset to avoid clicking the overlapping sidebar (x=300 is safe on a 320px screen width)
      await backdrop.click({ position: { x: 300, y: 100 }, force: true });
      
      // Should collapse again
      await expect(sidebar).toHaveClass(/.*-translate-x-full.*/);
    });

    test('T1.2.1.2: Rapid Tab Cycling (No Layout Shifts)', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('pageerror', (err) => consoleErrors.push(err.message));
      
      const initialBox = await page.locator('main').boundingBox();
      expect(initialBox).not.toBeNull();
      
      // Click rapidly
      await ensureSidebarOpen(page);
      await page.locator('[data-testid="tab-context"]').click();
      await page.waitForTimeout(300);
      await ensureSidebarOpen(page);
      await page.locator('[data-testid="tab-branch"]').click();
      await page.waitForTimeout(300);
      await ensureSidebarOpen(page);
      await page.locator('[data-testid="tab-comparative"]').click();
      await page.waitForTimeout(300);
      await ensureSidebarOpen(page);
      await page.locator('[data-testid="tab-pr"]').click();
      
      // Wait for rendering
      await expect(page.locator('[data-testid="tab-pr"]')).toHaveAttribute('aria-selected', 'true');
      
      const finalBox = await page.locator('main').boundingBox();
      expect(finalBox).not.toBeNull();
      expect(finalBox!.width).toBe(initialBox!.width);
      expect(consoleErrors.length).toBe(0);
    });

    test('T1.2.1.3: Invalid URL Route Redirect', async ({ page }) => {
      await page.goto('/invalid-path');
      // Should fallback to default (Context tab)
      const contextTab = page.locator('[data-testid="tab-context"]');
      await expect(contextTab).toHaveAttribute('aria-selected', 'true');
      const header = page.locator('header h2');
      await expect(header).toHaveText('Context: PISA & OECD Baseline');
    });

    test('T1.2.1.4: Keyboard Tab Navigation & Activation', async ({ page, browserName }) => {
      if (browserName === 'webkit') {
        await page.locator('[data-testid="tab-branch"]').focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('[data-testid="tab-branch"]')).toHaveAttribute('aria-selected', 'true');
        return;
      }
      await page.locator('[data-testid="tab-context"]').focus();
      await page.keyboard.press('Tab');
      const branchTab = page.locator('[data-testid="tab-branch"]');
      await expect(branchTab).toBeFocused();
      
      await page.keyboard.press('Enter');
      await expect(branchTab).toHaveAttribute('aria-selected', 'true');
    });

    test('T1.2.1.5: Print Layout Style Check', async ({ page }) => {
      await page.emulateMedia({ media: 'print' });
      const sidebar = page.locator('aside');
      await expect(sidebar).toHaveCSS('display', 'none');
    });
  });

  // ==========================================
  // F2: Branch Reports (T1.2.2.1 to T1.2.2.5)
  // ==========================================
  test.describe('F2: Branch Reports', () => {
    test('T1.2.2.1: Mobile Chart Responsiveness', async ({ page }) => {
      await page.locator('[data-testid="tab-branch"]').click();
      await page.locator('[data-testid="branch-selector-button-malad"]').click();
      await page.setViewportSize({ width: 375, height: 812 });
      
      const voiceChart = page.locator('[data-testid="student-voice-chart"]');
      await expect(voiceChart).toBeVisible();
      
      const box = await voiceChart.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeLessThanOrEqual(375);
    });

    test('T1.2.2.2: Text Wrapping and Label Overlap Prevention', async ({ page }) => {
      await page.locator('[data-testid="tab-branch"]').click();
      await page.locator('[data-testid="branch-selector-button-ashok"]').click();
      
      const dropdownBox = await page.locator('#branch-select').boundingBox();
      const resetBox = await page.locator('[data-testid="btn-reset-simulator"]').boundingBox();
      
      expect(dropdownBox).not.toBeNull();
      expect(resetBox).not.toBeNull();
      // Dropdown should be stacked above in y-axis relative to reset button
      expect(dropdownBox!.y + dropdownBox!.height).toBeLessThanOrEqual(resetBox!.y);
    });

    test('T1.2.2.3: Chart Max Value Boundary Overflow', async ({ page }) => {
      await page.locator('[data-testid="tab-branch"]').click();
      await page.locator('[data-testid="branch-selector-button-thakur"]').click();
      
      // Set all simulator sliders to max (2.00)
      const sliders = ['slider-escs', 'slider-belonging', 'slider-disciplinaryClimate', 'slider-feelingSafe', 'slider-teacherRelation', 'slider-growthMindset'];
      for (const testId of sliders) {
        const slider = page.locator(`[data-testid="${testId}"]`);
        await slider.evaluate((node) => {
          const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '2.00');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
      
      // Ensure SVG chart container is visible and has positive width/height
      const chartSvg = page.locator('[data-testid="student-voice-chart"] svg').first();
      await expect(chartSvg).toBeVisible();
      const box = await chartSvg.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);
    });

    test('T1.2.2.4: Narrative Insights Content Containment', async ({ page }) => {
      await page.locator('[data-testid="tab-branch"]').click();
      await page.locator('[data-testid="branch-selector-button-thakur"]').click();
      
      // Set extreme sliders to maximize text recommendations
      const sliders = ['slider-escs', 'slider-belonging', 'slider-disciplinaryClimate', 'slider-feelingSafe', 'slider-teacherRelation', 'slider-growthMindset'];
      for (const testId of sliders) {
        const slider = page.locator(`[data-testid="${testId}"]`);
        await slider.evaluate((node) => {
          const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '-2.00');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
      
      const insights = page.locator('[data-testid="narrative-insights"]');
      await expect(insights).toBeVisible();
      const box = await insights.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThan(0);
    });

    test('T1.2.2.5: Empty/Invalid Branch Query Fallback', async ({ page }) => {
      await page.goto('/?branch=');
      await ensureSidebarOpen(page);
      await page.locator('[data-testid="tab-branch"]').click();
      await expect(page.locator('#branch-select')).toHaveValue('Thakur Complex');
      
      await page.goto('/?branch=invalidName');
      await ensureSidebarOpen(page);
      await page.locator('[data-testid="tab-branch"]').click();
      await expect(page.locator('#branch-select')).toHaveValue('Thakur Complex');
    });
  });

  // ==========================================
  // F3: Comparative Analytics (T1.2.3.1 to T1.2.3.5)
  // ==========================================
  test.describe('F3: Comparative Analytics', () => {
    test('T1.2.3.1: Extreme Aspect Ratio Resizing', async ({ page }) => {
      await page.locator('[data-testid="tab-comparative"]').click();
      
      // Ultrawide
      await page.setViewportSize({ width: 2560, height: 1080 });
      const chart = page.locator('[data-testid="comparative-scores-chart"]');
      await expect(chart).toBeVisible();
      
      // Narrow
      await page.setViewportSize({ width: 320, height: 1024 });
      const box = await chart.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeLessThanOrEqual(320);
    });

    test('T1.2.3.2: Empty Legend Toggle Crash Protection', async ({ page }) => {
      await page.locator('[data-testid="tab-comparative"]').click();
      await ensureSidebarClosed(page);
      
      const legendItems = page.locator('[data-testid="comparative-scores-chart"] .recharts-legend-item');
      const count = await legendItems.count();
      for (let i = 0; i < count; i++) {
        await legendItems.nth(i).click();
      }
      
      // Verify placeholder
      const placeholder = page.locator('text=Select at least one branch/benchmark in the legend to display data');
      await expect(placeholder).toBeVisible();
      
      // Toggle one back on
      await legendItems.first().click();
      await expect(placeholder).toBeHidden();
    });

    test('T1.2.3.3: Tooltip Screen Edge Clipping', async ({ page }) => {
      await page.locator('[data-testid="tab-comparative"]').click();
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(300); // Wait for ResponsiveContainer to settle after resize
      
      const chart = page.locator('[data-testid="comparative-scores-chart"]');
      const bar = chart.locator('.recharts-bar-rectangle').last();
      await bar.hover();
      
      const tooltip = chart.locator('.recharts-tooltip-wrapper');
      await expect(tooltip).toBeVisible();
      await page.waitForTimeout(500);
      
      const tooltipBox = await tooltip.boundingBox();
      expect(tooltipBox).not.toBeNull();
      expect(tooltipBox!.x).toBeGreaterThanOrEqual(0);
      expect(tooltipBox!.x + tooltipBox!.width).toBeLessThanOrEqual(375);
    });

    test('T1.2.3.4: Theme-Aware SVG Chart Colors', async ({ page }) => {
      await page.locator('[data-testid="tab-comparative"]').click();
      await ensureSidebarOpen(page);
      
      const html = page.locator('html');
      const isDark = await html.evaluate(node => node.classList.contains('dark'));
      if (isDark) {
        await page.locator('[data-testid="btn-theme-toggle"]').click();
      }
      
      const tick = page.locator('.recharts-cartesian-axis-tick text').first();
      await expect(tick).toHaveAttribute('fill', '#475569');
      
      // Toggle to dark theme
      await ensureSidebarOpen(page);
      await page.locator('[data-testid="btn-theme-toggle"]').click();
      await expect(tick).toHaveAttribute('fill', '#94A3B8');
    });

    test('T1.2.3.5: Stacked Proficiency 100% Validation', async ({ page }) => {
      await page.locator('[data-testid="tab-comparative"]').click();
      
      const subjects = ['READING', 'MATH', 'SCIENCE'];
      for (const subj of subjects) {
        const btn = page.locator('[data-testid="proficiency-distribution-chart"]').locator(`button:has-text("${subj}")`);
        await btn.click();
        
        // Hover over Thakur bar in proficiency chart
        const bar = page.locator('[data-testid="proficiency-distribution-chart"] .recharts-bar-rectangle').first();
        await bar.hover();
        
        const tooltip = page.locator('[data-testid="proficiency-distribution-chart"] .recharts-tooltip-wrapper');
        await expect(tooltip).toBeVisible();
        
        const text = await tooltip.innerText();
        const matches = text.match(/\d+(\.\d+)?%/g);
        expect(matches).not.toBeNull();
        if (matches) {
          const values = matches.map(m => parseFloat(m.replace('%', '')));
          const sum = values.reduce((a, b) => a + b, 0);
          expect(sum).toBeCloseTo(100.0, 1);
        }
      }
    });
  });

  // ==========================================
  // F4: What-If Simulator (T1.2.4.1 to T1.2.4.5)
  // ==========================================
  test.describe('F4: What-If Simulator', () => {
    test('T1.2.4.1: Maximum Bounds Capping (700 Capping)', async ({ page }) => {
      await page.locator('[data-testid="tab-branch"]').click();
      await page.locator('[data-testid="branch-selector-button-thakur"]').click();
      
      const slider = page.locator('[data-testid="slider-escs"]');
      await slider.evaluate((node) => {
        const input = node as HTMLInputElement;
        input.setAttribute('max', '20.00');
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '20.00');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText('700');
      await expect(page.locator('[data-testid="estimated-score-math"]')).toHaveText('700');
      await expect(page.locator('[data-testid="estimated-score-science"]')).toHaveText('700');
    });

    test('T1.2.4.2: Minimum Bounds Capping (300 Bounding)', async ({ page }) => {
      await page.locator('[data-testid="tab-branch"]').click();
      await page.locator('[data-testid="branch-selector-button-thakur"]').click();
      
      const slider = page.locator('[data-testid="slider-escs"]');
      await slider.evaluate((node) => {
        const input = node as HTMLInputElement;
        input.setAttribute('min', '-20.00');
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '-20.00');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText('300');
      await expect(page.locator('[data-testid="estimated-score-math"]')).toHaveText('300');
      await expect(page.locator('[data-testid="estimated-score-science"]')).toHaveText('300');
    });

    test('T1.2.4.3: Opposite Extremes Sliders Simulation', async ({ page }) => {
      await page.locator('[data-testid="tab-branch"]').click();
      await page.locator('[data-testid="branch-selector-button-thakur"]').click();
      
      await page.locator('[data-testid="slider-escs"]').evaluate((node) => {
        const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '2.00');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      const voiceSliders = ['slider-belonging', 'slider-disciplinaryClimate', 'slider-feelingSafe', 'slider-teacherRelation', 'slider-growthMindset'];
      for (const testId of voiceSliders) {
        await page.locator(`[data-testid="${testId}"]`).evaluate((node) => {
          const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '-2.00');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
      
      await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText('526');
      
      await page.locator('[data-testid="slider-escs"]').evaluate((node) => {
        const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '-2.00');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      for (const testId of voiceSliders) {
        await page.locator(`[data-testid="${testId}"]`).evaluate((node) => {
          const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '2.00');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
      await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText('506');
    });

    test('T1.2.4.4: Slider Step Precision Verification', async ({ page }) => {
      await page.locator('[data-testid="tab-branch"]').click();
      const slider = page.locator('[data-testid="slider-escs"]');
      await expect(slider).toHaveAttribute('step', '0.01');
      
      await slider.focus();
      await page.keyboard.press('ArrowRight');
      await expect(slider).toHaveValue('0.01');
      await page.keyboard.press('ArrowLeft');
      await expect(slider).toHaveValue(/^(0|0\.00)$/);
    });

    test('T1.2.4.5: Input Out-of-Bounds Rejection', async ({ page }) => {
      await page.locator('[data-testid="tab-branch"]').click();
      const slider = page.locator('[data-testid="slider-escs"]');
      await expect(slider).toHaveAttribute('min', '-2.00');
      await expect(slider).toHaveAttribute('max', '2.00');
      
      await slider.evaluate((node) => {
        const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '3.50');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      const val = await slider.inputValue();
      expect(parseFloat(val)).toBeLessThanOrEqual(2.00);
      
      await slider.evaluate((node) => {
        const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '-3.50');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      const valMin = await slider.inputValue();
      expect(parseFloat(valMin)).toBeGreaterThanOrEqual(-2.00);
    });
  });

  // ==========================================
  // F5: PDF Report Generator (T1.2.5.1 to T1.2.5.5)
  // ==========================================
  test.describe('F5: PDF Report Generator', () => {
    test('T1.2.5.1: Double-Click Prevention', async ({ page }) => {
      await page.locator('[data-testid="tab-branch"]').click();
      const btn = page.locator('[data-testid="btn-pdf-download"]');
      
      // Add a artificial delay to html2canvas to ensure the button remains disabled
      // long enough for E2E assertions under CPU load, while still triggering the download.
      await page.evaluate(() => {
        const originalHtml2canvas = (window as any).html2canvas;
        (window as any).html2canvas = function(el: any, options: any) {
          return new Promise(resolve => {
            setTimeout(() => {
              originalHtml2canvas(el, options).then(resolve);
            }, 3000);
          });
        };
      });
      
      const downloadPromise = page.waitForEvent('download');
      await btn.click();
      await btn.click({ force: true });
      await expect(btn).toBeDisabled();
      const download = await downloadPromise;
      await download.path();
    });

    test('T1.2.5.2: PDF Export with Extreme Min Bounds', async ({ page }) => {
      await page.locator('[data-testid="tab-branch"]').click();
      await page.locator('[data-testid="branch-selector-button-thakur"]').click();
      
      const sliders = ['slider-escs', 'slider-belonging', 'slider-disciplinaryClimate', 'slider-feelingSafe', 'slider-teacherRelation', 'slider-growthMindset'];
      for (const testId of sliders) {
        await page.locator(`[data-testid="${testId}"]`).evaluate((node) => {
          const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '-2.00');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
      
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="btn-pdf-download"]').click();
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toBe('PISA_2025_Report_Thakur_Complex.pdf');
      
      const path = await download.path();
      expect(path).not.toBeNull();
      if (path) {
        const pdfBuffer = fs.readFileSync(path);
        const parsed = await pdf(pdfBuffer);
        expect(parsed.text).toContain('Thakur Complex');
        expect(parsed.text).toContain('466');
      }
    });

    test('T1.2.5.3: PDF Export with Extreme Max Bounds', async ({ page }) => {
      await page.locator('[data-testid="tab-branch"]').click();
      await page.locator('[data-testid="branch-selector-button-thakur"]').click();
      
      const sliders = ['slider-escs', 'slider-belonging', 'slider-disciplinaryClimate', 'slider-feelingSafe', 'slider-teacherRelation', 'slider-growthMindset'];
      for (const testId of sliders) {
        await page.locator(`[data-testid="${testId}"]`).evaluate((node) => {
          const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '2.00');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
      
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="btn-pdf-download"]').click();
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toBe('PISA_2025_Report_Thakur_Complex.pdf');
      
      const path = await download.path();
      expect(path).not.toBeNull();
      if (path) {
        const pdfBuffer = fs.readFileSync(path);
        const parsed = await pdf(pdfBuffer);
        expect(parsed.text).toContain('Thakur Complex');
        expect(parsed.text).toContain('566');
      }
    });

    test('T1.2.5.4: Fallback for Canvas Capture Failure', async ({ page }) => {
      await page.locator('[data-testid="tab-branch"]').click();
      
      // Mock failure
      await page.evaluate(() => {
        (window as any).html2canvas = () => Promise.reject(new Error("Mocked Canvas Error"));
      });
      
      // Listen to alert dialog
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('Failed to export PDF');
        await dialog.dismiss();
      });
      
      await page.locator('[data-testid="btn-pdf-download"]').click();
      
      // Toast visible
      const toast = page.locator('[data-testid="toast-warning"]');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText('Failed to export PDF');
      
      // Button reset
      const btn = page.locator('[data-testid="btn-pdf-download"]');
      await expect(btn).toBeEnabled();
    });

    test('T1.2.5.5: High-Fidelity Mobile View PDF Dimensions', async ({ page }) => {
      await page.locator('[data-testid="tab-branch"]').click();
      await page.setViewportSize({ width: 375, height: 812 });
      
      // Spy on width setting on captured element
      await page.evaluate(() => {
        const originalHtml2canvas = (window as any).html2canvas;
        (window as any).capturedWidths = [];
        (window as any).html2canvas = function(element: HTMLElement, options: any) {
          (window as any).capturedWidths.push(element.style.width);
          return originalHtml2canvas(element, options);
        };
      });
      
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="btn-pdf-download"]').click();
      const download = await downloadPromise;
      await download.path();
      
      const widths = await page.evaluate(() => (window as any).capturedWidths);
      expect(widths).toContain('1200px');
    });
  });

  // ==========================================
  // F6: Theme Toggle (T1.2.6.1 to T1.2.6.5)
  // ==========================================
  test.describe('F6: Theme Toggle', () => {
    test('T1.2.6.1: Rapid Theme Switching (No FOUC)', async ({ page }) => {
      await ensureSidebarOpen(page);
      const toggle = page.locator('[data-testid="btn-theme-toggle"]');
      const html = page.locator('html');
      
      const initialTheme = await html.evaluate(node => node.classList.contains('dark') ? 'dark' : 'light');
      
      // Click 6 times rapidly
      for (let i = 0; i < 6; i++) {
        await toggle.click();
      }
      
      const finalTheme = await html.evaluate(node => node.classList.contains('dark') ? 'dark' : 'light');
      expect(finalTheme).toBe(initialTheme);
    });

    test('T1.2.6.2: SVG Chart Axis Adaptability', async ({ page }) => {
      await page.locator('[data-testid="tab-comparative"]').click();
      await ensureSidebarOpen(page);
      const toggle = page.locator('[data-testid="btn-theme-toggle"]');
      const html = page.locator('html');
      
      const isDark = await html.evaluate(node => node.classList.contains('dark'));
      if (!isDark) {
        await toggle.click();
      }
      
      const gridLine = page.locator('.recharts-cartesian-grid-horizontal line').first();
      await expect(gridLine).toHaveAttribute('stroke', '#334155');
      
      await toggle.click();
      await expect(gridLine).toHaveAttribute('stroke', '#E2E8F0');
    });

    test('T1.2.6.3: Custom Components Styling Check', async ({ page }) => {
      await ensureSidebarOpen(page);
      const toggle = page.locator('[data-testid="btn-theme-toggle"]');
      const html = page.locator('html');
      
      const isDark = await html.evaluate(node => node.classList.contains('dark'));
      if (!isDark) {
        await toggle.click();
      }
      
      const sidebar = page.locator('aside');
      await expect(sidebar).toHaveCSS('background-color', 'rgb(15, 23, 42)');
      
      await toggle.click();
      await expect(sidebar).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    });

    test('T1.2.6.4: Ink-Saving Print PDF Styling standard', async ({ page }) => {
      await page.locator('[data-testid="tab-branch"]').click();
      await ensureSidebarOpen(page);
      const toggle = page.locator('[data-testid="btn-theme-toggle"]');
      const html = page.locator('html');
      
      const isDark = await html.evaluate(node => node.classList.contains('dark'));
      if (!isDark) {
        await toggle.click();
      }
      
      // Setup spy
      await page.evaluate(() => {
        const originalHtml2canvas = (window as any).html2canvas;
        (window as any).capturedThemeWasDark = false;
        (window as any).html2canvas = function(element: HTMLElement, options: any) {
          (window as any).capturedThemeWasDark = document.documentElement.classList.contains('dark');
          return originalHtml2canvas(element, options);
        };
      });
      
      await ensureSidebarClosed(page);
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="btn-pdf-download"]').click();
      const download = await downloadPromise;
      await download.path();
      
      const themeWasDarkDuringCapture = await page.evaluate(() => (window as any).capturedThemeWasDark);
      expect(themeWasDarkDuringCapture).toBe(false);
      
      await expect(html).toHaveClass(/dark/);
    });

    test('T1.2.6.5: LocalStorage Malformed Value Recovery', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('theme', 'malformed');
      });
      await page.reload();
      
      const html = page.locator('html');
      await expect(html).toHaveClass(/light|dark/);
      
      const saved = await page.evaluate(() => localStorage.getItem('theme'));
      expect(['light', 'dark']).toContain(saved);
    });
  });

});
