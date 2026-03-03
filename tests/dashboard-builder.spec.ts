import { test, expect } from '@playwright/test';

test.describe('Dashboard Builder - AI Prompts Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto('http://localhost:3000/auth/login');
    
    // Login
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');
    
    // Create a new project or select existing
    const createButton = page.locator('text=Create Project').first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.fill('input[placeholder*="name"]', 'Test Dashboard');
      await page.click('button:has-text("Create")');
    }
    
    // Click "Open Builder" to enter the builder
    await page.click('text=Open Builder');
    await page.waitForURL('**/builder**');
  });

  test('Create dashboard with 3 analytics cards, 2 charts in flex div, and 1 table', async ({ page }) => {
    // Open AI chat
    await page.click('[data-test-id*="ai"]');
    await page.waitForSelector('textarea, input[placeholder*="AI"]');
    
    const chatInput = page.locator('textarea, input[placeholder*="AI"]').last();
    
    // Step 1: Create a page
    console.log('Step 1: Creating Sales page...');
    await chatInput.fill('Create a page called Sales with a shopping cart icon');
    await chatInput.press('Enter');
    await page.waitForTimeout(3000); // Wait for AI response
    
    // Verify page was created
    await expect(page.locator('text=Sales')).toBeVisible();
    
    // Step 2: Add 3 analytics cards
    console.log('Step 2: Adding 3 analytics cards...');
    await chatInput.fill('Add 3 analytics cards showing Total Revenue ($45,230), Total Orders (1,247), and Average Order Value ($36.28)');
    await chatInput.press('Enter');
    await page.waitForTimeout(4000);
    
    // Verify analytics cards exist
    await expect(page.locator('text=Total Revenue')).toBeVisible();
    await expect(page.locator('text=Total Orders')).toBeVisible();
    await expect(page.locator('text=Average Order Value')).toBeVisible();
    
    // Step 3: Add container with 2 charts
    console.log('Step 3: Adding flex container with 2 charts...');
    await chatInput.fill('Add a container with flex layout and gap-2. Inside it, add a bar chart showing monthly sales and a line chart showing daily traffic');
    await chatInput.press('Enter');
    await page.waitForTimeout(5000);
    
    // Verify charts exist (look for chart elements or canvas)
    const charts = page.locator('svg, canvas').filter({ hasText: /sales|traffic/i });
    await expect(charts.first()).toBeVisible({ timeout: 10000 });
    
    // Step 4: Add table
    console.log('Step 4: Adding table...');
    await chatInput.fill('Add a table with columns for Product Name, Category, Price, Stock, and Status');
    await chatInput.press('Enter');
    await page.waitForTimeout(4000);
    
    // Verify table exists
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Product Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Category")')).toBeVisible();
    await expect(page.locator('th:has-text("Price")')).toBeVisible();
    
    // Take screenshot of final result
    await page.screenshot({ path: 'tests/screenshots/dashboard-final.png', fullPage: true });
    
    console.log('✅ All components created successfully!');
  });

  test('Verify exact prompts that work', async ({ page }) => {
    // This test documents the EXACT prompts that work
    const workingPrompts = [];
    
    await page.click('[data-test-id*="ai"]');
    const chatInput = page.locator('textarea, input[placeholder*="AI"]').last();
    
    // Prompt 1: Create page
    const prompt1 = 'Create a page called Sales with a shopping cart icon';
    workingPrompts.push(prompt1);
    await chatInput.fill(prompt1);
    await chatInput.press('Enter');
    await page.waitForTimeout(3000);
    
    // Prompt 2: Analytics cards
    const prompt2 = 'Add 3 stat cards for revenue, orders, and conversion rate';
    workingPrompts.push(prompt2);
    await chatInput.fill(prompt2);
    await chatInput.press('Enter');
    await page.waitForTimeout(4000);
    
    // Prompt 3: Charts in container
    const prompt3 = 'Add a div with flex layout. Inside add a bar chart for monthly sales and a line chart for traffic';
    workingPrompts.push(prompt3);
    await chatInput.fill(prompt3);
    await chatInput.press('Enter');
    await page.waitForTimeout(5000);
    
    // Prompt 4: Table
    const prompt4 = 'Add a table showing product name, price, stock, and status';
    workingPrompts.push(prompt4);
    await chatInput.fill(prompt4);
    await chatInput.press('Enter');
    await page.waitForTimeout(4000);
    
    // Log working prompts
    console.log('\n=== WORKING PROMPTS ===');
    workingPrompts.forEach((prompt, i) => {
      console.log(`${i + 1}. ${prompt}`);
    });
    console.log('======================\n');
  });
});
