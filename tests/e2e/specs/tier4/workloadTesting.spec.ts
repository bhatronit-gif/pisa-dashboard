import { test, expect } from '@playwright/test';
import fs from 'fs';
import pdf from 'pdf-parse';
import { BASELINE_TEST_DATA } from '../../fixtures/testData';
import { ensureSidebarOpen, ensureSidebarClosed } from '../helpers/sidebar';

test.describe('Tier 4: E2E Real-World Workload Testing', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the base URL before each test
    await page.goto('/');
    await ensureSidebarOpen(page);
  });

  // ==========================================
  // T1.4.1.1: Analytical Journey
  // ==========================================
  test('T1.4.1.1: Analytical Journey - Navigation, identification of lagging branch, details verification', async ({ page }) => {
    // 1. User loads PISA dashboard (defaults to Context tab)
    await expect(page.locator('[data-testid="tab-context"]')).toHaveAttribute('aria-selected', 'true');

    // 2. User switches to "Comparative Reports"
    await page.locator('[data-testid="tab-comparative"]').click();
    await expect(page.locator('[data-testid="tab-comparative"]')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('[data-testid="comparative-scores-chart"]')).toBeVisible();

    // 3. User navigates to "Branch Reports" and selects "Malad"
    await ensureSidebarOpen(page);
    await page.locator('[data-testid="tab-branch"]').click();
    await expect(page.locator('[data-testid="tab-branch"]')).toHaveAttribute('aria-selected', 'true');

    await page.locator('[data-testid="branch-selector-button-malad"]').click();

    // 4. User inspects demographic and student voice baselines for Malad
    await expect(page.locator('#branch-select')).toHaveValue('Malad');
    await expect(page.locator('[data-testid="student-count"]')).toHaveText(BASELINE_TEST_DATA.malad.students.toString());
    
    // Check gender ratio labels
    const genderRatioText = await page.locator('[data-testid="gender-ratio"]').textContent();
    expect(genderRatioText).toContain(`Boys ${BASELINE_TEST_DATA.malad.gender.boysPercent}%`);
    expect(genderRatioText).toContain(`Girls ${BASELINE_TEST_DATA.malad.gender.girlsPercent}%`);

    // Check ESCS index
    await expect(page.locator('[data-testid="escs-index"]')).toHaveText(BASELINE_TEST_DATA.malad.escsIndex.toFixed(2));

    // Verify baseline estimated scores
    await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText(BASELINE_TEST_DATA.malad.cognitiveScores.reading.toString());
    await expect(page.locator('[data-testid="estimated-score-math"]')).toHaveText(BASELINE_TEST_DATA.malad.cognitiveScores.math.toString());
    await expect(page.locator('[data-testid="estimated-score-science"]')).toHaveText(BASELINE_TEST_DATA.malad.cognitiveScores.science.toString());

    // Verify student voice chart container
    await expect(page.locator('[data-testid="student-voice-chart"]')).toBeVisible();
  });

  // ==========================================
  // T1.4.1.2: Policy Simulation Session
  // ==========================================
  test('T1.4.1.2: Policy Simulation Session - Multi-slider adjustments, score verification, PDF export validation', async ({ page }) => {
    // 1. Navigate to "Branch Reports" -> "Thakur Complex"
    await page.locator('[data-testid="tab-branch"]').click();
    await page.locator('[data-testid="branch-selector-button-thakur"]').click();

    // 2. Increase ESCS to +0.50 SD
    const escsSlider = page.locator('[data-testid="slider-escs"]');
    await escsSlider.evaluate((node) => {
      const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '0.50');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // 3. Increase "Feeling Safe" and "Growth Mindset" to +1.00 SD
    const feelingSafeSlider = page.locator('[data-testid="slider-feelingSafe"]');
    await feelingSafeSlider.evaluate((node) => {
      const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '1.00');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const growthMindsetSlider = page.locator('[data-testid="slider-growthMindset"]');
    await growthMindsetSlider.evaluate((node) => {
      const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '1.00');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // 4. Verify cognitive scores change:
    // AvgVoiceDelta = (1.00 + 1.00 + 0 + 0 + 0) / 5 = 0.40 SD
    // Reading baseline: 516. Simulated: Math.round(516 + 0.50*15 + 0.40*10) = Math.round(516 + 7.5 + 4) = Math.round(527.5) = 528.
    // Math baseline: 500. Simulated: Math.round(500 + 7.5 + 4) = Math.round(511.5) = 512.
    // Science baseline: 497. Simulated: Math.round(497 + 7.5 + 4) = Math.round(508.5) = 509.
    const expectedReading = 528;
    const expectedMath = 512;
    const expectedScience = 509;

    await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText(expectedReading.toString());
    await expect(page.locator('[data-testid="estimated-score-math"]')).toHaveText(expectedMath.toString());
    await expect(page.locator('[data-testid="estimated-score-science"]')).toHaveText(expectedScience.toString());

    // Verify deltas in UI show (+12)
    await expect(page.locator('[data-testid="estimated-score-reading"] + span')).toHaveText('(+12)');
    await expect(page.locator('[data-testid="estimated-score-reading"] + span')).toHaveClass(/text-emerald-600/);

    // 5. Export PDF of this simulation
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-testid="btn-pdf-download"]').click();
    const download = await downloadPromise;

    // 6. Verify correct filename and scores passed to download
    expect(download.suggestedFilename()).toBe('PISA_2025_Report_Thakur_Complex.pdf');

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
  // T1.4.1.3: Theme Adaptation & Insight Review
  // ==========================================
  test('T1.4.1.3: Theme Adaptation & Insight Review - Dark mode contrast, narrative insights, and regression simulator styling', async ({ page }) => {
    // 1. Force Dark theme
    const html = page.locator('html');
    const isDark = await html.evaluate(node => node.classList.contains('dark'));
    if (!isDark) {
      await page.locator('[data-testid="btn-theme-toggle"]').click();
    }
    await expect(html).toHaveClass(/dark/);

    // 2. Review Context tab and scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // 3. Navigate to "Branch Reports" -> "Ashok Nagar"
    await page.locator('[data-testid="tab-branch"]').click();
    await page.locator('[data-testid="branch-selector-button-ashok"]').click();

    // 4. Verify Narrative Insights container is visible and has dark styling classes
    await expect(page.locator('[data-testid="narrative-insights"]')).toBeVisible();
    
    // Assert cards inside narrative insights use dark mode classes
    const insightsCards = page.locator('[data-testid="narrative-insights"] > div');
    await expect(insightsCards.first()).toHaveClass(/dark:bg-slate-800\/40/);
    await expect(insightsCards.first().locator('p')).toHaveClass(/dark:text-slate-300/);

    // 5. Adjust "Growth Mindset" slider to -1.50 SD (simulating regression)
    const growthMindsetSlider = page.locator('[data-testid="slider-growthMindset"]');
    await growthMindsetSlider.evaluate((node) => {
      const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '-1.50');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // 6. Verify simulator computes estimated scores accurately and highlights drop in warning colors
    // AvgVoiceDelta = (-1.50 + 0 + 0 + 0 + 0) / 5 = -0.30 SD
    // Ashok Nagar baseline: Reading 472, Math 508, Science 499.
    // Reading Simulated: Math.round(472 + 0*15 + -0.30*10) = Math.round(472 - 3) = 469.
    // Math Simulated: Math.round(508 - 3) = 505.
    // Science Simulated: Math.round(499 - 3) = 496.
    const expectedReading = 469;
    const expectedMath = 505;
    const expectedScience = 496;

    await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText(expectedReading.toString());
    await expect(page.locator('[data-testid="estimated-score-math"]')).toHaveText(expectedMath.toString());
    await expect(page.locator('[data-testid="estimated-score-science"]')).toHaveText(expectedScience.toString());

    // Verify delta indicates (-3) drop and uses warning color (text-red-500)
    const readingDelta = page.locator('[data-testid="estimated-score-reading"] + span');
    await expect(readingDelta).toHaveText('(-3)');
    await expect(readingDelta).toHaveClass(/text-red-500/);

    const mathDelta = page.locator('[data-testid="estimated-score-math"] + span');
    await expect(mathDelta).toHaveText('(-3)');
    await expect(mathDelta).toHaveClass(/text-red-500/);

    const scienceDelta = page.locator('[data-testid="estimated-score-science"] + span');
    await expect(scienceDelta).toHaveText('(-3)');
    await expect(scienceDelta).toHaveClass(/text-red-500/);
  });

  // ==========================================
  // T1.4.1.4: Cross-Comparative Evaluation
  // ==========================================
  test('T1.4.1.4: Cross-Comparative Evaluation - Legend de-selection, Light mode theme toggle, Recharts Tooltip hover', async ({ page }) => {
    // 1. Go to "Comparative Reports"
    await page.locator('[data-testid="tab-comparative"]').click();
    await expect(page.locator('[data-testid="comparative-scores-chart"]')).toBeVisible();

    // 2. Turn off "Singapore" and "OECD" in the chart legend
    const oecdLegend = page.locator('[data-testid="comparative-scores-chart"] .recharts-legend-item', { hasText: 'OECD Average' });
    const singaporeLegend = page.locator('[data-testid="comparative-scores-chart"] .recharts-legend-item', { hasText: 'Singapore Benchmark' });
    
    await oecdLegend.click();
    await singaporeLegend.click();

    // Verify legend item de-selection styling (opacity drops to 0.35)
    await expect(oecdLegend).toHaveCSS('opacity', '0.35');
    await expect(singaporeLegend).toHaveCSS('opacity', '0.35');

    // Verify bars corresponding to OECD Average (#9CA3AF) and Singapore (#F43F5E) are no longer rendered
    const oecdBars = page.locator('[data-testid="comparative-scores-chart"] path[fill="#9CA3AF"], [data-testid="comparative-scores-chart"] rect[fill="#9CA3AF"]');
    const singaporeBars = page.locator('[data-testid="comparative-scores-chart"] path[fill="#F43F5E"], [data-testid="comparative-scores-chart"] rect[fill="#F43F5E"]');
    await expect(oecdBars).toHaveCount(0);
    await expect(singaporeBars).toHaveCount(0);

    // 3. Toggle theme to Light mode
    const html = page.locator('html');
    const isDark = await html.evaluate(node => node.classList.contains('dark'));
    if (isDark) {
      await ensureSidebarOpen(page);
      await page.locator('[data-testid="btn-theme-toggle"]').click();
      await ensureSidebarClosed(page);
    }
    await expect(html).not.toHaveClass(/dark/);

    // 4. Hover over Malad's columns (#14B8A6) and verify tooltip values
    const maladBars = page.locator('[data-testid="comparative-scores-chart"] path[fill="#14B8A6"], [data-testid="comparative-scores-chart"] rect[fill="#14B8A6"]');
    await maladBars.first().hover();

    const tooltip = page.locator('[data-testid="comparative-scores-chart"] .recharts-tooltip-wrapper .recharts-default-tooltip');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('Malad');
    await expect(tooltip).toContainText(BASELINE_TEST_DATA.malad.cognitiveScores.reading.toString());
  });

  // ==========================================
  // T1.4.1.5: Comprehensive Quality Audit Flow
  // ==========================================
  test('T1.4.1.5: Comprehensive Quality Audit Flow - Stress tab cycling, multi-slider reset, audit assertions', async ({ page }) => {
    // 1. Begin tracking console and page errors
    const consoleErrors: string[] = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    // 2. Rapidly cycle through tabs
    await ensureSidebarOpen(page);
    await page.locator('[data-testid="tab-context"]').click();
    await ensureSidebarOpen(page);
    await page.locator('[data-testid="tab-branch"]').click();
    await ensureSidebarOpen(page);
    await page.locator('[data-testid="tab-comparative"]').click();
    await ensureSidebarOpen(page);
    await page.locator('[data-testid="tab-pr"]').click();
    await ensureSidebarOpen(page);
    await page.locator('[data-testid="tab-branch"]').click();

    // 3. Select Malad, raise all well-being voice sliders to +2.00
    await page.locator('[data-testid="branch-selector-button-malad"]').click();

    const voiceSliders = [
      'slider-belonging',
      'slider-disciplinaryClimate',
      'slider-feelingSafe',
      'slider-teacherRelation',
      'slider-growthMindset'
    ];

    for (const testId of voiceSliders) {
      const slider = page.locator(`[data-testid="${testId}"]`);
      await slider.evaluate((node) => {
        const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '2.00');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    // Verify simulated reading score increases to 487 (467 baseline + 20 well-being points)
    await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText('487');

    // Click reset and verify scores revert to baseline
    await page.locator('[data-testid="btn-reset-simulator"]').click();
    await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText(BASELINE_TEST_DATA.malad.cognitiveScores.reading.toString());

    // 4. Select Ashok Nagar, lower ESCS to -2.00
    await page.locator('[data-testid="branch-selector-button-ashok"]').click();
    
    const escsSlider = page.locator('[data-testid="slider-escs"]');
    await escsSlider.evaluate((node) => {
      const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '-2.00');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Verify drop
    // Reading baseline: 472. Simulated: Math.round(472 - 2.00*15) = Math.round(472 - 30) = 442.
    // Math baseline: 508. Simulated: 478.
    // Science baseline: 499. Simulated: 469.
    const expectedReading = 442;
    const expectedMath = 478;
    const expectedScience = 469;

    await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText(expectedReading.toString());
    await expect(page.locator('[data-testid="estimated-score-math"]')).toHaveText(expectedMath.toString());
    await expect(page.locator('[data-testid="estimated-score-science"]')).toHaveText(expectedScience.toString());

    // Export PDF for Ashok Nagar
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-testid="btn-pdf-download"]').click();
    const download = await downloadPromise;

    // Verify suggested filename
    expect(download.suggestedFilename()).toBe('PISA_2025_Report_Ashok_Nagar.pdf');

    const downloadPath = await download.path();
    if (!downloadPath) throw new Error("Downloaded PDF path is null");

    // Parse PDF and verify state matches Ashok Nagar simulation
    const pdfBuffer = fs.readFileSync(downloadPath);
    const parsedPdf = await pdf(pdfBuffer);

    expect(parsedPdf.text).toContain('Ashok Nagar');
    expect(parsedPdf.text).toContain(expectedReading.toString());
    expect(parsedPdf.text).toContain(expectedMath.toString());
    expect(parsedPdf.text).toContain(expectedScience.toString());

    // 5. Toggle theme twice
    const html = page.locator('html');
    const initialIsDark = await html.evaluate(node => node.classList.contains('dark'));

    await ensureSidebarOpen(page);
    await page.locator('[data-testid="btn-theme-toggle"]').click();
    const midIsDark = await html.evaluate(node => node.classList.contains('dark'));
    expect(midIsDark).toBe(!initialIsDark);

    await page.locator('[data-testid="btn-theme-toggle"]').click();
    const finalIsDark = await html.evaluate(node => node.classList.contains('dark'));
    expect(finalIsDark).toBe(initialIsDark);
    await ensureSidebarClosed(page);

    // 6. Verify page had no errors/exceptions
    expect(consoleErrors.length).toBe(0);
  });

});
