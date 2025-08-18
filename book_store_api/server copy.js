const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors')

const app = express();
const port = process.env.PORT || 3000;
// Create downloads directory if it doesn't exist
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');

app.use(cors())

async function ensureDownloadsDir() {
    try {
        await fs.access(DOWNLOADS_DIR);
    } catch {
        await fs.mkdir(DOWNLOADS_DIR, { recursive: true });
        console.log(`Created downloads directory: ${DOWNLOADS_DIR}`);
    }
}
ensureDownloadsDir();
app.use(express.json());
/**
 * Advanced cookie banner and content bypass for StuDocu
 */
const bypassCookiesAndRestrictions = async (page) => {
    console.log("🍪 Starting comprehensive cookie and restriction bypass...");
    // Step 1: Set cookies before page load
    const preCookies = [
        { name: 'cookieConsent', value: 'accepted', domain: '.studocu.com' },
        { name: 'cookie_consent', value: 'true', domain: '.studocu.com' },
        { name: 'gdpr_consent', value: 'accepted', domain: '.studocu.com' },
        { name: 'privacy_policy_accepted', value: 'true', domain: '.studocu.com' },
        { name: 'user_consent', value: '1', domain: '.studocu.com' },
        { name: 'analytics_consent', value: 'false', domain: '.studocu.com' },
        { name: 'marketing_consent', value: 'false', domain: '.studocu.com' },
        { name: 'functional_consent', value: 'true', domain: '.studocu.com' },
    ];
    for (const cookie of preCookies) {
        try {
            await page.setCookie(cookie);
        } catch (e) {
            console.log(`Failed to set cookie ${cookie.name}:`, e.message);
        }
    }
    // Step 2: Inject CSS to hide cookie banners immediately
    await page.addStyleTag({
        content: `
            /* Hide all possible cookie banners */
            [id*="cookie" i]:not(img):not(input),
            [class*="cookie" i]:not(img):not(input),
            [data-testid*="cookie" i],
            [aria-label*="cookie" i],
            .gdpr-banner, .gdpr-popup, .gdpr-modal,
            .consent-banner, .consent-popup, .consent-modal,
            .privacy-banner, .privacy-popup, .privacy-modal,
            .cookie-law, .cookie-policy, .cookie-compliance,
            .onetrust-banner-sdk, #onetrust-consent-sdk,
            .cmp-banner, .cmp-popup, .cmp-modal,
            [class*="CookieBanner"], [class*="CookieNotice"],
            [class*="ConsentBanner"], [class*="ConsentManager"],
            .cc-banner, .cc-window, .cc-compliance,
            div[style*="position: fixed"]:has-text("cookie"),
            div[style*="position: fixed"]:has-text("consent"),
            .fixed:has-text("cookie"), .fixed:has-text("consent") {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                z-index: -9999 !important;
                pointer-events: none !important;
            }
            /* Remove blur and premium overlays */
            [class*="blur" i], [class*="premium" i], [class*="paywall" i],
            [class*="sample-preview-blur" i] {
                filter: none !important;
                backdrop-filter: none !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            /* Ensure document content is visible */
            .document-content, .page-content, [data-page] {
                filter: none !important;
                opacity: 1 !important;
                visibility: visible !important;
                pointer-events: auto !important;
            }
            /* Remove fixed overlays */
            .fixed-overlay, .sticky-overlay, .content-overlay {
                display: none !important;
            }
            /* Restore scrolling */
            html, body {
                overflow: auto !important;
                position: static !important;
            }
        `
    });
    // Step 3: Inject JavaScript to handle dynamic cookie banners
    await page.evaluateOnNewDocument(() => {
        // Override common cookie consent functions
        window.cookieConsent = { accepted: true };
        window.gtag = () => { };
        window.ga = () => { };
        window.dataLayer = [];
        // Mutation observer to catch dynamically added cookie banners
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        const element = node;
                        const text = element.textContent || '';
                        const className = element.className || '';
                        const id = element.id || '';
                        // Check if this looks like a cookie banner
                        if (
                            text.toLowerCase().includes('cookie') ||
                            text.toLowerCase().includes('consent') ||
                            text.toLowerCase().includes('privacy policy') ||
                            className.toLowerCase().includes('cookie') ||
                            className.toLowerCase().includes('consent') ||
                            className.toLowerCase().includes('gdpr') ||
                            id.toLowerCase().includes('cookie') ||
                            id.toLowerCase().includes('consent')
                        ) {
                            console.log('Removing detected cookie banner:', element);
                            element.remove();
                        }
                    }
                });
            });
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        // Set up periodic cleanup
        setInterval(() => {
            const cookieElements = document.querySelectorAll(`
                [id*="cookie" i]:not(img):not(input),
                [class*="cookie" i]:not(img):not(input),
                [data-testid*="cookie" i],
                .gdpr-banner, .consent-banner, .privacy-banner,
                .onetrust-banner-sdk, #onetrust-consent-sdk,
                .cmp-banner, .cc-banner
            `);
            cookieElements.forEach(el => el.remove());
            // Restore body scroll
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
        }, 1000);
    });
    return true;
};
/**
 * Enhanced content unblurring and premium bypass (integrated from extension script)
 */
