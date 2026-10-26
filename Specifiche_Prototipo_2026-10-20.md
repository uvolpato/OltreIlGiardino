# Pianificatore Logistica — Specifiche dal prototipo

**Data:** 20/10/2026, aggiornato al 26/10/2026 · **Stato:** decisioni di lavoro, da validare con Logistica (Fabiana) e magazzino
**Riferimenti:** `PRD_Pianificatore_Logistica.md` (perché e per chi) · `Documento_Tecnico_Sistema.md` (architettura) · questo documento (cosa fa l'app, regole e decisioni prese costruendo il prototipo)

Il prototipo è `Prototipo/index.html`: un solo file, si apre con doppio clic, senza installazione. Serve internet solo per mostrare i PDF (pdf.js da CDN). Tutto lo stato è in memoria: ricaricando la pagina si riparte dai dati di esempio.

> **Documentazione UI:** le maschere, il flusso e l'utilizzo sono spiegati in `Documentazione_UI.md`.

---

## 0. Aggiornamenti 26/10/2026

Lavoro dei giorni 25–26/10. Le voci 13, 15 e 16 della tabella del 25/10 sono superate dai punti qui sotto.

| # | Cosa è cambiato | Dettaglio |
|---|---|---|
| 1 | **Dialog addetto a schede** | Schede Anagrafica, Competenze, Disponibilità, Archivio. Il dialog ha la dimensione della scheda più grande e non cambia passando da una all'altra (classe `.panes`: tutte le schede nella stessa cella della griglia, le inattive con `data-off`). Tipo risorsa a scelta (Interno/Cooperativa, il campo Cooperativa compare solo se serve), valutazione a stelle, nome obbligatorio. |
| 2 | **Disponibilità con timeline del mese** | Timeline adattata alla larghezza del dialog, con frecce ‹ › e «Oggi». Prima riga sempre l'addetto in modifica, sotto **tutti i colleghi con assenze nel mese mostrato**. Stessa grafica del Gantt (fasce grigie tratteggiate). Trascinando sulla prima riga si crea una ferie. Legge le assenze **in modifica**, non quelle salvate. Timeline ed elenco mostrano circa 3 righe, poi scorrono. |
| 3 | **Assenze: in programma e archivio** | La scheda Disponibilità elenca solo le assenze in corso o future; quelle concluse vanno nella scheda **Archivio**. Ogni riga mostra la durata e chi altro è assente negli stessi giorni. Non si salva con date incoerenti, assenze sovrapposte o date mancanti. |
| 4 | **Dialog mezzo con la stessa struttura** | Schede Dati, **Scadenze** (revisione, assicurazione, bollo, tagliando: arancione entro 30 giorni, rosso se scaduta), Disponibilità (**fermi**: manutenzione, revisione, tagliando, guasto, noleggiato a terzi), Archivio. In timeline, sotto il mezzo, i mezzi **dello stesso tipo** fermi nel mese; ogni fermo indica i sostituti liberi. Editor comune ad addetti e mezzi (configurazione `DISP`). |
| 5 | **Stato del mezzo calcolato dai fermi** | Il campo `stato` non si sceglie più a mano: `statoMezzi()` lo calcola da `fermi` per oggi; i controlli usano `fermo(m, s, e)` sulle date reali (proposte di flotta, avvisi, dettaglio tratta, foglio del giorno). Nel Gantt per risorsa i fermi sono fasce datate. La lookup «Stati mezzi» è diventata «Tipi di fermo mezzo». Scadenze superate o vicine compaiono come etichette nell'elenco mezzi. |
| 6 | **Magazzino: report cartacei per ordine** | Due report, una scheda per ordine: **Da preparare per domani** (carichi del giorno successivo, con persone schedulate sul carico, mezzo, partenza, location/ZTL, articoli con caselle Preparato/Caricato) e **Rientri attesi** (rientri e riconsegne del giorno, con colonne Rientrati/Danneggiati/Mancanti). Note e firma in fondo; «da assegnare» in rosso se mancano persone o mezzo. «Stampa» stampa solo le schede; CSV con le righe articolo. |
| 7 | **Registro modifiche e Ctrl+Z** | Ogni modifica al piano è una voce del registro (ora, descrizione, ordini toccati, copia degli ordini prima della modifica). **Ctrl+Z** annulla l'ultima. Annullare una voce annulla anche **tutte le successive sugli stessi ordini**, a catena, con conferma che le elenca; le altre restano. Voci annullate barrate. Registro generale (icona orologio in alto) o per ordine (pulsante nel dettaglio). Non c'è «rifai». |
| 8 | **Salvataggio** | Nel piano ogni modifica si applica subito (non c'è un Salva); il puntino bianco su una barra = task modificato a mano, il pallino arancione nella sequenza = conflitto. Anagrafiche, ferie e fermi si salvano con il pulsante Salva del loro dialog e non passano dal registro. |
| 9 | **Modale dettaglio ordine più larga** | Fino a 1320 px e tutta l'altezza dello schermo. |
| 10 | **Zoom nei dialog** | Ctrl + rotella dentro un dialog non zooma più la Pianificazione sottostante. |
| 11 | **Dati dimostrativi su 20 giorni** | 20/10 – 08/11, con un caso per ogni avviso (elenco e date nella guida `Guida_Prototipo.md`). Assenze e fermi sono inseriti prima delle proposte, alcune assegnazioni sbagliate sono volute. |
| 12 | **Offerte anonimizzate per la demo pubblica** | `Estrazione/anonimizza.py` crea `Prototipo/assets/offerte-demo/`: nei PDF cliente, referenti, contatti, P.IVA, IBAN e prezzi sono redatti davvero (testo rimosso), nell'indice sostituiti da nomi di fantasia. Il prototipo usa `assets/offerte/` se c'è (locale) altrimenti `offerte-demo/` (GitHub Pages). |

### Catalogo prodotti: app della stessa suite

| # | Cosa è cambiato | Dettaglio |
|---|---|---|
| 1 | **Stessi componenti della Logistica** | `Catalogo/build.py` copia a ogni build dal prototipo Logistica (che non si modifica) lo stile e la libreria: `esc`, dialog, icone, `UI` (pannelli, tabelle, `datatable`, `filtri`, `conferma`…), `toast`, aiuti «?». `Catalogo/app.js` usa solo quei componenti. |
| 2 | **Datatable ovunque** | Catalogo in vista tabella, Revisione, Prompt, anomalie dell'Import: ricerca, segmenti con conteggi, ordinamento, pagine. La griglia usa la stessa paginazione. |
| 3 | **Layout e interazioni uguali** | Barra laterale con riquadro di stato, intestazione con titolo e «?», **una sola azione primaria in alto a destra** per vista; conferme con `UI.conferma` (azzera, elimina prompt, togli componente, rimanda scheda); dialog di inserimento come le anagrafiche. |
| 4 | **Scheda articolo riorganizzata** | Modale larga fino a 1520 px. A sinistra un **riepilogo fisso** (foto, stato, codice, classe, colore, varianti, completezza con le voci mancanti cliccabili); a destra **6 schede**: Descrizione, Uso negli eventi, Misure, Composizione, Foto e colori, ERP e storico. Ogni scheda mostra quanti dati mancano. Azioni nel piede: Chiudi a sinistra; AI, Invia in revisione / Approva a destra. |
| 5 | **Responsive** | Sotto 1024 px la modale occupa lo schermo e il riepilogo va in alto; sotto 600 px riepilogo compatto, schede scorrevoli, campi due per riga, chiusura con la × in alto. |
| 6 | **Nome** | «Serra» sostituito da «Oltre Il Giardino» (resta solo la chiave interna di salvataggio del browser). |
| 7 | **Listino pubblicabile** | `Catalogo/pubblica.py` crea `articoli-demo.js` senza fornitori, prezzi e note interne; usato su GitHub Pages quando manca `articoli.js`. |
| 8 | **Anagrafica come fonte unica** | Prezzi di acquisto, vendita e noleggio; più fornitori per articolo con codice, prezzo e condizioni; storico dei costi; tipo finito / componente; giacenza fisica con data del conteggio; navigazione obbligatoria Categoria → Sottocategoria → Prodotti (categorie in ordine alfabetico, ★ per metterle in testa; prodotti per codice); anomalia «foto di un altro codice». L'ERP riceve i dati dal catalogo. Dettagli: `Catalogo/AUDIT_Anagrafica_Articoli.md`, schema `Catalogo/schema.prisma`. |
| 9 | **Varianti: raggruppamento facoltativo e propagazione** | Ogni variante di colore resta un articolo completo. Il raggruppamento per modello è una preferenza dell'utente («Raggruppa le varianti», salvata per utente). Campi **comuni** (classe, tipo, misure, volume, peso, pila, tempi, funzione, stili, temi, caratteristiche, prezzi, fornitori): cambiandone uno su un articolo con varianti diverse, si chiede «Solo questa variante» o «Anche alle altre N», con «Ricorda la scelta finché la scheda è aperta». Per i tag si aggiunge o toglie la voce, senza sovrascrivere l'elenco. **«Propaga caratteristiche comuni a…»** (riepilogo della scheda): si scelgono i campi (tutti / solo i diversi, con «diverso in N») e gli articoli che ricevono (le varianti, più altri cercati per codice o nome); nome, descrizioni, colore, foto, giacenza e composizione non si copiano. Ogni copia entra nello storico dell'articolo che la riceve. |

---

## 0bis. Aggiornamenti 25/10/2026

Lavoro dei giorni 24–25/10 (UI, anagrafiche, aiuti). Modifiche al prototipo:

| # | Cosa è cambiato | Dettaglio |
|---|---|---|
| 1 | **Anagrafiche unificata in Risorse** | Rimossa la voce "Anagrafiche"; la vista *Risorse* ora ha 8 schede: Addetti, Mezzi, Squadre, Trasportatori, Articoli, Zone ZTL, Micro-task/formule, Tabelle. CRUD (Nuovo/Modifica/Elimina) su tutte le entità. |
| 2 | **Addetti: ruoli multipli** | `ruolo`/`mansione` → `ruoli` (array). Un addetto può essere es. Autista + Montatore. |
| 3 | **Patenti e certificazioni selezionabili** | Nel CRUD addetto sono checkbox alimentate dalle tabelle di lookup, non più testo libero. `abil`+`cert` unificati in `cert`. |
| 4 | **I ruoli guidano l'assegnazione** | Nuovo mapping `RUOLO_TASK` + `adatto()`: `proponi` preferisce chi ha un ruolo adatto ai micro-task della tratta; per la guida preferisce gli "Autista" (la patente resta il requisito). |
| 5 | **Tabelle di lookup modificabili** | Scheda "Tabelle": Ruoli, Patenti, Certificazioni, Stati mezzi come elenchi aggiungi/rimuovi che alimentano i menu. |
| 6 | **Articoli: anagrafica separata (FK-ready)** | Il `codice` è la chiave (futura FK). Le righe d'ordine senza codice presente appaiono "Da censire" e **non** vengono inserite nell'anagrafica (consistenza per la FK in arrivo). |
| 7 | **Maschere di dettaglio ridisegnate** | Da drawer laterale (in alto a destra) a **modale centrata** con etichette di ambito colorate (Ordine/Tratta/Questo task/Piano/Avvisi) e footer con le azioni. |
| 8 | **Dialoghi CRUD sistemati** | Larghezza moderata (`dialog.form`), griglia a 2 colonne, `<select>` allineati correttamente (fix del layout). |
| 9 | **Aiuti contestuali (tooltip)** | Sistema riusabile `UI.hint()` + registro `AIUTI` (unica fonte dei testi). Icona «?» sul titolo di ogni vista e sulle sezioni del dettaglio. |
| 10 | **Nuove viste** | `Magazzino` (carichi del giorno dopo, CSV) e `Notifiche & ore` (alert + riconciliazione ore), aggiunte in precedenza. |
| 11 | **Azioni primarie in topbar** | I pulsanti "Nuovo …" sono nella barra superiore, **a sinistra della campanella** (slot `#topActions`), coerenti in tutte le viste; rimossi dai contenuti delle schede. |
| 12 | **Assenze/ferie/permessi: intera vs parziale** | Un'assenza è `{tipo, intera:true, da, a}` (giornata intera, stesso giorno = solo quello) oppure `{tipo, intera:false, giorno, dalle, alle}` (parziale a ore). `ferie`/`riposi` unificati in `assenze`; `assenza()` fa l'overlap orario per le parziali. |
| 13 | **Gestione ferie/permessi in "Per risorsa"** | Dialog "Ferie / permessi" per aggiungere un'assenza a qualunque addetto (vale per magazzino e officina); i blocchi-assenza nel Gantt sono cliccabili per rimuoverli. |
| 14 | **Timeline estratta come componente riusabile** | `timeline(R, {corner, body, zoom})` rende testata scala + corsie; `scaleHtml`/`mesiHtml`/`celle` parametrizzate per `zoom`. Usata dalla Pianificazione e dal mini-gantt del CRUD. |
| 15 | **Barra dei mesi con etichette sticky** | Ogni mese è un segmento colorato con il proprio nome sticky a sinistra (`.mbseg`/`.mb-lab`): scorrendo/zoommando il nome del mese resta visibile; a cavallo di due mesi si vedono entrambi. |
| 16 | **Mini-gantt assenze nel CRUD addetto** | Nella maschera Modifica/Nuovo addetto compare una timeline delle assenze di tutti gli addetti (finestra del mese corrente), con l'addetto in modifica evidenziato — per vedere la copertura ferie. |

---

## 1. Cosa è stato deciso oggi (in breve)

| # | Decisione | Perché |
|---|---|---|
| 1 | La prima schermata operativa è il **Foglio del giorno**, con le stesse colonne dell'Excel attuale, stampabile ed esportabile in CSV | Il PRD indica come rischio principale che l'operatore torni all'Excel: l'app deve *sostituire* il foglio, non aggiungere un passaggio |
| 2 | Il Gantt ha due raggruppamenti (**per ordine**, **per risorsa**), due scale (giorno, settimana), **zoom continuo** e **spostamento con barra spaziatrice** | Le durate vanno da 15 minuti a più giorni: senza zoom i task brevi sono illeggibili |
| 3 | Le barre del Gantt hanno **geometria esatta** (nessuna larghezza minima, 1 px di stacco, contorno di conflitto interno) | A zoom basso le barre si sovrapponevano e non si capiva dove finiva un task |
| 4 | **Più mezzi per tratta** | Ordini grandi non stanno su un mezzo solo (es. Golosario) |
| 5 | Import PDF: **PDF originale a sinistra con evidenziato da dove viene ogni campo**, campi a destra, **anteprima del piano modificabile** prima di confermare | La revisione umana è obbligatoria (PRD 7.2): va resa veloce e verificabile |
| 6 | Estrazione con **LlamaExtract, region EU**, con `cite_sources` e `confidence_scores` | Le coordinate delle citazioni permettono l'evidenziazione; i dati restano in UE |
| 7 | **Volume e peso automatici sospesi** finché non c'è un'anagrafica articoli consultabile; nell'interfaccia restano con il riquadro "In arrivo" e **non sono usati per scegliere i mezzi** | Senza anagrafica ogni volume è un'invenzione; vedi §7 |
| 8 | Il volume non lo stima l'LLM e **le foto del PDF non servono** | Il volume è una proprietà dell'articolo, si misura una volta in magazzino |
| 9 | Persone e micro-task: prima ciò che è **scritto nell'offerta** (righe di logistica "3 pax", "2 furgoni"), poi lo **storico**, poi l'LLM, sempre con conferma | Vedi §8 |
| 10 | **Micro-task modificabili** (aggiungi, togli, sposta, cambia durata), con **ripristino della proposta** per tratta o per ordine | L'override manuale deve essere sempre possibile (PRD, guardrail) |
| 11 | **Le modifiche manuali vincono**: "Proponi risorse" non sovrascrive le tratte toccate a mano | Altrimenti l'operatore perde fiducia al primo ricalcolo |
| 12 | Fine andata: **rientro / pernottamento / resta in loco**, proposto dal sistema, deciso dall'operatore. Il **pernottamento occupa persone e mezzo ma non conta come ore di lavoro** | Le persone in trasferta non sono disponibili per altri incarichi; il modello precedente "teletrasportava" la squadra in magazzino |
| 13 | **Nessun motore di dipendenze tipo MS Project**: i task di una tratta sono in sequenza, il resto lo controllano gli avvisi | Basta per il dominio, molto meno codice e meno sorprese |
| 14 | Avvisi su **riposo < 11 h, giornate > 10 h, lavoro notturno (22–6), festivi** | Le offerte escludono notturni e festivi salvo accordi; i turni sono un rischio reale |
| 15 | Logo nuovo (blocco "oig", senza "Noleggi Creativi") | Richiesta del cliente |
| 16 | Il Gantt è una **finestra scorrevole** (giorno, settimana, mese) che parte da qualunque giorno, non dal lunedì o dal giorno 1; entrando si posiziona su oggi, ma **se oggi cade a metà di un ordine torna all'inizio di quell'ordine** | Con la finestra a mese di calendario gli eventi a cavallo restano spezzati |
| 17 | Spostamento **avanti/indietro di 1 giorno, 1 settimana o 1 mese**, indipendente dalla larghezza della finestra; si vedono solo gli ordini con almeno un task nel periodo | Navigazione libera nel calendario |
| 18 | L'import diventa un **percorso guidato**: dati dell'offerta → piano → riepilogo (persone, mezzi, percorso con Google Maps, criticità) → conferma | Aiutare l'operatore: un controllo alla volta, niente schermata unica sovraccarica |

---

## 2. Viste dell'applicazione

### 2.1 Foglio del giorno (pagina iniziale)
Pensato per giornate con molte uscite: la lista è la parte principale e scorre da sola, il riepilogo di persone e mezzi sta in una colonna fissa a destra.
- Intestazione con la data, **Esporta per Excel** e **Stampa** (entrambi con il tracciato dell'Excel attuale, tutte le colonne, indipendenti dalla vista a schermo).
- **Numeri cliccabili**: uscite e carichi aprono la scheda corrispondente; "da assegnare" e "avvisi" applicano il filtro.
- **Timeline orizzontale in testa alla lista** (Uscite e In magazzino), 05–23: una barra per uscita/carico (consegne e ritiri in colori diversi, bordo arancio se ci sono avvisi), separatori delle fasce, linea rossa dell'ora attuale. **Cliccare o trascinare** sulla timeline fa scorrere la lista all'orario; **cliccare una barra** porta alla sua riga e la evidenzia; passando su una barra si evidenzia la riga. **Scorrendo la lista**, un riquadro sulla timeline mostra la fascia oraria delle righe visibili e le barre corrispondenti si accendono.
- **Schede**:
  - **Uscite**: righe compatte su due righe (orario partenza→arrivo, cliente e cosa; squadra, mezzo, ZTL, avvisi), **raggruppate per fascia oraria** (prima delle 7, mattina, pomeriggio, sera) con intestazioni fisse durante lo scorrimento. Una riga si **espande** con location, referente, responsabile, note, avvisi e i pulsanti "Apri l'ordine" / "Mostra nel Gantt". Filtri: ricerca, Da assegnare / Con avvisi / Pronte, Consegne / Ritiri. Le righe con avvisi hanno un bordo arancio a sinistra.
  - **In magazzino**: carichi del giorno per fascia oraria, con squadra, mezzo e quando parte.
  - **Per squadra**: la giornata di ogni persona e di ogni mezzo come sequenza di micro-task (per la riunione del mattino).
- **Colonna laterale**: personale con orario di arrivo, mezzi in uso (fascia oraria), mezzi liberi, riposi e assenti, in trasferta stanotte, disponibili non assegnati.

### 2.2 Pianificazione (Gantt)
- **Per ordine**: una riga per ordine con i micro-task a segmenti; si espande per vedere un task per riga. Pallino di stato (pronto / da verificare / conflitti / da assegnare).
- **Per risorsa**: una riga per addetto e per mezzo; le barre sovrapposte vanno su corsie separate, il tratto in conflitto è tratteggiato in rosso, ferie/riposi/manutenzione sono campiti.
- **Barra dei mesi** sopra i giorni: un segmento per mese, colore diverso per mese, nome centrato nel segmento e abbreviato quando il segmento si stringe ("ottobre 2026" → "ottobre" → "ott 26" → "ott" → "O"). Il giorno 1 di ogni mese ha un separatore più marcato.
- **La griglia riempie sempre la larghezza disponibile**: se lo zoom la renderebbe più stretta, la scala si allarga (non si può ridurre oltre); si ricalcola al ridimensionamento della finestra. Senza ordini nel periodo compare una riga «Nessun ordine» con la griglia completa.
- **Finestra** Giorno (intero, 00–24, si apre alle 06:00; notte 20–6 in grigio), Settimana (7 giorni) o Mese (un mese di calendario di durata), **a partire da qualunque giorno**.
- **Posizionamento all'ingresso** (e con "Oggi"): oggi; se oggi cade a metà di uno o più ordini (primo task prima di oggi, ultimo dopo), la finestra parte dal primo giorno del più vecchio di questi ordini, così l'evento in corso si vede tutto.
- **Navigazione**: frecce ‹ › con passo selezionabile **1 g / 1 sett / 1 mese** (scegliendo la finestra Settimana o Mese il passo si allinea). La barra mostra l'intervallo visibile (es. "19 ott – 18 nov 2026").
- Nella vista per ordine compaiono **solo gli ordini con almeno un task nella finestra**; gli avvisi del pannello sono quelli del periodo.
- **Zoom**: pulsanti −/+, Ctrl+rotella o pinch (ancorato al cursore), tasti + e −; "Adatta" torna al livello base. La scala delle ore si adatta al livello di zoom.
- **Barra spaziatrice tenuta premuta**: cursore a mano, trascinando si sposta il diagramma; i clic sono disattivati finché si tiene Spazio.
- **Trascinamento** di una barra su un'altra riga (vista per risorsa): riassegna la tratta a quell'addetto o mezzo.
- **Layout a tutta altezza**: scorrono solo le righe del Gantt; legenda fissa in fondo; pannello avvisi a destra con scorrimento proprio.
- Barre: pernottamento tratteggiato; pallino bianco sui task modificati a mano; contorno rosso interno sui conflitti (tacche sopra/sotto sulle barre sottili).

### 2.3 Dettaglio ordine (pannello laterale)
- Dati dell'offerta, stima effort (con riquadro "In arrivo" per volume e peso), avvisi dell'ordine.
- **Editor dei micro-task** per tratta (Carico, Andata, Ritiro, Riconsegna):
  - inizio (data e ora, passo 15 min) e durata in ore; cambiandoli i task successivi della tratta scorrono;
  - ↑ ↓ per scambiare l'ordine di due task contigui; ✕ per eliminare (con conferma);
  - "+ Aggiungi micro-task" con tutti i tipi, compresi Pernottamento, Attesa, Sopralluogo e Attività personalizzata (nome libero);
  - nella tratta di andata: **"Dopo il lavoro la squadra"** → Rientro in giornata / Pernottamento / Resta in loco fino al ritiro, con la proposta del sistema e il motivo;
  - "Ripristina" per tratta e "Ripristina proposta" per l'ordine, con conferma che dice quante modifiche manuali si perdono.
- "Proponi risorse": assegna squadra e mezzi solo alle tratte non modificate a mano.

### 2.4 Dettaglio micro-task (dal particolare al generale)
1. **Testata**: tipo (colore), orario, tratta e durata, stati (modificato a mano, conflitto).
2. **Sequenza dell'ordine** come mini-timeline orizzontale: il task corrente evidenziato, un pallino arancio sui task in conflitto; ogni tappa apre il suo task.
3. **Da sistemare**: avvisi della tratta e del task, solo se ci sono.
4. **Questo micro-task**: inizio, durata, nota (albergo per il pernottamento), nome per l'attività personalizzata, elimina; "Come è stimata la durata" in un blocco piegabile.
5. **Tratta**: squadra con lo stato di ciascuno e "Ripristina proposta"; **Mezzi** della tratta.
6. **Ordine**: cliente, servizio, location (ZTL), referente, note; "Apri l'ordine".

Il **dettaglio ordine** segue lo stesso schema: testata con periodo e stato, sequenza, azioni, avvisi, editor dei micro-task, dati dell'ordine, stima. **Gli articoli non sono più in primo piano**: stanno in fondo in un blocco piegabile chiuso.

### 2.4bis Componenti (window.UI)
Libreria di componenti riutilizzati in tutte le viste, ispirata alla struttura del prototipo DecoBrands (`window.CRM`) ma con lo stile di questo prototipo. Catalogo dal vivo nella vista **Componenti**.

| Componente | Uso |
|---|---|
| `stato`, `contatore` | chip ok / da verificare / errore / info, conteggi |
| `kpi`, `kpiRiga` | numeri chiave (foglio del giorno, stima, riepilogo) |
| `intestazione` | testata del pannello laterale |
| `sezione`, `pannello`, `piegabile` | struttura; il piegabile per le informazioni secondarie |
| `dettagli` | coppie etichetta → valore |
| `tabella` | tabelle con colonne numeriche |
| `sequenza` | mini-timeline dei micro-task |
| `risorsa` | riga persona o mezzo con stati e azione |
| `avviso`, `avvisi` | elenchi di avvisi (cliccabili o no) |
| `binario` | stepper dell'import |
| `inArrivo` | funzioni sospese (volume e peso) |
| `nota`, `campo`, `selezione` | testo esplicativo, moduli |
| `conferma()` | finestra di conferma al posto di `confirm()` del browser (ripristino, eliminazione, ricalcolo del piano) |

Componenti aggiunti nella conversione: `schede` (tab), `misura` (barra di carico), `elenco` (blocchi del foglio del giorno), `tipoTask` (etichetta colorata), `voce` (riga di criticità), `gettone` (persona/mezzo rimovibile nell'anteprima). `tabella` accetta righe cliccabili, attributi di riga (es. `data-cite` per l'evidenziazione nel PDF), righe di inserimento e celle su più colonne.

**`datatable` e `filtri`** (dal modello `CRM.DataTable` / `CRM.FilterBar` del prototipo DecoBrands):
- `datatable`: colonne per tipo (testo, numero, data, ora, stato) con formattazione e allineamento automatici; **ordinamento** cliccando l'intestazione (crescente → decrescente → nessuno), valore di ordinamento personalizzabile (es. lo stato per criticità); **paginazione** (25 righe, o disattivata); piede con **conteggio** e riga dei **totali** sulle colonne marcate; stato vuoto con titolo e suggerimento; righe cliccabili.
- `filtri`: ricerca + gruppi di segmenti con **conteggio** (calcolato sugli altri filtri attivi) e "Togli i filtri".
- Lo stato (ordinamento, pagina, ricerca, segmenti) è conservato per tabella e sopravvive ai cambi di vista.
- Usati in: **Ordini** (stato, servizio, totale micro-task), **Risorse** (addetti per ruolo, mezzi per stato), **Anagrafiche** (articoli per origine, con paginazione; zone), **Foglio del giorno** (uscite e carichi ordinabili, senza paginazione). Le tabelle dell'import restano `tabella` semplici perché hanno campi modificabili e righe di inserimento.

**Tutte le viste usano i componenti:** foglio del giorno, pianificazione, ordini, risorse, anagrafiche, dettagli laterali, import (dati offerta, piano, riepilogo).

In produzione diventano componenti del framework scelto, con gli stessi nomi e parametri.

**Barre del Gantt:** stesso arrotondamento anche quando sono strette; se il testo non entra compaiono tre puntini a indicare che c'è un'etichetta (tooltip e dettaglio). **Conflitti:** la barra pulsa in arancio (ciclo 2,4 s) e la cella della griglia che la contiene (ora o giorno, secondo lo zoom) pulsa in controfase, più tenue; con "riduci animazioni" restano evidenziate senza movimento. **Ordinamento** delle offerte: data di inizio, consegna, criticità, cliente, numero, responsabile; pulsante unico **Apri tutti / Chiudi tutti**.

### 2.5 Ordini, Risorse, Anagrafiche
- **Ordini**: tabella cercabile con volume, mezzo dell'andata, stato.
- **Risorse**: addetti (ruolo, patenti, abilitazioni, turno, carico ore settimana, assenze) e mezzi (volume, portata, patente, Euro, massa, lunghezza, impegno settimana, stato) + corriere esterno su richiesta.
- **Anagrafiche**: articoli (con riquadro "In arrivo"), micro-task e formule, zone ZTL.

### 2.6 Import offerta PDF (percorso guidato)
Stepper in alto; i passi già fatti sono cliccabili per tornare indietro.

1. **Caricamento** — trascina il PDF o scegli tra le offerte già estratte (indicando quelle già nel piano).
2. **Estrazione** — nel prototipo è già fatta: si leggono i risultati salvati.
3. **Dati dell'offerta** — a due colonne:
   - sinistra: il PDF originale con un riquadro sul punto da cui viene ogni campo (arancio se confidenza < 85%); clic su un riquadro → va al campo;
   - destra: segnalazioni dell'estrazione, campi con confidenza e pagina, articoli (quantità modificabili, "Alt." a zero, riquadro "In arrivo" per il volume), servizi logistici ("N persone", "N mezzi");
   - **aggiunte manuali**: in fondo agli articoli e ai servizi c'è una riga per inserire ciò che l'estrazione non ha letto. Articolo: descrizione e quantità (codice `MAN-n`, "da censire"). Servizio: tipo (trasporto consegna/ritiro, allestimento, disallestimento, facchinaggio, altro), persone, mezzi. Le righe aggiunte sono marcate "aggiunto a mano" e si possono togliere; persone e mezzi indicati valgono per la proposta del piano (si usa il massimo fra le righe); aggiungere un allestimento imposta il servizio "con allestimento". Le modifiche ai campi già fatte restano;
   - **validazione per andare avanti**: campi obbligatori (numero, cliente, location, consegna, ritiro), ritiro dopo la consegna, **ogni campo sotto 85% confermato con "✓ Verificato" o corretto** (correggerlo vale come verifica). Il piè di pagina dice quanti campi mancano; "Avanti" porta sul primo da sistemare.
4. **Piano** — micro-task e proposte di squadra e mezzi per tratta, modificabili (persone, mezzi, inizio, durata); scelta **"Dopo il lavoro la squadra"** (rientro / pernottamento / resta) con proposta e motivo; conflitti con il piano esistente. Se si torna ai dati e li si cambia, il piano viene ricalcolato (con conferma se c'erano modifiche manuali).
5. **Riepilogo** — prima di confermare:
   - testata con cliente, servizio, location e contatori (persone, mezzi, micro-task, avvisi);
   - **Persone coinvolte**: per ciascuna, i periodi di impegno per tratta, se pernotta, e i conflitti (sovrapposizioni, assenze, turni);
   - **Mezzi**: tratte, patente, Euro, massa, lunghezza, ammissione nella ZTL, se già impegnati;
   - **Percorso**: da magazzino (Grassobbio) alla location, km e tempo stimato, orari di partenza e arrivo di andata e ritiro, link **"Apri in Google Maps"** e mappa incorporata **caricata solo su richiesta** (l'indirizzo viene inviato a Google);
   - **Criticità di percorso e accesso**: ZTL e permesso, mezzi non ammessi, mezzi pesanti (> 7,5 t o > 8 m), viaggio lungo, frasi delle note con indicazioni di accesso/orari ("tassativo", "ingresso", "piano", "area C"…), lavori notturni o festivi, orario da confermare; voce "Cantieri, chiusure, eventi in zona" segnata come *in arrivo* (ricerca automatica, documento tecnico §9);
   - **Avvisi sul piano** ancora aperti (si possono risolvere anche dopo dal Gantt).
   - **Crea ordine e pianifica** → l'ordine entra nel piano e il Gantt si posiziona sul suo periodo.

**In produzione per il percorso:** distanza e tempi reali con un'API di routing (es. Google Routes API, richiede chiave e accordo sul trattamento dati), verifica dei vincoli per mezzi pesanti, ricerca di cantieri/chiusure.

---

## 3. Modello dati

### 3.1 Ordine
```js
{
  id, numero, resp,            // "2026-2025 V1", responsabile commerciale
  cliente, evento, location, km, zona,   // zona = nome ZTL citata (o null)
  referente, servizio,         // "allestimento" | "consegna" | "ritiro" (ritira e riconsegna il cliente)
  consegna, fine,              // ISO: consegna in loco; ritiro (inizio lavoro di ritiro)
  nota,
  pax,                         // persone indicate nell'offerta (righe di logistica), opzionale
  righe: [[codiceArticolo, quantita], ...],
  dopo,                        // scelta dell'operatore a fine andata: "rientro" | "pernotta" | "resta" (null = usa la proposta)
  dopoProposta: { v, motivo }, // calcolata dal sistema
  eff: {...},                  // stima effort (vedi §5.1)
  tasks: [MicroTask, ...]
}
```

### 3.2 Tratte
Ogni micro-task appartiene a una tratta; squadra e mezzi si assegnano per tratta.

| Tratta | Significato | Mezzi |
|---|---|---|
| `C` Carico in magazzino | preparazione del materiale | carica i mezzi dell'andata |
| `A` Andata | viaggio, consegna, allestimento, poi rientro / pernottamento / attesa | sì |
| `B` Ritiro | (viaggio), disallestimento, ritiro, rientro e scarico | sì |
| `R` Riconsegna in magazzino | solo per "ritira il cliente": controllo del materiale riportato | no |

### 3.3 Micro-task
```js
{
  id, oid, leg,                // leg = tratta
  tipo,                        // vedi tabella sotto
  label,                       // solo per ALTRO (nome libero)
  inizio, fine,                // Date
  persone,                     // persone stimate per il task
  risorse: [nomeAddetto],      // assegnati
  mezzi: [nomeMezzo],          // assegnati (solo tipi che usano il mezzo)
  why,                         // spiegazione della stima
  nota,                        // es. albergo per il pernottamento
  manual                       // true se toccato a mano: la proposta automatica non lo sovrascrive
}
```

| Tipo | Etichetta | Usa il mezzo | Ore di lavoro |
|---|---|---|---|
| CARICO | Carico in magazzino | sì | sì |
| VIAGGIO | Viaggio | sì | sì |
| CONSEGNA | Consegna e scarico | sì | sì |
| ALLESTIMENTO | Allestimento | no | sì |
| DISALLESTIMENTO | Disallestimento | no | sì |
| RITIRO | Ritiro e carico in loco | sì | sì |
| RIENTRO | Rientro e scarico | sì | sì |
| RICONSEGNA | Riconsegna cliente in magazzino | no | sì |
| RIENTRO_SQ | Rientro squadra in magazzino | sì | sì |
| ATTESA | Attesa / assistenza in loco | sì | sì |
| PERNOTTAMENTO | Pernottamento | sì (il mezzo resta sul posto) | **no**: occupa ma non è lavoro |
| SOPRALLUOGO | Sopralluogo | no | sì |
| ALTRO | Attività personalizzata | no | sì |

### 3.4 Anagrafiche
- **Addetto**: nome, ruolo (Autista, Capo squadra, Montatore, Magazziniere), patenti (B, C, CE; nessuna = non guida), abilitazioni (muletto, carrello), turno, assenze `{tipo, da, a}`.
- **Mezzo**: nome, tipo, volume utile (m³), portata (kg), patente richiesta, classe Euro, massa (t), lunghezza (m), `fermi` (stesso formato delle assenze, con tipo di fermo), `scadenze` {revisione, assicurazione, bollo, tagliando}. Lo `stato` è calcolato dai fermi (§0 n.5). Corriere esterno a parte: preavviso 48 h, costo indicativo.
- **Zona ZTL**: nome, città, Euro minima, massa e lunghezza massime, fascia attiva, permesso richiesto, fonte. *I valori nel prototipo sono indicativi e vanno verificati.*
- **Articolo**: codice, descrizione, categoria, volume, peso, ore·persona di carico e di allestimento per pezzo. *Sospeso: vedi §7.*

---

## 4. Generazione del piano (proposta)

### 4.1 Sequenza dei micro-task per servizio
Deterministica, nessun LLM.

- **Consegna con allestimento**: Carico → Viaggio → Consegna → Allestimento → *[fine andata]* · Viaggio → Disallestimento → Ritiro → Rientro e scarico.
- **Solo consegna**: come sopra senza allestimento e disallestimento.
- **Ritira il cliente**: Carico (preparazione) prima dell'orario di ritiro del cliente · Riconsegna in magazzino all'orario di rientro. Nessun mezzo.
- Se la partenza sarebbe prima delle 06:00, il carico si fa il giorno prima entro le 17:00.

### 4.2 Fine dell'andata: rientro, pernottamento o resta in loco
Il sistema propone, l'operatore decide (campo `dopo`). La proposta e il motivo sono visibili nell'editor.

| Proposta | Quando | Cosa genera |
|---|---|---|
| **Resta in loco** | tra fine lavoro e partenza per il ritiro c'è meno di andata + ritorno + 1 h | Attesa fino al ritiro; il ritiro non ha il viaggio di andata |
| **Pernottamento** | il ritiro è il giorno dopo con partenza prima delle 6:30 e ≥ 2 h di viaggio, **oppure** rientrando si arriverebbe dopo le 22:00 con ≥ 1,5 h di viaggio | Se il ritiro è il giorno dopo: pernottamento fino al ritiro, senza viaggio di andata del ritiro. Altrimenti: pernottamento fino alle 7:30 e rientro squadra |
| **Rientro in giornata** | negli altri casi | Rientro squadra in magazzino |

Esempio reale: Play2Give (Roncoferraro, MN, 120 km) → proposto **pernottamento**: il ritiro è il giorno dopo alle 8:30 e si dovrebbe ripartire alle 5:30 con 3 h di viaggio.

Le soglie (11 h, 22:00, 1,5 h, 2 h, 6:30) sono **parametri da concordare con la logistica**.

### 4.3 Proposta di squadra e mezzi
Per ogni tratta, nell'intervallo occupato dalla tratta:
1. **Mezzi** (senza volume, finché l'anagrafica articoli è sospesa): tanti mezzi quanti ne indica l'offerta nelle righe di logistica ("TRASPORTO CONSEGNA – 2 furgone"), altrimenti **1**; si scelgono i mezzi liberi più piccoli (esclusa l'auto), preferendo quelli ammessi nella ZTL della location. **Il sistema non verifica se il carico ci sta: decide l'operatore**, che può aggiungere o cambiare mezzi dal dettaglio della tratta.
   *Con l'anagrafica articoli:* il più piccolo mezzo con capacità ≥ volume, o una combinazione di mezzi, con solver (OR-Tools CP-SAT) come da documento tecnico.
2. **Autisti**: un autista abilitato **diverso per ogni mezzo**, dal mezzo con patente più alta, preferendo il ruolo Autista.
3. **Squadra**: si completa fino alle persone stimate, escludendo assenti e occupati; in magazzino si preferiscono i magazzinieri, fuori gli altri; a parità, chi ha meno ore nella settimana.
4. **Le tratte con task modificati a mano non vengono riproposte** (salvo "Ripristina").

### 4.4 Modifiche manuali e ripristino
- Ogni modifica (orario, durata, aggiunta, spostamento, squadra, mezzi, nota, nome) marca il task come `manual`.
- Cambiando inizio o durata, i task successivi della **stessa tratta** scorrono dello stesso intervallo.
- ↑ ↓ scambia due task contigui mantenendo le durate: il primo parte all'inizio del precedente, il secondo subito dopo.
- Ogni modifica entra nel **registro modifiche** e si può annullare (Ctrl+Z, o la voce nel registro con annullamento a catena delle successive sugli stessi ordini, §0 n.7).
- **Ripristino** = rigenera le tratte dalla proposta (sequenza §4.1 + scelta di fine andata) e riassegna le risorse. Andata e Ritiro si ripristinano **insieme** perché sono legati (se la squadra resta o pernotta, il ritiro non ha il viaggio di andata). Cambiare "Dopo il lavoro" equivale a ripristinare Andata e Ritiro.

---

## 5. Stime

### 5.1 Formule (segnaposto, da tarare con il magazzino)
| Grandezza | Formula nel prototipo |
|---|---|
| Squadra in loco | persone indicate nell'offerta ("N pax"); altrimenti 1 sotto 4 m³, 2 sotto 12, 3 sotto 25, poi 4 |
| Magazzinieri | 1 sotto 12 m³, altrimenti 2 |
| Carico | Σ(q.tà × ore·persona di carico per pezzo) ÷ magazzinieri, minimo 30 min |
| Viaggio | km ÷ 45 km/h + 15 min |
| Consegna / ritiro | 60% del carico ÷ squadra, minimo 15 min |
| Allestimento | Σ(q.tà × ore·persona di allestimento per pezzo) ÷ squadra, minimo 30 min |
| Disallestimento | 70% dell'allestimento |
| Arrotondamento | ai 15 minuti |
| Distanza | dal magazzino di **Grassobbio (BG)**, per città (tabella nel convertitore). *In produzione: API di routing* |

Poiché volume e tempi per pezzo dipendono dall'anagrafica articoli (sospesa), **oggi le durate sono dimostrative**. L'operatore le corregge nell'editor.

### 5.2 Volume e peso — sospesi
Vedi §7.

---

## 6. Avvisi

Gli avvisi non bloccano mai: segnalano. Severità: **alta** = da risolvere, **media** = da verificare, **bassa** = informativo.

| Categoria | Severità | Regola |
|---|---|---|
| Sovrapposizione | alta | la stessa persona o lo stesso mezzo su due ordini contemporanei |
| Assenza | alta | addetto assegnato in un giorno di ferie/riposo |
| Mezzo | alta | mezzo in manutenzione |
| Capacità | alta | somma dei volumi dei mezzi < volume dell'ordine — **disattivato** finché l'anagrafica articoli è sospesa |
| Patente | alta | non ci sono abbastanza autisti abilitati distinti per i mezzi della tratta |
| Assegnazione | media | tratta senza squadra |
| Mezzo | media | tratta senza mezzo (tutti impegnati o in manutenzione: suggerisce il corriere) |
| ZTL | media | mezzo non ammesso nella zona della location (Euro, massa, lunghezza) |
| Turni | media | giornata di lavoro > 10 h per un addetto |
| Turni | media | riposo < 11 h tra la fine di un giorno e la ripresa |
| Orari | media | lavoro nella fascia 22–6 (le offerte escludono i notturni salvo accordi) |
| Assegnazione | bassa | squadra inferiore alle persone stimate |
| Permesso | bassa | location in ZTL: ricordare il permesso |
| Orari | bassa | lavoro di domenica o festivo (festività fisse; Pasquetta e patrono da aggiungere) |
| Trasferta | bassa | pernottamento: prenotare l'alloggio |
| Anagrafica | bassa | articoli non censiti |

**Da aggiungere in produzione:** tempi di guida e riposo da tachigrafo per i mezzi oltre 3,5 t (Reg. CE 561/2006). Il sistema può avvisare, non sostituisce chi organizza i turni.

---

## 7. Volume e peso: perché sono sospesi e come ripartire

- **Non esiste oggi un'anagrafica articoli consultabile.** La colonna "Pos" delle offerte (100, 200, 300…) è il numero di riga, non un codice articolo: lo stesso numero indica articoli diversi in offerte diverse.
- Nel prototipo volume e peso sono **stimati dalla descrizione** con una tabella di parole chiave (sedia 0,09 m³, tavolo 0,5 m³, bancone 0,7 m³…). Sono valori dimostrativi: su Golosario danno 310 m³, gonfiati da appendiabiti e sedie che in realtà si impilano.
- **Chi stima il volume in produzione:** nessuno offerta per offerta. Il volume è una proprietà dell'articolo e si misura **una volta** in magazzino (ingombro da imballato, quanti per pila, se si smonta). L'ordine fa solo Σ quantità × volume.
- **L'LLM non stima il volume e le foto del PDF non servono**: da una foto non si ricavano misure né impilabilità. L'LLM può al massimo proporre una prima stima da confermare per un articolo nuovo e collegare la descrizione di un'offerta all'articolo giusto.
- **Strada consigliata quando si riparte:**
  1. chiedere se il gestionale che genera le offerte può esportare l'elenco articoli con codice (ed eventuali misure) o stampare il codice sull'offerta;
  2. in alternativa, costruire il catalogo dalle offerte estratte: raggruppare le varianti (es. "Sgabello Kate bianco/antracite"), usare le misure scritte nella descrizione dove ci sono (18 righe su 81 nelle 7 offerte), e far misurare al magazzino prima gli articoli più frequenti (coda "da censire").
- Nell'interfaccia il riquadro **"In arrivo"** compare in Anagrafiche → Articoli, nella stima effort dell'ordine e negli articoli dell'import.
- **Il volume dimostrativo non influenza la scelta dei mezzi**: la proposta usa il numero di mezzi indicato in offerta (o 1) e l'avviso di capacità è disattivato (§4.3, §6). Il volume dimostrativo pesa ancora sulle durate e sulla dimensione della squadra quando l'offerta non indica "N pax" (§5.1): sono valori che l'operatore corregge.

---

## 8. Stima di persone e micro-task senza volume

In ordine di affidabilità:

1. **Quello che dice l'offerta.** Le righe di logistica riportano spesso persone e mezzi: Artena "ALLESTIMENTO – 3 pax", Play2Give "TRASPORTO CONSEGNA – 2 furgone", "ALLESTIMENTO – DIURNO". Il convertitore le riconosce e le "N pax" diventano la squadra del piano.
2. **Lo storico.** Il foglio Excel di ottobre contiene 135 righe che legano un numero d'offerta a persone ("3 PAX + LAU E ISA", nomi), mezzo ("1 FURG", "IVECO GRANDE", "SPONDA NOSTRA") e orari. Estraendo i PDF di quelle offerte si ottengono casi reali "articoli + servizio → persone, mezzo, orari". Nessuna delle 7 offerte di oggi compare nel foglio di ottobre.
3. **L'LLM**, per un'offerta nuova senza indicazioni: riceve articoli, note (piani, orari tassativi, ZTL) e i casi simili dello storico, e propone persone, mezzi e durate **con motivazione e confidenza**. L'operatore conferma.
4. **Regole di default** (§5.1) quando non c'è altro.

La **sequenza** dei micro-task non richiede l'LLM: dipende dal servizio (§4.1).

---

## 9. Estrazione delle offerte (LlamaExtract)

### 9.1 Pipeline
```
PDF Offerte/*.pdf
  └─ Estrazione/estrai.py      → LlamaExtract (EU) con schema + prompt → Estrazione/output/<pdf>.json
  └─ Estrazione/converti.py    → Prototipo/assets/offerte/indice.js (campi, righe, citazioni)
                                 Prototipo/assets/offerte/<id>.js (PDF in base64, caricato on demand)
```
- Chiave in `Estrazione/.env` (`LLAMA_CLOUD_API_KEY`, escluso da git). Base URL EU: `https://api.cloud.eu.llamaindex.ai`.
- SDK `llama-cloud` ≥ 2.8: `client.files.create(..., purpose="extract")`, `client.extract.create(file_input, configuration={data_schema, extraction_target:"per_doc", tier:"agentic", system_prompt, cite_sources:true, confidence_scores:true})`, polling di `client.extract.get`.
- **Attenzione:** citazioni e confidenza arrivano solo leggendo il job con `expand=["extract_metadata"]`; senza, `extract_metadata` è vuoto.
- Costo osservato: circa **125 crediti per offerta** (50 parse + 75 extract), 60–90 secondi ciascuna.
- Schema: `Estrazione/schema_offerta.json`. Prompt e configurazione: `Estrazione/prompt_e_config.md`.

### 9.2 Citazioni
`extract_metadata.field_metadata.document_metadata.<campo>.citation[]` con `page` (da 1), `bounding_boxes [{x,y,w,h}]` in punti PDF con **origine in alto a sinistra**, `page_dimensions`. I campi annidati seguono la stessa struttura (`evento.location`, `articoli[i].quantita`). Per disegnare il riquadro: scala = larghezza pagina a schermo ÷ `page_dimensions.width`.

### 9.3 Conversione verso l'ordine
| Campo ordine | Da |
|---|---|
| numero | `numero_offerta` + " V" + `revisione` |
| resp, cliente | `responsabile_offerta`, `cliente.ragione_sociale` |
| location | `evento.location` (a capo → virgola) |
| zona | `evento.zona_ztl_citata` normalizzata sui nomi delle zone censite |
| referente | `referente_in_loco` + telefono (o referente cliente) |
| servizio | `consegna_e_allestimento` → allestimento, `solo_consegna` → consegna, `ritiro_cliente` → ritiro; se null, dedotto dalle righe di logistica |
| consegna, fine | data + ora; **ora mancante → 08:00 con confidenza ≤ 50%** (da verificare) |
| nota | `note_operative` senza le note standard + "permessi a carico del cliente" se indicato |
| km | non nel PDF: stimato dalla città |
| righe | articoli che non sono logistica né cauzione/sconti/avvertenze; "Alt." a quantità 0 |
| pax / mezzi | dalle righe di logistica ("N pax", "N furgoni") |

### 9.4 Cosa abbiamo imparato dalle 7 offerte
- Dati principali corretti su tutte: cliente, date, location, articoli, righe "Alt.", "area c" su Palazzo Mezzanotte.
- Casi particolari: **The Fairplay** ritira e riconsegna il cliente in magazzino; **Fondazione Prada** consegna "entro le 9.00 tassativo"; **Bertocco 1702** "Mattino_da definire"; **Golosario** "orari diurni da definire", servizio non specificato.
- Problemi corretti nel prompt (valgono dalla prossima estrazione): il modello metteva tra le note operative le **note standard** stampate su tutte le offerte; creava un **avviso per ogni campo vuoto**; le righe con "N pax" / "N furgoni" vanno estratte come articoli di logistica.
- Nessuna delle 7 offerte dice esplicitamente se la squadra **rientra o pernotta**: è una decisione dell'operatore (§4.2). Se in futuro compare ("trasferta", "vitto e alloggio"), si aggiunge un campo allo schema.

---

## 10. Limiti noti del prototipo (semplificazioni volute)

| Semplificazione | Da fare in produzione |
|---|---|
| Registro modifiche senza «rifai» e senza autore | registro persistente per utente, Ctrl+Y |
| Stato solo in memoria, nessun salvataggio | database, multi-utente (domanda aperta nel PRD) |
| Volume e tempi per pezzo stimati dalla descrizione | anagrafica articoli (§7) |
| Distanze per città da Grassobbio | API di routing |
| Mezzi proposti senza verifica di capacità (numero da offerta o 1) | con anagrafica articoli: capacità ≥ volume, solver CP-SAT |
| Festività fisse | calendario completo (Pasquetta, patrono) |
| Regole ZTL indicative | DB regole versionato con fonte |
| Fine andata scelta solo dopo aver creato l'ordine (l'anteprima dell'import usa la proposta) | scelta anche nell'anteprima |
| pdf.js da CDN | libreria inclusa nell'app |
| Mappa Google incorporata senza chiave, distanza stimata per città | Routes API con chiave; valutare impatto privacy |
| Ordini di esempio con distanze vecchie (20–50 km) | dati reali |
| Nessun tachigrafo | avviso tempi di guida |

---

## 11. Domande aperte

| Domanda | Per chi |
|---|---|
| Quale gestionale genera le offerte? Può esportare l'elenco articoli con codice (e misure) o stampare il codice sull'offerta? | Fabiana / amministrazione |
| Chi in magazzino conosce gli ingombri reali e può misurare gli articoli più frequenti? | Magazzino |
| Soglie per la proposta di fine andata (riposo 11 h, rientro dopo le 22, viaggio ≥ 1,5–2 h) e massimo ore giornaliere | Logistica |
| Si possono avere i PDF di ~20 offerte di ottobre già nel foglio Excel, per confrontare le proposte con quanto fatto davvero? | Fabiana |
| Il pernottamento ha un costo da tracciare (albergo, trasferta) o basta la nota? | Logistica / amministrazione |
| Il foglio del giorno deve restare identico all'Excel o si accettano colonne in più? | Fabiana |

---

## 12. Mappa dei file

| Percorso | Contenuto |
|---|---|
| `Prototipo/index.html` | il prototipo completo |
| `Prototipo/assets/logo-oig.png`, `logo-oig-biz.png` | logo nuovo senza "Noleggi Creativi" (estratto da `Documenti Vari/logo OIG_CMYK_NOLEGGI_CREATIVI.pdf`) |
| `Prototipo/assets/offerte/` | estrazioni convertite e PDF delle 7 offerte (**contengono dati di clienti**, esclusi da git) |
| `Prototipo/assets/offerte-demo/` | le stesse offerte anonimizzate, pubblicate (generate da `Estrazione/anonimizza.py`) |
| `Prototipo-Catalogo/index.html` | prototipo del catalogo, generato da `Catalogo/build.py` |
| `Prototipo-Catalogo/assets/articoli.js`, `articoli-demo.js` | listino completo (escluso da git) e copia pubblicabile (`Catalogo/pubblica.py`) |
| `Guida_Prototipo.md` | guida d'uso del prototipo e casi dimostrativi |
| `Preventivo_Pianificatore_Catalogo.md` | preventivo delle due applicazioni, mercato e Patent Box |
| `Estrazione/schema_offerta.json`, `prompt_e_config.md` | schema e prompt di estrazione |
| `Estrazione/estrai.py`, `converti.py` | pipeline di estrazione e conversione |
| `Estrazione/output/` | risposte grezze di LlamaExtract (**dati di clienti**) |
| `Estrazione/.env` | chiave API (escluso da git; **da rigenerare** perché è passata in chat) |
| `PDF Offerte/` | le 7 offerte reali |
| `Documenti Vari/` | Excel e PDF dei fogli giornalieri, logo |

**Versionamento** (repository pubblico `uvolpato/OltreIlGiardino`, demo su GitHub Pages): `.gitignore` esclude `.env`, `PDF Offerte/`, `Documenti Vari/`, `Estrazione/output/`, `Prototipo/assets/offerte/`, il listino completo e i backup. Restano i nomi di clienti reali nei dati dimostrativi dentro `Prototipo/index.html`.

---

## 13. Da fare (backlog)

| # | Cosa | Note |
|---|---|---|
| 1 | **Pagina di configurazione degli avvisi** | Da concordare con il cliente quali avvisi fanno pulsare i task nel Gantt (oggi: tutti quelli "da risolvere"), le soglie (riposo 11 h, giornata 10 h, rientro dopo le 22, viaggio 1,5–2 h, confidenza 85%) e quali avvisi mostrare. Oggi sono valori fissi nel codice. |
| 2 | Collegare volume, peso e tempi per pezzo al **Catalogo prodotti** | Vedi `PRD_Catalogo_Prodotti.md`: il catalogo è la fonte delle misure; la logistica le legge via API. |
| 3 | Rifare le estrazioni con il prompt aggiornato | Note standard escluse, avvisi solo per dati ambigui, righe "N pax / N furgoni". |
| 4 | Confrontare le proposte con lo storico | ~20 offerte di ottobre già nel foglio Excel. |
| 5 | Mostrare le percentuali "stimate" diversamente da quelle di LlamaExtract | km, ora mancante, servizio dedotto. |
| 6 | Rigenerare la chiave LlamaCloud | È passata in chat. |
| 7 | Avvisi dalle scadenze dei mezzi | Es. mezzo con revisione scaduta assegnato a una tratta. |
| 8 | Catalogo prodotti, poi magazzino con impegno degli articoli | Disponibilità per data; prima il catalogo. |
| 9 | Officina | Manutenzione e sistemazione degli articoli noleggiati rientrati danneggiati (dai report dei rientri). |
| 10 | «Rifai» nel registro modifiche | Ctrl+Y, autore della modifica. |
| 11 | Nomi di fantasia nei dati dimostrativi | Oggi i clienti dei dati di esempio sono reali. |
