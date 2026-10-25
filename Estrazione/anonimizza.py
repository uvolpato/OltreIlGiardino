"""Versioni anonimizzate delle offerte, pubblicabili (GitHub Pages).

Legge Prototipo/assets/offerte (indice.js + off-*.js, dati reali, esclusi da git) e scrive
Prototipo/assets/offerte-demo con:
  - nel PDF: cliente, indirizzo, P.IVA/C.F., SDI, referenti, telefoni, email, IBAN e prezzi coperti
    da redazione vera (il testo sotto viene rimosso, non solo nascosto); immagini e impaginazione restano,
    quindi le citazioni (coordinate) dell'estrazione continuano a puntare al posto giusto;
  - nell'indice: gli stessi dati sostituiti con nomi di fantasia.
Uso: python Estrazione/anonimizza.py
"""
import base64, json, re
from pathlib import Path
import pymupdf

RADICE = Path(__file__).resolve().parent.parent
SRC, DEST = RADICE / "Prototipo/assets/offerte", RADICE / "Prototipo/assets/offerte-demo"
NOSTRI = {"035.4522320", "035.3843598", "03324250160", "1N74KED"}   # dati di Oltre Il Giardino: restano
FINTI = ["Aurora Eventi srl", "Borgo Verde srl", "Cielo Aperto snc", "Delta Allestimenti spa", "Estate Viva srl", "Fiori & Co srl", "Gaia Comunicazione srl"]
PAROLE_COMUNI = {"srl", "spa", "snc", "sas", "events", "eventi", "associazione", "and", "the", "del", "della", "group"}

TEL = re.compile(r"(?:\+39[\s.]?)?\b(?:3\d{2}|0\d{1,3})[\s.]?\d{3}[\s.]?\d{3,5}\b")
MAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")
PIVA = re.compile(r"\b\d{11}\b|\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b")
IBAN = re.compile(r"IBAN[\s-]*IT[\d A-Z]{20,32}")
PREZZO = re.compile(r"-?\d[\d.]*,\d{2}\s*[€�]|[€�]\s*-?\d[\d.]*,\d{2}")
ETICHETTE = {"Indirizzo", "Paese", "P.IVA", "C.F.", "Ref", "Email", "Tel", "Cell", "Codice SDI"}


def leggi_js(path, var):
    t = path.read_text(encoding="utf-8")
    m = re.search(rf"window\.{var}=(.*?);\n", t, re.S)
    return json.loads(m.group(1))


def nomi_sensibili(o):
    """frasi intere (cliente, referente) e singole parole lunghe da coprire ovunque"""
    ref = (o["campi"]["referente"][0] or "").split("·")[0].strip()
    cli = [x for x in {o["cliente"] or "", o["campi"]["cliente"][0] or ""} if len(x) >= 3]
    frasi = cli + ([ref] if len(ref) >= 3 else [])
    parole = {w for f in frasi for w in re.split(r"[\s'/,.]+", f) if len(w) >= 4 and w.lower() not in PAROLE_COMUNI}
    return frasi, parole


def ok(txt):
    return not any(n in txt for n in NOSTRI) and "oltreilgiardino" not in txt.lower()


def redigi_pdf(pdf_bytes, frasi, parole, finto, cli):
    doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
    for n, page in enumerate(doc):
        rects = []                                     # (rect, testo sostitutivo)
        righe = [(pymupdf.Rect(l["bbox"]), "".join(s["text"] for s in l["spans"]).strip())
                 for b in page.get_text("dict")["blocks"] for l in b.get("lines", [])]
        # pagina 1: il riquadro Cliente (valori dopo le etichette, fino a "Consegna")
        if n == 0:
            visti_cliente, attesa = 0, None
            for r, t in righe:
                if t == "Cliente":
                    visti_cliente += 1; attesa = "cliente" if visti_cliente == 2 else None; continue
                if t in ("Consegna", "Data Consegna"): break
                if t in ETICHETTE: attesa = t; continue
                if attesa and t:
                    rects.append((r, finto if attesa == "cliente" else "")); attesa = None
        for r, t in righe:
            if not ok(t): continue
            for rx in (TEL, MAIL, PIVA, IBAN, PREZZO):
                for m in rx.finditer(t):
                    for q in page.search_for(m.group(0), clip=r): rects.append((q, ""))
        for f in sorted(frasi, key=len, reverse=True):
            for q in page.search_for(f): rects.append((q, finto if f in cli else "Referente demo"))
        for w in parole:
            for q in page.search_for(w):
                if ok(page.get_textbox(q + (-60, 0, 60, 0))): rects.append((q, ""))
        for q, txt in rects:
            page.add_redact_annot(q, text=txt, fontsize=max(5, min(8, q.height * .7)), fill=(.93, .93, .93))
        page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE)
    doc.set_metadata({})
    return doc.tobytes(garbage=4, deflate=True)


def anonimizza_testo(v, frasi, parole, finto):
    if isinstance(v, str):
        for f in sorted(frasi, key=len, reverse=True): v = re.sub(re.escape(f), finto, v, flags=re.I)
        for w in parole: v = re.sub(rf"\b{re.escape(w)}\b", "•••", v, flags=re.I)
        for rx in (TEL, MAIL, PIVA, IBAN):
            v = rx.sub(lambda m: m.group(0) if m.group(0) in NOSTRI else "•••", v)
        return v
    if isinstance(v, list): return [anonimizza_testo(x, frasi, parole, finto) for x in v]
    if isinstance(v, dict): return {k: anonimizza_testo(x, frasi, parole, finto) for k, x in v.items()}
    return v


def main():
    offerte, catalogo = leggi_js(SRC / "indice.js", "OFFERTE"), leggi_js(SRC / "indice.js", "OFFERTE_CATALOGO")
    DEST.mkdir(parents=True, exist_ok=True)
    clienti, out = {}, []
    tutte = set().union(*(nomi_sensibili(o)[1] for o in offerte))   # un nome visto in un'offerta si copre in tutte
    for o in offerte:
        frasi, parole = nomi_sensibili(o); parole = tutte
        finto = clienti.setdefault((o["cliente"] or "").upper(), FINTI[len(clienti) % len(FINTI)])
        a = anonimizza_testo(o, frasi, parole, finto)
        a["cliente"] = finto
        a["campi"]["cliente"][0] = finto
        a["campi"]["referente"][0] = "Referente demo · 333 000 0000"
        a["file"] = f"Offerta_{o['numero'].replace(' ', '_')}_demo.pdf"
        out.append(a)
        pdf = base64.b64decode(re.search(r'="([A-Za-z0-9+/=]+)"', (SRC / f"{o['id']}.js").read_text()).group(1))
        red = redigi_pdf(pdf, frasi, parole, finto, frasi[:-1] if len(frasi) > 1 else frasi)
        (DEST / f"{o['id']}.js").write_text(f'window.OFFERTE_PDF=window.OFFERTE_PDF||{{}};window.OFFERTE_PDF["{o["id"]}"]="{base64.b64encode(red).decode()}";\n')
        print(f"{o['numero']:<14} {o['cliente'][:28]:<28} -> {finto:<24} PDF {len(pdf)//1024} -> {len(red)//1024} KB")
    (DEST / "indice.js").write_text(
        "/* generato da Estrazione/anonimizza.py: offerte con dati dei clienti sostituiti, pubblicabili */\n"
        f"window.OFFERTE={json.dumps(out, ensure_ascii=False)};\n"
        f"window.OFFERTE_CATALOGO={json.dumps(catalogo, ensure_ascii=False)};\n", encoding="utf-8")


if __name__ == "__main__":
    main()
