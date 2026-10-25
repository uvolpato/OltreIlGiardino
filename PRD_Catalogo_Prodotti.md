# Catalogo Prodotti — PRD

## Document Information

- **Autori:** Ugo (PM / analisi)
- **Revisori:** 🔵 da definire — referente magazzino, commerciali, amministrazione (ERP)
- **Data:** 2026-10-20
- **Stato:** Bozza 0.1
- **Documenti collegati:** `PRD_Pianificatore_Logistica.md`, `Documento_Tecnico_Sistema.md`, `Specifiche_Prototipo_2026-10-20.md`

### Change Log

| Versione | Data | Autore | Modifica |
|---|---|---|---|
| 0.1 | 2026-10-20 | Ugo | Prima bozza dalle richieste del 20/10 |
| 0.2 | 2026-10-21 | Ugo | Analisi del file articoli IBED (§2bis); codici, classificazioni, colori e varianti allineati ai dati reali |

---

## 0. La piattaforma aziendale e il suo nome

Oggi esiste solo la sezione **Logistica** (il pianificatore). Il catalogo prodotti è la seconda sezione della **stessa applicazione**: stesso accesso, stessi utenti, ruoli diversi. Nel tempo si aggiungeranno altre sezioni (magazzino, poi forse commerciale).

```
                    ┌──────────────────────────────────────────┐
                    │  [Nome piattaforma]  — un solo accesso    │
                    ├───────────────┬──────────────┬───────────┤
   webapp (desktop) │  Logistica    │  Catalogo    │ Magazzino │
   mobile (telefono)│  (consulta)   │  (censimento)│ (dopo)    │
                    └───────┬───────┴──────┬───────┴───────────┘
                            │              │
                            ▼              ▼
                    API REST + server MCP  ──►  ERP, sito, preventivi, agenti AI
```

### Proposte per il nome

Il nome deve funzionare come "contenitore" (la piattaforma) e lasciare alle sezioni nomi descrittivi ("Serra · Logistica", "Serra · Catalogo").

| Nome | Perché | Contro |
|---|---|---|
| **Serra** ⭐ | Dentro il giardino, è il luogo dove le cose si preparano e si custodiscono. Breve, italiano, facile da dire ("aprilo in Serra"). | Nessuno di rilievo; verificare che non sia già un marchio nel settore. |
| **Vivaio** | Dove si coltiva e si cataloga: richiama bene il catalogo. | Più adatto alla sola sezione catalogo che all'intera piattaforma. |
| **Radici** | La "fonte di verità" da cui tutto parte. | Suona astratto per un'app operativa. |
| **OIG Hub** / **OIG Studio** | Neutro, richiama il marchio. | Generico, poco memorabile. |

**Consiglio:** **Serra** per la piattaforma; sezioni "Logistica", "Catalogo", "Magazzino". In alternativa, **Vivaio** se si preferisce dare un nome proprio al catalogo dentro una piattaforma "OIG".

---

## 1. Executive Summary

Costruiamo il **Catalogo Prodotti** di Oltre Il Giardino: l'anagrafica unica di tutti gli articoli a noleggio, che diventa la **fonte di verità aziendale** sui prodotti e sostituisce il file Excel attuale. Gli addetti censiscono e completano gli articoli **dal telefono, in magazzino o in loco**, partendo da una foto e da una descrizione facoltativa: un modello di immagini (Nano Banana) produce la foto di presentazione scontornata secondo un prompt scelto, e un LLM descrive l'oggetto nel dettaglio, estrae fino a 3 colori RGB e propone temi, stili e funzioni utili per gli eventi. Il catalogo gestisce **articoli composti** (componenti, configurazioni alternative, anima e rivestimento) e distribuisce i dati a tutti i sistemi via **API REST e MCP**. Per la logistica è anche la fonte di **volume, peso e tempi** oggi mancanti.

---

## 2. Problem Statement

### Chi ha il problema
- Chi gestisce oggi il catalogo in Excel (🔵 chi esattamente?).
- Commerciali che preparano le offerte (descrizioni, foto, proposte di allestimento).
- Logistica e magazzino, che non hanno misure, pesi e ingombri degli articoli.

