"""Scarica le temperature giornaliere di Milano per la stagione di riscaldamento
2025/26 (15 ottobre - 15 aprile) da Open-Meteo e le salva in js/dati-inverno.js.

Si lancia una volta sola, a mano:  python3 scripts/scarica-dati.py
La pagina poi legge il file salvato e non chiama nessun servizio esterno.

Dati: Open-Meteo Historical Weather API, licenza CC BY 4.0 (https://open-meteo.com).
Usa solo la libreria standard di Python: niente da installare.
"""

import json
import urllib.request
from pathlib import Path

INIZIO = "2025-10-15"
FINE = "2026-04-15"
MILANO = {"latitude": 45.4642, "longitude": 9.19}

URL = (
    "https://archive-api.open-meteo.com/v1/archive"
    f"?latitude={MILANO['latitude']}&longitude={MILANO['longitude']}"
    f"&start_date={INIZIO}&end_date={FINE}"
    "&daily=temperature_2m_mean,temperature_2m_min,temperature_2m_max"
    "&timezone=Europe%2FRome"
)

with urllib.request.urlopen(URL) as risposta:
    giornaliero = json.load(risposta)["daily"]

dati = {
    "inizio": giornaliero["time"][0],
    "media": giornaliero["temperature_2m_mean"],
    "minima": giornaliero["temperature_2m_min"],
    "massima": giornaliero["temperature_2m_max"],
}

destinazione = Path(__file__).resolve().parent.parent / "js" / "dati-inverno.js"
destinazione.write_text(
    "// Generato da scripts/scarica-dati.py: non modificare a mano.\n"
    "// Temperature giornaliere di Milano (°C), fonte Open-Meteo, licenza CC BY 4.0.\n"
    "window.INVERNO_MILANO = " + json.dumps(dati, separators=(",", ":")) + ";\n",
    encoding="utf-8",
)

print(f"Salvati {len(dati['media'])} giorni in {destinazione}")
