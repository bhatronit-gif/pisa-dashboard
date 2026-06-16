import { test, expect } from '@playwright/test';
import fs from 'fs';
import pdf from 'pdf-parse';
import { BASELINE_TEST_DATA } from '../../fixtures/testData';
import { ensureSidebarOpen, ensureSidebarClosed } from '../helpers/sidebar';

test.describe('Tier 3: E2E Cross-Feature Combination Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the base URL before each test
    await page.goto('/');
    await ensureSidebarOpen(page);
  });

  // ==========================================
  // T1.3.1.1 (F1 + F2): Tab navigation and active branch selection persistence
  // ==========================================
  test('T1.3.1.1 (F1 + F2): Select branch, cycle tabs, verify branch selection persists', async ({ page }) => {
    // 1. Switch to "Branch Reports" tab
    await page.locator('[data-testid="tab-branch"]').click();
    await expect(page.locator('[data-testid="tab-branch"]')).toHaveAttribute('aria-selected', 'true');

    // 2. Select "Malad" branch
    await page.locator('[data-testid="branch-selector-button-malad"]').click();
    
    // Verify Malad is selected and shows Malad's baseline student count
    await expect(page.locator('#branch-select')).toHaveValue('Malad');
    await expect(page.locator('[data-testid="student-count"]')).toHaveText(BASELINE_TEST_DATA.malad.students.toString());

    // 3. Switch to "Comparative Reports" tab
    await ensureSidebarOpen(page);
    await page.locator('[data-testid="tab-comparative"]').click();
    await expect(page.locator('[data-testid="tab-comparative"]')).toHaveAttribute('aria-selected', 'true');

    // 4. Switch back to "Branch Reports" tab
    await ensureSidebarOpen(page);
    await page.locator('[data-testid="tab-branch"]').click();

    // 5. Verify "Malad" remains the active branch
    await expect(page.locator('#branch-select')).toHaveValue('Malad');
    await expect(page.locator('[data-testid="student-count"]')).toHaveText(BASELINE_TEST_DATA.malad.students.toString());
  });

  // ==========================================
  // T1.3.1.2 (F2 + F4): Branch selection and What-If Simulator reset interaction
  // ==========================================
  test('T1.3.1.2 (F2 + F4): Modify sliders on one branch, switch branch, verify reset of simulator deltas', async ({ page }) => {
    // 1. Switch to "Branch Reports" tab
    await page.locator('[data-testid="tab-branch"]').click();
    
    // 2. Select "Ashok Nagar" branch
    await page.locator('[data-testid="branch-selector-button-ashok"]').click();

    // 3. Modify simulator sliders (ESCS = +1.00 SD, Growth Mindset = +0.50 SD)
    const escsSlider = page.locator('[data-testid="slider-escs"]');
    await escsSlider.evaluate((node) => {
      const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '1.00');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const gmSlider = page.locator('[data-testid="slider-growthMindset"]');
    await gmSlider.evaluate((node) => {
      const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '0.50');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Verify simulated score for Ashok Nagar
    // Reading baseline: 472. ESCS delta (+1.00) increases by 15. Avg voice delta: (0.5 / 5) = 0.1, increases by 1. Total simulated = 472 + 15 + 1 = 488.
    const expectedSimulatedReading = Math.round(BASELINE_TEST_DATA.ashok.cognitiveScores.reading + 15 + 1);
    await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText(expectedSimulatedReading.toString());

    // 4. Switch to "Thakur Complex" branch
    await page.locator('[data-testid="branch-selector-button-thakur"]').click();

    // 5. Verify simulator sliders and estimated scores reset to Thakur's baseline
    await expect(escsSlider).toHaveValue('0');
    await expect(gmSlider).toHaveValue('0');
    await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText(BASELINE_TEST_DATA.thakur.cognitiveScores.reading.toString());
  });

  // ==========================================
  // T1.3.1.3 (F4 + F5): What-If simulation state reflected in exported PDF
  // ==========================================
  test('T1.3.1.3 (F4 + F5): Set sliders, export PDF, verify simulated scores inside downloaded PDF', async ({ page }) => {
    // 1. Switch to "Branch Reports" tab and select "Thakur Complex"
    await page.locator('[data-testid="tab-branch"]').click();
    await page.locator('[data-testid="branch-selector-button-thakur"]').click();

    // 2. Adjust sliders to arbitrary values (ESCS = +0.80 SD, Feeling Safe = +1.20 SD)
    const escsSlider = page.locator('[data-testid="slider-escs"]');
    await escsSlider.evaluate((node) => {
      const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '0.80');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const fsSlider = page.locator('[data-testid="slider-feelingSafe"]');
    await fsSlider.evaluate((node) => {
      const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '1.20');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Verify calculated simulated scores in UI
    // Baseline Reading: 516. ESCS: 0.80 * 15 = 12. Feeling Safe: 1.20 / 5 = 0.24, 0.24 * 10 = 2.4. Total: 516 + 12 + 2.4 = 530.4 -> 530.
    // Baseline Math: 500. ESCS: 0.80 * 15 = 12. Feeling Safe: 2.4. Total: 500 + 12 + 2.4 = 514.4 -> 514.
    // Baseline Science: 497. ESCS: 0.80 * 15 = 12. Feeling Safe: 2.4. Total: 497 + 12 + 2.4 = 511.4 -> 511.
    const expectedReading = 530;
    const expectedMath = 514;
    const expectedScience = 511;

    await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText(expectedReading.toString());
    await expect(page.locator('[data-testid="estimated-score-math"]')).toHaveText(expectedMath.toString());
    await expect(page.locator('[data-testid="estimated-score-science"]')).toHaveText(expectedScience.toString());

    // 3. Trigger PDF export
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-testid="btn-pdf-download"]').click();
    const download = await downloadPromise;

    // 4. Verify suggested filename
    expect(download.suggestedFilename()).toBe('PISA_2025_Report_Thakur_Complex.pdf');

    // 5. Read PDF content and verify simulated scores are parsed
    const downloadPath = await download.path();
    if (!downloadPath) throw new Error("Downloaded PDF path is null");

    const pdfBuffer = fs.readFileSync(downloadPath);
    const parsedPdf = await pdf(pdfBuffer);

    expect(parsedPdf.text).toContain('Thakur Complex');
    expect(parsedPdf.text).toContain(expectedReading.toString());
    expect(parsedPdf.text).toContain(expectedMath.toString());
    expect(parsedPdf.text).toContain(expectedScience.toString());
  });

  // ==========================================
  // T1.3.1.4 (F4 + F6): What-If simulation state preservation during theme toggle
  // ==========================================
  test('T1.3.1.4 (F4 + F6): Set sliders to minimum bounds, toggle theme, verify value preservation and color change', async ({ page }) => {
    // 1. Switch to "Branch Reports" tab and select "Thakur Complex"
    await page.locator('[data-testid="tab-branch"]').click();
    await page.locator('[data-testid="branch-selector-button-thakur"]').click();

    // 2. Set all sliders to minimum bounds (-2.00 SD)
    const sliders = [
      'slider-escs',
      'slider-belonging',
      'slider-disciplinaryClimate',
      'slider-feelingSafe',
      'slider-teacherRelation',
      'slider-growthMindset'
    ];

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

    // Verify Reading score at minimum bounds: 516 - 2*15 - 2*10 = 466
    const expectedMinReading = 466;
    await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText(expectedMinReading.toString());

    // 3. Toggle theme and verify the theme class is changed
    const html = page.locator('html');
    const initialIsDark = await html.evaluate(node => node.classList.contains('dark'));

    await ensureSidebarOpen(page);
    await page.locator('[data-testid="btn-theme-toggle"]').click();
    const afterIsDark = await html.evaluate(node => node.classList.contains('dark'));
    expect(afterIsDark).toBe(!initialIsDark);

    // 4. Verify slider inputs and simulated scores keep their values
    for (const testId of sliders) {
      await expect(page.locator(`[data-testid="${testId}"]`)).toHaveValue('-2');
    }
    await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText(expectedMinReading.toString());

    // 5. Verify colors adjust properly (using aside background color as indicator of active theme change)
    const sidebar = page.locator('aside');
    if (afterIsDark) {
      await expect(sidebar).toHaveCSS('background-color', 'rgb(15, 23, 42)'); // slate-900
    } else {
      await expect(sidebar).toHaveCSS('background-color', 'rgb(255, 255, 255)'); // white
    }
  });

  // ==========================================
  // T1.3.1.5 (F3 + F6): Chart Tooltip readability under Dark Mode
  // ==========================================
  test('T1.3.1.5 (F3 + F6): Toggle to Dark theme, hover over comparative chart, check tooltip visibility and dark styles', async ({ page }) => {
    // 1. Force Dark theme
    const html = page.locator('html');
    const isDark = await html.evaluate(node => node.classList.contains('dark'));
    if (!isDark) {
      await page.locator('[data-testid="btn-theme-toggle"]').click();
    }
    await expect(html).toHaveClass(/dark/);

    // 2. Switch to "Comparative Reports" tab
    await page.locator('[data-testid="tab-comparative"]').click();
    
    // 3. Hover over comparative cognitive chart elements to trigger tooltip
    const chart = page.locator('[data-testid="comparative-scores-chart"]');
    await expect(chart).toBeVisible();
    const firstBar = chart.locator('.recharts-bar-rectangle').first();
    await firstBar.hover();

    // 4. Verify that tooltip container appears
    const tooltip = chart.locator('.recharts-tooltip-wrapper .recharts-default-tooltip');
    await expect(tooltip).toBeVisible();

    // 5. Verify tooltip styling (background, border, text color) matches dark mode specifications
    // From ComparativeCognitiveChart.tsx: backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC'
    await expect(tooltip).toHaveCSS('background-color', 'rgb(30, 41, 59)'); // #1E293B
    await expect(tooltip).toHaveCSS('border-color', 'rgb(51, 65, 85)'); // #334155
    await expect(tooltip).toHaveCSS('color', 'rgb(248, 250, 252)'); // #F8FAFC
  });

  // ==========================================
  // T1.3.1.6 (F5 + F6): PDF Export behavior in Dark Mode
  // ==========================================
  test('T1.3.1.6 (F5 + F6): Switch to Dark theme, export PDF, verify ink-saving light layout capture and restoring dark theme', async ({ page }) => {
    // 1. Force Dark theme
    const html = page.locator('html');
    const isDark = await html.evaluate(node => node.classList.contains('dark'));
    if (!isDark) {
      await page.locator('[data-testid="btn-theme-toggle"]').click();
    }
    await expect(html).toHaveClass(/dark/);

    // 2. Switch to "Branch Reports" tab and select "Thakur Complex"
    await page.locator('[data-testid="tab-branch"]').click();
    await page.locator('[data-testid="branch-selector-button-thakur"]').click();

    // 3. Spy on html2canvas theme check to verify light mode (ink-saving) is forced during capture
    await page.evaluate(() => {
      const originalHtml2canvas = (window as any).html2canvas;
      (window as any).capturedThemeWasDark = false;
      (window as any).html2canvas = function(element: HTMLElement, options: any) {
        (window as any).capturedThemeWasDark = document.documentElement.classList.contains('dark');
        return originalHtml2canvas(element, options);
      };
    });

    // 4. Click PDF Export and await download completion
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-testid="btn-pdf-download"]').click();
    const download = await downloadPromise;

    // Verify correct filename
    expect(download.suggestedFilename()).toBe('PISA_2025_Report_Thakur_Complex.pdf');

    // 5. Verify the captured theme was indeed light (ink-saving)
    const themeWasDarkDuringCapture = await page.evaluate(() => (window as any).capturedThemeWasDark);
    expect(themeWasDarkDuringCapture).toBe(false);

    // 6. Verify page remains in/restores dark mode after export completes
    await expect(html).toHaveClass(/dark/);

    // 7. Verify file contents
    const downloadPath = await download.path();
    if (!downloadPath) throw new Error("Downloaded PDF path is null");

    const pdfBuffer = fs.readFileSync(downloadPath);
    const parsedPdf = await pdf(pdfBuffer);
    expect(parsedPdf.text).toContain('Thakur Complex');
  });

});
