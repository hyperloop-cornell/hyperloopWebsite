/**
 * Playwright Demo Recorder
 * Records a comprehensive walkthrough of the Hyperloop website
 */

import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple HTTP server for serving files
function startServer(port = 8000) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      // Decode URL-encoded paths (for filenames with spaces, etc)
      let decodedUrl = decodeURIComponent(req.url);
      let filePath = path.join(__dirname, decodedUrl === '/' ? 'index.html' : decodedUrl);
      
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error(`❌ Failed to load: ${req.url}`);
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        
        const ext = path.extname(filePath);
        const mimeTypes = {
          '.html': 'text/html',
          '.css': 'text/css',
          '.js': 'text/javascript',
          '.json': 'application/json',
          '.avif': 'image/avif',
          '.webp': 'image/webp',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.webm': 'video/webm',
          '.mp4': 'video/mp4',
          '.woff': 'font/woff',
          '.woff2': 'font/woff2',
          '.ttf': 'font/ttf',
          '.eot': 'application/vnd.ms-fontobject',
        };
        
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    
    server.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
      resolve(server);
    });
  });
}

// Wait for all images and videos to fully load
async function waitForAllMedia(page) {
  await page.waitForLoadState('load');
  await page.evaluate(() => {
    return Promise.all(
      Array.from(document.querySelectorAll('img, video')).map(media => {
        if (media.complete || media.readyState >= 3) {
          return Promise.resolve();
        }
        return new Promise(resolve => {
          media.addEventListener('load', resolve, { once: true });
          media.addEventListener('loadeddata', resolve, { once: true });
          media.addEventListener('error', resolve, { once: true });
          // Timeout after 5 seconds per media element
          setTimeout(resolve, 5000);
        });
      })
    );
  }).catch(() => {});
}

// Slowly scroll from top to bottom of page to show all content
async function slowScrollPage(page, duration = 3000) {
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  const steps = Math.ceil(duration / 50); // Scroll in 50ms intervals
  const scrollPerStep = scrollHeight / steps;
  
  for (let i = 0; i <= steps; i++) {
    await page.evaluate((scroll) => window.scrollBy(0, scroll), scrollPerStep);
    await page.waitForTimeout(50);
  }
}

// Scroll back to top slowly
async function scrollToTop(page, duration = 1500) {
  const scrollHeight = await page.evaluate(() => window.scrollY);
  const steps = Math.ceil(duration / 50);
  const scrollPerStep = scrollHeight / steps;
  
  for (let i = 0; i <= steps; i++) {
    await page.evaluate((scroll) => window.scrollBy(0, -scroll), scrollPerStep);
    await page.waitForTimeout(50);
  }
}

