/*
Install required dependencies:
npm init -y
npm install express cheerio puppeteer axios jsdom user-agents
*/

const express = require('express');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const UserAgent = require('user-agents');
const app = express();
const port = 3000;

// Enable JSON parsing and CORS
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Generate random user agent
function getRandomUserAgent() {
    const userAgent = new UserAgent();
    return userAgent.toString();
}

// Method 1: Scrape YouTube subscriber count using Cheerio (lightweight)
async function scrapeYouTubeSubscribersCheerio(videoId) {
    try {
        const url = `https://livecounts.io/embed/youtube-live-view-counter/${videoId}`;
        console.log(`🔍 Scraping YouTube data from: ${url}`);

        const response = await axios.get(url, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Referer': 'https://livecounts.io/',
            },
            timeout: 15000
        });

        const $ = cheerio.load(response.data);

        // Extract data from the embed page
        const subscriberCount = $('[data-type="subscriber"]').text().trim() ||
            $('.subscriber-count').text().trim() ||
            $('span:contains("subscribers")').prev().text().trim() ||
            $('div').filter((i, el) => $(el).text().includes('subscriber')).text().match(/[\d,]+/)?.[0];

        const viewCount = $('[data-type="view"]').text().trim() ||
            $('.view-count').text().trim() ||
            $('span:contains("views")').prev().text().trim() ||
            $('div').filter((i, el) => $(el).text().includes('view')).text().match(/[\d,]+/)?.[0];

        const liveViewers = $('[data-type="live"]').text().trim() ||
            $('.live-count').text().trim() ||
            $('span:contains("watching")').prev().text().trim();

        return {
            method: 'cheerio',
            subscriberCount: subscriberCount || 'N/A',
            viewCount: viewCount || 'N/A',
            liveViewers: liveViewers || 'N/A',
            rawHtml: response.data.length > 1000 ? `${response.data.substring(0, 1000)}...` : response.data
        };
    } catch (error) {
        throw new Error(`Cheerio scraping failed: ${error.message}`);
    }
}

// Method 2: Scrape using Puppeteer (more powerful, handles JavaScript)
async function scrapeYouTubeSubscribersPuppeteer(videoId) {
    let browser;
    try {
        console.log(`🤖 Launching Puppeteer for: ${videoId}`);

        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        // Set realistic viewport and user agent
        await page.setViewport({ width: 1366, height: 768 });
        await page.setUserAgent(getRandomUserAgent());

        const url = `https://livecounts.io/embed/youtube-live-view-counter/${videoId}`;
        console.log(`📱 Navigating to: ${url}`);

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for content to load
        await page.waitForTimeout(3000);

        // Extract data using various selectors
        const data = await page.evaluate(() => {
            // Try multiple selectors to find the data
            const selectors = [
                '[data-type="subscriber"]',
                '.subscriber-count',
                '.count-number',
                '.odometer',
                'span[class*="count"]',
                'div[class*="count"]',
                '.live-sub-count'
            ];

            let subscriberCount = 'N/A';
            let viewCount = 'N/A';
            let liveViewers = 'N/A';

            // Try each selector
            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    const text = el.textContent.trim();
                    if (text && /[\d,]+/.test(text)) {
                        if (el.className.includes('sub') || el.getAttribute('data-type') === 'subscriber') {
                            subscriberCount = text;
                        } else if (el.className.includes('view') || el.getAttribute('data-type') === 'view') {
                            viewCount = text;
                        } else if (el.className.includes('live')) {
                            liveViewers = text;
                        }
                    }
                });
            }

            // Fallback: search for numbers in the entire page
            if (subscriberCount === 'N/A') {
                const pageText = document.body.textContent;
                const numbers = pageText.match(/[\d,]+/g);
                if (numbers && numbers.length > 0) {
                    subscriberCount = numbers[0];
                    if (numbers.length > 1) viewCount = numbers[1];
                    if (numbers.length > 2) liveViewers = numbers[2];
                }
            }

            return {
                subscriberCount,
                viewCount,
                liveViewers,
                pageTitle: document.title,
                url: window.location.href
            };
        });

        return { method: 'puppeteer', ...data };

    } catch (error) {
        throw new Error(`Puppeteer scraping failed: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Method 3: Scrape Instagram data
async function scrapeInstagramFollowers(username) {
    try {
        const url = `https://livecounts.nl/instagram-realtime/embed/?u=${username}`;
        console.log(`📸 Scraping Instagram data from: ${url}`);

        const response = await axios.get(url, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://livecounts.nl/',
            },
            timeout: 15000
        });

        const $ = cheerio.load(response.data);

        const followerCount = $('.follower-count').text().trim() ||
            $('[data-type="follower"]').text().trim() ||
            $('span:contains("followers")').prev().text().trim() ||
            $('div').filter((i, el) => $(el).text().includes('follower')).text().match(/[\d,]+/)?.[0];

        const following = $('.following-count').text().trim() ||
            $('[data-type="following"]').text().trim() ||
            $('span:contains("following")').prev().text().trim();

        return {
            platform: 'instagram',
            username: username,
            followerCount: followerCount || 'N/A',
            following: following || 'N/A',
            method: 'cheerio'
        };
    } catch (error) {
        throw new Error(`Instagram scraping failed: ${error.message}`);
    }
}

