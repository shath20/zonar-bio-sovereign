"""Acoustic DNA Feature Extractor using Librosa MFCCs.

Uses MFCC (Mel-Frequency Cepstral Coefficients) to generate
a compact acoustic fingerprint for vessel identification.
No TensorFlow Hub or TFLite dependency required.
"""
import numpy as np
import librosa
from src.config import SAMPLE_RATE, FFT_WINDOW_SIZE, HOP_LENGTH


class AcousticDNAExtractor:
    """Extracts acoustic fingerprints using MFCC features."""

    def __init__(self, n_mfcc=40):
        self.n_mfcc = n_mfcc
        print(f"[DNA] Acoustic fingerprinter initialized (MFCC n={n_mfcc}).")

    def extract_dna(self, waveform):
        """
        Extracts an acoustic fingerprint from a waveform.

        Args:
            waveform: 1D float32 numpy array at 16kHz.

        Returns:
            A compact feature vector summarizing the audio's acoustic DNA.
        """
        waveform = waveform.astype(np.float32)

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
        dot = np.dot(dna_a, dna_b)
        norm = np.linalg.norm(dna_a) * np.linalg.norm(dna_b)
        return dot / norm if norm > 0 else 0.0
