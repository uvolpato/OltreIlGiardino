# Audit anagrafica articoli — 26/10/2026

Verifica del catalogo prodotti contro i requisiti dell'anagrafica come **fonte unica dei dati** (sito, preventivi, logistica, ERP). Il catalogo è proprietario: **è il catalogo a dare i dati all'ERP**, non il contrario.

Ambito: prototipo `Prototipo-Catalogo/` (sorgenti `Catalogo/app.js`, `Catalogo/catalogo.css`) e modello di produzione `Catalogo/schema.prisma`. Il backend non esiste ancora: endpoint e servizi sono definiti come contratto (§ API) e si sviluppano nella fase di implementazione del preventivo.

## Esito

| # | Requisito | Prima dell'audit | Ora |
|---|---|---|---|
| 1.1 | Prezzi distinti: acquisto, vendita, noleggio | Solo vendita e noleggio dal file, in sola lettura «dall'ERP» | Tre prezzi modificabili dal curatore (scheda **Prezzi e fornitori**), margine e numero di noleggi che ripagano l'acquisto |
| 1.2 | Storico costi di produzione / riacquisto | Assente | Tabella dello storico con data, tipo, importo, fornitore, nota |
| 1.3 | Più fornitori per articolo (molti-a-molti) | Due campi di testo (`f`, `f2`) | Elenco fornitori con codice del fornitore, prezzo d'acquisto, condizioni, fornitore principale; aggiungi / togli (con conferma). Schema: `ArticoloFornitore` |
| 2.1 | Articolo finito vs componente | Assente (solo anomalia «copertura») | Campo **Tipo articolo**, proposto dal nome per i 2.194 articoli (coperture, fodere, strutture → componente), filtro nel catalogo, etichetta nella scheda |
| 2.2 | Distinta base | Presente (ruoli parte, anima, rivestimento, struttura; «usato come componente in») | Invariata; i componenti proposti sono prima quelli di tipo componente; avviso se un componente non è collegato a nessun articolo |
| 2.3 | Varianti colore sulla scala aziendale | Presente (codice `-CC`, scala colori del file) | Invariato; schema `Colore` |
| 2.4 | Varianti indipendenti, campi comuni allineabili | — | Raggruppamento facoltativo per utente; propagazione dei campi comuni al salvataggio e procedura «Propaga caratteristiche comuni a…». API: `POST /articoli/{codice}/propaga {campi, destinatari}` |
| 3.1 | Navigazione Categoria → Sottocategoria → Prodotti | Tutti i prodotti mescolati, filtro per classe opzionale | **Obbligatoria**: si sceglie la categoria, poi la sottocategoria, solo allora compaiono i prodotti; percorso cliccabile. La ricerca resta su tutto il catalogo |
| 3.2 | Ordinamento | Nessuno definito | Categorie in ordine alfabetico, con la ★ il curatore ne mette in testa alcune (ordine personalizzato); prodotti ordinati per codice |
| 4.1b | Misure regolabili (min–max) | Solo il primo valore («h45/72» → 45) | Ogni misura ha «da» e «fino a»; il file è riletto (135 altezze, 3 profondità, 1 lunghezza con massimo); volume stimato e API usano l'ingombro massimo. Test: `Catalogo/test_dimensioni.py` |
| 4.1 | Dimensioni e volume | Presenti (L, P, H, Ø, volume, peso, pila, tempi) | Invariati; volume stimato dalle dimensioni se manca quello da imballato |
| 4.2 | Dati esposti alla logistica | Solo nel JSON di esempio | Contratto `GET /articoli/{codice}/logistica` e `GET /logistica/articoli?codici=…`. Il prototipo Logistica non è stato toccato: il collegamento si fa in produzione |
| 5.1 | Codice univoco | Duplicati segnalati in Import (92 codici ripetuti) | Invariato + avviso nella scheda; nello schema `codice @unique`: i duplicati vanno risolti in migrazione |
| 5.2 | Mappatura codice ↔ immagini | Non verificata | Nuova anomalia **«Foto di un altro codice»** (158 articoli: il nome del file non inizia con il codice), evidenziata anche sulla singola foto |
| 5.3 | Giacenza fisica | Assente | Campo **Giacenza fisica** con data dell'ultimo conteggio e «Conferma il conteggio di oggi» (scheda Magazzino e storico) |
| — | Prezzi nella completezza | — | «Prezzo di noleggio» è una voce di completezza per gli articoli finiti |

## API (contratto)

Lettura, già descritta nella vista **API e MCP** del prototipo:

| Metodo | Percorso | Note |
|---|---|---|
| GET | `/articoli`, `/articoli/{codice}`, `/modelli/{codice}` | filtri: testo, categoria, sottocategoria, tipo, colore, stato |
| GET | `/articoli/{codice}/logistica`, `/logistica/articoli?codici=…` | volume, peso, L×P×H, pila, persone, tempi |
| GET | `/tassonomie` | categorie e sottocategorie già ordinate |
| GET | `/fornitori`, `/fornitori/{id}/articoli` | solo chiavi ERP e amministrazione |
| GET | `/export/erp` | tracciato per l'ERP |
| POST | webhook | `articolo.pubblicato`, `articolo.modificato`, `prezzo.modificato` |

Scrittura (solo l'applicazione, ruolo curatore salvo diversa indicazione):

| Risorsa | Operazioni |
|---|---|
| `/articoli` | POST, PATCH `/{codice}`, DELETE `/{codice}` (solo se non pubblicato e non usato come componente) |
| `/articoli/{codice}/fornitori` | POST, PATCH `/{fornitoreId}`, DELETE `/{fornitoreId}`; `principale` unico per articolo |
| `/articoli/{codice}/costi` | POST, DELETE `/{id}` |
| `/articoli/{codice}/componenti` | POST, PATCH, DELETE; rifiuto se crea un ciclo |
| `/articoli/{codice}/giacenza` | PUT `{quantita}` → aggiorna anche la data del conteggio (ruoli curatore e logistica/magazzino) |
| `/categorie` | POST, PATCH (nome, ordine), DELETE se vuota; massimo due livelli |
| `/fornitori` | POST, PATCH, DELETE se senza articoli |

## Da decidere

- Chi modifica i prezzi: nel prototipo solo il curatore; i commerciali li vedono. Serve un ruolo «amministrazione»?
- Vendita a 0 nel file: «non in vendita» o «prezzo mancante»? Oggi è mostrato come 0.
- Come si risolvono i 92 codici ripetuti e le 158 foto con codice diverso: a mano prima della migrazione o con una regola?
- Tracciato e frequenza dell'invio all'ERP (export completo, solo variazioni, webhook).
