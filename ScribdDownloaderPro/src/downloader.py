import os
from .metadata_fetcher import MetadataFetcher
from .browser_handler import BrowserHandler
from .pdf_processor import PDFProcessor
from .utils import get_document_id_from_url, sanitize_filename

class Downloader:
    """
    Orchestrates the document download process from Scribd, from
    metadata fetching, browser interaction, to PDF processing.
    """
    def __init__(self, url_or_id, compress, clean, logger, output_dir="downloads"):
        """
        Initializes the Downloader.
        
        Args:
            url_or_id (str): The URL or ID of the Scribd document.
            compress (bool): Whether to compress the final PDF.
            clean (bool): Whether to remove blank pages from the PDF.
            logger (Logger): The logger instance for logging messages.
            output_dir (str, optional): The directory to save the downloaded file. 
                                        Defaults to "downloads".
        """
        self.url_or_id = url_or_id
        self.compress = compress
        self.clean = clean
        self.logger = logger
        self.output_dir = output_dir

    def run(self):
        """
        Executes the entire download workflow.
        Returns:
            str: The path to the saved file, or None on failure.
        """
        self.logger.info("="*50)
        self.logger.info("Starting Scribd Document Download Process")
        self.logger.info("="*50)

        doc_id = get_document_id_from_url(self.url_or_id)
        if not doc_id:
            self.logger.error(f"Invalid URL or ID: '{self.url_or_id}'")
            return None
        self.logger.info(f"Successfully extracted Document ID: {doc_id}")

        metadata_fetcher = MetadataFetcher(doc_id, self.logger)
        metadata = metadata_fetcher.fetch()

        doc_title = metadata.get("title", f"scribd_document_{doc_id}")
        self.logger.info(f"Document Title: {doc_title}")
        page_count = metadata.get('page_count')
        self.logger.info(f"Page Count: {page_count if page_count else 'N/A'}")

        browser_handler = BrowserHandler(self.logger, page_count=page_count)

        embed_url = f"https://www.scribd.com/embeds/{doc_id}/content"

        pdf_bytes = browser_handler.get_pdf_from_url(embed_url)

        if not pdf_bytes:
            self.logger.error("Failed to generate PDF from the browser. Halting process.")
            return None
        self.logger.info("Successfully created PDF file from the browser.")

        pdf_processor = PDFProcessor(self.logger)
        processed_pdf = pdf_bytes

        if self.clean:
            self.logger.info("Starting blank page removal process...")
            processed_pdf = pdf_processor.remove_blank_pages(processed_pdf)
        else:
            self.logger.info("Skipping blank page removal process.")

        if self.compress:
            self.logger.info("Starting PDF compression process...")
            processed_pdf = pdf_processor.compress_pdf(processed_pdf)
        else:
            self.logger.info("Skipping PDF compression process.")

        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
            self.logger.info(f"Directory '{self.output_dir}' created successfully.")
        
        safe_filename = sanitize_filename(doc_title) + ".pdf"
        output_path = os.path.join(self.output_dir, safe_filename)

        pdf_processor.save_pdf(processed_pdf, output_path)

        file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
        self.logger.info("="*50)
        self.logger.info("🎉 PROCESS COMPLETE 🎉")
        self.logger.info(f"File saved successfully at: {output_path}")
        self.logger.info(f"File Size: {file_size_mb:.2f} MB")
        self.logger.info("="*50)
        
        return output_path