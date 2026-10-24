#!/usr/bin/env python3
"""Reconstruye atlas desde las fuentes geográficas incluidas y materializa v2.2."""
from pathlib import Path
import subprocess,sys
HERE=Path(__file__).resolve().parent
subprocess.run([sys.executable,str(HERE/'generate_sources_v21.py')],check=True)
subprocess.run([sys.executable,str(HERE/'build_v22.py')],check=True)
