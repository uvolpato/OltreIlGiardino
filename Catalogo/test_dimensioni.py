"""Controllo della lettura delle dimensioni di converti.py.  Uso: python Catalogo/test_dimensioni.py"""
import re
from pathlib import Path

src = (Path(__file__).parent / "converti.py").read_text(encoding="utf-8")
g = {"re": re}
exec(src[src.index('N = r"'):src.index("\n", src.index("DIM = re.compile("))], g)   # solo le regex, senza leggere l'Excel
CASI = [("80x80xh45/72 CM", {"l": "80", "p": "80", "h": "45", "hx": "72"}),   # altezza regolabile 45-72
        ("39x40xh32/58 CM", {"h": "32", "hx": "58"}),
        ("39/45x40xh32 CM", {"l": "39", "lx": "45", "p": "40"}),            # lunghezza 39-45
        ("80x80xh45/80x80xh60 CM", {"h": "45", "hx": None}),                 # due formati, non un massimo
        ("Ø40xh45/80 CM", {"dv": "40", "h": "45", "hx": "80"}),
        ("Ø50/Ø60 CM", {"dv": "50", "dx": None})]
for testo, atteso in CASI:
    m = g["DIM"].search(testo)
    trovato = {k: m.group(k) for k in atteso}
    assert trovato == atteso, (testo, trovato)
print("ok", len(CASI), "casi")
