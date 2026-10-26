"""Assembla il prototipo del catalogo: Prototipo-Catalogo/index.html.

Il catalogo è un'app della stessa suite della Logistica: dal prototipo Logistica (Prototipo/index.html, che
NON si modifica) si copiano a ogni build
  - il blocco <style> (token, layout, componenti),
  - la libreria dei componenti JS: esc, $, dialog, icone, UI (pannelli, tabelle, datatable, filtri, conferme…),
    toast e suggerimenti (?).
Così componenti, modali, conferme e pulsanti sono gli stessi. Il catalogo aggiunge solo catalogo.css e app.js.
Uso:  python Catalogo/build.py   (dopo converti.py e pubblica.py)
"""
from pathlib import Path
import re

QUI = Path(__file__).resolve().parent
R = QUI.parent
log = (R / "Prototipo" / "index.html").read_text(encoding="utf-8")
stile = re.search(r"<style>(.*?)</style>", log, re.S).group(1)


def blocco(inizio, fine):
    """testo della Logistica da `inizio` fino a `fine` compreso (prima occorrenza dopo l'inizio)"""
    a = log.index(inizio)
    b = log.index(fine, a) + len(fine)
    return log[a:b]


libreria = "\n".join([
    blocco("const esc=", "</svg>`;"),   # esc, $, showDlg, closeDlg, ICON, icon
    blocco("const UI={", "\n};"),
    blocco("const dtStato=", "\n});"),
    blocco("function toast(", "\n}"),
    blocco("function hintShow(", 'document.addEventListener("scroll",()=>hintHide(),true);'),
])

X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'
html = f"""<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Oltre Il Giardino · Catalogo prodotti</title>
<link rel="icon" href="assets/logo-oig.png">
<style>{stile}
{(QUI / "catalogo.css").read_text(encoding="utf-8")}</style>
<script src="assets/articoli.js"></script>
<!-- listino completo (escluso da git) se presente in locale, altrimenti la copia pubblicabile (Catalogo/pubblica.py) -->
<script>if(!window.CAT) document.write('<script src="assets/articoli-demo.js"><'+'/script>');</script>
</head>
<body>
<div class="login-wrap" id="login"></div>
<div class="app">
  <aside class="sidebar">
    <div class="brand">
      <img src="assets/logo-oig.png" alt="" width="241" height="163">
      <div><strong>Oltre Il Giardino</strong><small>Catalogo prodotti</small></div>
    </div>
    <nav class="nav" id="nav" aria-label="Sezioni"></nav>
    <div class="health" id="health" aria-live="polite"></div>
    <!-- guide: le pagine .md pubblicate da GitHub Pages (Jekyll le rende HTML); funziona anche aprendo il file da disco, con internet -->
    <details class="side-docs"><summary>Guide e specifiche</summary><ul><li><a href="https://uvolpato.github.io/OltreIlGiardino/PRD_Catalogo_Prodotti.html" target="_blank" rel="noopener">PRD Catalogo prodotti</a></li><li><a href="https://uvolpato.github.io/OltreIlGiardino/Catalogo/AUDIT_Anagrafica_Articoli.html" target="_blank" rel="noopener">Audit anagrafica articoli</a></li><li><a href="https://uvolpato.github.io/OltreIlGiardino/Guida_Prototipo.html" target="_blank" rel="noopener">Guida al prototipo Logistica</a></li><li><a href="https://uvolpato.github.io/OltreIlGiardino/Documentazione_UI.html" target="_blank" rel="noopener">Documentazione interfaccia</a></li></ul></details>
    <p class="side-foot" id="sideFoot"></p>
  </aside>
  <div class="main">
    <header class="topbar">
      <div class="title"><div class="row"><h1 id="pageTitle"></h1><span id="pageHint"></span></div><p id="pageSub"></p></div>
      <div class="row" id="topActions" style="gap:8px"></div>
    </header>
    <main class="view" id="view" tabindex="-1"></main>
  </div>
</div>
<div class="scrim" id="scrim" data-act="close-drawer"></div>
<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle">
  <div class="drawer-head">
    <div class="grow"><div class="eyebrow" id="drawerKicker"></div><h2 id="drawerTitle"></h2></div>
    <button class="icon-btn" data-act="close-drawer" aria-label="Chiudi dettaglio">{X}</button>
  </div>
  <div class="drawer-body" id="drawerBody"></div>
  <div class="drawer-foot" id="drawerFoot" hidden></div>
</aside>
<div class="toasts" id="toasts" aria-live="polite"></div>
<div class="hint-tip" id="hintTip" role="tooltip" hidden></div>
<script>
"use strict";
/* ---- libreria componenti copiata dal prototipo Logistica da Catalogo/build.py: non modificare qui ---- */
{libreria}
/* ---- catalogo ---- */
{(QUI / "app.js").read_text(encoding="utf-8")}
</script>
</body>
</html>
"""
(R / "Prototipo-Catalogo" / "index.html").write_text(html, encoding="utf-8")
print("ok", len(html) // 1024, "KB")
