"""Assembla il prototipo del catalogo: Prototipo-Catalogo/index.html.

Stile condiviso: copia il blocco <style> del prototipo Logistica (stessi token e componenti) + catalogo.css.
Uso:  python Catalogo/build.py   (dopo converti.py)
"""
from pathlib import Path
import re

QUI = Path(__file__).resolve().parent
R = QUI.parent
log = (R / "Prototipo" / "index.html").read_text(encoding="utf-8")
stile = re.search(r"<style>(.*?)</style>", log, re.S).group(1)
html = f"""<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Serra · Catalogo prodotti</title>
<link rel="icon" href="assets/logo-oig.png">
<style>{stile}
{(QUI / "catalogo.css").read_text(encoding="utf-8")}</style>
</head>
<body>
<div id="app"></div>
<div class="scrim" id="scrim" data-act="close"></div>
<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle">
  <div class="drawer-head">
    <div class="grow"><div class="eyebrow" id="drawerKicker"></div><h2 id="drawerTitle"></h2></div>
    <button class="icon-btn" data-act="close" aria-label="Chiudi"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
  </div>
  <div class="drawer-body" id="drawerBody"></div>
</aside>
<div class="toasts" id="toasts" aria-live="polite"></div>
<script src="assets/articoli.js"></script>
<script>
{(QUI / "app.js").read_text(encoding="utf-8")}
</script>
</body>
</html>
"""
(R / "Prototipo-Catalogo" / "index.html").write_text(html, encoding="utf-8")
print("ok", len(html) // 1024, "KB")
