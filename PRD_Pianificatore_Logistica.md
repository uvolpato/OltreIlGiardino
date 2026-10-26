# Pianificatore Logistica Eventi — PRD

## Document Information

- **Authors:** Ugo (PM / analisi), Fabiana Serra (Logistica — stakeholder)
- **Reviewers:** (da definire) — referenti commerciali, capo magazzino
- **Date:** 2026-10-19
- **Stato:** Bozza 0.1 — consolidamento discovery

### Change Log

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-10-19 | Ugo | Prima bozza da discovery (mail Fabiana + analisi PDF/Excel) |
| 0.2 | 2026-10-25 | Ugo | Aggiornamento dal prototipo: addetti multi-ruolo, patenti/certificazioni selezionabili, ruoli che guidano l'assegnazione, anagrafica articoli separata (FK-ready), lookup modificabili, maschere di dettaglio centrate con etichette di ambito, tooltip contestuali. Dettaglio in `Specifiche_Prototipo_2026-10-20.md` §0 e `Documentazione_UI.md` |
| 0.3 | 2026-10-25 | Ugo | Assenze/ferie/permessi con giornata intera vs parziale (ore); gestione in "Per risorsa" e nel CRUD addetto; azioni "Nuovo" in topbar; timeline estratta come componente riusabile; barra dei mesi con etichetta sticky per mese; mini-gantt assenze nel CRUD. |

| 0.4 | 2026-10-26 | Ugo | Dialog addetto e mezzo a schede con disponibilità e archivio; fermi e scadenze dei mezzi, stato calcolato; report di magazzino per ordine (preparazione del giorno dopo, rientri); registro modifiche con annullamento a catena; dati dimostrativi su 20 giorni. Dettagli in `Specifiche_Prototipo_2026-10-20.md` §0 |

---

## 1. Executive Summary

Costruiamo da zero un **pianificatore logistico** per "Oltre Il Giardino" (noleggio arredi per eventi). Carica i **PDF delle offerte**, estrae i dati, **posiziona l'evento sulla timeline**, lo **spezza in micro-task** (carico, viaggio, consegna, allestimento, disallestimento, ritiro, rientro a magazzino) e **assegna addetti e mezzi in funzione dell'effort** (quantità/volume del materiale, tempi, disponibilità). Il tutto visualizzato come **Gantt** (evento → sotto-eventi) e con segnalazione automatica di **sovrapposizioni** e **vincoli di accesso (ZTL/permessi)**.

Impatto: si passa da un foglio Excel compilato a mano (uno per giorno, con errori e sovrapposizioni scoperte a posteriori) a un piano generato e validato automaticamente, con dati centralizzati.

---

## 2. Problem Statement

### Chi ha il problema

L'operatore logistica (oggi Fabiana) che ogni giorno costruisce il foglio di pianificazione assegnando persone e mezzi agli incarichi, più il capo magazzino/coordinatore squadre.

### Qual è il problema

La pianificazione è **manuale e frammentata**:
- i dati di partenza stanno in **PDF di offerta separati**, non in un gestionale collegato;
- il piano viene ricopiato a mano in un foglio Excel/PDF per giorno (vedi `10. OTTOBRE 2026.xlsx`: 31 fogli, uno per giorno);
- **non c'è il volume/peso per ordine**, quindi non si può sapere in modo deterministico quale mezzo serve né quante persone;
- le **sovrapposizioni di personale/mezzi** si scoprono a posteriori, non in fase di pianificazione;
- i **vincoli di accesso** (ZTL Milano — Area C, Zona Isola, Quadrilatero della Moda — permessi di sosta/carico) non sono verificati.

### Perché fa male

- **Impatto utente:** tempi lunghi, refusi, doppie assegnazioni, incarichi mal dimensionati (mezzo o squadra sbagliati).
- **Impatto business:** errori di pianificazione = ritardi/mancate consegne, mezzi male utilizzati, persone ferme o sovraccariche, rischio multe per accesso ZTL.

### Evidence