const unblurContent = async (page) => {
    console.log("🔓 Unblurring content and bypassing premium restrictions...");
    await page.evaluate(() => {
        // Function to remove all visual restrictions
        const removeRestrictions = () => {
            const removeBySelector = (selector) => {
                document.querySelectorAll(selector).forEach(el => el.remove());
            };
            // Remove ads by known class or ID
            removeBySelector("#adbox");
            removeBySelector(".adsbox");
            removeBySelector(".ad-box");
            removeBySelector(".banner-ads");
            removeBySelector(".advert");
            // Remove premium banner container
            removeBySelector(".PremiumBannerBlobWrapper_overflow-wrapper__xsaS8");
            // Enhanced blur removal
            const removeBlur = (element = document) => {
                element.querySelectorAll("*").forEach(el => {
                    const style = window.getComputedStyle(el);
                    // Check for blur via filter, backdrop-filter, or class names
                    if (
                        style.filter?.includes("blur") ||
                        style.backdropFilter?.includes("blur") ||
                        parseFloat(style.opacity) < 1 ||
                        (el.className && el.className.toString().toLowerCase().includes("blur")) ||
                        (el.className && el.className.toString().toLowerCase().includes("premium"))
                    ) {
                        el.style.filter = "none !important";
                        el.style.backdropFilter = "none !important";
                        el.style.opacity = "1 !important";
                        if (el.classList) {
                            el.classList.remove("blur", "blurred", "premium-blur");
                        }
                    }
                    // Check parent elements for blur-inducing styles
                    const parent = el.parentElement;
                    if (parent) {
                        const parentStyle = window.getComputedStyle(parent);
                        if (
                            parentStyle.filter?.includes("blur") ||
                            parentStyle.backdropFilter?.includes("blur") ||
                            parseFloat(parentStyle.opacity) < 1
                        ) {
                            parent.style.filter = "none !important";
                            parent.style.backdropFilter = "none !important";
                            parent.style.opacity = "1 !important";
                        }
                    }
                });
            };
            // Remove dark overlays and paywall-like elements
            document.querySelectorAll("div, section, aside").forEach(el => {
                const style = window.getComputedStyle(el);
                if (
                    style.backgroundColor.includes("rgba") &&
                    (style.backgroundColor.includes("0.5") || parseFloat(style.zIndex) > 1000) ||
                    (el.className && el.className.toString().toLowerCase().includes("overlay")) ||
                    (el.className && el.className.toString().toLowerCase().includes("paywall"))
                ) {
                    el.remove();
                }
            });
            removeBlur();
            // Remove other restrictions
            removeBySelector('[class*="blur" i], [class*="premium" i], [class*="paywall" i], [class*="sample-preview-blur" i]');
            // Ensure document content is visible
            const contentSelectors = [
                '.document-content',
                '.page-content',
                '.content',
                '[data-page]',
                '[data-testid*="document"]',
                '[data-testid*="page"]',
                '.page',
                '.document-page',
                'main',
                'article'
            ];
            contentSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    el.style.setProperty('filter', 'none', 'important');
                    el.style.setProperty('opacity', '1', 'important');
                    el.style.setProperty('visibility', 'visible', 'important');
                    el.style.setProperty('display', 'block', 'important');
                    el.style.setProperty('pointer-events', 'auto', 'important');
                });
            });
            // Remove overlay divs that might be blocking content
            const overlays = document.querySelectorAll(`
                [class*="overlay" i],
                [class*="modal" i],
                [class*="popup" i],
                [class*="banner" i],
                [style*="position: fixed"],
                [style*="position: absolute"][style*="z-index"]
            `);
            overlays.forEach(overlay => {
                const text = overlay.textContent || '';
                if (text.includes('premium') || text.includes('unlock') ||
                    text.includes('subscribe') || text.includes('cookie') ||
                    text.includes('consent') || text.includes('login')) {
                    overlay.remove();
                }
            });
        };
        // Run immediately
        removeRestrictions();
        // Run periodically
        const intervalId = setInterval(removeRestrictions, 2000);
        // Clean up after 60 seconds
        setTimeout(() => {
            clearInterval(intervalId);
        }, 60000);
    });
};
/**
 * Apply print styles for clean PDF output (integrated from extension script with improvements)
 */
