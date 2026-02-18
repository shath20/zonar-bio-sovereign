"""ZONAR Autonomous Negotiator - RAG-powered SMCP advisory generator."""
import os
from src.config import GOOGLE_API_KEY


class AutonomousNegotiator:
    """
    Uses RAG context + LLM to generate SMCP-compliant VHF radio advisories.
    Falls back to mock responses if no API key is configured.
    """

    def __init__(self, rag_engine):
        self.rag = rag_engine
        self.model = None

        if GOOGLE_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=GOOGLE_API_KEY)
                self.model = genai.GenerativeModel("gemini-1.5-flash")
                print("[NEGOTIATOR] Gemini model configured.")
            except Exception as e:
                print(f"[NEGOTIATOR] Gemini setup failed: {e}. Using mock.")
        else:
            print("[NEGOTIATOR] No API key. Using mock responses.")

    def generate_advisory(self, vessel_info, violation_details):
        """Generates a VHF Voice Advisory for the ship's bridge."""
        # Retrieve legal/bio context from RAG
        query = (
            f"Vessel {vessel_info['name']} acoustic masking violation "
            f"in marine protected area. {violation_details}"
        )
        results = self.rag.query(query)
        context = "\n".join(results["documents"][0]) if results["documents"] else ""

        prompt = f"""You are the ZONAR (Zonal Ocean Noise Analysis & Response) Autonomous Negotiator.
A vessel has breached an acoustic boundary in a marine protected area.

VESSEL: {vessel_info['name']} (ID: {vessel_info['id']})
AIS STATUS: {vessel_info.get('ais_status', 'UNKNOWN')}
VIOLATION: {violation_details}

RETRIEVED LEGAL/BIO CONTEXT:
{context}

TASK: Generate a VHF Voice Advisory to broadcast to the ship's bridge.

STRICT REQUIREMENTS:
1. Use Standard Marine Communication Phrases (SMCP) format.
2. Be authoritative, professional, and urgent.
3. Include specific legal references from the context.
4. Recommend concrete speed reduction targets.
5. Warn about Acoustic Credit Score consequences.

Provide ONLY the radio broadcast text. Start with the vessel callsign."""

        if self.model:
            try:
                response = self.model.generate_content(prompt)
                return response.text
            except Exception as e:
                print(f"[NEGOTIATOR] LLM error: {e}")

        # Mock SMCP response
        return (
            f"SECURITE, SECURITE, SECURITE. "
            f"{vessel_info['name']}, {vessel_info['name']}, "
            f"this is ZONAR Control. "
            f"You are in violation of UNCLOS Article 192 - marine environment "
            f"protection. Acoustic Masking Index threshold exceeded. "
            f"Advise you reduce speed to minimum steerage way immediately. "
            f"Failure to comply will result in Acoustic Credit Score penalty. "
            f"Acknowledge on VHF Channel 16. Over."
        )
