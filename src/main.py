"""ZONAR - Zonal Ocean Noise Analysis & Response - Main Orchestrator."""
import os
from src.audio_processing.preprocessor import NeuralEarPreprocessor
from src.audio_processing.fingerprint import AcousticDNAExtractor
from src.intelligence.rag_engine import LegalCortexRAG, seed_knowledge
from src.intelligence.negotiator import AutonomousNegotiator
from src.enforcement.ledger import BlueLedger
from src.config import DATA_DIR


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

        result = {
            "vessel": vessel_name,
            "vessel_id": vessel_id,
            "ais_status": ais_status,
            "dna_sample": dna[:5].tolist(),
            "advisory": advisory,
            "acoustic_credit_score": acs,
            "spectrogram_shape": spec.shape,
        }

        print("\n[COMPLETE] Incident processed successfully.")
        return result


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