### Qual è il problema
- Il catalogo vive in un **file Excel**: una copia per chi lo usa, nessuno storico delle modifiche, nessun controllo su chi cambia cosa, impossibile da consultare da un'altra applicazione.
- Le **foto** sono disomogenee (sfondi diversi, luce diversa) e non sono collegate in modo affidabile all'articolo.
- Le **descrizioni** sono brevi e non pensate per la vendita: non dicono a quali eventi, stili o temi si adatta un oggetto.
- Gli articoli **composti** (struttura + piani, anima + rivestimento, struttura usabile come bancone o come gazebo) non sono rappresentabili in un foglio piatto.
- Mancano **volume, peso, impilabilità, tempi** di carico e montaggio: la pianificazione logistica non può dimensionare mezzi e squadre (vedi `Specifiche_Prototipo` §7).
- Le offerte, generate dall'ERP, usano come "codice" la posizione di riga (100, 200, 300…), non un codice articolo stabile.

### Perché fa male
- **Operativo:** errori di carico (mezzo sbagliato), tempi stimati a occhio, articoli "dimenticati" perché non si sa che esistono.
- **Commerciale:** offerte meno curate, difficile proporre allestimenti coerenti per tema o colore.
- **Tecnologico:** nessuna integrazione possibile finché il dato vive in un Excel.

