"""Central configuration for Bio-Sovereign Radio Protocol."""
import os
from dotenv import load_dotenv

load_dotenv()

# Project Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO_DATA_DIR = os.path.join(BASE_DIR, "data")

# Vercel / Serverless Environment Check
if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
    # Read-only file system, write to /tmp
    WRITABLE_DIR = "/tmp"
else:
    WRITABLE_DIR = REPO_DATA_DIR

# DATA_DIR aliases to repo assets (read-only) for API serving
DATA_DIR = REPO_DATA_DIR

# Audio Processing
SAMPLE_RATE = 16000
FFT_WINDOW_SIZE = 1024
HOP_LENGTH = 512

# YAMNet Model
YAMNET_MODEL_URL = "https://tfhub.dev/google/yamnet/1"

# RAG (Must utilize writable storage)
CHROMA_DB_PATH = os.path.join(WRITABLE_DIR, "vector_db")
SAMPLE_RATE = 16000
FFT_WINDOW_SIZE = 1024
HOP_LENGTH = 512

# YAMNet Model
YAMNET_MODEL_URL = "https://tfhub.dev/google/yamnet/1"

# RAG
CHROMA_DB_PATH = os.path.join(DATA_DIR, "vector_db")

# LLM
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
