# Bio-Sovereign Radio Protocol

A decentralized acoustic defense network that restores SDG 14 ecological integrity by granting marine life "Digital Sovereignty" through active, real-time enforcement of acoustic boundaries.

## Features

- **Neural Ear** — Spectral subtraction to isolate ship noise from ocean ambient
- **Acoustic DNA** — MFCC + spectral feature fingerprinting for vessel identification
- **Ghost Vessel Detection** — Identifies ships with disabled AIS transponders
- **RAG Legal Cortex** — ChromaDB vector store with UNCLOS/MARPOL/NOAA thresholds
- **Autonomous Negotiator** — Gemini-powered SMCP-compliant VHF radio advisories
- **Blue Ledger** — SQLite-backed Acoustic Credit Score with risk premium tiers
- **API Bridge** — FastAPI server for n8n/webhook integration

## Quick Start

```bash
pip install -r requirements.txt
cp .env.example .env   # Add your Gemini API key
python src/main.py     # Run the full pipeline
python src/api_bridge.py  # Start the API server
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/trigger-breach` | Trigger acoustic breach protocol |
| GET | `/ledger/{vessel_id}` | Query vessel Acoustic Credit Score |

## Architecture

```
src/
├── audio_processing/    # Neural Ear & Acoustic DNA
├── intelligence/        # RAG Engine & LLM Negotiator
├── enforcement/         # Blue Ledger (ACS)
├── config.py            # Central configuration
├── main.py              # Pipeline orchestrator
└── api_bridge.py        # FastAPI for n8n
```

## License

Built for Build2Gether Hackathon — SDG 14: Life Below Water