- **Mail Fabiana (Logistica):** richiede esplicitamente (1) segnalazione sovrapposizioni personale, (2) segnalazione divieti accesso (Area C, Isola, Quadrilatero), (3) programmazione trasporti con tipologia mezzo + assegnazione trasportatore, (4) micro-task per incarico.
- **Artefatti reali:** `07.SETTEMBRE 2026.pdf` e `10. OTTOBRE 2026.xlsx` mostrano un formato tabellare quotidiano compilato a mano, con celle ambigue ("A SEGUIRE", "//", "AL RIENTRO"), refusi (DOUGLAS/DOUGLASS, LASSANA/LASSANE) e colonne disallineate.
- **PDF offerta reale** (`Offerta_...Golosario...pdf`): conferma che i dati utili (cliente, date, location, articoli+quantità, note su permessi) esistono già, ma sono sparsi su un documento per ordine.

---

## 3. Target Users & Personas

### Persona primaria — "Fabiana", operatore logistica

- **Ruolo:** pianifica la giornata, assegna persone e mezzi, costruisce il foglio quotidiano.
- **Goal:** un piano giornaliero corretto al primo colpo, senza sovrapposizioni e con mezzi/squadre giusti.
- **Pain:** ricopiatura manuale, nessuna visibilità immediata sui conflitti, dati sparsi.
- **Comportamento attuale:** legge i PDF offerta, compila l'Excel a mano, controlla "a occhio" le sovrapposizioni.

### Persona secondaria — capo magazzino / capo squadra

- **Ruolo:** coordina carico, squadre e mezzi; conosce competenze e disponibilità reali delle persone.
- **Goal:** sapere chi/che mezzo è dove, e chi è fermo in magazzino.
- **Pain:** il foglio non dice cosa è "in magazzino" vs "fuori", né l'effort reale per allestimento/disallestimento.

### Persona secondaria — referente commerciale (es. "Chiara")

- **Ruolo:** gestisce l'offerta (`A Cura di`), conosce cliente e accordi commerciali.
- **Goal:** che il suo ordine venga servito con il materiale/le date concordate.

### Jobs-to-Be-Done

- **Funzionale:** trasformare un'offerta PDF in un piano di micro-task assegnati e vincolati.
- **Emotivo:** fiducia che il piano sia giusto senza dover ricontrollare tutto a mano.
- **Sociale:** essere percepito come organizzato ed efficiente verso clienti e colleghi.

---

## 4. Strategic Context

### Business Goals

- Ridurre gli **errori di pianificazione** (sovrapposizioni, mezzi/squadre sbagliate).
- Ridurre il **tempo** per produrre il piano giornaliero.
- **Scalare il volume di eventi** senza aggiungere personale amministrativo.
- Centralizzare i dati ordine (oggi dispersi in PDF).

### Market Opportunity

🔶 Assumption — strumento **interno**, non un prodotto commerciale. Non si applica TAM/SAM/SOM. Se in futuro diventasse un SaaS per il settore eventi italiano, la valutazione andrebbe rifatta.

### Competitive Landscape

Strumenti esistenti coprono pezzi del problema ma **nessuno il tutto**:
- **Gantt/PM** (MS Project, Smartsheet, TeamGantt): timeline, debole su risorse e mezzi.
- **Resource scheduling** (Float, Resource Guru, Dusk IMS, Lasso): sovrapposizione persone, ma non mezzi/ZTL/volume.
- **TMS/routing** (Onfleet, OptimoRoute, ORTEC): routing + finestre orarie, non personale/eventi.

**Gap:** nessuno combina *offerte PDF → volume → micro-task → assegnazione persone+mezzi → ZTL*.

### Why Now

Volume eventi in crescita; la pianificazione manuale è il collo di bottiglia. Il modello di estrazione (LlamaCloud EU + JSON schema) è già stato **validato** sul PDF Golosario e produce dati puliti.

---

## 5. Solution Overview

### Architettura (pipeline)