async function recordDemo() {
  const server = await startServer(8000);
  const videoDir = path.join(__dirname, '.videos');
  fs.mkdirSync(videoDir, { recursive: true });
  
  try {
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: videoDir }
    });
    
    const page = await context.newPage();
    
    console.log('Starting recording...\n');
    
    // Page 1: Home - Hero animations
    console.log('📺 Visiting home page...');
    await page.goto('http://localhost:8000/index.html');
    await waitForAllMedia(page);
    await page.waitForTimeout(2500); // Let hero animations play
    
    // Hover over nav links (wait for them to load)
    console.log('📺 Hovering over navigation...');
    try {
      await page.waitForSelector('nav a', { timeout: 3000 });
      const navLinks = await page.$$('nav a');
      for (const link of navLinks.slice(0, 2)) {
        await link.hover();
        await page.waitForTimeout(300);
      }
    } catch (e) {
      console.log('⚠️  Nav links not found');
    }
    
    // Hover over Apply button
    try {
      const applyBtn = await page.$('a:has-text("JOIN TEAM")');
      if (applyBtn) {
        await applyBtn.hover();
        await page.waitForTimeout(300);
      }
    } catch (e) {}
    
    // Scroll back to hero
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(600);
    
    // Slowly scroll down to show entire page
    console.log('📺 Scrolling through hero page...');
    await slowScrollPage(page, 4000);
    await page.waitForTimeout(1000);
    
    // Hover over pod CAD card
    try {
      const podCard = await page.$('img[alt="2025 Pod CAD model"]');
      if (podCard) {
        await podCard.hover();
        await page.waitForTimeout(500);
      }
    } catch (e) {}
    
    await page.waitForTimeout(500);
    
    // Scroll back to top
    await scrollToTop(page, 2000);
    await page.waitForTimeout(1500);
    
    // Page 2: Subteams overview
    console.log('📺 Visiting subteams page...');
    await page.click('a[href*="subteams.html"]');
    await waitForAllMedia(page);
    await page.waitForTimeout(1500);
    
    // Hover over some subteam cards
    try {
      const cards = await page.$$('a[href*="subteam"]');
      for (const card of cards.slice(0, 2)) {
        await card.hover();
        await page.waitForTimeout(400);
      }
    } catch (e) {}
    
    await slowScrollPage(page, 3500);
    await page.waitForTimeout(800);
    
    // Page 3: Visit individual subteams
    const subteams = ['braking', 'business', 'ecc', 'magnetic', 'power', 'structures'];
    
    for (const subteam of subteams) {
      console.log(`📺 Visiting ${subteam} subteam...`);
      await page.goto(`http://localhost:8000/subteam-views/subteam-${subteam}.html`);
      await waitForAllMedia(page);
      await page.waitForTimeout(1200);
      await slowScrollPage(page, 2500);
      await page.waitForTimeout(600);
    }
    
    // Page 4: Members
    console.log('📺 Visiting members page...');
    await page.goto('http://localhost:8000/members.html');
    await waitForAllMedia(page);
    await page.waitForTimeout(1500);
    
    // Hover over some member items
    try {
      const items = await page.$$('a, button');
      for (const item of items.slice(0, 2)) {
        await item.hover().catch(() => {});
        await page.waitForTimeout(250);
      }
    } catch (e) {}
    
    await slowScrollPage(page, 4000);
    await page.waitForTimeout(1000);
    
    // Page 5: Sponsors
    console.log('📺 Visiting sponsors page...');
    await page.click('a[href*="sponsors.html"]');
    await waitForAllMedia(page);
    await page.waitForTimeout(1500);
    
    // Hover over some sponsor items
    try {
      const items = await page.$$('a, img');
      for (const item of items.slice(0, 2)) {
        await item.hover().catch(() => {});
        await page.waitForTimeout(250);
      }
    } catch (e) {}
    
    await slowScrollPage(page, 3500);
    await page.waitForTimeout(1000);
    
    // Page 6: Apply
    console.log('📺 Visiting apply page...');
    await page.click('a[href*="apply.html"]');
    await waitForAllMedia(page);
    await page.waitForTimeout(1500);
    
    // Hover over buttons
    try {
      const buttons = await page.$$('button, a[class*="bg-"]');
      for (const btn of buttons.slice(0, 2)) {
        await btn.hover().catch(() => {});
        await page.waitForTimeout(300);
      }
    } catch (e) {}
    
    await slowScrollPage(page, 3500);
    await page.waitForTimeout(1000);
    
    // Demo mobile menu & responsiveness
    console.log('📺 Demonstrating mobile menu...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8000/index.html');
    await waitForAllMedia(page);
    await page.waitForTimeout(1200);
    
    // Open mobile menu
    await page.click('#mobile-menu-btn');
    await page.waitForTimeout(600);
    
    // Slowly scroll through mobile page
    await slowScrollPage(page, 2500);
    await page.waitForTimeout(600);
    
    // Close menu
    await page.click('#mobile-menu-btn');
    await page.waitForTimeout(800);
    
    // Return to desktop and home
    console.log('📺 Returning to home...');
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:8000/index.html');
    await waitForAllMedia(page);
    
    // Final hovers
    try {
      const navLinks = await page.$$('nav a');
      if (navLinks.length > 0) {
        await navLinks[0].hover();
        await page.waitForTimeout(300);
      }
    } catch (e) {}
    
    try {
      const applyBtn = await page.$('a[class*="bg-primary"]');
      if (applyBtn) {
        await applyBtn.hover();
        await page.waitForTimeout(400);
      }
    } catch (e) {}
    
    await page.waitForTimeout(2200); // Final hold on home page
    
    console.log('\n✅ Recording complete!');
    
    // Close context and browser - this finalizes the video
    await context.close();
    await browser.close();
    
    // Find and rename the video file
    const files = fs.readdirSync(videoDir);
    const videoFile = files.find(f => f.endsWith('.webm'));
    
    if (videoFile) {
      const outputPath = path.join(__dirname, 'demo-hyperloop.webm');
      fs.renameSync(path.join(videoDir, videoFile), outputPath);
      const stats = fs.statSync(outputPath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`📹 Video saved to: ${outputPath}`);
      console.log(`📊 File size: ${sizeInMB} MB`);
    }
  } finally {
    server.close();
    console.log('Server stopped.');
  }
}

recordDemo().catch(console.error);
