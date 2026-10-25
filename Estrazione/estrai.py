"""Estrae le offerte PDF con LlamaExtract (region EU) usando schema_offerta.json.

Uso:  python Estrazione/estrai.py ["PDF Offerte"]
Chiave: variabile LLAMA_CLOUD_API_KEY oppure file Estrazione/.env con  LLAMA_CLOUD_API_KEY=llx-...
Output: Estrazione/output/<nome pdf>.json  (risposta completa: dati + extract_metadata con citazioni)
I PDF già estratti vengono saltati; cancella il json per rifarlo.
"""
import json, os, re, sys, time
from pathlib import Path

from llama_cloud import LlamaCloud

QUI = Path(__file__).resolve().parent
env = QUI / ".env"
if env.exists():
    for riga in env.read_text(encoding="utf-8").splitlines():
        if "=" in riga and not riga.lstrip().startswith("#"):
            k, v = riga.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"'))
if not os.environ.get("LLAMA_CLOUD_API_KEY"):
    sys.exit("Manca LLAMA_CLOUD_API_KEY (in Estrazione/.env o nell'ambiente).")

schema = json.loads((QUI / "schema_offerta.json").read_text(encoding="utf-8"))
schema.pop("$schema", None)
prompt = re.search(r"## System prompt\s+```\n(.*?)```", (QUI / "prompt_e_config.md").read_text(encoding="utf-8"), re.S).group(1).strip()

client = LlamaCloud(base_url=os.environ.get("LLAMA_CLOUD_BASE_URL", "https://api.cloud.eu.llamaindex.ai"))
cartella = Path(sys.argv[1]) if len(sys.argv) > 1 else QUI.parent / "PDF Offerte"
out = QUI / "output"
out.mkdir(exist_ok=True)

ESPANDI = ["extract_metadata", "configuration", "usage"]  # citazioni e confidenza arrivano solo con expand

for pdf in sorted(cartella.glob("*.pdf")):
    dest = out / (pdf.stem + ".json")
    if dest.exists():
        vecchio = json.loads(dest.read_text(encoding="utf-8"))
        if vecchio.get("extract_metadata") is None:  # salvato senza metadata: lo riscarica, senza rifare l'estrazione
            dati = client.extract.get(vecchio["id"], expand=ESPANDI).model_dump(mode="json")
            dati["_file"] = pdf.name
            dest.write_text(json.dumps(dati, ensure_ascii=False, indent=1), encoding="utf-8")
            print("metadata aggiunti:", pdf.name)
        else:
            print("già fatto:", pdf.name)
        continue
    print("estraggo:", pdf.name, flush=True)
    f = client.files.create(file=(pdf.name, pdf.read_bytes(), "application/pdf"), purpose="extract")
    job = client.extract.create(file_input=f.id, configuration={
        "data_schema": schema,
        "extraction_target": "per_doc",
        "tier": "agentic",
        "system_prompt": prompt,
        "cite_sources": True,
        "confidence_scores": True,
    })
    t0 = time.time()
    while job.status not in ("COMPLETED", "FAILED", "CANCELLED"):
        if time.time() - t0 > 900:
            print("  timeout, salto"); break
        time.sleep(4)
        job = client.extract.get(job.id)
    if job.status != "COMPLETED":
        print("  errore:", job.status, getattr(job, "error_message", ""))
        continue
    dati = client.extract.get(job.id, expand=ESPANDI).model_dump(mode="json")
    dati["_file"] = pdf.name
    dest.write_text(json.dumps(dati, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"  ok in {time.time() - t0:.0f}s")
