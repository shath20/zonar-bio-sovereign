# ZONAR — Zonal Ocean Noise Analysis & Response

A decentralized acoustic defense network that restores SDG 14 ecological integrity by granting marine life "Digital Sovereignty" through active, real-time enforcement of acoustic boundaries.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshath20%2Fzonar-bio-sovereign)

## The Problem

Every day, 60,000+ cargo ships cross the world's oceans. Their engine noise (20–200 Hz) directly overlaps with baleen whale communication bands, causing **acoustic masking** that prevents mothers from finding calves. Up to **30% of ships** disable their AIS transponders — becoming invisible **Ghost Vessels** with zero accountability.

**ZONAR** is the world's first Edge-AI Orchestrator that detects, identifies, and responds to underwater noise pollution in real time.

## System Architecture — The Neural Ear Pipeline

ZONAR processes raw hydrophone audio through **five software layers**:

### Layer 1: The Listener — Input Stage
- **Model:** `Distil-Whisper v3` / `Wav2Vec 2.0` (Fine-tuned)
- **Training Data:** ShipsEar & DeepShip datasets
- **Technique:** Mechanical Phoneme Detection — identifies rhythmic signatures of engine types & propeller counts
- **Performance:** 5-second sliding window Sound Buffer for zero-lag real-time identification

### Layer 2: Signal Decoupling — Segregation Layer
- **Technique:** Blind Source Separation (BSS) using Independent Component Analysis (ICA)
- **Denoising:** `Demucs` — AI music source separation, fine-tuned for ocean noise. Treats sea disturbance as "backing track" and ship drone as "lead vocal"
- **Sonar Filter:** High-Pass Notch Filter + CNN binary classifier to identify and mute active sonar pings

### Layer 3: Acoustic DNA & Triangulation — Recognition Layer
- **Feature Extraction:** `VGGish` converts Log-Mel Spectrogram into a 128-dimension acoustic vector (the "DNA")
- **Classifier:** `LightGBM` compares DNA against database — identifies vessel class (e.g., "300m Cargo Carrier")
- **Triangulation:** TDOA (Time Difference of Arrival) across 3 triangulated beams → vessel coordinates in Nautical Miles

### Layer 4: Bio-Radius RAG Brain — Awareness Layer
- **Model:** `Gemini 1.5 Flash` / `Mistral-7B` (Agentic RAG)
- **Knowledge Base:** Vectorized Mammal Radius Data — NOAA acoustic thresholds, UNCLOS/MARPOL regulations, species migration paths
- **Logic:** If Vessel Speed > 10 NM && Location ∈ Mammal Radius → Trigger the Negotiator

### Layer 5: The Negotiator — Output Stage
- **Warning:** AI generates SMCP-compliant (Standard Marine Communication Phrases) advisory message
- **TTS Model:** `Fish Speech v1.5` — authoritative maritime voice synthesis
- **Enforcement:** Blue Ledger — Acoustic Credit Score degradation + Insurance Risk Premium adjustment

## Key Models & Components

| Component | Key Term | Model |
|-----------|----------|-------|
| Input Capture | Mechanical Phoneme Detection | `Distil-Whisper v3` |
| Sound Segregation | Blind Source Separation (BSS) | `Demucs` (Maritime Fine-tune) |
| Identification | Acoustic DNA Fingerprinting | `VGGish` + `LightGBM` |
| Location | TDOA Triangulation | Custom Python (NumPy/SciPy) |
| Warning / RAG | Agentic Bio-Radius Logic | `Gemini 1.5 Flash` |
| Voice Output | SMCP-TTS | `Fish Speech v1.5` |

## Quick Start

```bash
pip install -r requirements.txt
cp .env.example .env   # Add your Gemini API key
python src/api_bridge.py  # Start dashboard + API on http://localhost:8000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Interactive Dashboard |
| GET | `/health` | Health check |
| POST | `/trigger-breach` | Trigger acoustic breach protocol |
| GET | `/ledger/{vessel_id}` | Query vessel Acoustic Credit Score |

## Project Structure

```
src/
├── audio_processing/    # Neural Ear & Acoustic DNA
├── intelligence/        # RAG Engine & LLM Negotiator
├── enforcement/         # Blue Ledger (ACS)
├── config.py            # Central configuration
├── main.py              # Pipeline orchestrator
└── api_bridge.py        # FastAPI for n8n
static/
├── index.html           # Dashboard UI
├── style.css            # Ocean theme
└── app.js               # Interactive engine
```

## Deployment & "Lite Mode" Architecture

ZONAR is architected to run anywhere — from high-performance local rigs to constrained serverless clouds.

| Feature | **Local (Full Power)** | **Vercel (Lite Mode)** |
|:---|:---|:---|
| **Audio Analysis** | Real-time `Librosa` + `TensorFlow` spectral decomposition | Lightweight Mock Engine (prevents timeout/memory crash) |
| **RAG Knowledge** | `ChromaDB` Vector Store (Semantic Search) | In-Memory Keyword Matcher (Zero-dependency) |
| **Database** | Persistent `blue_ledger.db` in `./data` | Ephemeral `blue_ledger.db` in `/tmp` (Read-only OS compatible) |

The system **automatically detects** the environment and switches modes. This ensures the dashboard is **always live and responsive** for demos, even on free-tier hosting limits (250MB), without changing a single line of code.

## Team

- **Shathrack V**
- **Divyesh Kumar N**
- **Mowshmitha A**
- **Sri Varshini S**

## License

Built for Build2Gether Hackathon 2026 — SDG 14: Life Below Water
