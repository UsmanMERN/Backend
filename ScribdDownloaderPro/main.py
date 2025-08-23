import argparse
import sys
from src.downloader import Downloader
from src.logger import setup_logger

def main():
    """Main function to run the application from the command line."""

    parser = argparse.ArgumentParser(
        description="Scribd Downloader Pro - Download documents from Scribd with ease.",
        formatter_class=argparse.RawTextHelpFormatter
    )

    parser.add_argument(
        "url_or_id",
        help="The full URL or ID of the Scribd document to download."
    )

    parser.add_argument(
        "--compress",
        action="store_true",
        help="Enable PDF compression after downloading (requires Ghostscript)."
    )

    parser.add_argument(
        "--no-clean",
        dest="clean",
        action="store_false",
        help="Disable the feature to remove blank pages from the PDF."
    )

    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Display more detailed logs for debugging purposes."
    )

    args = parser.parse_args()

    log_level = "DEBUG" if args.verbose else "INFO"
    logger = setup_logger(level=log_level)

    try:
        downloader = Downloader(
            url_or_id=args.url_or_id,
            compress=args.compress,
            clean=args.clean,
            logger=logger
        )
        downloader.run()
    except Exception as e:
        logger.error(f"An unexpected fatal error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()