// YouTube endpoint with multiple fallback methods
app.get('/api/youtube/:videoId', async (req, res) => {
    const startTime = Date.now();
    const { videoId } = req.params;
    const { method } = req.query;

    try {
        if (!videoId) {
            return res.status(400).json({
                success: false,
                message: 'Video ID is required',
                example: '/api/youtube/cBq6p5lMxvg'
            });
        }

        console.log(`🎯 Processing YouTube request for: ${videoId}`);

        let result;

        if (method === 'puppeteer') {
            result = await scrapeYouTubeSubscribersPuppeteer(videoId);
        } else {
            // Try Cheerio first (faster), fallback to Puppeteer
            try {
                result = await scrapeYouTubeSubscribersCheerio(videoId);
            } catch (cheerioError) {
                console.log(`⚠️ Cheerio failed, trying Puppeteer: ${cheerioError.message}`);
                result = await scrapeYouTubeSubscribersPuppeteer(videoId);
            }
        }

        const responseData = {
            success: true,
            platform: 'youtube',
            videoId: videoId,
            data: result,
            metadata: {
                responseTime: `${Date.now() - startTime}ms`,
                timestamp: new Date().toISOString(),
                source: 'livecounts.io'
            }
        };

        console.log(`✅ YouTube data extracted successfully using ${result.method}`);
        res.json(responseData);

    } catch (error) {
        console.error(`❌ YouTube scraping error: ${error.message}`);

        res.status(500).json({
            success: false,
            platform: 'youtube',
            videoId: videoId,
            error: error.message,
            metadata: {
                responseTime: `${Date.now() - startTime}ms`,
                timestamp: new Date().toISOString()
            }
        });
    }
});

// Instagram endpoint
app.get('/api/instagram/:username', async (req, res) => {
    const startTime = Date.now();
    const { username } = req.params;

    try {
        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'Username is required',
                example: '/api/instagram/usman'
            });
        }

        console.log(`📸 Processing Instagram request for: ${username}`);

        const result = await scrapeInstagramFollowers(username);

        const responseData = {
            success: true,
            platform: 'instagram',
            username: username,
            data: result,
            metadata: {
                responseTime: `${Date.now() - startTime}ms`,
                timestamp: new Date().toISOString(),
                source: 'livecounts.nl'
            }
        };

        console.log(`✅ Instagram data extracted successfully`);
        res.json(responseData);

    } catch (error) {
        console.error(`❌ Instagram scraping error: ${error.message}`);

        res.status(500).json({
            success: false,
            platform: 'instagram',
            username: username,
            error: error.message,
            metadata: {
                responseTime: `${Date.now() - startTime}ms`,
                timestamp: new Date().toISOString()
            }
        });
    }
});

// Health check endpoint
app.get('/health', async (req, res) => {
    res.json({
        status: 'healthy',
        server: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString()
        },
        features: {
            youtube_scraping: 'enabled',
            instagram_scraping: 'enabled',
            puppeteer: 'available',
            cheerio: 'available'
        },
        endpoints: [
            'GET /api/youtube/:videoId - Get YouTube live stats',
            'GET /api/instagram/:username - Get Instagram follower count',
            'GET /health - Server health check',
            'GET /test - Test scraping functionality'
        ],
        examples: [
            '/api/youtube/cBq6p5lMxvg',
            '/api/youtube/cBq6p5lMxvg?method=puppeteer',
            '/api/instagram/usman'
        ]
    });
});

// Test endpoint
app.get('/test', async (req, res) => {
    try {
        console.log('🧪 Running test scraping...');

        const youtubeTest = await scrapeYouTubeSubscribersCheerio('cBq6p5lMxvg');
        const instagramTest = await scrapeInstagramFollowers('usman');

        res.json({
            success: true,
            tests: {
                youtube: {
                    status: 'success',
                    data: youtubeTest
                },
                instagram: {
                    status: 'success',
                    data: instagramTest
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Root endpoint with documentation
app.get('/', (req, res) => {
    res.json({
        name: 'LiveCounts Web Scraper API',
        version: '1.0.0',
        description: 'Scrape real-time subscriber and follower counts from social media platforms',
        endpoints: {
            youtube: {
                url: '/api/youtube/:videoId',
                description: 'Get YouTube live subscriber count and views',
                example: '/api/youtube/cBq6p5lMxvg',
                parameters: {
                    method: 'optional - use "puppeteer" for JavaScript-heavy pages'
                }
            },
            instagram: {
                url: '/api/instagram/:username',
                description: 'Get Instagram follower count',
                example: '/api/instagram/usman'
            },
            health: '/health',
            test: '/test'
        },
        usage: 'Simply make GET requests to the endpoints above'
    });
});

app.listen(port, () => {
    console.log(`🚀 LiveCounts Scraper Server Started`);
    console.log(`🌐 Server: http://localhost:${port}`);
    console.log(`📋 Health: http://localhost:${port}/health`);
    console.log(`🧪 Test: http://localhost:${port}/test`);
    console.log(`🎯 YouTube: http://localhost:${port}/api/youtube/cBq6p5lMxvg`);
    console.log(`📸 Instagram: http://localhost:${port}/api/instagram/usman`);
    console.log(`⚡ Ready to scrape!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down server...');
    process.exit(0);
});