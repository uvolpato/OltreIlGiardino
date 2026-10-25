"""Copia pubblicabile del listino: Prototipo-Catalogo/assets/articoli-demo.js.

articoli.js (generato da converti.py, escluso da git) contiene fornitori, prezzi e note interne.
Qui si tolgono quei campi; il resto (codici, descrizioni, classi, colori, misure, nomi foto) resta.
Il prototipo usa articoli.js se c'è (in locale), altrimenti questa copia (GitHub Pages).
Uso:  python Catalogo/pubblica.py   (dopo converti.py)
"""
import json, re
from pathlib import Path

A = Path(__file__).resolve().parent.parent / "Prototipo-Catalogo" / "assets"
RISERVATI = {"f", "f2", "pn", "pv", "n"}   # fornitore, secondo fornitore, prezzo noleggio, prezzo vendita, note interne

cat = json.loads(re.search(r"window\.CAT=(.*?);?\s*$", (A / "articoli.js").read_text(encoding="utf-8"), re.S).group(1))
cat["articoli"] = [{k: v for k, v in a.items() if k not in RISERVATI} for a in cat["articoli"]]
(A / "articoli-demo.js").write_text(
    "/* generato da Catalogo/pubblica.py: listino senza fornitori, prezzi e note interne */\n"
    f"window.CAT={json.dumps(cat, ensure_ascii=False, separators=(',', ':'))};\n", encoding="utf-8")
print(len(cat["articoli"]), "articoli ->", A / "articoli-demo.js")
