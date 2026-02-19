"""ZONAR - FastAPI bridge for n8n / HTTP webhook integration + Dashboard."""
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
from src.main import ZonarProtocol
from src.config import DATA_DIR

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = FastAPI(
    title="ZONAR API",
    description="Zonal Ocean Noise Analysis & Response - HTTP interface",
    version="2.0.0"
)

protocol = None


def get_protocol():
    global protocol
    if protocol is None:
        protocol = ZonarProtocol()
    return protocol


class BreachTrigger(BaseModel):
    vessel_id: str = "GHOST"
    vessel_name: str = "Unknown Vessel"
    audio_filename: str = "sample_ship.wav"


@app.post("/trigger-breach")
async def trigger_breach(trigger: BreachTrigger):
    """Endpoint for n8n webhook or external sensors."""
    audio_path = os.path.join(DATA_DIR, trigger.audio_filename)
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found.")
    p = get_protocol()
    result = p.process_incident(
        audio_path, vessel_id=trigger.vessel_id,
        vessel_name=trigger.vessel_name
    )
    return {"status": "ADVISORY_BROADCAST", "result": result}


@app.get("/ledger")
async def get_all_vessels():
    """Query the Blue Ledger for all vessels."""
    p = get_protocol()
    return p.ledger.get_all_vessels()


@app.delete("/ledger")
async def clear_ledger():
    """Clear all records from the Blue Ledger."""
    p = get_protocol()
    p.ledger.clear_ledger()
    return {"status": "cleared", "message": "All ledger records deleted."}


@app.get("/ledger/{vessel_id}")
async def get_vessel_status(vessel_id: str):
    """Query the Blue Ledger for a vessel's Acoustic Credit Score."""
    p = get_protocol()
    status = p.ledger.get_vessel(vessel_id)
    if not status:
        raise HTTPException(status_code=404, detail="Vessel not found.")
    return status


@app.get("/health")
async def health():
    return {"status": "operational", "protocol": "ZONAR"}


# Serve audio files from data directory
app.mount("/audio", StaticFiles(directory=DATA_DIR), name="audio")

# Serve the dashboard
static_dir = os.path.join(BASE_DIR, "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
async def dashboard():
    """Serve the main dashboard."""
    return FileResponse(os.path.join(static_dir, "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
