import time
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

class BrowserHandler:
    """
    Mengelola interaksi dengan browser (Chromium) menggunakan Playwright untuk
    meng-scrape halaman dan mencetaknya ke PDF.
    """
    def __init__(self, logger, page_count=None):
        self.logger = logger
        self.page_count = int(page_count) if page_count and page_count != 'N/A' else None

    def get_pdf_from_url(self, url):
        """
        Improved PDF generation with better margin control.
        """
        pdf_bytes = None
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--memory-pressure-off',
                    '--disable-background-timer-throttling',  # Better for dynamic content
                    '--disable-renderer-backgrounding',
                    '--disable-backgrounding-occluded-windows'
                ]
            )
            context = browser.new_context(
                viewport={"width": 1280, "height": 720},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
                java_script_enabled=True,
                bypass_csp=True,
                locale='en-US',
                accept_downloads=True,
            )
            page = context.new_page()
            try:
                self.logger.info(f"Accessing URL: {url}")
                
                # Navigate and wait for initial load
                page.goto(url, wait_until="networkidle", timeout=120000)  # Increased timeout for long documents
                page.wait_for_timeout(5000)  # Optimized initial wait
                
                # Wait for first page element
                try:
                    page.wait_for_selector("[class*='page']", timeout=120000)  # Increased timeout
                    self.logger.info("First page element found, starting to load all pages...")
                except PlaywrightTimeoutError:
                    self.logger.error("Timeout waiting for page elements.")
                    return None
    
                # Load all pages completely
                self._load_all_pages_completely(page)
                
                # Advanced UI cleaning for better PDF output
                self._advanced_clean_ui_elements(page)
                
                # Set optimal print media
                page.emulate_media(media="print")
                
                # Add CSS to remove unwanted margins and spacing
                page.add_style_tag(content="""
                    @page {
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    
                    [class*='page'] {
                        margin: 0 !important;
                        padding: 0 !important;
                        page-break-inside: avoid !important;
                        display: block !important;
                    }
                    
                    /* Hide any remaining UI elements */
                    .toolbar_top, .toolbar_bottom, .navigation,
                    .header, .footer, .sidebar {
                        display: none !important;
                    }
                """)
                
                # Final wait before PDF generation
                page.wait_for_timeout(5000)  # Optimized wait
                
                # Generate PDF with zero margins
                pdf_bytes = page.pdf(
                    format="A4",
                    landscape=False,
                    display_header_footer=False,
                    print_background=True,
                    prefer_css_page_size=False,  # Use format instead
                    scale=1.0,  # No scaling
                    margin={
                        'top': '0mm',
                        'bottom': '0mm', 
                        'left': '0mm',
                        'right': '0mm'
                    }
                )
                
                self.logger.info("PDF generated successfully with zero margins")
                
            except Exception as e:
                self.logger.error(f"Error in browser process: {e}")
                return None
            finally:
                browser.close()
        return pdf_bytes
    
    def _advanced_clean_ui_elements(self, page):
        """Advanced UI cleaning for PDF generation."""
        self.logger.debug("Performing advanced UI cleanup...")
        
        cleanup_scripts = [
            # Remove all toolbars and navigation
            """
            const elementsToHide = document.querySelectorAll(`
                .toolbar_top, .toolbar_bottom, .navigation, .header, .footer,
                .sidebar, .menu, .popup, .overlay, .modal, .advertisement,
                [class*='toolbar'], [class*='nav'], [id*='toolbar'], [id*='nav']
            `);
            elementsToHide.forEach(el => el.remove());
            """,
            
            # Fix container dimensions
            """
            const containers = document.querySelectorAll('.document_scroller, .outer_container, .page_container');
            containers.forEach(el => {
                el.style.overflow = 'visible';
                el.style.height = 'auto';
                el.style.maxHeight = 'none';
                el.style.margin = '0';
                el.style.padding = '0';
            });
            """,
            
            # Optimize body and html
            """
            document.body.style.margin = '0';
            document.body.style.padding = '0';
            document.body.style.height = 'auto';
            document.body.style.overflow = 'visible';
            document.documentElement.style.margin = '0';
            document.documentElement.style.padding = '0';
            """,
            
            # Ensure all pages are visible and properly styled
            """
            const pages = document.querySelectorAll('[class*="page"]');
            pages.forEach((page, index) => {
                page.style.display = 'block';
                page.style.visibility = 'visible';
                page.style.opacity = '1';
                page.style.margin = '0';
                page.style.padding = '0';
                page.style.pageBreakInside = 'avoid';
                page.style.pageBreakAfter = index < pages.length - 1 ? 'always' : 'auto';
            });
            """
        ]
        
        for script in cleanup_scripts:
            try:
                page.evaluate(script)
            except Exception as e:
                self.logger.warning(f"Failed to execute cleanup script: {e}")
        
        # Final cleanup wait
        page.wait_for_timeout(2000)  # Optimized wait
    
    def _load_all_pages_completely(self, page):
        """
        Memuat semua halaman dokumen secara lengkap dengan strategi scrolling yang diperbaiki.
        """
        self.logger.info("Memulai proses memuat semua halaman...")
        
        try:
            # Strategy 1: Progressive scrolling to load all pages
            self._progressive_scroll_load(page)
            
            # Strategy 2: Ensure all pages are fully rendered
            self._ensure_all_pages_rendered(page)
            
            # Strategy 3: Final verification and cleanup
            final_page_count = len(page.locator("[class*='page']").all())
            self.logger.info(f"Total pages loaded: {final_page_count}")
            
            if self.page_count and final_page_count < self.page_count:
                self.logger.warning(f"Expected {self.page_count} pages but only loaded {final_page_count}")
                # Try aggressive loading as fallback
                self._aggressive_load_remaining_pages(page, final_page_count)
            
        except Exception as e:
            self.logger.error(f"Error in loading all pages: {e}")

    def _progressive_scroll_load(self, page):
        """
        Improved progressive scroll loading with incremental viewport-based scrolling for better lazy-loading handling in large documents.
        """
        self.logger.info("Starting improved progressive scroll loading...")
        
        max_attempts = 500 if self.page_count else 300  # Increased for large documents
        attempt = 0
        last_page_count = 0
        stable_count = 0
        consecutive_no_change = 0
        
        while attempt < max_attempts:
            # Get current page count
            current_pages = len(page.locator("[class*='page']").all())
            
            if current_pages == last_page_count:
                stable_count += 1
                consecutive_no_change += 1
            else:
                stable_count = 0
                consecutive_no_change = 0
                last_page_count = current_pages
            
            self.logger.debug(f"Attempt {attempt + 1}: {current_pages} pages loaded")
            
            # If we have the expected page count and it's stable, break
            if self.page_count and current_pages >= self.page_count and stable_count >= 10:  # Increased stability check
                self.logger.info(f"All {self.page_count} pages loaded successfully")
                break
            
            # If no changes for many attempts and page_count unknown, break
            if not self.page_count and consecutive_no_change >= 30:  # Increased threshold
                self.logger.info(f"No new content after {consecutive_no_change} attempts. Stopping.")
                break
            
            # Incremental scrolling strategy to trigger lazy loading
            try:
                current_y = page.evaluate("window.scrollY")
                scroll_height = page.evaluate("document.body.scrollHeight")
                viewport_height = page.evaluate("window.innerHeight")
                step = viewport_height * 1.5  # Scroll by 1.5 viewports for overlap
                
                while current_y < scroll_height - viewport_height:
                    next_y = current_y + step
                    if next_y > scroll_height:
                        next_y = scroll_height
                    page.evaluate(f"window.scrollTo(0, {next_y})")
                    page.wait_for_timeout(3000)  # Optimized wait for each step to allow loading
                    # Update positions as content may have loaded
                    current_y = page.evaluate("window.scrollY")
                    scroll_height = page.evaluate("document.body.scrollHeight")
                
                # At bottom, dispatch events and wait
                page.evaluate("""
                    window.dispatchEvent(new Event('scroll'));
                    window.dispatchEvent(new Event('resize'));
                    // Try to find and click load more buttons if any
                    const loadButtons = document.querySelectorAll('button[class*="load"], [class*="more"]');
                    loadButtons.forEach(btn => {
                        if (btn.offsetParent !== null) btn.click();
                    });
                """)
                page.wait_for_timeout(3000)  # Optimized wait
                try:
                    page.wait_for_load_state('networkidle', timeout=15000)  # Optimized timeout
                except PlaywrightTimeoutError:
                    self.logger.debug("Network idle timeout during scroll, continuing...")
            except Exception as e:
                self.logger.debug(f"Error in incremental scrolling: {e}")
            
            # Add extra wait every 10 attempts
            if attempt % 10 == 0 and attempt > 0:
                page.wait_for_timeout(5000)  # Optimized extra wait
                self.logger.debug(f"Extra wait after {attempt} attempts")
            
            attempt += 1
        
        final_count = len(page.locator("[class*='page']").all())
        self.logger.info(f"Progressive loading completed with {final_count} pages")

    def _ensure_all_pages_rendered(self, page):
        """
        Ensure all loaded pages are fully rendered, with optimizations for very long documents.
        """
        self.logger.info("Ensuring all pages are fully rendered...")
        
        page_elements = page.locator("[class*='page']").all()
        total_pages = len(page_elements)
        
        scroll_interval = 1
        if total_pages > 1000:
            scroll_interval = 10
        elif total_pages > 500:
            scroll_interval = 5
        elif total_pages > 100:
            scroll_interval = 2
        
        for i, page_element in enumerate(page_elements):
            if i % scroll_interval == 0:
                try:
                    page_element.scroll_into_view_if_needed()
                    
                    # Wait for text layer
                    try:
                        page_element.wait_for_selector(".textLayer, .text_layer", timeout=3000)  # Optimized timeout
                    except PlaywrightTimeoutError:
                        self.logger.debug(f"Text layer not found in page {i+1}")
                    
                    # Wait for images or canvas to ensure visuals are loaded
                    try:
                        page_element.wait_for_selector("canvas, img", timeout=3000)  # Optimized timeout for images/canvases
                    except PlaywrightTimeoutError:
                        self.logger.debug(f"Canvas or image not found in page {i+1}")
                    
                    wait_time = 300 if total_pages > 500 else 200  # Optimized wait
                    page.wait_for_timeout(wait_time)
                    
                except Exception as e:
                    self.logger.debug(f"Error rendering page {i+1}: {e}")
            
            if (i + 1) % 50 == 0:  # Log progress every 50 pages
                self.logger.debug(f"Rendered {i + 1}/{total_pages} pages")
        
        self.logger.info(f"All {total_pages} pages rendering completed")

    def _aggressive_load_remaining_pages(self, page, current_count):
        """
        Aggressively attempt to load remaining pages if not all are loaded.
        """
        self.logger.info(f"Starting aggressive loading for remaining pages (current: {current_count}, expected: {self.page_count})")
        
        aggressive_attempts = 0
        max_aggressive_attempts = 100  # Increased limit
        longer_wait = 3000  # Optimized base wait
        
        while aggressive_attempts < max_aggressive_attempts and current_count < self.page_count:
            try:
                # Force incremental scroll again with longer waits
                current_y = page.evaluate("window.scrollY")
                scroll_height = page.evaluate("document.body.scrollHeight")
                viewport_height = page.evaluate("window.innerHeight")
                step = viewport_height * 1.5
                
                while current_y < scroll_height - viewport_height:
                    next_y = current_y + step
                    if next_y > scroll_height:
                        next_y = scroll_height
                    page.evaluate(f"window.scrollTo(0, {next_y})")
                    page.wait_for_timeout(longer_wait)  # Optimized wait
                    current_y = page.evaluate("window.scrollY")
                    scroll_height = page.evaluate("document.body.scrollHeight")
                
                # Trigger events
                page.evaluate("""
                    window.dispatchEvent(new Event('scroll'));
                    window.dispatchEvent(new Event('resize'));
                """)
                
                # Wait for network
                try:
                    page.wait_for_load_state('networkidle', timeout=20000)  # Optimized
                except PlaywrightTimeoutError:
                    pass
                
                # Update count
                new_count = len(page.locator("[class*='page']").all())
                if new_count > current_count:
                    self.logger.info(f"Aggressive load added {new_count - current_count} pages")
                    current_count = new_count
                
            except Exception as e:
                self.logger.debug(f"Error in aggressive load: {e}")
            
            aggressive_attempts += 1
            page.wait_for_timeout(3000)  # Optimized wait between attempts
        
        final_count = len(page.locator("[class*='page']").all())
        self.logger.info(f"Aggressive loading completed with {final_count} pages")

    def _clean_ui_elements(self, page):
        """Menghapus elemen UI yang tidak diinginkan dari halaman."""
        self.logger.debug("Menghapus elemen UI yang mengganggu...")
        
        scripts_to_run = [
            # Hide toolbars and navigation
            """document.querySelectorAll('.toolbar_top, .toolbar_bottom, .navigation').forEach(el => el.style.display = 'none');""",
            
            # Fix container heights
            """document.querySelectorAll('.document_scroller').forEach(el => { 
                el.style.overflow = 'visible'; 
                el.style.height = 'auto'; 
                el.style.maxHeight = 'none';
            });""",
            
            """document.querySelectorAll('.outer_container').forEach(el => {
                el.style.height = 'auto';
                el.style.maxHeight = 'none';
            });""",
            
            # Fix body styling
            """document.body.style.height = 'auto';
            document.body.style.overflow = 'visible';""",
            
            # Hide any overlay or popup elements
            """document.querySelectorAll('.overlay, .popup, .modal').forEach(el => el.style.display = 'none');""",
            
            # Ensure all pages are visible
            """document.querySelectorAll('[class*="page"]').forEach(el => {
                el.style.display = 'block';
                el.style.visibility = 'visible';
                el.style.opacity = '1';
            });"""
        ]
        
        for script in scripts_to_run:
            try:
                page.evaluate(script)
            except Exception as e:
                self.logger.warning(f"Gagal menjalankan skrip pembersihan: {e}")
        
        # Final cleanup wait
        page.wait_for_timeout(1000)  # Optimized wait