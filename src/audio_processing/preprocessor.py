"""Neural Ear Preprocessor - Spectral Subtraction & Log-Mel Spectrogram."""
try:
    import librosa
    HAS_LIBROSA = True
except ImportError:
    HAS_LIBROSA = False
    print("[WARN] Librosa not found. Audio processing will be mocked.")

import numpy as np
from src.config import SAMPLE_RATE, FFT_WINDOW_SIZE, HOP_LENGTH


class NeuralEarPreprocessor:
    """Handles raw hydrophone data preprocessing."""

    def __init__(self, sample_rate=SAMPLE_RATE):
        self.sr = sample_rate

    def load_audio(self, file_path):
        """Loads audio file and returns its time series."""
        if HAS_LIBROSA:
            try:
                y, _ = librosa.load(file_path, sr=self.sr)
                return y
            except Exception as e:
                print(f"[ERR] Librosa load failed: {e}")
                return np.random.uniform(-0.01, 0.01, self.sr * 5)
        return np.random.uniform(-0.01, 0.01, self.sr * 5)

    def spectral_subtraction(self, y, noise_factor=0.5):
        """
        Spectral subtraction to isolate mechanical hull/propeller vibrations.
        """
        if not HAS_LIBROSA:
            return y if len(y) > 0 else np.zeros(self.sr)

        stft = librosa.stft(y, n_fft=FFT_WINDOW_SIZE, hop_length=HOP_LENGTH)
        power = np.abs(stft) ** 2

        # Estimate noise from first 10 frames
        noise_est = np.mean(power[:, :10], axis=1, keepdims=True)
        cleaned = np.maximum(power - noise_factor * noise_est, 1e-10)

        phase = np.angle(stft)
        result = np.sqrt(cleaned) * np.exp(1j * phase)
        return librosa.istft(result, hop_length=HOP_LENGTH)

    def compute_log_mel_spectrogram(self, y):
        """Converts audio to a Log-Mel Spectrogram."""
        if not HAS_LIBROSA:
            # Return dummy spectrogram (64 mel bands, ~100 frames)
            return np.random.rand(64, 100)

        mel = librosa.feature.melspectrogram(
            y=y, sr=self.sr, n_fft=FFT_WINDOW_SIZE,
            hop_length=HOP_LENGTH, n_mels=64
        )
        return librosa.power_to_db(mel, ref=np.max)