```
PDF offerta ──▶ Estrazione (LlamaParse/LLM EU) ──▶ Ordine JSON strutturato
                                                        │
              ┌─────────────────────────────────────────┼────────────────────────┐
              ▼                                         ▼                        ▼
      Anagrafiche (addetti, mezzi,          Posizionamento timeline       Motore regole ZTL/permessi
      articoli, micro-task, zone)           + generazione micro-task       (point-in-polygon + tabella)
              └──────────────────────────────┬────────────────────────────────────┘
                                              ▼
                          Stima effort (tempi carico/viaggio/allestimento
                          in funzione di quantità+volume) ──▶ Selezione addetti & mezzi
                                                              (CP-SAT / OR-Tools, con conferma umana)
                                              ▼
                                        Gantt UI (evento + sotto-eventi; vista per ordine e per risorsa)
                                              ▼
                                        Avvisi: sovrapposizioni, vincoli, permessi
```

### Key Features

1. **Anagrafiche**: addetti (con patenti), mezzi (con capacità di carico), articoli (volume/peso), micro-task (template), zone ZTL.
2. **Ingest PDF offerte** → ordine strutturato (già validato).
3. **Auto-posizionamento** dell'evento sulla timeline da data consegna/ritiro + orari.
4. **Splittaggio in micro-task** con template + dipendenze.
5. **Stima effort** (tempi e persone/mezzo) in funzione della quantità/volume.
6. **Selezione** addetti e mezzi in funzione di effort, disponibilità, patenti e capacità.
7. **Gantt** a due viste: *per ordine* (evento + sotto-eventi) e *per risorsa* (sovrapposizioni in rosso).
8. **Avvisi** automatici: sovrapposizioni, ZTL/permessi, capacità mezzo insufficiente.

### Flusso utente (target)

1. L'operatore carica il PDF offerta.
2. Il sistema estrae i dati e crea l'ordine (con revisione/correzione manuale).
3. Il sistema posiziona l'evento sulla timeline e genera i micro-task.
4. Il sistema stima l'effort e propone addetti + mezzi.
5. L'operatore conferma/aggiusta (drag & drop, riassegnazione).
6. Il Gantt mostra il piano; gli avvisi evidenziano i conflitti prima del congelamento.

---

## 6. Success Metrics

### Primary Metric

**Copertura pigliata correttezza del piano** — % di incarichi della giornata generati e validati *senza* sovrapposizioni non rilevate né mezzi/squadre sottodimensionati.
- Current: 🔵 Open Question (baseline non misurata — oggi il conflitto si scopre a mano).
- Target: 100% degli incarichi con risorse non in conflitto alla consegna del piano.
- Timeline: da misurare dopo la prima stagione di utilizzo.

### Secondary Metrics

- **Tempo** per produrre il piano giornaliero: da ~X a <X/2 🔵 (baseline da misurare).
- **Accuratezza estrazione** offerta → ordine: % campi corretti senza intervento (oggi ≈ 90–95% sul campione Golosario, con errori noti sulle colonne prezzo).
- **Volume ordini gestiti** per operatore 🔵.

### Guardrail Metrics

- **Nessun blocco del lavoro**: il sistema deve sempre permettere l'override manuale (non deve rendere il piano più lento o più rigido).
- **Accuratezza** non peggiora: i micro-task generati non devono introdurre più errori dell'attuale ricopiatura.

---

## 7. User Stories & Requirements

### Epic Hypothesis

Crediamo che, estraendo le offerte PDF e generando/assegnando automaticamente i micro-task in funzione di quantità e volume, ridurremo gli errori e il tempo di pianificazione, perché oggi il collo di bottiglia è la ricopiatura manuale senza vincoli. Misureremo il successo sulla correttezza del piano e sul tempo per produrlo.

### 7.1 — Anagrafiche

**Story — Anagrafica addetti**
Come operatore, voglio censire ogni addetto con patenti e competenze, così il sistema può proporre chi è abilitato per ciascun task.

- Campi: nome, ruolo (magazziniere/montatore/autista/capo squadra), **patente** (nessuna → `semplice`, `B`, `C`, `CE` = "patenti speciali"), abilitazioni (muletto/carrello), disponibilità, orario di lavoro, ferie/assenze/riposi.
- AC: un addetto può avere 0..N patenti; gli addetti "semplici" non risultano assegnabili a task che richiedono guida.

