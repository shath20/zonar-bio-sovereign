"""Acoustic DNA Feature Extractor using Librosa MFCCs.

Uses MFCC (Mel-Frequency Cepstral Coefficients) to generate
a compact acoustic fingerprint for vessel identification.
No TensorFlow Hub or TFLite dependency required.
"""
import numpy as np
try:
    import librosa
    HAS_LIBROSA = True
except ImportError:
    HAS_LIBROSA = False

from src.config import SAMPLE_RATE, FFT_WINDOW_SIZE, HOP_LENGTH


class AcousticDNAExtractor:
    """Extracts acoustic fingerprints using MFCC features."""

    def __init__(self, n_mfcc=40):
        self.n_mfcc = n_mfcc
        if HAS_LIBROSA:
            print(f"[DNA] Acoustic fingerprinter initialized (MFCC n={n_mfcc}).")
        else:
            print(f"[DNA] Librosa missing. Fingerprinting will be MOCKED.")

    def extract_dna(self, waveform):
        """
        Extracts an acoustic fingerprint from a waveform.

        Args:
            waveform: 1D float32 numpy array at 16kHz.

        Returns:
            A compact feature vector summarizing the audio's acoustic DNA.
        """
        waveform = waveform.astype(np.float32)

        if not HAS_LIBROSA:
            # Mock DNA vector (200 dimensions: mean/std for 5 features * n_mfcc/etc)
            # Just return a random vector of compatible size for demo
            return np.random.rand(self.n_mfcc * 5) 

        # Extract MFCCs
        mfccs = librosa.feature.mfcc(
            y=waveform, sr=SAMPLE_RATE, n_mfcc=self.n_mfcc,
            n_fft=FFT_WINDOW_SIZE, hop_length=HOP_LENGTH
        )

        # Extract additional timbral features
        spectral_centroid = librosa.feature.spectral_centroid(
            y=waveform, sr=SAMPLE_RATE, hop_length=HOP_LENGTH
        )
        spectral_bandwidth = librosa.feature.spectral_bandwidth(
            y=waveform, sr=SAMPLE_RATE, hop_length=HOP_LENGTH
        )
        spectral_rolloff = librosa.feature.spectral_rolloff(
            y=waveform, sr=SAMPLE_RATE, hop_length=HOP_LENGTH
        )
        zcr = librosa.feature.zero_crossing_rate(
            y=waveform, hop_length=HOP_LENGTH
        )

        # Aggregate: mean + std for each feature across time
        features = []
        for feat in [mfccs, spectral_centroid, spectral_bandwidth,
                     spectral_rolloff, zcr]:
            features.append(np.mean(feat, axis=1))
            features.append(np.std(feat, axis=1))

        dna_vector = np.concatenate(features)
        return dna_vector

    def compute_similarity(self, dna_a, dna_b):
        """Cosine similarity between two DNA vectors."""
        # Ensure vectors are same length (pad if needed for mock)
        min_len = min(len(dna_a), len(dna_b))
        a = dna_a[:min_len]
        b = dna_b[:min_len]
        
        dot = np.dot(a, b)
        norm = np.linalg.norm(a) * np.linalg.norm(b)
        return dot / norm if norm > 0 else 0.0
