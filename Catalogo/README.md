# Prototipo Catalogo prodotti (Oltre Il Giardino · Catalogo)

Prototipo separato dalla Logistica per l'anagrafica articoli. Specifiche: `../PRD_Catalogo_Prodotti.md`.

**Aprire:** `Prototipo-Catalogo/index.html` (doppio clic, nessuna installazione). Le modifiche restano nel browser (localStorage); "Azzera" in basso a sinistra riparte dai dati originali.

## Rigenerare
```
python Catalogo/converti.py   # Excel -> Prototipo-Catalogo/assets/articoli.js
python Catalogo/build.py           # app.js + catalogo.css + stile della Logistica -> Prototipo-Catalogo/index.html
```
Si modifica `Catalogo/app.js` e `Catalogo/catalogo.css`, poi si rilancia `build.py`. Dal prototipo Logistica (che non si modifica) build.py copia lo stile e la libreria dei componenti (UI: pannelli, tabelle, datatable, filtri, conferme, toast, aiuti), così le due app della suite restano uguali. `python Catalogo/pubblica.py` genera la copia del listino senza fornitori e prezzi usata su GitHub Pages.

## Cosa c'è
| Vista | Ruoli | Contenuto |
|---|---|---|
| Accesso | tutti | un solo accesso (SSO simulato), scelta del ruolo |
| Catalogo | tutti | 2.194 articoli raggruppati in 1.643 modelli con varianti; ricerca, filtri per stato, classe e famiglia di colore; griglia o tabella; completezza della scheda |
| Scheda articolo | tutti (commerciale in sola lettura) | varianti di colore, descrizioni, classificazione a 3 livelli, codice colore e materiale (dal codice), colori RGB dalla foto, funzione/stili/temi/caratteristiche, misure per la logistica (volume, peso, pila, tempi), composizione (parte, anima, rivestimento, struttura; "usato come componente in"), foto, dati commerciali in sola lettura, storico |
| Censimento | censitore, curatore, logistica | il telefono: nuovo / completa / solo foto → foto (fotocamera o esempio) → nota e prompt → AI → proposta con articoli simili → invio in revisione |
| Revisione | curatore | coda delle schede da approvare |
| Prompt immagini | curatore | prompt standard e personali per Nano Banana |
| Import | curatore, logistica | cosa è stato importato e le anomalie (duplicati, fuori schema, descrizioni lunghe, dimensioni illeggibili, coperture da collegare) |
| API e MCP | curatore, commerciale | endpoint, strumenti MCP, JSON di esempio dell'articolo aperto |

## Cosa è vero e cosa è simulato
- **Vero:** i dati del file; varianti ricavate dal codice; materiale e colore dal codice; dimensioni lette dal testo; **colori RGB calcolati dai pixel della foto** (k-means, sfondo escluso) e codice colore aziendale più vicino; codice proposto per i nuovi articoli secondo lo schema `XXFFFprprg-CC` (materiale 99 = da definire).
- **Simulato:** la foto di presentazione (Nano Banana) è l'immagine centrata su un fondo pulito; descrizione, stili e temi (LLM) sono generati da regole sulle parole; SSO; coda senza rete.
- **Mancano:** le foto (solo nomi file, il riquadro mostra il colore dell'articolo); salvataggio condiviso.