**Story — Anagrafica mezzi (come censire per il carico autonomo)**
Come operatore, voglio censire ogni mezzo con la sua capacità, così il sistema capisce da solo se un carico "ci sta" e chi può guidarlo.

- Campi per mezzo:
  - identità: nome/targa, tipo (furgone, sponda idraulica, ducato, iveco, bilico, motrice, auto), **interno vs corriere esterno** (se corriere: lead time + costo);
  - **capacità carico**: volume utile (m³), portata (kg), dimensioni pianale/vano (L×W×H), n. bancali;
  - **requisiti**: patente richiesta, n. autisti (1 o 2);
  - **circolazione/ZTL**: classe Euro, massa totale, lunghezza (servono per i vincoli di accesso);
  - stato/disponibilità (libero/occupato/manutenzione).
- AC: dato un ordine con volume totale V e peso P, il sistema esclude i mezzi con volume utile < V, portata < P o patente non coperta dagli addetti disponibili.

> **Perché questi campi:** volume+portata decidono "ci sta il carico"; patente decide "chi può guidarlo"; Euro/massa/lunghezza decidono "può entrare in ZTL"; interno/corriere decide il lead time di pianificazione.

**Story — Anagrafica articoli (collega quantità → volume)** 🔶 Assumption: non esiste ancora, da costruire
Come operatore, voglio censire ogni articolo con volume/peso unitario, così "qta" in offerta si traduce in volume/peso ordine.

