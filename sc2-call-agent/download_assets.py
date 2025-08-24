# download_assets.py
"""
Pre-download optional, secret-free assets for the image build.
This script MUST NOT depend on runtime secrets (.env).
It's safe to run during `docker build`.

What it does:
- Creates common cache directories.
- Prefetches Silero VAD model (no API keys required).
- Leaves TTS/STT/LLM downloads (which require keys) for runtime.

You can disable all downloads by setting SKIP_DOWNLOADS=1.
"""

import os
import sys
import logging
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s",
)

def ensure_dirs():
    home = Path.home()
    dirs = [
        home / ".cache",
        home / ".cache" / "silero",
        home / ".local" / "share",
        Path("/tmp/cache"),
    ]
    for d in dirs:
        try:
            d.mkdir(parents=True, exist_ok=True)
            logging.info(f"Ensured cache dir: {d}")
        except Exception as e:
            logging.warning(f"Could not create {d}: {e}")

def prefetch_silero_vad():
    """
    Try to download Silero VAD weights via livekit.plugins.silero.
    This does NOT require any API key.
    If it fails (no internet, etc.), we just warn and continue.
    """
    try:
        from livekit.plugins import silero
        logging.info("Prefetching Silero VAD model...")
        # Use lightweight defaults; the call should trigger model fetch + cache
        silero.VAD.load(
            min_speech_duration=0.1,
            min_silence_duration=0.3,
        )
        logging.info("Silero VAD model prefetched (or already cached).")
    except Exception as e:
        logging.warning(f"Skipping Silero VAD prefetch (not fatal): {e}")

def main():
    if os.getenv("SKIP_DOWNLOADS") == "1":
        logging.info("SKIP_DOWNLOADS=1 -> skipping all pre-downloads.")
        return 0

    ensure_dirs()
    prefetch_silero_vad()

    # Add other secret-free downloads here if you ever need them.
    # For example, downloading static prompts, grammars, etc.
    # DO NOT access Pinecone/OpenAI/Sarvam here.

    logging.info("Pre-download step completed.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