const applyPrintStyles = async (page) => {
    console.log("🖨️ Applying print styles for clean PDF...");
    await page.evaluate(() => {
        const style = document.createElement("style");
        style.id = "print-style-extension";
        style.innerHTML = `
            @page {
                size: A4 portrait;
                margin: 5mm;
            }
            @media print {
                html, body {
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: visible !important;
                }
                header, footer, nav, aside, .no-print, .ads, .sidebar,
                .premium-banner, .ViewerToolbar, .Layout_info-bar-wrapper__He0Ho,
                .Sidebar_sidebar-scrollable__kqeBZ, .HeaderWrapper_header-wrapper__mCmf3,
                .Layout_visible-content-bottom-wrapper-sticky__yaaAB,
                .Layout_bottom-section-wrapper__yBWWk,
                .Layout_footer-wrapper__bheJQ, .InlineBanner_inline-banner-wrapper__DAi5X,
                .banner-wrapper, #top-bar-wrapper,
                .Layout_sidebar-wrapper__unavM,
                .Layout_is-open__9DQr4 {
                  display: none !important;
                }
                body {
                  background: white !important;
                  color: black !important;
                }
                * {
                  box-shadow: none !important;
                  background: transparent !important;
                }
                .Viewer_document-wrapper__JPBWQ,
                .Viewer_document-wrapper__LXzoQ,
                .Viewer_document-wrapper__XsO4j,
                .page-content {
                  display: flex !important;
                  flex-direction: column !important;
                  width: 100% !important;
                  max-width: 210mm !important;
                  margin: 0 auto !important;
                }
                [data-page], .page, .document-page, img {
                  page-break-after: always !important;
                  page-break-inside: avoid !important;
                  page-break-before: avoid !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  height: auto !important;
                }
            }
        `;
        document.head.appendChild(style);
    });
};
/**
 * Enhanced StuDocu downloader with comprehensive bypasses and login support
 */
