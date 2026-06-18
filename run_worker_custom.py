import os
from pathlib import Path

# Ensure cwd is project root
os.chdir(Path(__file__).resolve().parent)

# Set env vars for this run
os.environ['CLIP_WORKER_CONCURRENCY'] = os.environ.get('CLIP_WORKER_CONCURRENCY', '2')
os.environ['CLIP_WORKER_POLL_SECONDS'] = os.environ.get('CLIP_WORKER_POLL_SECONDS', '5')

import worker

# Use alternative lock port to avoid collision
worker.ensure_single_instance(port=59999)
worker.run_worker()
