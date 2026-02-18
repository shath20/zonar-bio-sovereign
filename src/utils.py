"""Utility functions for Bio-Sovereign Radio Protocol."""
import numpy as np
import scipy.io.wavfile as wav
import os
from src.config import DATA_DIR, SAMPLE_RATE


def create_dummy_audio(filename="sample_ship.wav"):
    """Creates a dummy 5-second audio file simulating ship noise."""
    duration = 5.0
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), endpoint=False)

    # Simulate low-frequency engine thrum (50Hz) + propeller cavitation
    engine = 0.5 * np.sin(2 * np.pi * 50 * t)
    cavitation = 0.1 * np.random.normal(0, 1, t.shape)
    ambient = 0.05 * np.random.normal(0, 1, t.shape)

    audio = engine + cavitation + ambient
    audio = audio / np.max(np.abs(audio))

    os.makedirs(DATA_DIR, exist_ok=True)
    path = os.path.join(DATA_DIR, filename)
    wav.write(path, SAMPLE_RATE, (audio * 32767).astype(np.int16))
    print(f"[UTILS] Created sample audio: {path}")
    return path
