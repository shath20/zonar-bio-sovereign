"""FastAPI bridge for n8n / HTTP webhook integration."""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from src.main import BioSovereignProtocol
from src.config import DATA_DIR

app = FastAPI(
    title="Bio-Sovereign Radio Protocol API",
    description="HTTP interface for acoustic breach detection and enforcement",
    version="1.0.0"
)

protocol = None


def get_protocol():
    global protocol
    if protocol is None:
        protocol = BioSovereignProtocol()
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
    return {"status": "operational", "protocol": "Bio-Sovereign Radio Protocol"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
