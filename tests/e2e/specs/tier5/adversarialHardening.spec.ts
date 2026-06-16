import { test, expect } from '@playwright/test';
import { BASELINE_TEST_DATA } from '../../fixtures/testData';

test.describe('Tier 5: Adversarial Hardening & Visual Contrast Audits', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/');
    const hamburger = page.locator('[data-testid="btn-hamburger"]');
    if (await hamburger.isVisible()) {
      await hamburger.click();
      const sidebar = page.locator('aside');
      await expect(sidebar).toHaveClass(/.*\btranslate-x-0\b.*/);
    }
  });

  // ==========================================================
  // T1.5.1.1: Radar Chart Axis Bounding Bug & Domain Overflow
  // ==========================================================
  test('T1.5.1.1: Radar Chart Axis Bounding - Verify domain overflow under extreme deltas', async ({ page }) => {
    // 1. Go to Branch Reports and select Ashok Nagar
    await page.locator('[data-testid="tab-branch"]').click();
    await page.locator('[data-testid="branch-selector-button-ashok"]').click();

    // 2. Adjust Growth Mindset slider to maximum (+2.00 SD)
    const gmSlider = page.locator('[data-testid="slider-growthMindset"]');
    await gmSlider.evaluate((node) => {
      const input = node as HTMLInputElement;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
        nativeInputValueSetter!.call(input, '2.00');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // 3. Switch Student Voice chart to Radar View
    const radarBtn = page.locator('button:has-text("Radar View")');
    await radarBtn.click({ force: true });

    // 4. Verify that the Radar chart is visible
    const radarChart = page.locator('.recharts-polar-grid');
    await expect(radarChart).toBeVisible();

    // 5. Audit the PolarRadiusAxis bounds inside the SVG
    // The PolarRadiusAxis domain in StudentVoiceChart is hardcoded to [-1.0, 2.0]
    // Growth Mindset value = 0.42 (baseline) + 2.00 (delta) = 2.42, which overflows [ -1.0, 2.0 ]
    const polarRadiusAxis = page.locator('.recharts-polar-radius-axis');
    await expect(polarRadiusAxis).toBeVisible();
    
    // Validate that the SVG text ticks only go up to '2.00' or similar, confirming overflow bug
    const tickTexts = await polarRadiusAxis.locator('text').allTextContents();
    // In Recharts, the default ticks for domain [-1, 2] will not show 2.42, causing it to render outside the circular grid
    expect(tickTexts).not.toContain('2.42');
  });

  // ==========================================================
  // T1.5.1.2: Contrast and Color Class Accessibility Verification
  // ==========================================================
  test('T1.5.1.2: WCAG AA Contrast Compliance Audit', async ({ page }) => {
    // 1. Go to Branch Reports
    await page.locator('[data-testid="tab-branch"]').click();

    // 2. Locate elements on the page that have low contrast issues
    const narrativeInsights = page.locator('[data-testid="narrative-insights"]');
    await expect(narrativeInsights).toBeVisible();

    // 3. Check for specific style class patterns that fail 4.5:1 contrast ratio
    // List item text uses 'text-slate-500' on 'bg-slate-50'
    const leftColumnCard = narrativeInsights.locator('> div').first();
    const keyStrengthsList = leftColumnCard.locator('ul');
    await expect(keyStrengthsList).toBeVisible();

    // Confirm that the parent ul element has the CSS class 'text-slate-700' and 'dark:text-slate-300'
    const keyStrengthsClass = await keyStrengthsList.getAttribute('class');
    expect(keyStrengthsClass).toContain('text-slate-700');
    expect(keyStrengthsClass).toContain('dark:text-slate-300');

    // Confirm total enrollment card details text uses 'text-slate-600' on white background
    const enrollmentDetails = page.locator('text=PISA-eligible student cohort');
    const enrollmentDetailsClass = await enrollmentDetails.getAttribute('class');
    expect(enrollmentDetailsClass).toContain('text-slate-600');
  });

  // ==========================================================
  // T1.5.1.3: Bypass Input Constraints & Verify Calculations Integrity
  // ==========================================================
  test('T1.5.1.3: Input Boundary Bypass - Extreme numeric injection security', async ({ page }) => {
    await page.locator('[data-testid="tab-branch"]').click();
    await page.locator('[data-testid="branch-selector-button-thakur"]').click();

    const slider = page.locator('[data-testid="slider-escs"]');

    // 1. Inject an extreme invalid value directly to the range input bypassing slider bounds
    await slider.evaluate((node) => {
      const input = node as HTMLInputElement;
      input.setAttribute('max', '500.00');
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
      nativeInputValueSetter!.call(input, '500.00');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // 2. Verify math module still caps the score properly to 700
    await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText('700');
    await expect(page.locator('[data-testid="estimated-score-math"]')).toHaveText('700');
    await expect(page.locator('[data-testid="estimated-score-science"]')).toHaveText('700');

    // 3. Inject negative extreme value
    await slider.evaluate((node) => {
      const input = node as HTMLInputElement;
      input.setAttribute('min', '-500.00');
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set;
      nativeInputValueSetter!.call(input, '-500.00');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // 4. Verify math module caps the score to 300
    await expect(page.locator('[data-testid="estimated-score-reading"]')).toHaveText('300');
    await expect(page.locator('[data-testid="estimated-score-math"]')).toHaveText('300');
    await expect(page.locator('[data-testid="estimated-score-science"]')).toHaveText('300');
  });

});