const studocuDownloader = async (url, options = {}) => {
    let browser;
    try {
        console.log("🚀 Launching browser with stealth configuration...");
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-features=VizDisplayCompositor',
                '--disable-background-networking',
                '--disable-background-timer-throttling',
                '--disable-renderer-backgrounding',
                '--disable-backgrounding-occluded-windows',
                '--disable-ipc-flooding-protection',
                '--disable-web-security',
                '--disable-features=site-per-process',
                '--disable-blink-features=AutomationControlled',
                '--disable-extensions'
            ],
            timeout: 300000,
        });
        const page = await browser.newPage();
        // Set realistic browser characteristics
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 794, height: 1122 });
        // Hide webdriver property
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        });
        // Set up cookie and content bypass
        await bypassCookiesAndRestrictions(page);
        // Block unnecessary resources
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            const reqUrl = req.url();
            // Block trackers, ads, and analytics
            if (reqUrl.includes('doubleclick') || reqUrl.includes('googletagmanager') ||
                reqUrl.includes('facebook.com') || reqUrl.includes('twitter.com') ||
                reqUrl.includes('analytics') || reqUrl.includes('gtm') ||
                reqUrl.includes('hotjar') || reqUrl.includes('mixpanel') ||
                reqUrl.includes('onetrust') || reqUrl.includes('cookielaw') ||
                resourceType === 'other' && reqUrl.includes('track')) {
                req.abort();
            } else {
                req.continue();
            }
        });
        // Login if credentials provided (for premium content)
        if (options.email && options.password) {
            console.log("🔑 Logging in to StuDocu...");
            await page.goto('https://www.studocu.com/en-us/login', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            await page.waitForSelector('#email', { timeout: 15000 });
            await page.type('#email', options.email);
            await page.type('#password', options.password);
            await page.click('button[type="submit"]');
            try {
                await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
                // Additional check for successful login
                await page.waitForSelector('.user-profile, [data-testid="user-menu"]', { timeout: 10000 });
                console.log("✅ Login successful.");
            } catch (e) {
                console.error("❌ Login failed:", e.message);
                throw new Error("Login failed. Check credentials, if CAPTCHA is present, or try again.");
            }
        } else {
            console.log("⚠️ No login credentials provided. Full unblurred content requires premium account.");
        }
        console.log(`📄 Navigating to ${url}...`);
        // Navigate with retry logic
        let navigationSuccess = false;
        let attempts = 0;
        const maxAttempts = 3;
        while (!navigationSuccess && attempts < maxAttempts) {
            try {
                attempts++;
                console.log(`Navigation attempt ${attempts}/${maxAttempts}`);
                await page.goto(url, {
                    waitUntil: 'domcontentloaded',
                    timeout: 60000
                });
                navigationSuccess = true;
            } catch (e) {
                console.log(`Navigation attempt ${attempts} failed:`, e.message);
                if (attempts >= maxAttempts) throw e;
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        // Wait for initial load
        await new Promise(resolve => setTimeout(resolve, 5000));
        // Apply content unblurring
        await unblurContent(page);
        // Wait for document content with multiple selectors
        console.log("⏳ Waiting for document content to load...");
        const contentSelectors = [
            '.document-content',
            '.page-content',
            '[data-page]',
            '[data-testid*="document"]',
            'img[src*="document"]',
            'img[src*="page"]',
            '.page',
            'main img',
            'article img'
        ];
        let contentFound = false;
        for (const selector of contentSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 20000 });
                console.log(`✅ Found content with selector: ${selector}`);
                contentFound = true;
                break;
            } catch (e) {
                console.log(`❌ Selector ${selector} not found, trying next...`);
            }
        }
        if (!contentFound) {
            console.log("⚠️ No specific content selector found, proceeding with page content...");
        }
        // Enhanced scrolling to load all content (adapted from extension script)
        console.log("📜 Loading all document pages with slow scroll...");
        await page.evaluate(async () => {
            const delay = (ms) => new Promise((res) => setTimeout(res, ms));
            const scrollPageToBottom = async () => {
                let totalHeight = 0;
                const distance = 300;
                return new Promise(async (resolve) => {
                    const timer = setInterval(async () => {
                        const scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        if (totalHeight >= scrollHeight - window.innerHeight) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 300);
                });
            };
            // Scroll to top first
            window.scrollTo({ top: 0, behavior: "smooth" });
            await delay(500);
            // Scroll to bottom to load content
            await scrollPageToBottom();
            // Scroll back to top
            window.scrollTo({ top: 0, behavior: "smooth" });
            await delay(1000);
            // Perform again for reliability
            await scrollPageToBottom();
            window.scrollTo({ top: 0, behavior: "smooth" });
            await delay(1000);
        });
        // Wait for all images to load
        console.log("🖼️ Waiting for all images to load...");
        await page.evaluate(async () => {
            const images = Array.from(document.querySelectorAll('img'));
            await Promise.all(images.map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise((resolve) => {
                    img.addEventListener('load', resolve);
                    img.addEventListener('error', resolve);
                    setTimeout(resolve, 15000);
                });
            }));
        });
        // Additional wait for any lazy loading
        await new Promise(resolve => setTimeout(resolve, 10000));
        // Set exact height to avoid extra blank pages
        console.log("📏 Setting exact document height...");
        await page.evaluate(() => {
            const getDocumentHeight = () => Math.max(
                document.body.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.clientHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight
            );
            const height = getDocumentHeight();
            document.body.style.height = `${height}px !important`;
            document.documentElement.style.height = `${height}px !important`;
            document.body.style.overflow = 'hidden !important';
        });
        // Final content verification
        const contentCheck = await page.evaluate(() => {
            const textContent = document.body.textContent || '';
            const images = document.querySelectorAll('img');
            const documentImages = Array.from(images).filter(img =>
                img.src.includes('document') ||
                img.src.includes('page') ||
                img.alt.includes('document') ||
                img.alt.includes('page')
            );
            return {
                totalText: textContent.length,
                totalImages: images.length,
                documentImages: documentImages.length,
                hasDocumentContent: documentImages.length > 0 || textContent.length > 1000,
                sampleText: textContent.substring(0, 300)
            };
        });
        console.log("📊 Content verification:", {
            textLength: contentCheck.totalText,
            images: contentCheck.totalImages,
            documentImages: contentCheck.documentImages,
            hasContent: contentCheck.hasDocumentContent
        });
        if (!contentCheck.hasDocumentContent) {
            console.warn("⚠️ Warning: Limited document content detected. Use premium credentials for full access.");
        }
        // Apply print styles
        await applyPrintStyles(page);
        // Emulate print media
        await page.emulateMediaType('print');
        // Generate PDF
        console.log("🔄 Generating PDF...");
        const pdfBuffer = await page.pdf({
            printBackground: true,
            preferCSSPageSize: true,
            displayHeaderFooter: false,
            timeout: 180000,
            scale: 1,
            omitBackground: false
        });
        console.log(`✅ PDF generated successfully! Size: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);
        // Save locally if requested
        if (options.saveLocally) {
            await savePDFLocally(pdfBuffer, url, options.filename);
        }
        return pdfBuffer;
    } catch (error) {
        console.error("❌ Error during PDF generation:", error);
        if (error.message.includes('timeout')) {
            throw new Error("Request timed out. The document may be taking too long to load. Please try again.");
        } else if (error.message.includes('net::')) {
            throw new Error("Network error. Please check the URL and your internet connection.");
        } else if (error.message.includes('ERR_BLOCKED')) {
            throw new Error("Access blocked. Try again or check if the document is publicly accessible.");
        } else {
            throw new Error(`Failed to generate PDF: ${error.message}`);
        }
    } finally {
        if (browser) {
            console.log("🔒 Closing browser...");
            try {
                await browser.close();
            } catch (e) {
                console.log("Error closing browser:", e.message);
            }
        }
    }
};
/**
 * Save PDF buffer to local file system
 */
const savePDFLocally = async (pdfBuffer, url, customFilename = null) => {
    try {
        let filename;
        if (customFilename) {
            filename = customFilename.endsWith('.pdf') ? customFilename : `${customFilename}.pdf`;
        } else {
            const urlParts = url.split('/');
            const documentId = urlParts[urlParts.length - 1].split('?')[0];
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            filename = `studocu_${documentId}_${timestamp}.pdf`;
        }
        const filepath = path.join(DOWNLOADS_DIR, filename);
        await fs.writeFile(filepath, pdfBuffer);
        console.log(`💾 PDF saved: ${filepath} (${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
        return filepath;
    } catch (error) {
        console.error('❌ Failed to save PDF:', error.message);
        throw error;
    }
};
// API Routes
app.post('/api/download', async (req, res) => {
    const { url, saveLocally = false, filename, returnFile = true, email, password } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required.' });
    }
    if (!url.includes('studocu.com')) {
        return res.status(400).json({ error: 'Please provide a valid StuDocu URL.' });
    }
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) {
        normalizedUrl = 'https://' + normalizedUrl;
    }
    console.log(`🎯 Processing request for: ${normalizedUrl}`);
    try {
        const startTime = Date.now();
        const pdfBuffer = await studocuDownloader(normalizedUrl, { saveLocally, filename, email, password });
        const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
        if (returnFile) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=studocu-document.pdf');
            res.setHeader('Content-Length', pdfBuffer.length);
            res.send(pdfBuffer);
        } else {
            res.json({
                success: true,
                message: saveLocally ? 'PDF saved locally successfully' : 'PDF generated successfully',
                processingTime: `${processingTime}s`,
                size: `${(pdfBuffer.length / 1024 / 1024).toFixed(2)}MB`
            });
        }
        console.log(`🎉 Request completed successfully in ${processingTime}s`);
    } catch (error) {
        console.error(`❌ Failed to process ${normalizedUrl}:`, error.message);
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/save', async (req, res) => {
    const { url, filename, email, password } = req.body;
    if (!url || !url.includes('studocu.com')) {
        return res.status(400).json({ error: 'Please provide a valid StuDocu URL.' });
    }
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) {
        normalizedUrl = 'https://' + normalizedUrl;
    }
    try {
        const startTime = Date.now();
        const pdfBuffer = await studocuDownloader(normalizedUrl, { saveLocally: true, filename, email, password });
        const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
        res.json({
            success: true,
            message: 'PDF saved locally successfully',
            processingTime: `${processingTime}s`,
            size: `${(pdfBuffer.length / 1024 / 1024).toFixed(2)}MB`,
            savedTo: DOWNLOADS_DIR
        });
    } catch (error) {
        console.error(`❌ Failed to save ${normalizedUrl}:`, error.message);
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/saved', async (req, res) => {
    try {
        const files = await fs.readdir(DOWNLOADS_DIR);
        const pdfFiles = files.filter(file => file.endsWith('.pdf'));
        const fileDetails = await Promise.all(
            pdfFiles.map(async (filename) => {
                const filepath = path.join(DOWNLOADS_DIR, filename);
                const stats = await fs.stat(filepath);
                return {
                    filename,
                    size: `${(stats.size / 1024 / 1024).toFixed(2)}MB`,
                    created: stats.birthtime,
                    modified: stats.mtime
                };
            })
        );
        res.json({
            success: true,
            count: pdfFiles.length,
            files: fileDetails.sort((a, b) => new Date(b.created) - new Date(a.created))
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to list saved files' });
    }
});
app.get('/api/saved/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filepath = path.join(DOWNLOADS_DIR, filename);
        await fs.access(filepath);
        const fileBuffer = await fs.readFile(filepath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(fileBuffer);
    } catch (error) {
        res.status(404).json({ error: 'File not found' });
    }
});
app.delete('/api/saved/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filepath = path.join(DOWNLOADS_DIR, filename);
        await fs.unlink(filepath);
        res.json({ success: true, message: `Deleted ${filename}` });
    } catch (error) {
        res.status(404).json({ error: 'File not found or could not be deleted' });
    }
});
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
app.get('/', (req, res) => {
    res.json({
        message: '🚀 Enhanced StuDocu Downloader API v5.3 - Advanced Bypass with Print Styles',
        version: '5.3',
        features: [
            '🍪 Advanced cookie banner bypass',
            '🔓 Premium content unblurring (client-side only; server-side blur requires premium login)',
            '🔑 Login support for full unblurred content access',
            '🤖 Anti-bot detection evasion',
            '📄 Full document content extraction with print styles for clean PDF'
        ],
        endpoints: {
            download: 'POST /api/download (body: {url, saveLocally?, filename?, returnFile?, email?, password?})',
            saveOnly: 'POST /api/save (body: {url, filename?, email?, password?})',
            listSaved: 'GET /api/saved',
            getSaved: 'GET /api/saved/:filename',
            deleteSaved: 'DELETE /api/saved/:filename',
            health: 'GET /health'
        },
        note: 'For full unblurred content, provide premium email and password. Blurring is often server-side, so CSS bypass may not suffice without login.'
    });
});
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});
app.listen(port, () => {
    console.log(`🚀 Enhanced StuDocu Downloader v5.3 running on http://localhost:${port}`);
    console.log(`✨ Features: Advanced cookie bypass, content unblurring, login support, print styles, anti-detection`);
});