- Campi: codice (il `pos` dell'offerta), descrizione, categoria, **volume unitario (m³)**, **peso unitario (kg)**, ingombro/dimensioni, impilabile sì/no, **tempo carico/scarico unitario** (o per collo).
- AC: `volume_ordine = Σ (qta × volume unitario)`; articoli senza volume segnalati come "da censire".

**Story — Anagrafica micro-task (SÌ, serve)** 
Come operatore, voglio un catalogo di tipi di micro-task, così il sistema sa in quali step spezzare un evento.

- Tipi base: `CARICO` (magazzino), `VIAGGIO`, `CONSEGNA/SCARICO`, `ALLESTIMENTO`, `DISALLESTIMENTO`, `RITIRO`, `RIENTRO A MAGAZZINO`, `RICONSEGNA`.
- Ogni tipo ha: formula di durata (vedi 7.3), categoria di risorse coinvolte, dipendenze (es. allestimento dopo consegna; ritiro dopo fine evento; rientro → materiale "torna disponibile a magazzino").
- AC: dato un evento, il sistema genera i micro-task nell'ordine logico tipico e li collega.

**Story — Anagrafica zone/vincoli accesso** 🔶 Assumption: regole da curare/caricare
Come operatore, voglio censire le zone ZTL con orari e vincoli, così il sistema segnala i rischi di accesso.

- Zone: Area C, Area B, Cerchia dei Bastioni, Zona Isola, Quadrilatero della Moda (Milano) + Bergamo; vincoli per orario, classe Euro, massa/lunghezza, permessi (sosta/carico-scarico).
- AC: dato location + mezzo + orario, il sistema restituisce accessibile/vincolato + permesso necessario + fonte.

### 7.2 — Ingest PDF offerta

**Story — Estrazione ordine da PDF**
Come operatore, voglio caricare un PDF offerta e ottenere un ordine JSON strutturato, così non ricopio a mano.

- AC (già validato sul campione Golosario): estrae numero/revisione, referente commerciale, cliente (+piva/sdi/referente), data consegna/ritiro, luogo, orari, evento, articoli (categoria/descrizione/qta/dimensioni/alternative), totali, note operative (incl. permessi/facchinaggio) ed esclude il testo contrattuale.
- AC: campi non determinabili → `avvisi[]` con motivo, mai valori inventati.

**Story — Revisione manuale dell'ordine estratto**
Come operatore, voglio correggere i campi estratti prima che entrino in pianificazione, così gli errori dell'estrazione non si propagano.

### 7.3 — Posizionamento timeline + micro-task + effort

**Story — Posizionamento evento**
Come operatore, voglio che l'evento compaia sulla timeline nelle date/slot corretti (da data consegna a data ritiro), così vedo l'occupazione.

**Story — Generazione micro-task**
Come operatore, voglio che il sistema spezzi l'evento in micro-task usando il catalogo, così ho il Gantt evento → sotto-eventi.

**Story — Stima effort (tempi e risorse in funzione della quantità)**
Come operatore, voglio che i tempi dei micro-task siano calcolati dal materiale, così non li indovino.

- Modello di stima (da confermare con il magazzino):
  - `tempo_carico = f(volume totale, tempo unitario per categoria)`
  - `tempo_viaggio = f(distanza, mezzo)` 🔵 (fonte distanza: routing API o media manuale)
  - `tempo_allestimento/disallestimento = f(quantità, complessità categoria)`
  - `persone per task = f(volume, tipo allestimento, location)` 🔶 (regole da tarare)
  - `mezzo = argmin{mezzo : capacità ≥ volume ∧ patente compatibile}`
- AC: variando la qta di un articolo, il tempo stimato e il mezzo proposto cambiano di conseguenza.

### 7.4 — Selezione risorse

**Story — Selezione addetti e mezzi**
Come operatore, voglio che il sistema proponga addetti e mezzi in funzione di effort, disponibilità e vincoli, così non faccio io il matching.

- Hard constraints: non-sovrapposizione, patente/capacità, disponibilità (assenze/riposi), mezzo non già assegnato.
- Soft: bilanciamento carichi, minimo spostamento.
- AC: la proposta non genera mai sovrapposizioni; se non c'è soluzione, il sistema lo segnala anziché forzare.

🔶 Assumption — la selezione **automatica** diventa affidabile solo a catalogo articoli popolato (volume). Fino ad allora: proposta + conferma umana obbligatoria.

### 7.5 — Gantt & avvisi

**Story — Vista Gantt (evento + sotto-eventi)**
Come operatore, voglio il Gantt con l'evento totale e sotto i suoi micro-task, così seguo l'intera durata "dal primo task a quando la merce torna a magazzino".

**Story — Vista per risorsa (sovrapposizioni)**
Come operatore, voglio selezionare una persona o un mezzo e vedere tutti i suoi impegni, così le sovrapposizioni saltano all'occhio (barre rosse).

**Story — Avvisi automatici**
Come operatore, voglio avvisi su sovrapposizioni, vincoli ZTL/permessi e capacità mezzo insufficiente, così intervengo prima di congelare il piano.

### Vincoli & casi limite

- Task "A SEGUIRE"/"AL RIENTRO" senza orario: risolvere concatenando il task precedente (durata default se non stimabile).
- Eventi multi-giorno: la timeline deve gestire il ritorno merce a magazzino come task esplicito.
- Corriere esterno: si assegna con lead time, non come mezzo interno.
- Override manuale sempre consentito; nessun "lock" che blocchi l'operatore.
- GDPR/AI Act: estrazione su region EU; dati dipendenti/clienti non escono dall'UE.

---

## 8. Out of Scope

- **Ottimizzazione routing multi-sosta (TSP/VRP)** — non serve per N mezzi piccoli; prima la pianificazione a slot.
- **Gestionale completo** (fatturazione, magazzino/scorte, contabilità) — restano altrove.
- **GPS/tracking real-time** dei mezzi.
- **App mobile / notifiche push** ai guidatori.
- **Permessi suolo pubblico / iter burocratico automatico** — il sistema segnala *cosa serve*, non fa la pratica.
- **Multi-tenant/SaaS** e vendita esterna.

### Future Considerations

- Routing multi-sosta se il numero di consegne/giorno crescerà.
- Integrazione con il gestionale/fatturazione (es. SDI, PDF offerta già li contengono).
- Tracking ETA e gestione ritardi last-minute.

---

## 9. Dependencies & Risks

### Dependencies

- **Anagrafica articoli** (volume/peso) — 🔶 non esiste ancora; è la dipendenza critica per effort e selezione automatica. Fonte probabile: DDT fornitori / catalogo magazzino.
- **Anagrafica addetti/mezzi** — dati da raccogliere (oggi solo implicitamente nei fogli).
- **Regole ZTL/permessi** — vanno caricate/curate (fonti: atti comunali, ACI).
- **Estrazione**: LlamaCloud EU (40K crediti) per il prototipo; poi decidere produzione (locale vs EU cloud).
- **Solver**: OR-Tools CP-SAT (open source, nessuna licenza).

### Rischi & mitigazioni

- **Rischio:** manca il catalogo volume → l'assegnazione automatica non è affidabile.
  - **Mitigazione:** fase 1 = proposta+conferma umana; popolare il catalogo incrementaldmente.
- **Rischio:** qualità capi estratti (colonne prezzo, righe "Alt.") → errori in pianificazione.
  - **Mitigazione:** revisione umana pre-ingresso + `avvisi[]`; raffinare schema/prompt.
- **Rischio:** regole ZTL obsolete/incomplete → avvisi sbagliati.
  - **Mitigazione:** DB regole versionato con fonte; avviso con confidence, mai blocco.
- **Rischio:** adozione bassa (l'operatore torna all'Excel).
  - **Mitigazione:** l'output deve *sostituire* il foglio quotidiano (generarlo in formato riconoscibile), non aggiungere un passaggio.
- **Rischio:** valore (servirà davvero?) — mitigare con MVP su una settimana reale di ordini.

---

## 10. Open Questions

| Question | Owner | Deadline | Status |
|---|---|---|---|
| Esiste già un catalogo articoli con volume/peso, o va creato da DDT? | Magazzino | — | Open |
| Fonte per il tempo di viaggio: routing API (quale) o media manuale? | Ugo | — | Open |
| Quanti utenti simultanei? Un solo operatore o più postazioni? | Logistica | — | Open |
| Dove girerà in produzione: cloud EU o on-premise locale? (incide su GDPR) | Ugo | — | Open |
| Quali sono i "tipi" esatti di micro-task e le relative formule di tempo? (da tarare col magazzino) | Magazzino | — | Open |
| Il foglio quotidiano generato deve mantenere l'attuale layout (per abitudine) o si accetta il nuovo Gantt? | Fabiana | — | Open |
| Regole ZTL valide per le zone effettivamente servite (solo Milano+Bergamo, o altre)? | Logistica | — | Open |

---

## PRD Self-Assessment

### Strongest Section

**§5 Solution Overview** — l'architettura a pipeline è chiara e ogni anello è già stato validato empiricamente (estrazione Golosario funzionante, dominio ben compreso dai file reali).

### Weakest Section

**§6 Success Metrics** — nessuna baseline misurata (tempo di pianificazione, tasso di errore attuale). Senza baseline non si possono fissare target credibili.

### Top Assumptions to Validate

| # | Assumption | Sez. | Rischio se sbagliata | Validazione |
|---|---|---|---|---|
| 1 | Il catalogo articoli con volume/peso non esiste e va costruito | 7.1 | effort e selezione automatica non funzionano | chiedere al magazzino / ai DDT |
| 2 | Le formule di effort (tempo carico/allestimento per categoria) sono correggibili | 7.3 | tempi sbagliati = squadre/mezzo sbagliati | tarare su 2–3 eventi reali |
| 3 | Un tool interno (non commerciale) — niente TAM/SAM/SOM | 4 | se diventa prodotto va rifatta l'analisi | n/a (scoping) |
| 4 | Regole ZTL caricate basta per le zone servite | 7.1 | avvisi incompleti | verificare con Fabiana | 

### Recommended Next Step

**Raccogliere l'anagrafica articoli** (volume/peso unitario) e **definire con il magazzino le formule di effort** (tempi carico/viaggio/allestimento per categoria): senza questi due input, l'anagrafica mezzi e la selezione automatica restano bloccate come previsto in §2.

---

*End of PRD*