"""Converte le estrazioni LlamaExtract (Estrazione/output/*.json) nei dati del prototipo.

Uso:  python Estrazione/converti.py
Scrive:
  Prototipo/assets/offerte/indice.js   -> window.OFFERTE (campi, righe, citazioni) + window.OFFERTE_CATALOGO
  Prototipo/assets/offerte/<id>.js     -> PDF originale in base64 (caricato solo quando serve)
Il volume/peso degli articoli non esiste ancora a catalogo: qui è STIMATO dalla descrizione
(tabella STIME sotto) e marcato come stima nel prototipo.
"""
import base64, json, re
from pathlib import Path

QUI = Path(__file__).resolve().parent
RADICE = QUI.parent
DEST = RADICE / "Prototipo" / "assets" / "offerte"

# ponytail: stima grezza per parola chiave (m³, kg, h carico/pz, h allestimento/pz); va sostituita dall'anagrafica articoli
STIME = [
    (r"divano", 1.6, 55, .12, .08), (r"poltrona", .65, 25, .06, .03), (r"sdraio", .35, 8, .03, .02),
    (r"bancone", .7, 45, .1, .12), (r"baldacchino|gazebo|struttura", 2.5, 60, .3, .8), (r"ombrellone", .4, 20, .05, .1),
    (r"tavolo alto|joy cubic", .3, 15, .03, .03), (r"tavolino|pouf/tavolino", .12, 8, .02, .02),
    (r"tavolo|scrivania|console", .5, 25, .05, .06), (r"panca", .3, 12, .03, .02), (r"isola", 1.5, 60, .15, .2),
    (r"sgabello", .12, 5, .02, .01), (r"sedia", .09, 4, .015, .01), (r"pouf", .15, 5, .015, .01),
    (r"scaffale", .5, 20, .05, .1), (r"appendiabiti", .3, 6, .02, .01), (r"gettacarte", .05, 2, .01, .005),
    (r"tendiflex", .1, 6, .02, .03), (r"ventilatore", .15, 8, .02, .01), (r"lampada", .15, 4, .02, .02),
    (r"tettuccio", .3, 8, .03, .1), (r"cuscin", .03, 1, .005, .005), (r"cornice|brocch|porta comunicazioni", .02, 1, .005, .005),
]
NON_MATERIALE = re.compile(r"scontistica|cauzione|^\*|la merce|al momento del", re.I)
SERVIZIO = re.compile(r"trasporto|allestimento|disallestimento|facchinaggio|montaggio", re.I)
# ponytail: km dal magazzino di Grassobbio per città nota; poi API di routing
KM = {"milano": 50, "pero": 55, "rho": 60, "bergamo": 8, "grassobbio": 0, "mantova": 125, "roncoferrar": 120, "barbassolo": 120}
ZONE = {"area c": "Area C", "area b": "Area B", "isola": "Isola", "quadrilatero": "Quadrilatero della Moda", "città alta": "Città Alta"}
BOILERPLATE = re.compile(r"^(se non|se gli arredi|si precisa|sono a carico|eventuali)", re.I)


def cites(meta):
    out = []
    for c in (meta or {}).get("citation") or []:
        for b in c.get("bounding_boxes") or []:
            pd = c.get("page_dimensions") or {}
            out.append({"p": c["page"], "x": round(b["x"], 1), "y": round(b["y"], 1), "w": round(b["w"], 1), "h": round(b["h"], 1),
                        "pw": pd.get("width", 595.28), "ph": pd.get("height", 841.89)})
    return out


def conf(meta, default=0):
    c = (meta or {}).get("confidence")
    return round(c * 100) if c is not None else default


def unisci(*metas):
    """valore: citazioni di più campi, confidenza minima"""
    ms = [m for m in metas if m]
    return min((conf(m) for m in ms), default=0), [c for m in ms for c in cites(m)]


def stima(desc):
    d = desc.lower()
    for pat, v, p, tc, ta in STIME:
        if re.search(pat, d):
            return v, p, tc, ta
    return None


