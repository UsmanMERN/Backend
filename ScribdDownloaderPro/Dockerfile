# Use the official Playwright Python image as base, which includes Playwright and Chromium
FROM mcr.microsoft.com/playwright/python:v1.46.0-jammy

# Install system dependencies for PDF processing
RUN apt-get update && apt-get install -y \
    ghostscript \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /code

# Install Python dependencies
RUN pip install --no-cache-dir \
    PyPDF2 \
    pdfplumber \
    requests

# Set up a non-root user for security
# RUN useradd -m -u 1000 user
# USER user
# ENV HOME=/home/user \
#     PATH=/home/user/.local/bin:$PATH

# Set the working directory to the user's home
WORKDIR $HOME/app

# Copy the application code with ownership to the non-root user
COPY --chown=user . $HOME/app

# Assuming your main script is app.py or downloader.py; adjust accordingly
# If it's a web app (e.g., Gradio or FastAPI), use something like:
# CMD ["python", "app.py"]
# For a CLI tool, you might need to adjust based on how you run it.
# For Hugging Face Spaces, typically expose a web interface on port 7860.
# Example for a web app:
# CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]

# Placeholder command; replace 'main.py' with your entrypoint script
CMD ["python", "app.py"]