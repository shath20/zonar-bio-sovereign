try:
    import chromadb
    HAS_CHROMA = True
except ImportError:
    HAS_CHROMA = False

from src.config import CHROMA_DB_PATH


class LegalCortexRAG:
    """
    Manages UNCLOS/MARPOL/NOAA knowledge base.
    Features 'Lite Mode' (Mock) for Vercel/Serverless where ChromaDB (heavy) is unavailable.
    """

    def __init__(self, db_path=CHROMA_DB_PATH):
        self.mock_mode = not HAS_CHROMA
        
        if HAS_CHROMA:
            try:
                self.client = chromadb.PersistentClient(path=db_path)
                self.collection = self.client.get_or_create_collection("maritime_legal_bio")
            except Exception as e:
                print(f"[RAG] ChromaDB init failed ({e}). Falling back to Lite Mode.")
                self.mock_mode = True
        
        if self.mock_mode:
            print("[RAG] Running in LITE MODE (In-Memory). Heavy vector DB disabled.")
            self.docs = []

    def ingest(self, doc_id, content, metadata):
        """Adds a document to the store."""
        if not self.mock_mode:
            self.collection.add(
                documents=[content], metadatas=[metadata], ids=[doc_id]
            )
        else:
            # In-memory storage for Lite Mode
            # Check if exists (simple dedup)
            if not any(d['id'] == doc_id for d in self.docs):
                self.docs.append({"id": doc_id, "content": content, "meta": metadata})

    def query(self, text, n_results=3):
        """Retrieves relevant legal/bio context."""
        if not self.mock_mode:
            return self.collection.query(query_texts=[text], n_results=n_results)
        else:
            # Lite Mode: Keyword relevance scoring
            text_lower = text.lower()
            scored = []
            
            for d in self.docs:
                score = 0
                content_lower = d["content"].lower()
                
                # Bonus for species match if explicitly mentioned
                if d["meta"].get("species", "").lower() in text_lower:
                    score += 10
                
                # Bonus for exact article/regulation match
                id_lower = d["id"].lower()
                if id_lower in text_lower:
                    score += 15
                
                # Keyword overlap
                query_words = text_lower.split()
                for word in query_words:
                    if len(word) > 3 and word in content_lower:
                        score += 3
                
                if score > 0:
                    scored.append((score, d))
            
            # Sort by score desc
            scored.sort(key=lambda x: x[0], reverse=True)
            top = scored[:n_results]
            
            # Return in ChromaDB compatible format
            return {
                "documents": [[d["content"] for s, d in top]],
                "metadatas": [[d["meta"] for s, d in top]],
                "ids": [[d["id"] for s, d in top]]
            }


def seed_knowledge(rag):
    """Seeds the vector store with foundational maritime legal and bio data."""
    docs = [
        {
            "id": "UNCLOS-192",
            "content": (
                "UNCLOS Article 192: States have the obligation to protect "
                "and preserve the marine environment. This includes preventing "
                "acoustic pollution that disrupts marine mammal communication."
            ),
            "meta": {"source": "UNCLOS", "article": "192"},
        },
        {
            "id": "UNCLOS-194",
            "content": (
                "UNCLOS Article 194: States shall take measures to prevent, "
                "reduce and control pollution of the marine environment from "
                "any source, including noise from vessels."
            ),
            "meta": {"source": "UNCLOS", "article": "194"},
        },
        {
            "id": "MARPOL-VI-13",
            "content": (
                "MARPOL Annex VI Regulation 13: Governs NOx emissions and "
                "implies mechanical maintenance standards which correlate with "
                "reduced acoustic footprint from propulsion systems."
            ),
            "meta": {"source": "MARPOL", "regulation": "Annex VI R13"},
        },
        {
            "id": "NOAA-BALEEN",
            "content": (
                "NOAA Acoustic Threshold: Baleen whale acoustic masking occurs "
                "when industrial noise in the 20Hz-200Hz band exceeds 120 dB "
                "re 1 uPa. Speed reduction to under 10 knots reduces "
                "broadband source levels by approximately 5-10 dB."
            ),
            "meta": {"source": "NOAA", "species": "Baleen whales"},
        },
        {
            "id": "NOAA-TURTLE",
            "content": (
                "NOAA Acoustic Threshold: Olive Ridley turtle navigation cues "
                "operate in the 100Hz-1kHz band. Continuous exposure above "
                "160 dB re 1 uPa causes behavioral disruption."
            ),
            "meta": {"source": "NOAA", "species": "Olive Ridley turtle"},
        },
        {
            "id": "SMCP-SPEED",
            "content": (
                "SMCP Safety Advisory: 'Advise you reduce speed to minimum "
                "steerage way. Reason: ecological protection zone. Marine "
                "mammals reported in vicinity.'"
            ),
            "meta": {"source": "SMCP", "type": "speed_reduction"},
        },
        {
            "id": "SMCP-ROUTE",
            "content": (
                "SMCP Navigation Warning: 'You are entering a designated "
                "quiet zone. Maximum permitted speed: 10 knots. Maintain "
                "radio watch on VHF Channel 16.'"
            ),
            "meta": {"source": "SMCP", "type": "route_advisory"},
        },
    ]
    for d in docs:
        rag.ingest(d["id"], d["content"], d["meta"])
    print(f"[RAG] Seeded {len(docs)} documents into knowledge base.")
