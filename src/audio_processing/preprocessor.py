"""Neural Ear Preprocessor - Spectral Subtraction & Log-Mel Spectrogram."""
import librosa
import numpy as np
from src.config import SAMPLE_RATE, FFT_WINDOW_SIZE, HOP_LENGTH


class NeuralEarPreprocessor:
    """Handles raw hydrophone data preprocessing."""

    def __init__(self, sample_rate=SAMPLE_RATE):
        self.sr = sample_rate

    def load_audio(self, file_path):
        """Loads audio file and returns its time series."""
        y, _ = librosa.load(file_path, sr=self.sr)
        return y

    def spectral_subtraction(self, y, noise_factor=0.5):
        """
        Spectral subtraction to isolate mechanical hull/propeller vibrations
        from ambient ocean noise.
        """
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
        mel = librosa.feature.melspectrogram(
            y=y, sr=self.sr, n_fft=FFT_WINDOW_SIZE,
            hop_length=HOP_LENGTH, n_mels=64
        )
        return librosa.power_to_db(mel, ref=np.max)
