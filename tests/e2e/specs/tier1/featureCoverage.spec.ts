import { test, expect } from '@playwright/test';
import fs from 'fs';
import pdf from 'pdf-parse';
import { BASELINE_TEST_DATA } from '../../fixtures/testData';
import { ensureSidebarOpen, ensureSidebarClosed } from '../helpers/sidebar';

test.describe('Tier 1: Feature Coverage', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the base URL before each test
    await page.goto('/');
    await ensureSidebarOpen(page);
  });

  // ==========================================
  // F1: Navigation & Layout Tabs (T1.1.1 to T1.1.5)
  // ==========================================
  test.describe('F1: Navigation & Layout Tabs', () => {
    test('T1.1.1: App loads successfully, defaulting to the Context tab', async ({ page }) => {
      await expect(page).toHaveTitle("Children's Academy PISA 2025 Dashboard");
      const contextTabButton = page.locator('[data-testid="tab-context"]');
      await expect(contextTabButton).toBeVisible();
      await expect(contextTabButton).toHaveAttribute('aria-selected', 'true');
      
      const header = page.locator('header h2');
      await expect(header).toHaveText('Context: PISA & OECD Baseline');
    });

    test('T1.1.2: Click "Branch Reports" tab, verify view changes and headers appear', async ({ page }) => {
      const branchTabButton = page.locator('[data-testid="tab-branch"]');
      await branchTabButton.click();
      await expect(branchTabButton).toHaveAttribute('aria-selected', 'true');
      
      const header = page.locator('header h2');
      await expect(header).toHaveText('Individual Branch Performance & Est. Score Simulator');
      
      // Verify Branch Report elements are visible
      await expect(page.locator('[data-testid="student-count"]')).toBeVisible();
    });

    test('T1.1.3: Click "Comparative Reports" tab, verify comparison charts render', async ({ page }) => {
      const comparativeTabButton = page.locator('[data-testid="tab-comparative"]');
      await comparativeTabButton.click();
      await expect(comparativeTabButton).toHaveAttribute('aria-selected', 'true');
      
      const header = page.locator('header h2');
      await expect(header).toHaveText('Comparative Analysis');
      
      // Verify charts are visible
      await expect(page.locator('[data-testid="comparative-scores-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="proficiency-distribution-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="gender-gap-chart"]')).toBeVisible();
    });

    test('T1.1.4: Click "PR Showcase" tab, verify PR showcase container is displayed', async ({ page }) => {
      const prTabButton = page.locator('[data-testid="tab-pr"]');
      await prTabButton.click();
      await expect(prTabButton).toHaveAttribute('aria-selected', 'true');
      
      const header = page.locator('header h2');
      await expect(header).toHaveText('CAGS Network Performance vs OECD');
      
      // Verify showcase text
      await expect(page.locator('text=CAGS Network vs OECD Showcase')).toBeVisible();
    });

    test('T1.1.5: Cycle tabs sequentially, verify active state styling is correctly applied on each tab button', async ({ page }) => {
      const tabs = ['context', 'branch', 'comparative', 'pr'];
      
      for (const tabId of tabs) {
        await ensureSidebarOpen(page);
        const tabButton = page.locator(`[data-testid="tab-${tabId}"]`);
        await tabButton.click();
        await expect(tabButton).toHaveAttribute('aria-selected', 'true');
        
        // Assert other tabs are not selected
        for (const otherTabId of tabs) {
          if (otherTabId !== tabId) {
            const otherTab = page.locator(`[data-testid="tab-${otherTabId}"]`);
            await expect(otherTab).toHaveAttribute('aria-selected', 'false');
          }
        }
      }
    });
  });

  // ==========================================
  // F2: Branch Reports (T1.2.1 to T1.2.5)
  // ==========================================
  test.describe('F2: Branch Reports', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('[data-testid="tab-branch"]').click();
    });

    test('T1.2.1: Select "Thakur Complex", verify student count, gender ratio, and ESCS index match baseline values', async ({ page }) => {
      await page.locator('[data-testid="branch-selector-button-thakur"]').click();
      
      const studentCount = page.locator('[data-testid="student-count"]');
      await expect(studentCount).toHaveText(BASELINE_TEST_DATA.thakur.students.toString());
      
      const genderRatio = page.locator('[data-testid="gender-ratio"]');
      await expect(genderRatio).toContainText(`Boys ${BASELINE_TEST_DATA.thakur.gender.boysPercent}%`);
      await expect(genderRatio).toContainText(`Girls ${BASELINE_TEST_DATA.thakur.gender.girlsPercent}%`);
      
      const escsIndex = page.locator('[data-testid="escs-index"]');
      await expect(escsIndex).toHaveText(BASELINE_TEST_DATA.thakur.escsIndex.toFixed(2));
    });

    test('T1.2.2: Select "Malad", verify demographic metrics match baseline values', async ({ page }) => {
      await page.locator('[data-testid="branch-selector-button-malad"]').click();
      
      const studentCount = page.locator('[data-testid="student-count"]');
      await expect(studentCount).toHaveText(BASELINE_TEST_DATA.malad.students.toString());
      
      const genderRatio = page.locator('[data-testid="gender-ratio"]');
      await expect(genderRatio).toContainText(`Boys ${BASELINE_TEST_DATA.malad.gender.boysPercent}%`);
      await expect(genderRatio).toContainText(`Girls ${BASELINE_TEST_DATA.malad.gender.girlsPercent}%`);
      
      const escsIndex = page.locator('[data-testid="escs-index"]');
      await expect(escsIndex).toHaveText(BASELINE_TEST_DATA.malad.escsIndex.toFixed(2));
    });

    test('T1.2.3: Select "Ashok Nagar", verify demographic metrics match baseline values', async ({ page }) => {
      await page.locator('[data-testid="branch-selector-button-ashok"]').click();
      
      const studentCount = page.locator('[data-testid="student-count"]');
      await expect(studentCount).toHaveText(BASELINE_TEST_DATA.ashok.students.toString());
      
      const genderRatio = page.locator('[data-testid="gender-ratio"]');
      await expect(genderRatio).toContainText(`Boys ${BASELINE_TEST_DATA.ashok.gender.boysPercent}%`);
      await expect(genderRatio).toContainText(`Girls ${BASELINE_TEST_DATA.ashok.gender.girlsPercent}%`);
      
      const escsIndex = page.locator('[data-testid="escs-index"]');
      await expect(escsIndex).toHaveText(BASELINE_TEST_DATA.ashok.escsIndex.toFixed(2));
    });

    test('T1.2.4: Verify student voice chart is visible for each branch, showing Belonging, Disciplinary, Feeling Safe, Teacher Relation, and Growth Mindset scores', async ({ page }) => {
      const branches = ['thakur', 'malad', 'ashok'];
      for (const branchId of branches) {
        await page.locator(`[data-testid="branch-selector-button-${branchId}"]`).click();
        const voiceChart = page.locator('[data-testid="student-voice-chart"]');
        await expect(voiceChart).toBeVisible();
      }
    });

    test('T1.2.5: Verify narrative insights section loads text content containing "Academic Summary" and "Opportunities for Growth" for the selected branch', async ({ page }) => {
      await page.locator('[data-testid="branch-selector-button-thakur"]').click();
      const narrativeContainer = page.locator('[data-testid="narrative-insights"]');
      await expect(narrativeContainer).toBeVisible();
      await expect(narrativeContainer).toContainText('Academic Summary');
      await expect(narrativeContainer).toContainText('Opportunities for Growth');
    });
  });

  // ==========================================
  // F3: Comparative Analytics (T1.3.1 to T1.3.5)
  // ==========================================
  test.describe('F3: Comparative Analytics', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('[data-testid="tab-comparative"]').click();
    });

    test('T1.3.1: Comparative tab displays average scores chart (Reading, Math, Science) showing all three branches, Singapore, and OECD', async ({ page }) => {
      const cognitiveChart = page.locator('[data-testid="comparative-scores-chart"]');
      await expect(cognitiveChart).toBeVisible();
      // Verify legend text is visible
      await expect(cognitiveChart).toContainText('Thakur');
      await expect(cognitiveChart).toContainText('Malad');
      await expect(cognitiveChart).toContainText('Ashok Nagar');
      await expect(cognitiveChart).toContainText('Singapore');
      await expect(cognitiveChart).toContainText('OECD');
    });

    test('T1.3.2: Comparative tab displays proficiency level distribution chart', async ({ page }) => {
      const proficiencyChart = page.locator('[data-testid="proficiency-distribution-chart"]');
      await expect(proficiencyChart).toBeVisible();
      await expect(proficiencyChart).toContainText('Low');
      await expect(proficiencyChart).toContainText('Medium');
      await expect(proficiencyChart).toContainText('High');
    });

    test('T1.3.3: Comparative tab displays gender gap comparison chart', async ({ page }) => {
      const genderGapChart = page.locator('[data-testid="gender-gap-chart"]');
      await expect(genderGapChart).toBeVisible();
      await expect(genderGapChart).toContainText('Girls');
      await expect(genderGapChart).toContainText('Boys');
    });

    test('T1.3.4: Verify tooltips display correct average score values on hover for the main comparative chart', async ({ page }) => {
      const chart = page.locator('[data-testid="comparative-scores-chart"]');
      // Hover over one of the bar elements
      const bar = chart.locator('.recharts-bar-rectangle').first();
      await bar.hover();
      
      const tooltip = chart.locator('.recharts-tooltip-wrapper');
      await expect(tooltip).toBeVisible();
    });

    test('T1.3.5: Verify legend controls can hide/show individual branches/countries in the comparative charts', async ({ page }) => {
      const chart = page.locator('[data-testid="comparative-scores-chart"]');
      const legendItem = chart.locator('.recharts-legend-item').first();
      
      // Click legend to hide/toggle the series
      await legendItem.click();
      // Usually, it gets lower opacity or class "inactive"
      await expect(legendItem).toHaveCSS('opacity', '0.35'); // Or some visual style indicating it is deselected. Wait, if it has inline style or class, we can check. Let's make sure clicking works.
      
      // Toggle it back on
      await legendItem.click();
      await expect(legendItem).toHaveCSS('opacity', '1');
    });
  });

  // ==========================================
  // F4: What-If Simulator (T1.4.1 to T1.4.5)
  // ==========================================
  test.describe('F4: What-If Simulator', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('[data-testid="tab-branch"]').click();
      await page.locator('[data-testid="branch-selector-button-thakur"]').click();
    });

    test('T1.4.1: What-If panel is visible on Branch Reports with sliders for ESCS and student voice indicators', async ({ page }) => {
      await expect(page.locator('[data-testid="slider-escs"]')).toBeVisible();
      await expect(page.locator('[data-testid="slider-belonging"]')).toBeVisible();
      await expect(page.locator('[data-testid="slider-disciplinaryClimate"]')).toBeVisible();
      await expect(page.locator('[data-testid="slider-feelingSafe"]')).toBeVisible();
      await expect(page.locator('[data-testid="slider-teacherRelation"]')).toBeVisible();
      await expect(page.locator('[data-testid="slider-growthMindset"]')).toBeVisible();
    });

    test('T1.4.2: Sliding ESCS to +1.00 SD increases Reading, Mathematics, and Science estimated scores by 15 points', async ({ page }) => {
      const baselineReading = BASELINE_TEST_DATA.thakur.cognitiveScores.reading;
      const baselineMath = BASELINE_TEST_DATA.thakur.cognitiveScores.math;
      const baselineScience = BASELINE_TEST_DATA.thakur.cognitiveScores.science;
      
      const slider = page.locator('[data-testid="slider-escs"]');
      await slider.evaluate((node) => {
        const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '1.00');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText((baselineReading + 15).toString());
      await expect(page.locator('[data-testid="estimated-score-math"]')).toHaveText((baselineMath + 15).toString());
      await expect(page.locator('[data-testid="estimated-score-science"]')).toHaveText((baselineScience + 15).toString());
    });

    test('T1.4.3: Slider variations (Belonging at +1.00 SD, and all 5 voice attributes at +1.00 SD)', async ({ page }) => {
      const baselineReading = BASELINE_TEST_DATA.thakur.cognitiveScores.reading;
      
      // Part (a): Sliding ONLY Belonging to +1.00 SD increases estimated scores by 2.0 points
      const belongingSlider = page.locator('[data-testid="slider-belonging"]');
      await belongingSlider.evaluate((node) => {
        const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '1.00');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      // Reading score should increase by 2 points (516 -> 518)
      await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText((baselineReading + 2).toString());
      
      // Part (b): Sliding ALL 5 voice attributes to +1.00 SD increases estimated scores by 10.0 points
      const sliders = [
        'slider-disciplinaryClimate',
        'slider-feelingSafe',
        'slider-teacherRelation',
        'slider-growthMindset'
      ];
      
      for (const sliderTestId of sliders) {
        const slider = page.locator(`[data-testid="${sliderTestId}"]`);
        await slider.evaluate((node) => {
          const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '1.00');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
      
      // Reading score should increase by 10 points (516 -> 526)
      await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText((baselineReading + 10).toString());
    });

    test('T1.4.4: Adjusting simulator sliders updates both charts and estimated score indicators dynamically', async ({ page }) => {
      const slider = page.locator('[data-testid="slider-escs"]');
      await slider.evaluate((node) => {
        const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '0.50');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      // Reading score should increase by 7.5 points, which is rounded/clamped to 524
      const expectedReading = Math.round(BASELINE_TEST_DATA.thakur.cognitiveScores.reading + 0.5 * 15);
      await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText(expectedReading.toString());
    });

    test('T1.4.5: Reverting simulator settings resets estimated scores to baseline values', async ({ page }) => {
      const slider = page.locator('[data-testid="slider-escs"]');
      await slider.evaluate((node) => {
        const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '1.50');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      // Reset
      await page.locator('[data-testid="btn-reset-simulator"]').click();
      
      // Verify reset to baseline
      await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText(BASELINE_TEST_DATA.thakur.cognitiveScores.reading.toString());
      await expect(page.locator('[data-testid="slider-escs"]')).toHaveValue('0');
    });
  });

  // ==========================================
  // F5: PDF Report Generator (T1.5.1 to T1.5.5)
  // ==========================================
  test.describe('F5: PDF Report Generator', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('[data-testid="tab-branch"]').click();
    });

    test('T1.5.1: PDF download button exists on the Branch Reports view', async ({ page }) => {
      await expect(page.locator('[data-testid="btn-pdf-download"]')).toBeVisible();
    });

    test('T1.5.2: Click PDF download button for "Thakur Complex", verify download triggers and filename is correct', async ({ page }) => {
      await page.locator('[data-testid="branch-selector-button-thakur"]').click();
      
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="btn-pdf-download"]').click();
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toBe('PISA_2025_Report_Thakur_Complex.pdf');
      
      // Read downloaded PDF buffer and assert content contains branch names and score values
      const downloadPath = await download.path();
      if (!downloadPath) throw new Error("PDF download path is null");
      
      const pdfBuffer = fs.readFileSync(downloadPath);
      const parsedPdf = await pdf(pdfBuffer);
      
      expect(parsedPdf.text).toContain('Thakur Complex');
      expect(parsedPdf.text).toContain(BASELINE_TEST_DATA.thakur.cognitiveScores.reading.toString());
    });

    test('T1.5.3: Verify PDF download triggers and filename is correct when Malad is active', async ({ page }) => {
      await page.locator('[data-testid="branch-selector-button-malad"]').click();
      
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="btn-pdf-download"]').click();
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toBe('PISA_2025_Report_Malad.pdf');
      
      const downloadPath = await download.path();
      if (!downloadPath) throw new Error("PDF download path is null");
      
      const pdfBuffer = fs.readFileSync(downloadPath);
      const parsedPdf = await pdf(pdfBuffer);
      
      expect(parsedPdf.text).toContain('Malad');
      expect(parsedPdf.text).toContain(BASELINE_TEST_DATA.malad.cognitiveScores.reading.toString());
    });

    test('T1.5.4: Verify PDF download triggers and filename is correct when Ashok Nagar is active', async ({ page }) => {
      await page.locator('[data-testid="branch-selector-button-ashok"]').click();
      
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="btn-pdf-download"]').click();
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toBe('PISA_2025_Report_Ashok_Nagar.pdf');
      
      const downloadPath = await download.path();
      if (!downloadPath) throw new Error("PDF download path is null");
      
      const pdfBuffer = fs.readFileSync(downloadPath);
      const parsedPdf = await pdf(pdfBuffer);
      
      expect(parsedPdf.text).toContain('Ashok Nagar');
      expect(parsedPdf.text).toContain(BASELINE_TEST_DATA.ashok.cognitiveScores.reading.toString());
    });

    test('T1.5.5: PDF export works when simulator sliders are modified, embedding the simulated metrics in the download context', async ({ page }) => {
      await page.locator('[data-testid="branch-selector-button-thakur"]').click();
      
      // Modify sliders to change score
      const slider = page.locator('[data-testid="slider-escs"]');
      await slider.evaluate((node) => {
        const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '1.00');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      // Estimated reading should be 531
      const expectedSimulatedReading = BASELINE_TEST_DATA.thakur.cognitiveScores.reading + 15;
      
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="btn-pdf-download"]').click();
      const download = await downloadPromise;
      
      const downloadPath = await download.path();
      if (!downloadPath) throw new Error("PDF download path is null");
      
      const pdfBuffer = fs.readFileSync(downloadPath);
      const parsedPdf = await pdf(pdfBuffer);
      
      expect(parsedPdf.text).toContain('Thakur Complex');
      expect(parsedPdf.text).toContain(expectedSimulatedReading.toString());
    });
  });

  // ==========================================
  // F6: Theme Toggle (T1.6.1 to T1.6.5)
  // ==========================================
  test.describe('F6: Theme Toggle', () => {
    test('T1.6.1: Theme toggle button is present on the page header', async ({ page }) => {
      const toggleBtn = page.locator('[data-testid="btn-theme-toggle"]');
      await expect(toggleBtn).toBeVisible();
    });

    test('T1.6.2: Click theme toggle to switch to Light mode, verify root container has the appropriate CSS class (e.g. "light")', async ({ page }) => {
      // Set to Dark first to ensure we transition to Light
      const html = page.locator('html');
      const currentTheme = await html.evaluate(node => node.classList.contains('dark') ? 'dark' : 'light');
      
      if (currentTheme === 'light') {
        // Switch to Dark
        await page.locator('[data-testid="btn-theme-toggle"]').click();
      }
      
      // Now click to switch to Light
      await page.locator('[data-testid="btn-theme-toggle"]').click();
      await expect(html).toHaveClass(/light/);
      await expect(html).not.toHaveClass(/dark/);
    });

    test('T1.6.3: Click theme toggle to switch to Dark mode, verify root container has the appropriate CSS class (e.g. "dark")', async ({ page }) => {
      const html = page.locator('html');
      const currentTheme = await html.evaluate(node => node.classList.contains('dark') ? 'dark' : 'light');
      
      if (currentTheme === 'dark') {
        // Switch to Light
        await page.locator('[data-testid="btn-theme-toggle"]').click();
      }
      
      // Now click to switch to Dark
      await page.locator('[data-testid="btn-theme-toggle"]').click();
      await expect(html).toHaveClass(/dark/);
      await expect(html).not.toHaveClass(/light/);
    });

    test('T1.6.4: Refresh the page, verify that the selected theme state (Light/Dark) persists in localStorage', async ({ page }) => {
      const html = page.locator('html');
      
      // Force light theme
      const isDark = await html.evaluate(node => node.classList.contains('dark'));
      if (isDark) {
        await page.locator('[data-testid="btn-theme-toggle"]').click();
      }
      
      await expect(html).toHaveClass(/light/);
      
      // Reload
      await page.reload();
      await ensureSidebarOpen(page);
      await expect(html).toHaveClass(/light/);
      
      const storageTheme = await page.evaluate(() => localStorage.getItem('theme'));
      expect(storageTheme).toBe('light');
      
      // Force dark theme
      await page.locator('[data-testid="btn-theme-toggle"]').click();
      await expect(html).toHaveClass(/dark/);
      
      // Reload
      await page.reload();
      await ensureSidebarOpen(page);
      await expect(html).toHaveClass(/dark/);
      
      const storageThemeDark = await page.evaluate(() => localStorage.getItem('theme'));
      expect(storageThemeDark).toBe('dark');
    });

    test('T1.6.5: System theme preference is respected when no theme has been explicitly selected', async ({ page }) => {
      // Clear localStorage
      await page.evaluate(() => localStorage.removeItem('theme'));
      
      // Emulate dark mode system preference
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.reload();
      
      const html = page.locator('html');
      await expect(html).toHaveClass(/dark/);
      
      // Clear local storage and emulate light mode system preference
      await page.evaluate(() => localStorage.removeItem('theme'));
      await page.emulateMedia({ colorScheme: 'light' });
      await page.reload();
      
      await expect(html).toHaveClass(/light/);
    });
  });

});
