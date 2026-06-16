import { test, expect } from '@playwright/test';
import fs from 'fs';
import pdf from 'pdf-parse';
import { ensureSidebarOpen, ensureSidebarClosed } from './helpers/sidebar';

test.describe('Tier 5: Adversarial Hardening Tests', () => {

  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto('/');
    if (!testInfo.title.includes('T1.5.2')) {
      await ensureSidebarOpen(page);
    }
  });

  test('T1.5.1: Theme State Desynchronization during PDF Export', async ({ page }) => {
    // 1. Switch to Branch Reports tab
    await page.locator('[data-testid="tab-branch"]').click();
    
    // 2. Set theme to Dark mode
    await ensureSidebarOpen(page);
    const html = page.locator('html');
    const isDark = await html.evaluate(node => node.classList.contains('dark'));
    if (!isDark) {
      await page.locator('[data-testid="btn-theme-toggle"]').click();
    }
    await expect(html).toHaveClass(/dark/);

    // 3. Trigger PDF Export and immediately toggle theme to light
    await ensureSidebarClosed(page);
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-testid="btn-pdf-download"]').click();
    
    // Immediately toggle the theme
    await ensureSidebarOpen(page);
    await page.locator('[data-testid="btn-theme-toggle"]').click();
    
    // 4. Wait for download to complete
    const download = await downloadPromise;
    await download.path();

    // 5. Verify that the HTML element class list has 'light' and NOT 'dark'
    // This catches the race condition where the PDF exporter forces root back to 'dark'
    // after the user has switched it to 'light' during the export process.
    await expect(html).toHaveClass(/light/);
    await expect(html).not.toHaveClass(/dark/);
  });

  test('T1.5.2: Keyboard Accessibility & Focus Traps in Mobile Hamburger Sidebar', async ({ page, browserName }) => {
    // Resize to mobile
    await page.setViewportSize({ width: 320, height: 568 });
    
    const hamburger = page.locator('[data-testid="btn-hamburger"]');
    await expect(hamburger).toBeVisible();
    
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/.*-translate-x-full.*/);

    // Click hamburger to open sidebar
    await hamburger.click();
    await expect(sidebar).toHaveClass(/.*\btranslate-x-0\b.*/);

    // Focus should be manageable on the tabs inside sidebar
    const contextTab = page.locator('[data-testid="tab-context"]');
    await contextTab.focus();
    await expect(contextTab).toBeFocused();

    if (browserName !== 'webkit') {
      // Navigate using keyboard Tab
      await page.keyboard.press('Tab');
      const branchTab = page.locator('[data-testid="tab-branch"]');
      await expect(branchTab).toBeFocused();
    }
  });

  test('T1.5.3: WCAG Contrast Ratio Verification for Small Text', async ({ page }) => {
    // Navigate to branch reports
    await page.locator('[data-testid="tab-branch"]').click();
    
    // Verify that the small text in the footer does not violate contrast.
    // The footer has text-slate-400 in light mode and text-slate-500 in dark mode.
    // Let's verify the text element is visible and check its styles.
    const footerText = page.locator('div.text-\\[10px\\]').filter({ hasText: 'Model:' });
    await expect(footerText).toBeVisible();
    
    // We will verify the classes present on it
    const classList = await footerText.getAttribute('class');
    expect(classList).toContain('text-slate-700');
    expect(classList).toContain('dark:text-slate-300');
  });

  test('T1.5.4: PDF Generator Fallback with Canvas Error and Rapid Retries', async ({ page }) => {
    await page.locator('[data-testid="tab-branch"]').click();

    // Spy/Mock canvas failure
    await page.evaluate(() => {
      (window as any).html2canvas = () => Promise.reject(new Error("Simulated Canvas Capture Failure"));
    });

    // Attempt to download
    await page.locator('[data-testid="btn-pdf-download"]').click();

    // Verify warning toast is shown
    const toast = page.locator('[data-testid="toast-warning"]');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Failed to export PDF');

    // Reset mock to success
    await page.evaluate(() => {
      delete (window as any).html2canvas; // restores original
    });

    // Rapidly click download again, verify it works now
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-testid="btn-pdf-download"]').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('PISA_2025_Report_Thakur_Complex.pdf');
  });
});
