import { expect } from '@playwright/test';

export async function ensureSidebarOpen(page: any) {
  const hamburger = page.locator('[data-testid="btn-hamburger"]');
  if (await hamburger.isVisible()) {
    const sidebar = page.locator('aside');
    const classList = await sidebar.getAttribute('class') || '';
    if (classList.includes('-translate-x-full')) {
      await hamburger.click();
      await expect(sidebar).toHaveClass(/.*\btranslate-x-0\b.*/);
      await page.waitForTimeout(250);
    }
  }
}

export async function ensureSidebarClosed(page: any) {
  const hamburger = page.locator('[data-testid="btn-hamburger"]');
  if (await hamburger.isVisible()) {
    const sidebar = page.locator('aside');
    const classList = await sidebar.getAttribute('class') || '';
    if (!classList.includes('-translate-x-full')) {
      const backdrop = page.locator('.fixed.inset-0.bg-slate-900\\/50');
      if (await backdrop.isVisible()) {
        // Click the backdrop on the right side of the screen (x=320, relative to top-left of backdrop)
        // to avoid clicking the sidebar itself (which is 256px wide and covers the center of a 390px mobile screen)
        await backdrop.click({ position: { x: 320, y: 100 }, force: true });
        await expect(sidebar).toHaveClass(/.*-translate-x-full.*/);
        await page.waitForTimeout(250);
      } else {
        // Fallback to clicking hamburger directly
        await hamburger.click({ force: true });
        await expect(sidebar).toHaveClass(/.*-translate-x-full.*/);
        await page.waitForTimeout(250);
      }
    }
  }
}