### Evidenze
- **File articoli attuale** (`Articoli IBED_13_10_25_rev2_mod.xlsx`, preparato per il caricamento nell'ERP erpCUBE): **2.194 articoli**, analisi completa al §2bis.
- Le 7 offerte reali: 81 righe; con una ricerca per parole chiave **66 (81%)** si ritrovano nel file articoli, ma le offerte **non stampano il codice articolo** (la colonna "Pos" è il numero di riga).
- Il prototipo logistico ha dovuto **sospendere** volume e peso automatici: il file articoli non ha volume, peso né impilabilità.

---

## 2bis. Il catalogo di oggi: file articoli IBED

Analisi del file `Articoli IBED_13_10_25_rev2_mod.xlsx` (versione del 13/10/2025, rev. 2, foglio ARTICOLI + 7 fogli di supporto).

### Contenuto

| Dato | Copertura | Note |
|---|---|---|
| Articoli | **2.194** | 13 macro-classi: Mise en place 660, Sedute 497, Accessori 174, Tavoli 169, Coperture 165, Tessuti 158, Luci 112, Cuscini 71, Mobili 50, Pavimenti e tappeti 47, Vasi e piante 44, Banconi 37, Bambini 10 |
| Codice | 100% | schema `XX FFF pr prg-CC` (sotto) |
| Descrizione breve (max 40 car.), titolo, descrizione estesa | 100% / 100% / 99% | 106 descrizioni brevi superano i 40 caratteri |
| Dimensioni | 97% | **testo libero**: 1.313 su 2.182 leggibili come L×P×H (es. "104x27xh80 CM", "Ø62xh98 CM"); alcune su più righe |
| Classificazione a 3 livelli | 100% | 13 / 37 / 214 voci, con tabella codici dedicata |
| Fornitore 1 / 2 (codice e nome) | 90% / 3% | anagrafica fornitori in un foglio a parte |
| Prezzo noleggio / vendita | 85% / 61% | senza IVA (22% fissa) |
| Unità di misura | 100% | NR (2.189), MQ (5) |
| Foto | 100% un nome file, 3% più di una | **solo il nome del file**: le immagini non sono nel progetto |
| Note | 13% | campo libero interno |
| Famiglia, Gruppo merceologico | 0% | colonne vuote ("probabile non utilizzo") |
| **Volume, peso, impilabilità, tempi** | **0%** | non previsti |
| Temi, stili, funzioni d'uso, colori RGB | 0% | non previsti |
| Componenti / composizioni | 0% | non previsti (ma vedi coperture e varianti) |

### Schema del codice (foglio "Creazione Articolo")

```
SE POU 83 006 - 10
│  │   │  │     └─ CC  colore (tabella colori: 00 trasparente … 01–09 bianchi … 90 nero, 91–99 oro, argento, ferro, naturale, mix…)
│  │   │  └─────── prg serie di 3 cifre: identifica l'articolo
│  │   └────────── pr  serie di 2 cifre: identifica il materiale (10–19 plastiche, 20 legno, 30 fibre naturali, 40 metallo, 50 vetro, 60 ceramica, 70 personalizzazione, 80–99 tessuti)
│  └────────────── FFF codice 2ª classificazione (es. POU = pouf)
└───────────────── XX  codice 1ª classificazione (es. SE = sedute)
```

- **2.180 codici su 2.194 rispettano lo schema**; 14 no (es. `BA 10 001-20`, `MPACC 40 80-92`).
- **Tutti i codici contengono spazi** (anomalia già segnalata: adeguamento a cura di IBED).
- **92 codici duplicati** (es. `SEPOU83006-52`, `TECUS87141-52`).

### Cosa ci dice per il nuovo catalogo
1. **Le varianti di colore esistono già nel codice**: la parte prima di `-CC` identifica l'articolo, `CC` il colore. **286 articoli hanno più varianti** (es. "Pouf Pallino 39" in 14 colori, tovagliati fino a 23). L'import può quindi creare automaticamente **articolo padre + varianti**.
2. **Il colore aziendale è un codice**, non un RGB: il catalogo conserva il **codice colore aziendale** (filtro e codifica) e aggiunge i **colori RGB rilevati dalla foto**; il sistema propone il codice colore più vicino all'RGB dominante.
3. **Il materiale è nel codice** (`pr`): l'import lo ricava e lo usa come dato iniziale, che l'AI completa (finitura, materiali secondari).
4. **Anima e rivestimento ci sono già, ma come articoli separati**: 56 articoli "Copertura … / Fodera …" (es. "Copertura Da-Do angolare scirocco") vanno collegati come **componenti di ruolo rivestimento** dell'articolo (poltrona Da-Do).
5. **Classificazione a 3 livelli** (13/37/214) = la tassonomia **di prodotto** esistente, da mantenere. Funzione d'uso, stili e temi evento sono **in aggiunta**, non al posto.
6. **Le dimensioni vanno strutturate**: il testo attuale si converte in L/P/H/Ø dove possibile (60%); il resto finisce nella coda "da misurare".
7. **Il file è il caricamento dell'anagrafica ERP**: il catalogo nuovo non può ignorare erpCUBE. Vedi §4 "Rapporto con l'ERP".

---

## 3. Utenti e personas

| Persona | Ruolo | Dove lavora | Cosa fa nel catalogo |
|---|---|---|---|
| **Censitore** (magazziniere, montatore, chiunque abbia il telefono) | Primario | Magazzino, location di un evento | Fotografa, aggiunge una nota, completa misure e componenti, aggiunge foto a un articolo esistente |
| **Curatore del catalogo** | Primario | Ufficio, desktop | Revisiona e approva, corregge le descrizioni, gestisce composizioni e varianti, tassonomie, prompt |
| **Commerciale** | Secondario | Ufficio | Consulta, cerca per tema/colore/stile, scarica foto per offerte e moodboard |
| **Logistica** (Fabiana) | Secondario | Ufficio | Legge volume, peso, impilabilità, tempi; segnala articoli da misurare |
| **Sistemi esterni e agenti AI** | Consumatori | — | Leggono il catalogo via API / MCP |
| **Amministratore** | Supporto | Ufficio | Utenti e ruoli, prompt standard, chiavi API, integrazione ERP |

### Jobs-to-be-done
- *"Quando vedo in magazzino un articolo che non è in catalogo, voglio censirlo in meno di un minuto senza mettermi a scrivere."*
- *"Quando preparo un evento a tema, voglio trovare tutti gli oggetti adatti per stile e colore."*
- *"Quando pianifico un trasporto, voglio sapere quanto occupa e quanto pesa quello che carico."*

---

## 4. Contesto strategico

- **Obiettivo:** un'unica anagrafica prodotti, aggiornata da chi vede fisicamente gli oggetti, consultabile da tutte le applicazioni.
- **Perché ora:**
  1. La logistica è bloccata su volume e peso (dipendenza critica del PRD Logistica).
  2. I modelli di immagine e di visione (Nano Banana, LLM multimodali) rendono il censimento da foto rapido ed economico: la parte faticosa (descrivere, scontornare, classificare) diventa automatica e l'umano conferma.
  3. L'azienda ha appena investito in ERP, sito ed e-commerce (erpCUBE / IBED, Global Brand): un catalogo strutturato e servito via API li alimenta tutti.
- **Mercato:** strumento interno; TAM/SAM/SOM non applicabili. 🔶
- **Alternative valutate:**
  - *Restare in Excel / SharePoint:* nessuna API, nessuna foto gestita, nessuno storico.
  - *PIM commerciale (Akeneo, Pimcore, Plytix):* ottimi per prodotti venduti, ma pesanti da configurare per composizioni e temi da evento, e senza il flusso "foto da telefono → AI".
  - *Anagrafica articoli dell'ERP:* va **collegata** (codice articolo), non sostituita; non è adatta a foto multiple, AI e consultazione mobile.

### Rapporto con l'ERP (erpCUBE)
Il file articoli è il tracciato con cui l'anagrafica viene caricata nell'ERP. Proposta di ripartizione:

| Dato | Proprietario | Verso |
|---|---|---|
| Codice, descrizioni, classificazioni, colore, materiale, dimensioni, foto, fornitori | **Catalogo** | Catalogo → ERP (esportazione nel tracciato IBED, poi via API se erpCUBE la offre) |
| Volume, peso, impilabilità, tempi, componenti, temi, stili, colori RGB | **Catalogo** | solo catalogo (e logistica, sito, MCP) |
| Prezzi di noleggio e vendita | 🔵 **da decidere**: ERP (consigliato, perché fattura) oppure catalogo | — |
| Giacenze e movimenti | Magazzino (fase successiva) | — |

Così il catalogo diventa la fonte di verità per il prodotto e l'ERP resta la fonte per amministrazione e fatturazione, collegati dal codice articolo.

---

## 5. Soluzione

### 5.1 Principi
1. **Una piattaforma, un accesso:** stesso login (SSO aziendale) su web e mobile; i ruoli decidono cosa si vede.
2. **Mobile-first per il censimento, desktop per la cura.** La stessa applicazione si adatta allo schermo (PWA installabile sul telefono).
3. **L'AI propone, l'umano conferma.** Ogni dato generato è marcato come "proposto dall'AI" finché qualcuno non lo approva.
4. **Le foto originali non si perdono mai.** Ogni elaborazione crea una nuova immagine collegata all'originale.
5. **Il catalogo è la fonte di verità:** gli altri sistemi leggono da qui; le modifiche avvengono qui.

### 5.2 Flusso di censimento (mobile)

```
 [Scatta 1–N foto] → [Descrizione facoltativa (testo o voce)] → [Scegli: nuovo articolo | completa esistente | solo foto]
        │
        ├──► originale salvato
        ├──► Nano Banana (prompt scelto) ──► foto di presentazione scontornata
        └──► LLM visione + descrizione ──► scheda proposta: nome, descrizione, materiali, colori RGB (≤3),
                                            temi, stili, funzioni, dimensioni stimate, componenti visibili
        ▼
 [Anteprima sul telefono: accetta / correggi / rigenera]  →  stato "Da revisionare"
        ▼
 [Curatore, da desktop: approva]  →  stato "Pubblicato"  →  visibile via API/MCP
```

- **Ricerca prima di creare:** dopo lo scatto il sistema cerca articoli simili (per immagine e testo) e chiede "è uno di questi?" per evitare doppioni.
- **Scansione:** se l'articolo ha un'etichetta/QR (🔶 da introdurre), inquadrandola si apre la sua scheda.
- **Senza rete** (magazzini, location): le foto restano in coda sul telefono e partono quando torna la connessione.
- **Tempo obiettivo:** dallo scatto all'invio, meno di 60 secondi.

### 5.3 Elaborazione delle foto (Nano Banana)

- Modello: **Nano Banana** (Gemini 2.5 Flash Image) via API Google; 🔵 valutare la versione "Pro" per qualità e l'esecuzione su Vertex AI in region EU.
- **Libreria di prompt:**
  - *prompt standard* definiti dall'amministratore (es. "Sfondo bianco da catalogo", "Ombra morbida su grigio chiaro", "Ambientato in un giardino", "Scheda tecnica con misure");
  - l'utente può **sceglierne uno**, **modificarlo** prima dell'invio o **scriverne uno nuovo**; i prompt personali si possono salvare e proporre come standard.
  - Ogni immagine generata conserva **prompt usato, modello, data, autore**.
- Più varianti per articolo: una è la **foto principale**, le altre restano in galleria.
- Regole: l'oggetto **non va alterato** (forma, colore, proporzioni). Il prompt standard lo dice esplicitamente, e la revisione umana controlla.

### 5.4 Descrizione e classificazione (LLM)

L'LLM riceve **l'originale** (non la foto elaborata) e la descrizione facoltativa, e restituisce un JSON con schema fisso:

| Campo | Contenuto |
|---|---|
| `nome_proposto` | nome breve da catalogo |
| `descrizione_breve` | 1–2 frasi, per offerte e sito |
| `descrizione_dettagliata` | descrizione minuziosa: forma, materiali, finiture, dettagli costruttivi, stato visibile |
| `colori` | fino a **3** colori dominanti dell'oggetto (non dello sfondo): `{rgb:[r,g,b], hex, nome, percentuale}`, più il **codice colore aziendale** più vicino (tabella colori del file IBED) |
| `materiali` | legno, metallo, vetro, tessuto, ecopelle, rattan, plastica… |
| `finitura` | opaco, lucido, laccato, naturale, verniciato… |
| `classificazione` | proposta di classe 1/2/3 **dalla tabella esistente** (13/37/214 voci) |
| `funzione` | vedi tassonomia sotto (es. seduta, appoggio, illuminazione) |
| `stili` | vedi tassonomia (es. industrial, boho, minimal) |
| `temi_evento` | vedi tassonomia (es. matrimonio, gala, natalizio) |
| `ambiente` | interno / esterno coperto / esterno |
| `dimensioni_stimate` | L×P×H stimate **solo se** deducibili (marcate "stima") |
| `componenti_visibili` | parti riconoscibili (es. "struttura metallica", "piano in legno", "cuscino") |
| `parole_chiave` | sinonimi per la ricerca |
| `confidenza` | per campo, come nell'estrazione delle offerte |

- I colori si calcolano anche con un algoritmo classico (k-means sull'oggetto scontornato) e si confrontano con quelli dell'LLM; in caso di divergenza vince l'algoritmo e si segnala. 🔶
- Temi, stili e funzioni si scelgono da **vocabolari controllati** (l'LLM può proporre nuove voci, che il curatore approva o scarta), così la ricerca resta coerente.

**Tassonomie proposte (da validare con i commerciali):**
- **Funzione:** seduta · appoggio/tavolo · bar e catering · accoglienza/reception · illuminazione · decorazione e scenografia · separazione spazi · copertura (gazebo, ombrelloni) · contenitore/espositore · pedane e palchi · tessili · climatizzazione.
- **Stile:** minimal · industrial · shabby chic · boho · vintage · rustico · luxury/glam · tropicale · nordico · mediterraneo · contemporaneo · pop.
- **Tema/occasione:** matrimonio · gala e cena di gala · evento aziendale/convention · fiera e stand · lancio di prodotto · festa privata · natalizio · estivo/beach · garden party · cerimonia · evento culturale · street food/sagra.
- **Attributi pratici:** impilabile · smontabile · pieghevole · per esterni · resistente alla pioggia · richiede corrente.

### 5.5 Articoli composti

Tre casi reali, un unico modello a **grafo articolo ↔ componente**:

| Caso | Esempio | Come si rappresenta |
|---|---|---|
| **Composizione** | Gazebo = struttura + telo + 4 zavorre | Articolo con **distinta base** (componente × quantità) |
| **Configurazioni alternative** | La stessa struttura metallica diventa bancone o gazebo | Più articoli "configurazione" che **condividono** gli stessi componenti; il componente sa in quali configurazioni compare |
| **Anima + rivestimento** | Pouf = anima in espanso + fodera; fodere di colori diversi sulla stessa anima | Articolo con componenti di ruolo `anima` e `rivestimento`; le **varianti** (colore) cambiano solo il rivestimento |

- **Articolo completo:** scheda completa (descrizione AI, colori, temi, misure, foto di presentazione).
- **Componente:** solo **foto e descrizione breve** (+ misure e peso, utili alla logistica).
- **Varianti:** un articolo padre ("Sgabello Kate") con varianti (bianco, antracite) che ereditano tutto tranne colore, codice e foto. Segue lo schema di codice esistente: **padre = codice senza `-CC`, variante = `-CC`** (286 articoli del file attuale hanno già più varianti).
- **Coperture e fodere esistenti** (56 articoli "Copertura …") diventano componenti `rivestimento` dell'articolo corrispondente; l'import propone il collegamento per nome, il curatore conferma.
- Il volume/peso di un articolo composto si calcola dai componenti, ma si può forzare (es. ingombro da montato vs. da imballato).

### 5.6 Dati per la logistica (collegamento con il pianificatore)

Campi della scheda che servono alla sezione Logistica (oggi "In arrivo"):
- volume e peso **da imballato** per pezzo; dimensioni da montato;
- **impilabilità** (quanti per pila / per bancale) e se si **smonta**;
- tempo di carico e di montaggio per pezzo (o per categoria), persone minime per movimentarlo;
- richiede mezzo con sponda / muletto.

Il magazzino misura; il censimento da foto lascia questi campi **da completare** e il catalogo mostra una **coda "da misurare"** ordinata per frequenza d'uso negli ordini.

### 5.7 Interfaccia

**Mobile (PWA):** Scatta · Cerca (anche per foto) · Coda (in attesa di rete / da completare) · Scheda articolo (vista e completamento rapido).

**Web (desktop):**
- *Catalogo:* griglia con foto, filtri per funzione, stile, tema, colore (selettore colore), stato, completezza.
- *Scheda articolo:* galleria (originali ed elaborate), descrizioni, colori, tassonomie, misure, composizione e varianti, storico modifiche, "dove è usato" (offerte, configurazioni).
- *Revisione:* coda degli articoli "Da revisionare" con confronto proposta AI / valori attuali.
- *Prompt:* libreria dei prompt standard e personali, con anteprima.
- *Importazione:* caricamento dell'Excel attuale con mappatura colonne.
- *Amministrazione:* ruoli, tassonomie, chiavi API.

Coerenza con il prototipo logistico: stessi componenti (`datatable`, `filtri`, `stato`, `dettagli`, `sequenza`…).

### 5.8 Distribuzione: API REST e MCP

- **REST** (OpenAPI documentata), sola lettura per i sistemi esterni, scrittura solo per l'applicazione:
  - `GET /articoli` (filtri: testo, funzione, stile, tema, colore vicino a RGB, stato, aggiornati dopo il…),
  - `GET /articoli/{codice}` con componenti, varianti, foto, misure,
  - `GET /articoli/{codice}/foto?tipo=presentazione|originale`,
  - `GET /tassonomie`, webhook `articolo.pubblicato / modificato`.
- **Server MCP** per gli agenti AI (es. un assistente che propone allestimenti): strumenti `cerca_articoli`, `dettaglio_articolo`, `articoli_per_tema`, `articoli_per_colore`, `composizione`.
- Autenticazione con chiavi per sistema, permessi in sola lettura, limiti di richieste, registro degli accessi.
- Solo gli articoli **pubblicati** escono dal catalogo.

---

## 6. Metriche di successo

| Metrica | Obiettivo | Baseline |
|---|---|---|
| **Articoli pubblicati con scheda completa** (foto principale, descrizione, colori, ≥1 tema, misure da imballato) | 80% del catalogo attivo entro 3 mesi dal rilascio | **0%**: su 2.194 articoli nessuno ha volume/peso, temi o colori RGB; il 60% ha dimensioni leggibili |
| Tempo medio di censimento da telefono | < 60 s dallo scatto all'invio | — |
| Proposte AI accettate senza modifiche | > 70% per descrizione, > 85% per colori | — |
| Copertura volume/peso sugli articoli usati negli ordini dei prossimi 30 giorni | 90% | 0% |
| Sistemi che leggono dal catalogo invece che da copie | ERP/preventivi + logistica entro il primo trimestre | 0 |

**Guardrail:** nessun dato AI pubblicato senza revisione; nessuna foto originale persa; il censimento da telefono non deve richiedere più di 3 tocchi oltre allo scatto.

---

## 7. Requisiti (user stories)

### Ipotesi dell'epic
Crediamo che, permettendo a chi vede gli oggetti di censirli con una foto e lasciando all'AI descrizione, scontorno e classificazione, otterremo un catalogo completo e affidabile in pochi mesi invece che mai, perché oggi il collo di bottiglia è il lavoro di scrittura e di fotografia. Lo misureremo con la percentuale di schede complete e con il tempo di censimento.

### 7.1 Accesso
- **A1 — Accesso unico.** Come utente voglio entrare con le stesse credenziali da web e da telefono e trovare le sezioni a cui ho accesso. *AC:* SSO (🔵 Microsoft 365 / Google Workspace?); sessione lunga sul telefono; ruoli: censitore, curatore, commerciale, logistica, amministratore.

### 7.2 Censimento da mobile
- **C1 — Nuovo articolo da foto.** *AC:* 1–N foto; descrizione facoltativa (testo o dettatura); scelta del prompt immagine (standard di default); invio < 60 s; stato "Da revisionare".
- **C2 — Evitare doppioni.** *AC:* dopo lo scatto vengono proposti fino a 5 articoli simili; "è questo" porta al completamento invece che alla creazione.
- **C3 — Completare un esistente.** *AC:* ricerca per testo/foto/QR; campi mancanti evidenziati; misure inseribili con tastierino numerico.
- **C4 — Aggiungere foto.** *AC:* foto aggiunte alla galleria, con elaborazione facoltativa.
- **C5 — Senza rete.** *AC:* coda locale, invio automatico al ritorno della connessione, nessuna perdita.
- **C6 — Componenti.** *AC:* dalla scheda di un articolo, "aggiungi componente" con foto + descrizione breve + quantità + ruolo (anima/rivestimento/parte).

### 7.3 AI
- **I1 — Foto di presentazione.** *AC:* chiamata a Nano Banana con il prompt scelto; risultato collegato all'originale con prompt, modello, data; "rigenera" e "scegli come principale".
- **I2 — Prompt.** *AC:* elenco prompt standard; modifica prima dell'invio; prompt personali salvabili; proposta come standard all'amministratore.
- **I3 — Scheda proposta.** *AC:* JSON conforme allo schema §5.4; massimo 3 colori RGB dell'oggetto; tassonomie solo da vocabolario (nuove voci come "proposte"); confidenza per campo; nulla di inventato sulle misure se non visibili.
- **I4 — Rigenera / correggi.** *AC:* l'utente può correggere la descrizione e chiedere una nuova proposta che ne tenga conto.

### 7.4 Curatela (web)
- **R1 — Revisione.** *AC:* coda "Da revisionare"; confronto proposta/attuale; approva, modifica, scarta; pubblicazione solo dopo approvazione.
- **R2 — Composizioni e varianti.** *AC:* distinta base con quantità; un componente in più configurazioni; varianti con ereditarietà dei campi.
- **R3 — Tassonomie.** *AC:* gestione voci; unione di voci duplicate; le proposte dell'AI arrivano in coda.
- **R4 — Storico.** *AC:* ogni modifica registra chi, quando, cosa, origine (umano / AI).

### 7.5 Migrazione (dal file articoli IBED)
- **M1 — Import del file.** *AC:*
  - mappatura: Codice → codice (spazi rimossi); Descrizione breve/Titolo/Descrizione estesa → descrizioni; Classificazione 1/2/3 → classificazione; Dimensioni → testo originale + L/P/H/Ø quando leggibili; Fornitore 1/2 → fornitori; Note → note interne; Foto 1–4 → riferimenti alle immagini (principale = prima); prezzi → 🔵 secondo la decisione sull'ERP; UM → unità;
  - dal codice: materiale (`pr`) e codice colore (`CC`);
  - articoli con lo stesso codice base → **articolo padre + varianti**;
  - "Copertura …/Fodera …" → proposte di collegamento come rivestimento;
  - **report**: 92 codici duplicati, 14 codici fuori schema, 106 descrizioni brevi oltre 40 caratteri, dimensioni non leggibili, foto mancanti;
  - tutti gli articoli importati entrano come "Da completare" (mancano volume, peso, temi, colori RGB).
- **M2 — Foto esistenti.** *AC:* caricamento della cartella immagini (🔵 dove sono?) e abbinamento per nome file; le foto esistenti diventano "originali" e possono passare da Nano Banana e dall'LLM in **lotti** (arricchimento massivo dei 2.194 articoli, con revisione a campione).
- **M3 — Codice articolo.** *AC:* il codice resta quello aziendale; i nuovi articoli ricevono il codice secondo lo schema `XXFFFprprg-CC` (proposto dal sistema da classificazione, materiale e colore; serie `prg` progressiva).
- **M4 — Riferimento nelle offerte.** *AC:* 🔶 chiedere che l'ERP stampi il codice articolo sulle offerte; nel frattempo la logistica abbina le righe per descrizione (oggi 81% di riconoscimento) con conferma.

### 7.6 Distribuzione
- **D1 — API REST.** *AC:* endpoint §5.8, documentazione OpenAPI, chiavi per sistema, solo articoli pubblicati.
- **D2 — Server MCP.** *AC:* strumenti §5.8, sola lettura.
- **D3 — Logistica.** *AC:* il pianificatore legge volume, peso, impilabilità e tempi dal catalogo; il riquadro "In arrivo" scompare per gli articoli misurati.

### Vincoli e casi limite
- Oggetti grandi o già montati in location (foto parziali): il censimento accetta più foto e la descrizione lo segnala.
- Oggetti con colori molto variabili (mix colori, fantasie): il campo colori indica "multicolore" oltre ai 3 dominanti.
- Varianti fotografate come articoli diversi: la ricerca dei simili deve proporre "aggiungi come variante".
- Foto con persone o loghi di clienti: da escludere o sfocare prima dell'elaborazione (🔶 regola da definire).
- Costi AI: limite giornaliero di elaborazioni per utente e cache dei risultati.

---

## 8. Fuori perimetro

- **Magazzino**: giacenze, ubicazioni, movimenti, disponibilità per data, manutenzioni → sezione successiva.
- **Prezzi e listini**: oggi sono nel file articoli (noleggio 85%, vendita 61%); proposta: restano nell'ERP 🔵 da confermare.
- E-commerce e sito pubblico: leggeranno dal catalogo via API, ma non fanno parte di questo progetto.
- Riconoscimento automatico dell'articolo per i movimenti di magazzino.
- Moodboard / composizione automatica di allestimenti (possibile evoluzione via MCP).

---

## 9. Dipendenze e rischi

### Dipendenze
- File Excel attuale del catalogo (struttura e qualità dei dati) 🔵.
- Anagrafica articoli dell'ERP erpCUBE e possibilità di integrazione (fornitore IBED/Serenissima) 🔵.
- Account Google AI / Vertex AI per Nano Banana; scelta del LLM di visione (region EU).
- Sistema di accesso aziendale (SSO).
- Archivio per le immagini (object storage con backup).

### Rischi e mitigazioni
| Rischio | Mitigazione |
|---|---|
| L'immagine generata altera l'oggetto (colore, forma) | Prompt standard vincolanti, originale sempre conservato, approvazione umana, confronto colori algoritmico |
| Descrizioni AI generiche o sbagliate | Vocabolari controllati, confidenza per campo, revisione obbligatoria, esempi nel prompt |
| Doppioni nel censimento | Ricerca per similarità prima di creare, varianti |
| Dati aziendali verso fornitori AI | Contratti con elaborazione in UE e senza addestramento sui dati; niente foto di persone |
| Costi AI imprevisti | Limiti per utente, cache, modello economico di default e "Pro" solo su richiesta |
| Adozione bassa in magazzino | Flusso da 3 tocchi, funziona senza rete, coda "da misurare" con priorità chiare |
| Due fonti di verità (catalogo vs ERP) | Regola chiara: anagrafica e contenuti nel catalogo, prezzi e fatturazione nell'ERP; sincronizzazione via codice |

---

## 10. Domande aperte

| Domanda | Per chi |
|---|---|
| Nome della piattaforma (proposta: **Serra**) | Direzione |
| ~~Quanti articoli e con quali colonne?~~ **Risposto**: 2.194 articoli, 26 colonne (§2bis). Resta: chi lo aggiorna e ogni quanto? | Chi gestisce il catalogo |
| erpCUBE: l'anagrafica è già caricata da questo file? Si può leggere/scrivere via API o solo con import/export? | Amministrazione / IBED |
| Dove sono le **foto** (cartella con i 2.194+ file indicati nel file)? | Chi gestisce il catalogo |
| I prezzi restano nell'ERP o passano al catalogo? | Amministrazione |
| Come risolvere i 92 codici duplicati e i 14 fuori schema? | Curatore / IBED |
| La tabella colori va completata (voci intermedie): chi la cura? | Curatore |
| Come deve essere presentata la foto (sfondo, ombra, ambientazione)? Quali prompt standard? | Commerciali / marketing |
| Tassonomie di temi, stili e funzioni: confermare e completare | Commerciali |
| Sistema di accesso aziendale (Microsoft 365, Google Workspace, altro)? | IT |
| Chi approva le schede (un curatore unico o più)? | Direzione |
| Etichette/QR sugli articoli: si introducono? | Magazzino |
| Prezzi di listino nel catalogo o solo nell'ERP? | Amministrazione |
| Budget mensile per le chiamate AI | Direzione |

---

## PRD Self-Assessment

- **Sezione più solida:** §5 Soluzione — flusso di censimento, modello degli articoli composti e distribuzione via API/MCP sono definiti e legati a casi reali (pouf, struttura bancone/gazebo, varianti di colore viste nelle offerte).
- **Sezione più debole:** §6 Baseline e §4 Rapporto con l'ERP — il file articoli è analizzato (§2bis), ma non sappiamo ancora come erpCUBE si integra (API o solo import) né dove sono le foto.
- **Assunzioni principali da validare:**
  1. Gli addetti in magazzino useranno davvero il telefono per censire (test con 2–3 persone su 20 articoli).
  2. Nano Banana non altera colori e forme in modo inaccettabile (test su 30 foto reali con 3 prompt).
  3. L'LLM produce descrizioni e temi utili ai commerciali (valutazione su 30 articoli).
  4. erpCUBE può essere collegato tramite codice articolo (il codice aziendale esiste già ed è usato per 2.180 articoli su 2.194).
- **Prossimo passo consigliato:** recuperare la cartella foto e fare un **pilota su 30 articoli reali** scelti tra le classi più numerose (mise en place, sedute, tavoli), partendo dalle foto esistenti più alcune scattate col telefono (foto da telefono → Nano Banana + LLM → revisione), misurando tempo, qualità delle immagini e accuratezza delle descrizioni, prima di costruire l'applicazione.

---

*Fine del PRD*
