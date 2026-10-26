# Pianificatore Logistica — Documentazione UI (maschere, flusso, utilizzo)

**Prodotto:** `Prototipo/index.html` (singolo file, si apre con doppio clic, nessuna installazione).
**Scopo di questo documento:** spiegare a un utente (e a chi manutiene l'app) cosa mostra ogni maschera, come è organizzato il flusso di lavoro e come si usano le funzioni. È pensato per restare valido anche nel prodotto finito.

> Gli **aiuti contestuali** (tooltip) sono già dentro l'app: ogni schermata ha un'icona «?» accanto al titolo, e ogni sezione del dettaglio ha la sua. Vedere §5.

---

## 1. Le viste (maschere principali)

La navigazione è sulla colonna di sinistra. Ogni voce apre una vista; il titolo e il sottotitolo in alto spiegano di cosa si tratta, e l'icona **?** accanto al titolo dà l'aiuto esteso.

| Vista | Cosa mostra | A cosa serve |
|---|---|---|
| **Foglio del giorno** | Uscite, carichi e squadre del giorno selezionato, per fascia oraria | Sostituisce l'Excel quotidiano: è la schermata operativa che si usa ogni mattina |
| **Pianificazione (Gantt)** | Ordini e micro-task su una timeline; barra dei mesi con etichette sticky (sempre visibili) | Vede il piano nel tempo, i conflitti, e sposta i task trascinando le barre |
| **Ordini** | Elenco delle offerte importate | Cerca, filtra e apre il dettaglio di un ordine |
| **Risorse** | Addetti, mezzi, squadre, trasportatori, articoli, zone ZTL, micro-task/formule, tabelle di lookup | Anagrafiche: qui si creano e modificano le entità che alimentano il piano |
| **Magazzino** | Report da stampare, una scheda per ordine: «Da preparare per domani» e «Rientri attesi» | Preparare e caricare la merce, controllare cosa rientra; stampa ed esporta CSV |
| **Notifiche & ore** | Alert pendenti e riconciliazione ore | Tiene sotto controllo conferme (motrice, ZTL) e scostamenti ore |
| **Componenti** | Catalogo dal vivo della libreria UI | Strumento per chi sviluppa/configura l'interfaccia |

---

## 2. Flusso d'uso tipico

1. **Importa l'offerta** — pulsante «Carica offerta PDF» in alto a destra. È un percorso guidato a passi:
   - caricamento/estrazione (LlamaExtract, region EU),
   - dati dell'offerta (campi con % di confidenza e citazioni evidenziate nel PDF),
   - anteprima del piano modificabile,
   - riepilogo (persone, mezzi, percorso con Google Maps, criticità) → conferma.
2. **Controlla il piano** nella vista *Pianificazione*: i conflitti pulsano in rosso; usa «Proponi risorse» per far proporre squadre e mezzi.
3. **Correggi dal dettaglio** — cliccando una barra o un ordine si apre il pannello di dettaglio (vedi §3).
4. **Mantieni le anagrafiche** in *Risorse* (addetti con ruoli/patenti/certificazioni, mezzi, articoli, zone, lookup — vedi §4).
5. **Stampa/esporta** dal *Foglio del giorno* o dal *Magazzino* per la condivisione.
6. **Torna indietro** con Ctrl+Z o dal *Registro modifiche* (icona con l'orologio in alto) — vedi §3bis.

---

## 3. Maschera di dettaglio (modale centrata)

Si apre cliccando un ordine, un micro-task o un avviso. È un pannello **centrato** (non più laterale), con tre zone:

- **Intestazione** — contesto (numero ordine · cliente) + titolo (task selezionato).
- **Corpo** — diviso in sezioni, ciascuna con un'**etichetta di ambito colorata** che chiarisce a cosa si riferisce:
  - **Ordine** (verde): dati sempre visibili, relativi all'ordine (riepilogo, sequenza dei micro-task).
  - **Tratta** (verde scuro): squadra e mezzi, validi per tutta la tratta (non per il singolo task).
  - **Questo task / Piano** (blu): ciò che cambia col task selezionato (campi, editor dei micro-task).
  - **Avvisi** (giallo): i problemi da risolvere.
- **Piede** — pulsanti d'azione (Chiudi, Elimina, Ripristina, Proponi risorse, Mostra nel Gantt).

**Dettaglio task** (aprendo un micro-task): in alto la sequenza cliccabile di tutti i task dell'ordine; a sinistra i campi del task e la tratta (squadra/mezzi); a destra il riepilogo ordine e gli avvisi.

**Dettaglio ordine**: in alto intestazione e sequenza; a sinistra l'editor dei micro-task (diviso per tratta) e Officina/Falegnameria; a destra riepilogo, stima e avvisi.

---

## 3bis. Salvare e annullare

- Nel piano **non c'è un Salva**: ogni modifica si applica appena cambi un campo; Gantt e avvisi si ricalcolano e un messaggio dice se ci sono nuovi conflitti o se ne sono stati risolti. «Chiudi» non annulla nulla.
- **Puntino bianco** su una barra = task modificato a mano; **pallino arancione** nella sequenza = task in conflitto.
- **Ctrl+Z** annulla l'ultima modifica al piano (non mentre si scrive in un campo).
- **Registro modifiche**: generale (icona con l'orologio nella barra in alto) o del singolo ordine (pulsante nel piede del dettaglio ordine). Ogni voce: ora, descrizione, ordini toccati, «Annulla».
- Annullare una voce annulla anche **le successive sugli stessi ordini** (si basavano su di lei): prima compare una conferma con l'elenco. Le modifiche su altri ordini restano. Le voci annullate restano barrate.
- Anagrafiche, ferie e fermi si salvano con il **Salva** del loro dialog e non entrano nel registro.

## 4. Anagrafiche e tabelle di lookup (vista Risorse)

Tutte le entità che alimentano il piano sono create/modificate qui (pulsanti **«+ Nuovo»** e **«Modifica/Elimina»** su ogni riga).

- **Addetti** — hanno **più ruoli** (es. Autista + Montatore), **patenti** e **certificazioni selezionabili** a checkbox. I ruoli **guidano l'assegnazione** (mappatura in `RUOLO_TASK`): il sistema preferisce chi ha un ruolo adatto ai micro-task della tratta; la patente resta il requisito tecnico per la guida.
- **Assenze / ferie / permessi** — per ogni addetto, con durata **giornata intera** (dal → al; stesso giorno = solo quello) o **parziale** (giorno + dalle → alle). Si inseriscono dal CRUD addetto (che mostra anche un **mini-gantt** con le ferie di tutti, addetto in modifica evidenziato) o dal pulsante **«Ferie / permessi»** nella Pianificazione "Per risorsa"; i blocchi nel Gantt sono cliccabili per rimuoverli.
- **Dialog addetto e mezzo a schede**, sempre della stessa dimensione:
  - *Addetto*: Anagrafica, Competenze, Disponibilità, Archivio.
  - *Mezzo*: Dati, Scadenze, Disponibilità, Archivio.
  - *Disponibilità*: timeline del mese (‹ › Oggi), prima riga l'addetto o il mezzo, sotto i colleghi assenti nel mese (per i mezzi: quelli dello stesso tipo fermi). Trascinando sui giorni si crea un periodo; cliccando un periodo si apre la sua riga. Sotto, i periodi in programma (circa 3 righe, poi scorrono).
  - *Archivio*: i periodi conclusi.
  - Non si salva con date incoerenti, periodi sovrapposti o date mancanti: il dialog apre la riga da correggere.
- **Mezzi** — patente richiesta, capacità, classe Euro, **scadenze** (revisione, assicurazione, bollo, tagliando) e **fermi**; lo stato Libero/Fermo si calcola dai fermi, giorno per giorno.
- **Squadre / Trasportatori** — squadre generate dagli ordini; trasportatori esterni con tariffa.
- **Articoli** — **anagrafica separata** con il `codice` come chiave (futura **FK**). Le righe d'ordine che citano un codice inesistente compaiono come «Da censire» e **non** vengono inserite nell'anagrafica: il DB resta consistente in vista della FK.
- **Zone ZTL** — vincoli di accesso (Euro, massa, lunghezza, permessi).
- **Micro-task e formule** — catalogo dei tipi e delle regole di durata stimate.
- **Tabelle** — le tabelle di **lookup** (Ruoli, Patenti, Certificazioni, Tipi di fermo mezzo) sono elenchi modificabili che alimentano i menu di selezione. Le modifiche valgono per la sessione corrente.

---

## 5. Aiuti contestuali (tooltip)

Ogni sezione spiegata dall'app usa un sistema unico e riusabile:

- **`UI.hint(chiave)`** renderizza l'icona «?» (pulsante con `aria-label` e `data-hint`).
- **`AIUTI`** è l'unica fonte dei testi di aiuto: una mappa `chiave → testo` in fondo allo script. Aggiungere/cambiare un testo = toccare solo questa mappa.
- Un solo elemento flottante (`#hintTip`, `role="tooltip"`) è riposizionato via JavaScript su hover/tastiera; sparisce allo scroll/`mouseout`.
- Accessibilità: l'icona è un vero `<button>` con nome accessibile; il testo compare anche col focus da tastiera.

Le chiavi usate oggi: `vista-*` (aiuto della vista corrente), più le sezioni del dettaglio (`seq-ordine`, `questo-task`, `tratta`, `riep-ordine`, `avvisi-panel`, `ordine-intest`, `piano-microtask`, `piano-officina`, `stima`).

---

## 6. Convenzioni e componenti (per chi sviluppa)

- Le schermate sono composte dai componenti di `window.UI` (catalogo nella vista *Componenti*).
- Le azioni passano tutte da `data-act`, gestite da un unico listener delegato.
- I pulsanti **"Nuovo …"** (azioni primarie) stanno nella **topbar a sinistra della campanella** (slot `#topActions`), coerenti in tutte le viste.
- La **timeline del Gantt** è un componente riusabile `timeline(R, {corner, body, zoom})`; la barra dei mesi usa segmenti `.mbseg` con etichetta sticky `.mb-lab` per mese.
- Le etichette di ambito del dettaglio (`Ordine` / `Tratta` / `Questo task` / `Piano` / `Avvisi`) sono rese da `detPanel()`.
- I dialoghi di inserimento/modifica dati usano la classe `dialog.form` (larghezza moderata, griglia a 2 colonne); la multi-selezione a checkbox usa `crudMulti()` e lo stile `.chk`/`.chipgroup`.
- Ferie e fermi usano un editor comune configurato da `DISP` (addetti: `assenze`, mezzi: `fermi`): `formAddetto()`/`formMezzo()`, `renderAssenze()`, `renderAeTimeline()`, `assRow()`, convalida `aeValida()`.
- I dialog a schede usano `.panes`: tutte le schede nella stessa cella della griglia, le inattive con l'attributo `data-off` (non `hidden`, che è `display:none` globale), così il dialog non cambia dimensione.
- Il registro modifiche è in fondo allo script: `registra()` (chiamata da `dopoModifica` e `render`), `catena()`, `annullaVoce()`, `apriRegistro()`.
- **Catalogo prodotti**: è un'app della stessa suite. `Catalogo/build.py` copia da questo file stile e libreria dei componenti: un componente cambiato qui cambia anche nel catalogo alla build successiva.