def converti(path):
    raw = json.loads(path.read_text(encoding="utf-8"))
    r = raw["extract_result"]
    m = ((raw.get("extract_metadata") or {}).get("field_metadata") or {}).get("document_metadata") or {}
    ev, mev, cl, mcl = r["evento"], m.get("evento") or {}, r["cliente"], m.get("cliente") or {}
    num = r["numero_offerta"] or ""
    oid = "off-" + re.sub(r"[^0-9a-z]+", "-", num.lower()).strip("-")
    campi = {}

    def put(k, v, *metas, c=None):
        cf, cs = unisci(*metas)
        campi[k] = [v if v is not None else "", c if c is not None else cf, cs or None]

    put("numero", f"{num} V{r['revisione']}" if r.get("revisione") else num, m.get("numero_offerta"), m.get("revisione"))
    put("resp", r.get("responsabile_offerta"), m.get("responsabile_offerta"))
    put("cliente", cl.get("ragione_sociale"), mcl.get("ragione_sociale"))
    put("evento", ev.get("nome_evento"), mev.get("nome_evento"), c=0 if not ev.get("nome_evento") else None)
    put("location", re.sub(r"\s*\n\s*", ", ", ev.get("location") or ""), mev.get("location"))
    citta = (ev.get("citta") or "").lower()
    km = next((v for k, v in KM.items() if k in citta), None)
    campi["km"] = [str(km if km is not None else ""), 60 if km is not None else 0, None]
    z = (ev.get("zona_ztl_citata") or "").lower()
    put("zona", next((v for k, v in ZONE.items() if k in z), ""), mev.get("zona_ztl_citata"))
    rif = ev.get("referente_in_loco") or cl.get("referente")
    tel = ev.get("telefono_in_loco") or cl.get("telefono_referente")
    put("referente", " · ".join(x for x in (rif, tel) if x), mev.get("referente_in_loco"), mev.get("telefono_in_loco"))

    righe, servizi, escluse, catalogo = [], [], [], []
    ma = m.get("articoli") or []
    for i, a in enumerate(r["articoli"]):
        am = ma[i] if i < len(ma) else {}
        desc = re.sub(r"\s+", " ", a["descrizione"]).strip()
        cs = [c for f in ("codice", "descrizione", "quantita") for c in cites(am.get(f))]
        cf = min((conf(am.get(f), 100) for f in ("descrizione", "quantita")), default=0)
        q = a.get("quantita") or 0
        sez = a.get("categoria") or ""
        if re.search(r"logistic", sez, re.I) or SERVIZIO.search(desc) and not stima(desc):
            pax = re.search(r"(\d+)\s*pax", desc, re.I)
            mz = re.search(r"(\d+)\s*(furgon|camion|mezz)", desc, re.I)
            servizi.append({"desc": desc[:120], "q": q, "conf": cf, "cites": cs or None,
                            "pax": int(pax.group(1)) if pax else None, "mezzi": int(mz.group(1)) if mz else None})
            continue
        if NON_MATERIALE.search(desc):
            escluse.append(desc[:90]); continue
        cod = f"{num.split('-')[-1]}-{a.get('codice') if a.get('codice') and a.get('codice') != 'Alt.' else 'ALT' + str(i)}"
        s = stima(desc)
        if s:
            catalogo.append({"cod": cod, "desc": desc[:80], "cat": sez.title()[:30] or "Arredi", "vol": s[0], "peso": s[1], "tc": s[2], "ta": s[3], "stima": True})
        righe.append([cod, q, cf, desc[:80], bool(a.get("alternativa")), cs or None])

    srv = ev.get("servizio")
    if not srv:  # deducibile dalle righe di logistica
        srv = "consegna_e_allestimento" if any(re.search(r"^allestimento", s["desc"], re.I) for s in servizi) else "solo_consegna"
        c_srv = 55
    else:
        c_srv = None
    put("servizio", {"consegna_e_allestimento": "allestimento", "solo_consegna": "consegna", "ritiro_cliente": "ritiro"}[srv], mev.get("servizio"), c=c_srv)

    def quando(dk, hk, default):
        d, h = ev.get(dk), ev.get(hk)
        cf, cs = unisci(mev.get(dk), mev.get(hk))
        if not d:
            return ["", 0, cs or None]
        return [f"{d}T{h or default}", cf if h else min(cf, 50), cs or None]
    campi["consegna"] = quando("data_consegna", "ora_consegna", "08:00")
    campi["fine"] = quando("data_ritiro", "ora_ritiro", "08:00")

    note = [n.replace("\n", " ") for n in r.get("note_operative") or [] if not BOILERPLATE.search(n)]
    if (r.get("permessi") or {}).get("a_carico_di") == "cliente":
        note.append("Permessi di sosta e carico/scarico a carico del cliente.")
    mn = m.get("note_operative")
    campi["nota"] = [" ".join(note), conf(mn[0], 80) if isinstance(mn, list) and mn else 80,
                     (cites(mn[0]) if isinstance(mn, list) and mn else None) or None]

    pax = max((s["pax"] for s in servizi if s["pax"]), default=None)
    mezzi = max((s["mezzi"] for s in servizi if s["mezzi"]), default=None)
    avvisi = [f"{a['campo']}: {a['motivo']}" for a in r.get("avvisi") or []
              if not re.search(r"vuoto|non indicat|non riportat|nessuna nota|non è citata|nessuna zona", a["motivo"], re.I)]
    pdf = next((RADICE / "PDF Offerte").glob(path.stem + ".pdf"))
    (DEST / f"{oid}.js").write_text(f'window.OFFERTE_PDF=window.OFFERTE_PDF||{{}};window.OFFERTE_PDF["{oid}"]="{base64.b64encode(pdf.read_bytes()).decode()}";\n')
    return {"id": oid, "file": pdf.name, "cliente": cl.get("ragione_sociale"), "numero": campi["numero"][0], "consegna": campi["consegna"][0][:10],
            "campi": campi, "righe": righe, "servizi": servizi, "escluse": escluse, "avvisi": avvisi, "pax": pax, "mezzi": mezzi}, catalogo


DEST.mkdir(parents=True, exist_ok=True)
offerte, catalogo = [], {}
for f in sorted((QUI / "output").glob("*.json")):
    o, cat = converti(f)
    offerte.append(o)
    catalogo.update({c["cod"]: c for c in cat})
    print(f"{o['numero']:<14} {o['cliente'][:32]:<32} righe {len(o['righe']):>2}  servizi {len(o['servizi'])}  pax {o['pax']}  mezzi {o['mezzi']}")
offerte.sort(key=lambda o: o["consegna"])
(DEST / "indice.js").write_text(
    "/* generato da Estrazione/converti.py: estrazioni LlamaExtract delle offerte in PDF Offerte */\n"
    f"window.OFFERTE={json.dumps(offerte, ensure_ascii=False)};\n"
    f"window.OFFERTE_CATALOGO={json.dumps(list(catalogo.values()), ensure_ascii=False)};\n", encoding="utf-8")
print("scritto", DEST / "indice.js")
