"""ZONAR - Zonal Ocean Noise Analysis & Response - Main Orchestrator."""
import os
import io
import base64
import random
import numpy as np
from src.audio_processing.preprocessor import NeuralEarPreprocessor
from src.audio_processing.fingerprint import AcousticDNAExtractor
from src.intelligence.rag_engine import LegalCortexRAG, seed_knowledge
from src.intelligence.negotiator import AutonomousNegotiator
from src.enforcement.ledger import BlueLedger
from src.config import DATA_DIR

# Demo ocean locations (lat, lng, zone name)
OCEAN_ZONES = [
    (8.7, 76.9, "Lakshadweep Sea - Whale Migration Corridor"),
    (6.9, 79.8, "Sri Lanka Southern Coast - Blue Whale Zone"),
    (12.2, 74.8, "Malabar Coast - Olive Ridley Nesting"),
    (15.4, 73.8, "Goa Offshore - Humpback Corridor"),
    (20.0, 70.0, "Gujarat Marine Sanctuary"),
    (3.5, 72.8, "Maldives EEZ - Sperm Whale Zone"),
    (-6.2, 71.5, "Chagos Archipelago MPA"),
    (10.5, 72.2, "Arabian Sea Deep Trench"),
    (1.2, 103.8, "Singapore Strait - High Traffic"),
    (13.1, 80.3, "Chennai Coast - Turtle Nesting Zone"),
]


class ZonarProtocol:
    """Central pipeline orchestrator."""

    def __init__(self):
        print("=" * 60)
        print("  ZONAR - Zonal Ocean Noise Analysis & Response")
        print("  Initializing...")
        print("=" * 60)

        self.preprocessor = NeuralEarPreprocessor()
        self.dna_extractor = AcousticDNAExtractor()
        self.rag = LegalCortexRAG()
        self.negotiator = AutonomousNegotiator(self.rag)
        self.ledger = BlueLedger()

        # Seed RAG if empty
        if len(self.rag.collection.get()["ids"]) == 0:
            seed_knowledge(self.rag)

        print("[SYSTEM] All modules initialized.\n")

    def process_incident(self, audio_path, vessel_id="GHOST",
                         vessel_name="Unknown Vessel"):
        """
        Full pipeline: Audio -> Process -> DNA -> RAG -> Advisory -> Ledger.
        """
        print("-" * 60)
        print(f"[INCOMING] Acoustic breach detected!")
        print(f"[INCOMING] Source: {audio_path}")
        print("-" * 60)

        # Step 1: Neural Ear - Spectral Subtraction
        print("\n[STEP 1] Neural Ear - Loading & cleaning audio...")
        y = self.preprocessor.load_audio(audio_path)
        y_cleaned = self.preprocessor.spectral_subtraction(y)
        spec = self.preprocessor.compute_log_mel_spectrogram(y_cleaned)
        print(f"  -> Raw samples: {len(y)}")
        print(f"  -> Cleaned samples: {len(y_cleaned)}")
        print(f"  -> Spectrogram shape: {spec.shape}")

        # Step 2: Acoustic DNA
        print("\n[STEP 2] Extracting Acoustic DNA fingerprint...")
        dna = self.dna_extractor.extract_dna(y_cleaned)
        print(f"  -> DNA vector (1024-d): [{dna[0]:.4f}, {dna[1]:.4f}, "
              f"{dna[2]:.4f}, ...]")

        # Step 3: Ghost Vessel Detection (mock AIS check)
        ais_status = "DARK" if vessel_id == "GHOST" else "ACTIVE"
        if ais_status == "DARK":
            print("\n[ALERT] AIS TRANSPONDER NOT DETECTED!")
            print("  -> Vessel classified as GHOST VESSEL.")
            vessel_name = "Ghost Vessel (Unidentified)"

        # Step 4: Autonomous Negotiator
        print("\n[STEP 4] Generating VHF Advisory via RAG + LLM...")
        vessel_info = {
            "name": vessel_name,
            "id": vessel_id,
            "ais_status": ais_status
        }
        violation = (
            "Acoustic Masking Index (AMI) threshold exceeded. "
            "Industrial noise in 20-200Hz band measured at 135 dB re 1 uPa. "
            "Baleen whale communication corridor compromised."
        )
        advisory = self.negotiator.generate_advisory(vessel_info, violation)
        print(f"\n{'=' * 60}")
        print("  VHF VOICE ADVISORY BROADCAST")
        print(f"{'=' * 60}")
        print(advisory)
        print(f"{'=' * 60}\n")

        # Step 5: Blue Ledger Enforcement
        print("[STEP 5] Updating Blue Ledger...")
        acs = self.ledger.record_violation(
            vessel_id, vessel_name,
            violation_type="AMI_BREACH",
            penalty=15,
            advisory=advisory[:200]
        )

        # Encode spectrogram as base64 PNG for frontend
        spec_b64 = self._encode_spectrogram(spec)

        # Pick a random ocean zone for map visualization
        zone = random.choice(OCEAN_ZONES)
        lat = zone[0] + random.uniform(-0.5, 0.5)
        lng = zone[1] + random.uniform(-0.5, 0.5)

        result = {
            "vessel": vessel_name,
            "vessel_id": vessel_id,
            "ais_status": ais_status,
            "dna_sample": dna[:5].tolist(),
            "advisory": advisory,
            "acoustic_credit_score": acs,
            "spectrogram_shape": spec.shape,
            "spectrogram_b64": spec_b64,
            "location": {
                "lat": round(lat, 4),
                "lng": round(lng, 4),
                "zone": zone[2]
            }
        }

        print("\n[COMPLETE] Incident processed successfully.")
        return result

    @staticmethod
    def _encode_spectrogram(spec):
        """Encode a log-mel spectrogram as a base64 PNG image."""
        try:
            import matplotlib
            matplotlib.use('Agg')
            import matplotlib.pyplot as plt

            fig, ax = plt.subplots(1, 1, figsize=(8, 2.5), dpi=100)
            ax.imshow(spec, aspect='auto', origin='lower',
                      cmap='inferno', interpolation='bilinear')
            ax.set_xlabel('Time Frame', color='white', fontsize=8)
            ax.set_ylabel('Mel Band', color='white', fontsize=8)
            ax.tick_params(colors='white', labelsize=6)
            fig.patch.set_facecolor('#0a0e27')
            ax.set_facecolor('#0a0e27')
            for spine in ax.spines.values():
                spine.set_color('#1a3a4a')
            plt.tight_layout(pad=0.5)

            buf = io.BytesIO()
            fig.savefig(buf, format='png', facecolor='#0a0e27',
                        edgecolor='none', bbox_inches='tight')
            plt.close(fig)
            buf.seek(0)
            return base64.b64encode(buf.read()).decode('utf-8')
        except Exception as e:
            print(f"[SPEC] Encoding error: {e}")
            return None


if __name__ == "__main__":
    # Create sample audio if needed
    audio_file = os.path.join(DATA_DIR, "sample_ship.wav")
    if not os.path.exists(audio_file):
        from src.utils import create_dummy_audio
        audio_file = create_dummy_audio()

    protocol = ZonarProtocol()
    result = protocol.process_incident(audio_file)

    print("\n" + "=" * 60)
    print("  INCIDENT SUMMARY")
    print("=" * 60)
    for k, v in result.items():
        if k != "advisory":
            print(f"  {k}: {v}")
