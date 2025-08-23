from flask import Flask, request, jsonify, render_template, send_from_directory
from src.downloader import Downloader
from src.logger import setup_logger
import os

# Install dependencies
os.system("apt-get update && apt-get install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdbus-1-3 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 ghostscript")
os.system("pip install playwright")
os.system("playwright install --with-deps")

app = Flask(__name__)
logger = setup_logger(level="INFO")
DOWNLOAD_FOLDER = 'downloads'

if not os.path.exists(DOWNLOAD_FOLDER):
    os.makedirs(DOWNLOAD_FOLDER)

@app.route('/')
def index():
    """Serves the main user interface."""
    return render_template('index.html')

@app.route('/api/download', methods=['POST'])
def download_document():
    """
    API endpoint to download a Scribd document.
    Expects a JSON payload with 'url_or_id'.
    Optional parameters: 'compress' and 'clean'.
    """
    data = request.get_json()
    if not data or 'url_or_id' not in data:
        return jsonify({"error": "Missing 'url_or_id' in request."}), 400

    url_or_id = data['url_or_id']
    compress = data.get('compress', False)
    clean = data.get('clean', True)

    try:
        downloader = Downloader(
            url_or_id=url_or_id,
            compress=compress,
            clean=clean,
            logger=logger,
            output_dir=DOWNLOAD_FOLDER
        )
        file_path = downloader.run()
        if file_path and os.path.exists(file_path):
            return jsonify({
                "message": "Download successful!",
                "download_link": f"/downloads/{os.path.basename(file_path)}"
            })
        else:
            return jsonify({"error": "Download failed. Please check the logs."}), 500
    except Exception as e:
        logger.error(f"An error occurred during download: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/downloads/<filename>')
def downloaded_file(filename):
    """Serves downloaded files."""
    return send_from_directory(DOWNLOAD_FOLDER, filename, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=7860)  # Port for Hugging Face Spaces